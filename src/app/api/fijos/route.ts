import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

// GET: Obtener la lista base/concurrente maestra de Costos Fijos y Préstamos (genérica, sin filtrar por mes)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const [costosFijos, prestamos, tarjetas] = await Promise.all([
      prisma.costoFijo.findMany({
        where: { activo: true, usuarioId: user.id },
        include: {
          categoria: true,
          tarjeta: true,
        },
        orderBy: [{ orden: 'asc' }, { diaVencimiento: 'asc' }],
      }),
      prisma.prestamo.findMany({
        where: { activo: true, usuarioId: user.id },
        include: {
          cuotas: {
            orderBy: { numeroCuota: 'asc' },
          },
        },
        orderBy: [{ orden: 'asc' }, { diaPago: 'asc' }],
      }),
      prisma.tarjetaCredito.findMany({
        where: { activa: true, usuarioId: user.id },
        orderBy: { nombre: 'asc' },
      }),
    ]);

    const formattedFijos = costosFijos.map((cf) => ({
      id: cf.id,
      concepto: cf.concepto,
      monto: Number(cf.monto),
      diaVencimiento: cf.diaVencimiento,
      categoria: cf.categoria?.nombre || 'General',
      categoriaId: cf.categoriaId || null,
      categoriaColor: cf.categoria?.color || '#0284c7',
      tag: cf.tag || null,
      monedaOriginal: cf.monedaOriginal,
      montoOriginal: cf.montoOriginal ? Number(cf.montoOriginal) : null,
      tipoCambio: cf.tipoCambio ? Number(cf.tipoCambio) : 4.0,
      metodoPago: cf.metodoPago,
      tarjetaId: cf.tarjetaId || null,
      tarjetaNombre: cf.tarjeta?.nombre || null,
      tarjetaBanco: cf.tarjeta?.banco || null,
      tarjetaColor: cf.tarjeta?.color || null,
      mesInicio: cf.mesInicio,
      mesFin: cf.mesFin,
      activo: cf.activo,
      orden: cf.orden ?? 0,
    }));

    const formattedPrestamos = prestamos.map((p) => {
      const cuotasOrdenadas = [...p.cuotas].sort((a, b) => a.numeroCuota - b.numeroCuota);
      const cuotaPendiente = cuotasOrdenadas.find((c) => c.estado !== EstadoPago.PAGADO) || cuotasOrdenadas[0];
      return {
        id: p.id,
        cuotaId: cuotaPendiente?.id || p.id,
        banco: p.banco,
        concepto: p.concepto,
        montoTotal: Number(p.montoTotal),
        montoCuota: Number(p.montoCuota),
        cuotaActual: cuotaPendiente ? cuotaPendiente.numeroCuota : 1,
        cuotasTotales: p.cuotasTotales,
        tasaInteresAnual: Number(p.tasaInteresAnual),
        diaPago: p.diaPago,
        estado: cuotaPendiente ? cuotaPendiente.estado : EstadoPago.PENDIENTE,
        fechaPagoReal: cuotaPendiente?.fechaPagoReal ? cuotaPendiente.fechaPagoReal.toISOString() : null,
        periodoInicio: cuotasOrdenadas[0]?.periodo || null,
        periodoFin: cuotasOrdenadas[cuotasOrdenadas.length - 1]?.periodo || null,
        monedaOriginal: p.monedaOriginal,
        montoOriginal: p.montoOriginal ? Number(p.montoOriginal) : null,
        tipoCambio: p.tipoCambio ? Number(p.tipoCambio) : 4.0,
        orden: p.orden ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      costosFijos: formattedFijos,
      prestamos: formattedPrestamos,
      tarjetas,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Actualizar registro mensual específico (ej: cambiar monto de Octubre a S/ 220, concepto, categoría, estado o método de pago)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const {
      costoFijoId,
      periodo,
      concepto,
      categoriaId,
      tag,
      excluido,
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
    if (concepto !== undefined) {
      updateData.concepto = concepto ? concepto.trim() : null;
    }
    if (categoriaId !== undefined) {
      updateData.categoriaId = categoriaId || null;
    }
    if (tag !== undefined) {
      updateData.tag = tag ? tag.trim() : null;
    }
    if (excluido !== undefined) {
      updateData.excluido = Boolean(excluido);
    }
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
        concepto: concepto !== undefined ? (concepto ? concepto.trim() : null) : null,
        categoriaId: categoriaId !== undefined ? (categoriaId || null) : null,
        tag: tag !== undefined ? (tag ? tag.trim() : null) : null,
        excluido: excluido !== undefined ? Boolean(excluido) : false,
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

// DELETE: Eliminar costo fijo (Si incluye periodo, solo se excluye de ese mes; si no, se borra la plantilla completa)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const periodo = searchParams.get('periodo');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const costoFijo = await prisma.costoFijo.findFirst({
      where: { id, usuarioId: user.id },
    });
    if (!costoFijo) {
      return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
    }

    // Si se especifica periodo, es una eliminación local/mensual desde Finanzas del Mes
    if (periodo) {
      await prisma.registroCostoFijoMes.upsert({
        where: {
          costoFijoId_periodo: {
            costoFijoId: id,
            periodo,
          },
        },
        update: {
          excluido: true,
        },
        create: {
          costoFijoId: id,
          periodo,
          monto: costoFijo.monto,
          monedaOriginal: costoFijo.monedaOriginal,
          montoOriginal: costoFijo.montoOriginal,
          tipoCambio: costoFijo.tipoCambio,
          estado: EstadoPago.PENDIENTE,
          metodoPago: costoFijo.metodoPago,
          tarjetaId: costoFijo.tarjetaId,
          excluido: true,
        },
      });
      return NextResponse.json({ success: true, excluidoMes: periodo });
    }

    // Eliminación global de la definición concurrente (desde Fijos y Préstamos)
    await prisma.costoFijo.deleteMany({
      where: { id, usuarioId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
