import { NextRequest, NextResponse } from 'next/server';
import { ajustarCuotasPrestamo, ajustarCuotasGasto } from '@/lib/finanzas-service';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { tipo, id, cuotaActual, cuotasRestantes, cuotasTotales, periodoActual } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID del registro es requerido' }, { status: 400 });
    }

    if (cuotasRestantes === undefined && cuotasTotales === undefined && cuotaActual === undefined) {
      return NextResponse.json(
        { error: 'Se requiere especificar cuotaActual, cuotasRestantes o cuotasTotales' },
        { status: 400 }
      );
    }

    // 1. Si explícitamente se especifica tipo PRESTAMO
    if (tipo === 'PRESTAMO') {
      const p = await prisma.prestamo.findUnique({ where: { id } });
      if (!p || p.usuarioId !== user.id) {
        return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
      }

      const result = await ajustarCuotasPrestamo({
        prestamoId: id,
        cuotaActual: cuotaActual !== undefined ? parseInt(String(cuotaActual), 10) : undefined,
        cuotasRestantes: cuotasRestantes !== undefined ? parseInt(String(cuotasRestantes), 10) : undefined,
        cuotasTotales: cuotasTotales !== undefined ? parseInt(String(cuotasTotales), 10) : undefined,
        periodoActual,
      });
      return NextResponse.json(result);
    }

    // 2. Si el ID corresponde a un Préstamo bancario
    const esPrestamo = await prisma.prestamo.findUnique({ where: { id } });
    if (esPrestamo) {
      if (esPrestamo.usuarioId !== user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
      const result = await ajustarCuotasPrestamo({
        prestamoId: id,
        cuotaActual: cuotaActual !== undefined ? parseInt(String(cuotaActual), 10) : undefined,
        cuotasRestantes: cuotasRestantes !== undefined ? parseInt(String(cuotasRestantes), 10) : undefined,
        cuotasTotales: cuotasTotales !== undefined ? parseInt(String(cuotasTotales), 10) : undefined,
        periodoActual,
      });
      return NextResponse.json(result);
    }

    // 3. Si el ID corresponde a una Cuota de Préstamo individual
    const esCuotaPrestamo = await prisma.cuotaPrestamo.findUnique({
      where: { id },
      include: { prestamo: true },
    });
    if (esCuotaPrestamo) {
      if (esCuotaPrestamo.prestamo.usuarioId !== user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
      const result = await ajustarCuotasPrestamo({
        prestamoId: esCuotaPrestamo.prestamoId,
        cuotaId: id,
        cuotaActual: cuotaActual !== undefined ? parseInt(String(cuotaActual), 10) : esCuotaPrestamo.numeroCuota,
        cuotasRestantes: cuotasRestantes !== undefined ? parseInt(String(cuotasRestantes), 10) : undefined,
        cuotasTotales: cuotasTotales !== undefined ? parseInt(String(cuotasTotales), 10) : undefined,
        periodoActual: periodoActual || esCuotaPrestamo.periodo,
      });
      return NextResponse.json(result);
    }

    // 4. Si es un Gasto / compra con tarjeta diferida en cuotas
    const esGasto = await prisma.gasto.findUnique({ where: { id } });
    if (esGasto) {
      if (esGasto.usuarioId !== user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
      const result = await ajustarCuotasGasto({
        gastoId: id,
        cuotaActual: cuotaActual !== undefined ? parseInt(String(cuotaActual), 10) : undefined,
        cuotasRestantes: cuotasRestantes !== undefined ? parseInt(String(cuotasRestantes), 10) : undefined,
        cuotasTotales: cuotasTotales !== undefined ? parseInt(String(cuotasTotales), 10) : undefined,
        periodoActual,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  } catch (error: any) {
    console.error('Error en /api/cuotas:', error);
    return NextResponse.json(
      { error: error.message || 'Error al ajustar las cuotas' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
