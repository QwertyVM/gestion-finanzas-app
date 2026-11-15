import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDatabaseSession } from '@/lib/auth';
import { eliminarJamileSiVacio } from '@/lib/user-cleanup';

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, email, pin } = await request.json();

    if (!usuarioId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Correo electrónico inválido' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Validar PIN si el usuario ya tiene uno configurado
    if (usuario.pin) {
      if (!pin) {
        return NextResponse.json({ error: 'Ingresa tu PIN de acceso para confirmar' }, { status: 401 });
      }
      if (usuario.pin.trim() !== String(pin).trim()) {
        return NextResponse.json({ error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
      }
    } else if (pin) {
      // Si no tenía PIN, guardar el ingresado
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { pin: String(pin).trim() },
      });
    }

    // Verificar que el correo no esté ocupado por otro usuario
    const existente = await prisma.usuario.findFirst({
      where: {
        email: normalizedEmail,
        id: { not: usuario.id },
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Este correo ya se encuentra asociado a otra cuenta' },
        { status: 400 }
      );
    }

    // Actualizar usuario con el correo
    const updated = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { email: normalizedEmail },
    });

    // Posterior a la asociación con el correo, eliminar la cuenta de Jamile
    await eliminarJamileSiVacio();

    // Crear sesión en base de datos
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const { cookieOptions } = await createDatabaseSession(updated.id, { userAgent, ipAddress });

    const safeUser = {
      id: updated.id,
      nombre: updated.nombre,
      slug: updated.slug,
      color: updated.color,
      avatar: updated.avatar,
      monedaSimbolo: updated.monedaSimbolo,
      sueldoBaseMensual: Number(updated.sueldoBaseMensual),
      diaPagoSueldo: updated.diaPagoSueldo,
      tipoCambioUSD: Number(updated.tipoCambioUSD || 4.0),
      metaAhorroMensual: Number(updated.metaAhorroMensual || 1000.0),
      email: updated.email,
    };

    const response = NextResponse.json({
      success: true,
      usuario: safeUser,
      mensaje: 'Cuenta vinculada exitosamente con tu correo',
    });

    response.cookies.set(cookieOptions);
    response.cookies.set({
      name: 'finanzapp_usuario_id',
      value: updated.id,
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
  } catch (error: any) {
    console.error('Error al asociar correo a usuario:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
