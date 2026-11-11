import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

// POST: Actualizar registro mensual específico (ej: cambiar monto de Octubre a S/ 220 o cambiar estado o método de pago)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { costoFijoId, periodo, estado, monto, notas, metodoPago, tarjetaId } = await request.json();

    const costoFijo = await prisma.costoFijo.findUnique({ where: { id: costoFijoId } });
    if (!costoFijo || costoFijo.usuarioId !== user.id) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;
    const montoNum = (monto !== undefined && monto !== null && monto !== '') ? parseFloat(monto) : undefined;

    const updateData: any = {};
    if (estado) {
      updateData.estado = estado as EstadoPago;
      updateData.fechaPagoReal = fechaPagoReal;
    }
    if (montoNum !== undefined) {
      updateData.monto = montoNum;
    }
    if (notas !== undefined) {
      updateData.notas = notas;
    }
    if (metodoPago !== undefined) {
      updateData.metodoPago = metodoPago as MetodoPago;
      updateData.tarjetaId = metodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null;
    }

    const createMetodoPago = (metodoPago as MetodoPago) || costoFijo.metodoPago || MetodoPago.EFECTIVO_DEBITO;
    const createTarjetaId = createMetodoPago === MetodoPago.TARJETA_CREDITO
      ? (tarjetaId !== undefined ? tarjetaId : costoFijo.tarjetaId)
      : null;

    const registro = await prisma.registroCostoFijoMes.upsert({
      where: {
        costoFijoId_periodo: {
          costoFijoId,
          periodo,
        },
      },
      update: updateData,
      create: {
        costoFijoId,
        periodo,
        monto: montoNum !== undefined ? montoNum : costoFijo.monto,
        estado: (estado as EstadoPago) || EstadoPago.PENDIENTE,
        metodoPago: createMetodoPago,
        tarjetaId: createTarjetaId,
        fechaPagoReal,
        notas,
      },
    });

    return NextResponse.json({ success: true, data: registro });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Edición de la definición base del Costo Fijo (NO RETROACTIVA)
// Solo modifica el monto o vencimiento de los meses futuros pendientes (periodo >= mesDesde)
// Los meses pasados y los que ya están PAGADOS o ADELANTADOS quedan 100% intactos.
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id, concepto, monto, diaVencimiento, mesDesde, mesFin, activo, metodoPago, tarjetaId } = await request.json();

    const costoFijo = await prisma.costoFijo.findUnique({ where: { id } });
    if (!costoFijo || costoFijo.usuarioId !== user.id) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    const montoNum = monto !== undefined ? parseFloat(monto) : Number(costoFijo.monto);
    const diaNum = diaVencimiento !== undefined ? parseInt(diaVencimiento, 10) : costoFijo.diaVencimiento;

    // 1. Actualizar definición base
    await prisma.costoFijo.update({
      where: { id },
      data: {
        ...(concepto && { concepto }),
        ...(monto !== undefined && { monto: montoNum }),
        ...(diaVencimiento !== undefined && { diaVencimiento: diaNum }),
        ...(mesFin !== undefined && { mesFin }),
        ...(activo !== undefined && { activo }),
        ...(metodoPago !== undefined && {
          metodoPago: metodoPago as MetodoPago,
          tarjetaId: metodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null,
        }),
      },
    });

    // 2. Aplicar a registros futuros PENDIENTES (no retroactivo)
    if (mesDesde && (monto !== undefined || metodoPago !== undefined)) {
      const updateDataFuture: any = {};
      if (monto !== undefined) updateDataFuture.monto = montoNum;
      if (metodoPago !== undefined) {
        updateDataFuture.metodoPago = metodoPago as MetodoPago;
        updateDataFuture.tarjetaId = metodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null;
      }

      await prisma.registroCostoFijoMes.updateMany({
        where: {
          costoFijoId: id,
          periodo: { gte: mesDesde },
          estado: EstadoPago.PENDIENTE, // Lo que ya se pagó o adelantó NO se modifica
        },
        data: updateDataFuture,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar costo fijo
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const res = await prisma.costoFijo.deleteMany({
      where: { id, usuarioId: user.id },
    });

    if (res.count === 0) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
