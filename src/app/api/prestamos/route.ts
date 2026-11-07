import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { cuotaId, estado } = await request.json();

    const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;

    const cuota = await prisma.cuotaPrestamo.update({
      where: { id: cuotaId },
      data: {
        estado: estado as EstadoPago,
        fechaPagoReal,
      },
    });

    return NextResponse.json({ success: true, data: cuota });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
