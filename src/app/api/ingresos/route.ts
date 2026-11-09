import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TipoIngreso } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { periodo, tipo, concepto, monto, monedaOriginal = 'PEN', montoOriginal, tipoCambio = 4.00, fechaEsperada, recibido } = await request.json();

    const ingreso = await prisma.ingresoMes.upsert({
      where: {
        periodo_tipo_concepto: {
          periodo,
          tipo: tipo as TipoIngreso,
          concepto,
        },
      },
      update: {
        monto: parseFloat(monto),
        monedaOriginal,
        montoOriginal: montoOriginal ? parseFloat(montoOriginal) : null,
        tipoCambio: parseFloat(tipoCambio),
        fechaEsperada: new Date(fechaEsperada),
        recibido: !!recibido,
        fechaRecibido: recibido ? new Date() : null,
      },
      create: {
        periodo,
        tipo: tipo as TipoIngreso,
        concepto,
        monto: parseFloat(monto),
        monedaOriginal,
        montoOriginal: montoOriginal ? parseFloat(montoOriginal) : null,
        tipoCambio: parseFloat(tipoCambio),
        fechaEsperada: new Date(fechaEsperada),
        recibido: !!recibido,
        fechaRecibido: recibido ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: ingreso });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, recibido } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const updated = await prisma.ingresoMes.update({
      where: { id },
      data: {
        recibido: !!recibido,
        fechaRecibido: recibido ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.ingresoMes.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
