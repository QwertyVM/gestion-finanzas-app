import { NextRequest, NextResponse } from 'next/server';
import { registrarNuevoGasto } from '@/lib/finanzas-service';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo');

    const where: any = {};
    if (periodo) {
      where.periodoPago = periodo;
    }

    const gastos = await prisma.gasto.findMany({
      where,
      include: {
        categoria: true,
        tarjeta: true,
      },
      orderBy: { fechaGasto: 'desc' },
    });

    return NextResponse.json(gastos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await registrarNuevoGasto({
      concepto: body.concepto,
      monto: parseFloat(body.monto),
      monedaOriginal: body.monedaOriginal || 'PEN',
      montoOriginal: body.montoOriginal ? parseFloat(body.montoOriginal) : undefined,
      tipoCambio: body.tipoCambio ? parseFloat(body.tipoCambio) : 4.00,
      fechaGasto: body.fechaGasto || new Date(),
      metodoPago: body.metodoPago,
      tarjetaId: body.tarjetaId,
      totalCuotas: body.totalCuotas ? parseInt(body.totalCuotas, 10) : 1,
      categoriaId: body.categoriaId || undefined,
      estado: body.estado,
      notas: body.notas,
    });

    return NextResponse.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    console.error('Error al registrar gasto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, monto, concepto, estado, notas } = await request.json();
    const updateData: any = {};
    if (monto !== undefined) updateData.monto = parseFloat(monto);
    if (concepto !== undefined) updateData.concepto = concepto;
    if (estado !== undefined) {
      updateData.estado = estado;
      updateData.fechaPagoReal = (estado === 'PAGADO' || estado === 'ADELANTADO') ? new Date() : null;
    }
    if (notas !== undefined) updateData.notas = notas;

    const gasto = await prisma.gasto.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: gasto });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
