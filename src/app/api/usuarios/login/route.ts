import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDatabaseSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, slug, pin } = await request.json();

    let usuario = null;
    if (usuarioId) {
      usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    } else if (slug) {
      usuario = await prisma.usuario.findUnique({ where: { slug } });
    }

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (usuario.pin) {
      if (!pin) {
        return NextResponse.json({ error: 'Ingresa tu PIN de acceso' }, { status: 401 });
      }
      if (usuario.pin.trim() !== String(pin).trim()) {
        return NextResponse.json({ error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
      }
    }

    // Crear sesión criptográfica en la base de datos
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const { cookieOptions } = await createDatabaseSession(usuario.id, { userAgent, ipAddress });

    const safeUser = {
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
    };

    const response = NextResponse.json({ success: true, usuario: safeUser });

    // Cookie de sesión criptográfica (httpOnly, estricta)
    response.cookies.set(cookieOptions);

    // Cookie de referencia para cliente no sensible
    response.cookies.set({
      name: 'finanzapp_usuario_id',
      value: usuario.id,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    // Limpiar indicador de sesión cerrada
    response.cookies.set({
      name: 'finanzapp_logged_out',
      value: '',
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

