import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { concepto, monto, diaVencimiento, periodo } = await request.json();

    const costoFijo = await prisma.costoFijo.create({
      data: {
        concepto,
        monto: parseFloat(monto),
        diaVencimiento: parseInt(diaVencimiento, 10) || 30,
        registrosMes: {
          create: {
            periodo,
            monto: parseFloat(monto),
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
