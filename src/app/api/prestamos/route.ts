import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

// POST: Actualizar cuota específica (estado o monto real pagado en ese mes)
export async function POST(request: NextRequest) {
  try {
    const { cuotaId, estado, monto } = await request.json();

    const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;
    const updateData: any = {};
    if (estado) {
      updateData.estado = estado as EstadoPago;
      updateData.fechaPagoReal = fechaPagoReal;
    }
    if (monto !== undefined && monto !== null && monto !== '') {
      updateData.monto = parseFloat(monto);
    }

    const cuota = await prisma.cuotaPrestamo.update({
      where: { id: cuotaId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: cuota });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Edición de condiciones base del préstamo (NO RETROACTIVA)
// Solo actualiza cuotas futuras PENDIENTES, lo pagado no se toca.
export async function PUT(request: NextRequest) {
  try {
    const { id, concepto, banco, montoTotal, montoCuota, diaPago, tasaInteresAnual, mesDesde, activo } = await request.json();

    const cuotaMontoNum = montoCuota !== undefined ? parseFloat(montoCuota) : undefined;
    const montoTotalNum = montoTotal !== undefined ? parseFloat(montoTotal) : undefined;

    await prisma.prestamo.update({
      where: { id },
      data: {
        ...(concepto && { concepto }),
        ...(banco && { banco }),
        ...(montoTotalNum !== undefined && !isNaN(montoTotalNum) && { montoTotal: montoTotalNum }),
        ...(cuotaMontoNum !== undefined && !isNaN(cuotaMontoNum) && { montoCuota: cuotaMontoNum }),
        ...(diaPago !== undefined && { diaPago: parseInt(diaPago, 10) }),
        ...(tasaInteresAnual !== undefined && { tasaInteresAnual: parseFloat(tasaInteresAnual) }),
        ...(activo !== undefined && { activo }),
      },
    });

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await prisma.prestamo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
