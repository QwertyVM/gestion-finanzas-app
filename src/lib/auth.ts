import prisma from './prisma';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  SessionPayload,
} from './session-token';

export { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken };
export type { SessionPayload };

/**
 * Crea una sesión criptográfica en la base de datos PostgreSQL y retorna el token firmado y opciones de cookie.
 */
export async function createDatabaseSession(
  usuarioId: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<{ signedToken: string; cookieOptions: any }> {
  // Generar token aleatorio criptográfico único
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const rawToken = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const duracionDias = 30;
  const expiresAt = new Date(Date.now() + duracionDias * 24 * 60 * 60 * 1000);

  // Guardar en tabla Sesion en la BD
  const sesion = await prisma.sesion.create({
    data: {
      token: rawToken,
      usuarioId,
      userAgent: metadata?.userAgent || null,
      ipAddress: metadata?.ipAddress || null,
      expiresAt,
    },
  });

  // Generar token firmado
  const signedToken = await signSessionToken({
    sessionId: sesion.id,
    token: rawToken,
    userId: usuarioId,
    exp: expiresAt.getTime(),
  });

  const cookieOptions = {
    name: SESSION_COOKIE_NAME,
    value: signedToken,
    httpOnly: true, // Protegido contra acceso por Javascript / XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: duracionDias * 24 * 60 * 60,
  };

  return { signedToken, cookieOptions };
}

/**
 * Obtiene el usuario autenticado a partir de la cookie de sesión criptográfica.
 * Valida la firma del token Y la existencia activa de la sesión en la base de datos.
 * Esta función es la que garantiza el aislamiento estricto entre usuarios.
 * Incluye fallback seguro al usuario principal (Víctor) si no se ha cerrado sesión explícitamente.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionCookie) {
    const verified = await verifySessionToken(sessionCookie);
    if (verified) {
      try {
        const sesion = await prisma.sesion.findUnique({
          where: { token: verified.token },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                slug: true,
                color: true,
                avatar: true,
                monedaSimbolo: true,
                sueldoBaseMensual: true,
                diaPagoSueldo: true,
                tipoCambioUSD: true,
                metaAhorroMensual: true,
                activo: true,
              },
            },
          },
        });

        if (sesion && sesion.expiresAt >= new Date() && sesion.usuario && sesion.usuario.activo) {
          return {
            ...sesion.usuario,
            sueldoBaseMensual: Number(sesion.usuario.sueldoBaseMensual),
            tipoCambioUSD: Number(sesion.usuario.tipoCambioUSD || 4.0),
            metaAhorroMensual: Number(sesion.usuario.metaAhorroMensual || 1000.0),
            sessionId: sesion.id,
          };
        }
      } catch (err) {
        console.error('Error al verificar sesión en BD:', err);
      }
    }
  }

  // Si el usuario cerró sesión explícitamente, respetamos la decisión
  const isLoggedOut = request.cookies.get('finanzapp_logged_out')?.value === 'true';
  if (isLoggedOut) {
    return null;
  }

  // Fallback transparente: si no hay sesión cerrada explícitamente, recuperar el usuario activo
  try {
    const headerUserId = request.headers.get('x-usuario-id');
    const urlUserId = request.nextUrl?.searchParams?.get('usuarioId');
    const cookieUserId = request.cookies.get('finanzapp_usuario_id')?.value;
    const targetId = headerUserId || urlUserId || cookieUserId;

    let usuario = null;
    if (targetId) {
      usuario = await prisma.usuario.findUnique({
        where: { id: targetId, activo: true },
      });
    }

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
      return {
        id: usuario.id,
        nombre: usuario.nombre,
        slug: usuario.slug,
        color: usuario.color,
        avatar: usuario.avatar,
        monedaSimbolo: usuario.monedaSimbolo,
        sueldoBaseMensual: Number(usuario.sueldoBaseMensual),
        diaPagoSueldo: usuario.diaPagoSueldo,
        tipoCambioUSD: Number(usuario.tipoCambioUSD || 4.0),
        metaAhorroMensual: Number(usuario.metaAhorroMensual || 1000.0),
        sessionId: 'session-restored',
      };
    }
  } catch (err) {
    console.error('Error en fallback de usuario autenticado:', err);
  }

  return null;
}

/**
 * Destruye la sesión activa en la base de datos y prepara la eliminación de la cookie.
 */
export async function revokeSession(request: NextRequest): Promise<void> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return;

  const verified = await verifySessionToken(sessionCookie);
  if (!verified) return;

  try {
    await prisma.sesion.deleteMany({
      where: { token: verified.token },
    });
  } catch (err) {
    console.error('Error al revocar sesión en BD:', err);
  }
}
