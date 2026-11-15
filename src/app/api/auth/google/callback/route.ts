import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDatabaseSession } from '@/lib/auth';
import { eliminarJamileSiVacio } from '@/lib/user-cleanup';

const CATEGORIAS_DEFAULT = [
  { nombre: 'Alimentación / Supermercado', color: '#f59e0b', esFijo: true },
  { nombre: 'Servicios Básicos (Luz/Agua/Net)', color: '#3b82f6', esFijo: true },
  { nombre: 'Salud & Cuidado Personal', color: '#ec4899', esFijo: true },
  { nombre: 'Suscripciones / Streaming', color: '#8b5cf6', esFijo: true },
  { nombre: 'Transporte & Vehicular', color: '#64748b', esFijo: false },
  { nombre: 'Restaurantes & Salidas', color: '#f97316', esFijo: false },
  { nombre: 'Compras Varias', color: '#10b981', esFijo: false },
  { nombre: 'Educación & Cursos', color: '#06b6d4', esFijo: false },
];

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

  // Decodificar estado (from opcional)
  let from = '/';
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded.from && typeof decoded.from === 'string' && decoded.from.startsWith('/')) {
        from = decoded.from;
      }
    } catch {
      // Ignorar error al parsear state y continuar
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

    // 3. Buscar si el usuario ya está vinculado
    let usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { googleId },
          ...(googleEmail ? [{ email: googleEmail }] : []),
        ],
      },
    });

    if (usuario) {
      // Cuenta vinculada existente: actualizar campos que falten
      const updateData: any = {};
      if (!usuario.googleId) updateData.googleId = googleId;
      if (googleEmail && !usuario.email) updateData.email = googleEmail;
      if (googleUser.picture && (!usuario.avatar || usuario.avatar === 'User')) {
        updateData.avatar = googleUser.picture;
      }
      if (Object.keys(updateData).length > 0) {
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: updateData,
        });
      }
    } else {
      // Si existe una cuenta sin asociar (ej: usuario inicial sin correo), vincularla
      const cuentaHuerfana = await prisma.usuario.findFirst({
        where: { email: null, googleId: null, activo: true },
        orderBy: { createdAt: 'asc' },
      });

      if (cuentaHuerfana) {
        usuario = await prisma.usuario.update({
          where: { id: cuentaHuerfana.id },
          data: {
            googleId,
            email: googleEmail,
            avatar: googleUser.picture || cuentaHuerfana.avatar,
          },
        });
      } else {
        // Cuenta nueva sin vinculación: CREAR INSTANCIA TOTALMENTE NUEVA
        const nombrePerfil = googleUser.name?.trim() || googleEmail?.split('@')[0] || 'Mi Perfil';
        const rawSlug = nombrePerfil.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 18);
        const uniqueSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 7)}`;

        usuario = await prisma.usuario.create({
          data: {
            nombre: nombrePerfil,
            slug: uniqueSlug,
            email: googleEmail,
            googleId,
            avatar: googleUser.picture || 'User',
            color: '#2563eb',
            monedaSimbolo: 'S/',
            sueldoBaseMensual: 5000.00,
            diaPagoSueldo: 30,
            tipoCambioUSD: 3.40,
            metaAhorroMensual: 1000.00,
            activo: true,
          },
        });

        // Crear categorías iniciales para la nueva instancia
        for (const cat of CATEGORIAS_DEFAULT) {
          await prisma.categoria.create({
            data: {
              nombre: cat.nombre,
              color: cat.color,
              esFijo: cat.esFijo,
              usuarioId: usuario.id,
            },
          });
        }
      }
    }

    if (!usuario || !usuario.activo) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', origin));
    }

    // Asegurar limpieza de Jamile si existiera vacía
    await eliminarJamileSiVacio();

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
    response.cookies.delete('finanzapp_logged_out');

    return response;
  } catch (error) {
    console.error('Excepción en callback de Google OAuth:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_exception', origin));
  }
}
