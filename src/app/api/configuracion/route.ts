import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const usuario = await prisma.usuario.findUnique({ where: { id: user.id } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();

    const usuario = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.color && { color: body.color }),
        ...(body.avatar && { avatar: body.avatar }),
        ...(body.monedaSimbolo && { monedaSimbolo: body.monedaSimbolo }),
        ...(body.sueldoBaseMensual !== undefined && { sueldoBaseMensual: parseFloat(body.sueldoBaseMensual) }),
        ...(body.diaPagoSueldo && { diaPagoSueldo: parseInt(body.diaPagoSueldo, 10) }),
        ...(body.tipoCambioUSD !== undefined && { tipoCambioUSD: parseFloat(body.tipoCambioUSD) }),
        ...(body.metaAhorroMensual !== undefined && { metaAhorroMensual: parseFloat(body.metaAhorroMensual) }),
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
