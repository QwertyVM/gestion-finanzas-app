import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { concepto, monto, diaVencimiento, periodo, mesInicio, mesFin, categoriaId } = await request.json();
    const startPeriodo = mesInicio || periodo || '2026-11';
    const montoFloat = parseFloat(monto);

    const costoFijo = await prisma.costoFijo.create({
      data: {
        concepto,
        monto: montoFloat,
        diaVencimiento: parseInt(diaVencimiento, 10) || 30,
        mesInicio: startPeriodo,
        mesFin: mesFin || null,
        categoriaId: categoriaId || null,
        registrosMes: {
          create: {
            periodo: startPeriodo,
            monto: montoFloat,
            estado: EstadoPago.PENDIENTE,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: costoFijo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
