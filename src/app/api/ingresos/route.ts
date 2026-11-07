import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TipoIngreso } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { periodo, tipo, concepto, monto, fechaEsperada, recibido } = await request.json();

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
        fechaEsperada: new Date(fechaEsperada),
        recibido: !!recibido,
        fechaRecibido: recibido ? new Date() : null,
      },
      create: {
        periodo,
        tipo: tipo as TipoIngreso,
        concepto,
        monto: parseFloat(monto),
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
