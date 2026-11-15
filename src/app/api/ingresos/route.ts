import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TipoIngreso } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { periodo, tipo, concepto, monto, monedaOriginal = 'PEN', montoOriginal, tipoCambio = 4.00, fechaEsperada, recibido } = body;

    const usuarioId = user.id;

    const ingreso = await prisma.ingresoMes.upsert({
      where: {
        usuarioId_periodo_tipo_concepto: {
          usuarioId: usuarioId as any,
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
        usuarioId,
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
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { id, recibido, monto, concepto, fechaEsperada, tipo, monedaOriginal, montoOriginal, tipoCambio } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const updateData: any = {};
    if (recibido !== undefined) {
      updateData.recibido = !!recibido;
      updateData.fechaRecibido = recibido ? new Date() : null;
    }
    if (monto !== undefined) {
      updateData.monto = parseFloat(monto);
    }
    if (concepto !== undefined) {
      updateData.concepto = concepto.trim();
    }
    if (fechaEsperada !== undefined) {
      updateData.fechaEsperada = new Date(fechaEsperada);
    }
    if (tipo !== undefined) {
      updateData.tipo = tipo;
    }
    if (monedaOriginal !== undefined) {
      updateData.monedaOriginal = monedaOriginal;
    }
    if (montoOriginal !== undefined) {
      updateData.montoOriginal = montoOriginal ? parseFloat(montoOriginal) : null;
    }
    if (tipoCambio !== undefined) {
      updateData.tipoCambio = parseFloat(tipoCambio);
    }

    const updated = await prisma.ingresoMes.updateMany({
      where: { id, usuarioId: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const deleted = await prisma.ingresoMes.deleteMany({
      where: { id, usuarioId: user.id },
    });
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
