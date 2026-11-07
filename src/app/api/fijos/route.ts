import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { costoFijoId, periodo, estado, notas } = await request.json();

    const costoFijo = await prisma.costoFijo.findUnique({ where: { id: costoFijoId } });
    if (!costoFijo) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;

    const registro = await prisma.registroCostoFijoMes.upsert({
      where: {
        costoFijoId_periodo: {
          costoFijoId,
          periodo,
        },
      },
      update: {
        estado: estado as EstadoPago,
        fechaPagoReal,
        notas,
      },
      create: {
        costoFijoId,
        periodo,
        monto: costoFijo.monto,
        estado: estado as EstadoPago,
        fechaPagoReal,
        notas,
      },
    });

    return NextResponse.json({ success: true, data: registro });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
