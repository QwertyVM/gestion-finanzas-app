import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Destruir la sesión en la base de datos
  await revokeSession(request);

  const response = NextResponse.json({
    success: true,
    message: 'Sesión revocada y cerrada exitosamente',
  });

  // Eliminar cookie criptográfica de sesión
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  // Eliminar cookie de referencia
  response.cookies.set({
    name: 'finanzapp_usuario_id',
    value: '',
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  // Marcar cookie de cierre de sesión explícito
  response.cookies.set({
    name: 'finanzapp_logged_out',
    value: 'true',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    sameSite: 'lax',
  });

  return response;
}

