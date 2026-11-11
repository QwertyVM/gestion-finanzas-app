import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';
import { ajustarCuotasPrestamo } from '@/lib/finanzas-service';
import { getAuthenticatedUser } from '@/lib/auth';

// POST: Actualizar cuota específica (estado o monto real pagado en ese mes)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { cuotaId, estado, monto } = await request.json();

    const cuota = await prisma.cuotaPrestamo.findUnique({
      where: { id: cuotaId },
      include: { prestamo: true },
    });

    if (!cuota || cuota.prestamo.usuarioId !== user.id) {
      return NextResponse.json({ error: 'Cuota no encontrada' }, { status: 404 });
    }

    const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;
    const updateData: any = {};
    if (estado) {
      updateData.estado = estado as EstadoPago;
      updateData.fechaPagoReal = fechaPagoReal;
    }
    if (monto !== undefined && monto !== null && monto !== '') {
      updateData.monto = parseFloat(monto);
    }

    const updated = await prisma.cuotaPrestamo.update({
      where: { id: cuotaId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Edición de condiciones base del préstamo (NO RETROACTIVA)
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id, concepto, banco, montoTotal, montoCuota, tasaInteresAnual, mesDesde, activo, cuotasTotales, cuotaActual } = await request.json();

    const prestamo = await prisma.prestamo.findUnique({ where: { id } });
    if (!prestamo || prestamo.usuarioId !== user.id) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    const cuotaMontoNum = montoCuota !== undefined ? parseFloat(montoCuota) : undefined;
    const montoTotalNum = montoTotal !== undefined ? parseFloat(montoTotal) : undefined;

    await prisma.prestamo.update({
      where: { id },
      data: {
        ...(concepto && { concepto }),
        ...(banco && { banco }),
        ...(montoTotalNum !== undefined && !isNaN(montoTotalNum) && { montoTotal: montoTotalNum }),
        ...(cuotaMontoNum !== undefined && !isNaN(cuotaMontoNum) && { montoCuota: cuotaMontoNum }),
        diaPago: 30,
        ...(tasaInteresAnual !== undefined && { tasaInteresAnual: parseFloat(tasaInteresAnual) }),
        ...(activo !== undefined && { activo }),
      },
    });

    // Actualizar cuota actual o total de cuotas y generar/eliminar cuotas pendientes si cambiaron
    if ((cuotasTotales !== undefined && cuotasTotales !== null) || (cuotaActual !== undefined && cuotaActual !== null)) {
      await ajustarCuotasPrestamo({
        prestamoId: id,
        cuotaActual: cuotaActual !== undefined ? parseInt(String(cuotaActual), 10) : undefined,
        cuotasTotales: cuotasTotales !== undefined ? parseInt(String(cuotasTotales), 10) : undefined,
        periodoActual: mesDesde,
      });
    }

    // Actualizar cuotas futuras pendientes si cambió el monto de la cuota
    if (mesDesde && cuotaMontoNum !== undefined) {
      await prisma.cuotaPrestamo.updateMany({
        where: {
          prestamoId: id,
          periodo: { gte: mesDesde },
          estado: EstadoPago.PENDIENTE,
        },
        data: {
          monto: cuotaMontoNum,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar préstamo bancario y sus cuotas asociadas
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const res = await prisma.prestamo.deleteMany({
      where: { id, usuarioId: user.id },
    });

    if (res.count === 0) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
