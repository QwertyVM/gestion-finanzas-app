import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

// POST: Actualizar registro mensual específico (ej: cambiar monto de Octubre a S/ 220 o cambiar estado o método de pago)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const {
      costoFijoId,
      periodo,
      estado,
      monto,
      monedaOriginal,
      montoOriginal,
      tipoCambio,
      notas,
      metodoPago,
      tarjetaId,
      ingresoId,
    } = await request.json();

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
    if (monedaOriginal !== undefined) {
      updateData.monedaOriginal = monedaOriginal;
    }
    if (montoOriginal !== undefined) {
      updateData.montoOriginal = montoOriginal !== null ? parseFloat(montoOriginal) : null;
    }
    if (tipoCambio !== undefined) {
      updateData.tipoCambio = tipoCambio ? parseFloat(tipoCambio) : undefined;
    }
    if (notas !== undefined) {
      updateData.notas = notas;
    }
    if (metodoPago !== undefined) {
      updateData.metodoPago = metodoPago as MetodoPago;
      updateData.tarjetaId = metodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null;
    }
    if (ingresoId !== undefined) {
      updateData.ingresoId = ingresoId || null;
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
        monedaOriginal: monedaOriginal || costoFijo.monedaOriginal || 'PEN',
        montoOriginal: montoOriginal !== undefined
          ? (montoOriginal !== null ? parseFloat(montoOriginal) : null)
          : (costoFijo.montoOriginal ? Number(costoFijo.montoOriginal) : null),
        tipoCambio: tipoCambio
          ? parseFloat(tipoCambio)
          : (costoFijo.tipoCambio ? Number(costoFijo.tipoCambio) : 4.00),
        estado: (estado as EstadoPago) || EstadoPago.PENDIENTE,
        metodoPago: createMetodoPago,
        tarjetaId: createTarjetaId,
        ingresoId: ingresoId || null,
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

    const {
      id,
      concepto,
      monto,
      monedaOriginal,
      montoOriginal,
      tipoCambio,
      mesDesde,
      mesFin,
      activo,
      metodoPago,
      tarjetaId,
      categoriaId,
      tag,
    } = await request.json();

    const costoFijo = await prisma.costoFijo.findUnique({ where: { id } });
    if (!costoFijo || costoFijo.usuarioId !== user.id) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    const montoNum = monto !== undefined ? parseFloat(monto) : Number(costoFijo.monto);
    const mOrig = montoOriginal !== undefined ? (montoOriginal !== null ? parseFloat(montoOriginal) : null) : undefined;
    const tcNum = tipoCambio !== undefined ? (tipoCambio ? parseFloat(tipoCambio) : undefined) : undefined;

    // 1. Actualizar definición base
    await prisma.costoFijo.update({
      where: { id },
      data: {
        ...(concepto && { concepto }),
        ...(monto !== undefined && { monto: montoNum }),
        ...(monedaOriginal !== undefined && { monedaOriginal }),
        ...(mOrig !== undefined && { montoOriginal: mOrig }),
        ...(tcNum !== undefined && { tipoCambio: tcNum }),
        diaVencimiento: 30,
        ...(mesFin !== undefined && { mesFin }),
        ...(activo !== undefined && { activo }),
        ...(categoriaId !== undefined && { categoriaId: categoriaId || null }),
        ...(tag !== undefined && { tag: tag ? tag.trim() : null }),
        ...(metodoPago !== undefined && {
          metodoPago: metodoPago as MetodoPago,
          tarjetaId: metodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null,
        }),
      },
    });

    // 2. Aplicar a registros futuros PENDIENTES (no retroactivo)
    if (mesDesde && (monto !== undefined || metodoPago !== undefined || monedaOriginal !== undefined)) {
      const updateDataFuture: any = {};
      if (monto !== undefined) updateDataFuture.monto = montoNum;
      if (monedaOriginal !== undefined) updateDataFuture.monedaOriginal = monedaOriginal;
      if (mOrig !== undefined) updateDataFuture.montoOriginal = mOrig;
      if (tcNum !== undefined) updateDataFuture.tipoCambio = tcNum;
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
