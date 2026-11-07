import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { action, ids, estado } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Lista de IDs no válida' }, { status: 400 });
    }

    if (action === 'cambiar_estado') {
      const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;

      await prisma.gasto.updateMany({
        where: { id: { in: ids } },
        data: {
          estado: estado as EstadoPago,
          fechaPagoReal,
        },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'eliminar') {
      await prisma.gasto.deleteMany({
        where: { id: { in: ids } },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
