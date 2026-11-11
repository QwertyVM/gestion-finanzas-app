import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createDatabaseSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const usuario = await getAuthenticatedUser(request);

    if (!usuario) {
      return NextResponse.json(
        { authenticated: false, usuario: null, message: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      authenticated: true,
      usuario,
    });

    // Si no tenía cookie criptográfica activa, emitirla automáticamente
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie && usuario.id) {
      const { cookieOptions } = await createDatabaseSession(usuario.id, {
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      });
      response.cookies.set(cookieOptions);
      response.cookies.set({
        name: 'finanzapp_usuario_id',
        value: usuario.id,
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


