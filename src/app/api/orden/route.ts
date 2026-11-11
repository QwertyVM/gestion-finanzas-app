import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'La lista de items es requerida' }, { status: 400 });
    }

    const usuarioId = user.id;

    const updates = items.map((item: { id: string; tipo: string; orden: number; prestamoId?: string }) => {
      const ordenNum = typeof item.orden === 'number' ? item.orden : parseInt(String(item.orden), 10) || 0;

      if (item.tipo === 'FIJO') {
        return prisma.costoFijo.updateMany({
          where: {
            id: item.id,
            ...(usuarioId ? { usuarioId } : {}),
          },
          data: { orden: ordenNum },
        });
      }

      if (item.tipo === 'PRESTAMO') {
        const pId = item.prestamoId || item.id;
        return prisma.prestamo.updateMany({
          where: {
            OR: [
              { id: pId },
              { cuotas: { some: { id: pId } } },
            ],
            ...(usuarioId ? { usuarioId } : {}),
          },
          data: { orden: ordenNum },
        });
      }

      if (item.tipo === 'GASTO' || item.tipo === 'TARJETA' || item.tipo === 'DIRECTO') {
        return prisma.gasto.updateMany({
          where: {
            id: item.id,
            ...(usuarioId ? { usuarioId } : {}),
          },
          data: { orden: ordenNum },
        });
      }

      return null;
    }).filter(Boolean);

    await prisma.$transaction(updates as any);

    return NextResponse.json({
      success: true,
      message: 'Orden persistido exitosamente para todos los meses posteriores',
      count: items.length,
    });
  } catch (error: any) {
    console.error('Error al actualizar orden de egresos:', error);
    return NextResponse.json({ error: error.message || 'Error al persistir orden' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
