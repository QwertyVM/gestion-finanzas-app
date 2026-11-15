import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDatabaseSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const protocol = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '') || 'http');
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    console.warn('Google OAuth error param:', oauthError);
    return NextResponse.redirect(new URL('/login?error=google_cancelled', origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=google_no_code', origin));
  }

  // Decodificar estado (from & slug de perfil opcional)
  let from = '/';
  let slug = '';
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded.from && typeof decoded.from === 'string' && decoded.from.startsWith('/')) {
        from = decoded.from;
      }
      if (decoded.slug && typeof decoded.slug === 'string') {
        slug = decoded.slug;
      }
    } catch {
      // Ignorar error al parsear state y continuar con valores por defecto
    }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=google_config_missing', origin));
  }

  try {
    // 1. Canjear código por tokens de acceso
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      console.error('Error al canjear código en Google OAuth:', errorBody);
      return NextResponse.redirect(new URL('/login?error=google_token_exchange_failed', origin));
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // 2. Obtener datos del perfil de Google
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      console.error('Error al obtener perfil de usuario de Google:', await userinfoRes.text());
      return NextResponse.redirect(new URL('/login?error=google_userinfo_failed', origin));
    }

    const googleUser = await userinfoRes.json();
    const googleId = String(googleUser.id);
    const googleEmail = typeof googleUser.email === 'string' ? googleUser.email.toLowerCase().trim() : null;

    // 3. Buscar o vincular usuario en la base de datos
    let usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { googleId },
          ...(googleEmail ? [{ email: googleEmail }] : []),
        ],
      },
    });

    if (!usuario) {
      // Si se intentó vincular desde un perfil específico seleccionado
      if (slug) {
        usuario = await prisma.usuario.findUnique({ where: { slug } });
      }

      // Si no se encuentra, vincular al perfil principal 'victor' o al primer usuario activo
      if (!usuario) {
        usuario = await prisma.usuario.findFirst({
          where: { slug: 'victor', activo: true },
        });
      }
      if (!usuario) {
        usuario = await prisma.usuario.findFirst({
          where: { activo: true },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (usuario) {
        // Enlazar googleId y email
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            googleId,
            ...(googleEmail && !usuario.email ? { email: googleEmail } : {}),
            ...(googleUser.picture && !usuario.avatar ? { avatar: googleUser.picture } : {}),
          },
        });
      }
    } else if (!usuario.googleId) {
      // Ya existía con ese email pero faltaba asociar el googleId
      usuario = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { googleId },
      });
    }

    if (!usuario || !usuario.activo) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', origin));
    }

    // 4. Crear sesión criptográfica en la BD
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const { cookieOptions } = await createDatabaseSession(usuario.id, { userAgent, ipAddress });

    const response = NextResponse.redirect(new URL(from, origin));

    // Establecer cookies de sesión
    response.cookies.set(cookieOptions);

    response.cookies.set({
      name: 'finanzapp_usuario_id',
      value: usuario.id,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    response.cookies.set({
      name: 'finanzapp_logged_out',
      value: '',
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Excepción en callback de Google OAuth:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_exception', origin));
  }
}
