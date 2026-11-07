import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tarjetas = await prisma.tarjetaCredito.findMany({
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(tarjetas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tarjeta = await prisma.tarjetaCredito.create({
      data: {
        nombre: body.nombre,
        banco: body.banco,
        ultimosCuatro: body.ultimosCuatro || null,
        diaCorte: parseInt(body.diaCorte || '10', 10),
        diaPago: parseInt(body.diaPago || '30', 10),
        color: body.color || '#2563eb',
      },
    });
    return NextResponse.json(tarjeta);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
