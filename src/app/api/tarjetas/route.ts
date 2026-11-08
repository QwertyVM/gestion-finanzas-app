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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'ID de tarjeta requerido' }, { status: 400 });
    }

    // Desvincular cualquier gasto asociado para que no falle por foreign key
    await prisma.gasto.updateMany({
      where: { tarjetaId: id },
      data: { tarjetaId: null },
    });

    await prisma.tarjetaCredito.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tarjeta eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar tarjeta:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
