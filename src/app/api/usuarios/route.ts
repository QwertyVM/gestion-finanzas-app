import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json([]);
    }

    // Retorna únicamente el usuario autenticado de la instancia actual
    return NextResponse.json([user]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pin,
      nuevoPin,
      nombre,
      color,
      avatar,
      sueldoBaseMensual,
      diaPagoSueldo,
      metaAhorroMensual,
      tipoCambioUSD,
      monedaSimbolo,
      periodoDesde,
    } = body;

    const usuario = await prisma.usuario.findUnique({
      where: { id: authenticatedUser.id },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (nuevoPin !== undefined) {
      if (usuario.pin && pin && usuario.pin.trim() !== String(pin).trim()) {
        return NextResponse.json({ error: 'El PIN actual no coincide' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (nuevoPin !== undefined) updateData.pin = nuevoPin ? String(nuevoPin).trim() : null;
    if (nombre) updateData.nombre = nombre.trim();
    if (color) updateData.color = color;
    if (avatar) updateData.avatar = avatar;
    if (sueldoBaseMensual !== undefined) updateData.sueldoBaseMensual = parseFloat(sueldoBaseMensual);
    if (diaPagoSueldo !== undefined) updateData.diaPagoSueldo = parseInt(diaPagoSueldo, 10);
    if (metaAhorroMensual !== undefined) updateData.metaAhorroMensual = parseFloat(metaAhorroMensual);
    if (tipoCambioUSD !== undefined) updateData.tipoCambioUSD = parseFloat(tipoCambioUSD);
    if (monedaSimbolo !== undefined) updateData.monedaSimbolo = monedaSimbolo;

    const updated = await prisma.usuario.update({
      where: { id: authenticatedUser.id },
      data: updateData,
    });

    if (sueldoBaseMensual !== undefined && periodoDesde) {
      await prisma.ingresoMes.updateMany({
        where: {
          usuarioId: authenticatedUser.id,
          tipo: 'SUELDO',
          periodo: { gte: periodoDesde },
        },
        data: { monto: parseFloat(sueldoBaseMensual) },
      });
    }

    return NextResponse.json({ success: true, usuario: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
