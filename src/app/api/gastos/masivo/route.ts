import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action, ids, estado, categoriaId, tag } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Lista de IDs no válida' }, { status: 400 });
    }

    if (action === 'cambiar_estado') {
      const fechaPagoReal = (estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO) ? new Date() : null;

      await prisma.gasto.updateMany({
        where: { id: { in: ids }, usuarioId: user.id },
        data: {
          estado: estado as EstadoPago,
          fechaPagoReal,
        },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'cambiar_categoria') {
      const gastoIds = ids.filter((id: string) => !id.startsWith('fijo-') && !id.startsWith('prestamo-'));
      const fijoIds = ids.filter((id: string) => id.startsWith('fijo-')).map((id: string) => id.replace('fijo-', ''));

      if (gastoIds.length > 0) {
        await prisma.gasto.updateMany({
          where: { id: { in: gastoIds }, usuarioId: user.id },
          data: {
            ...(categoriaId !== undefined && { categoriaId: categoriaId || null }),
            ...(tag !== undefined && { tag: tag ? tag.trim() : null }),
          },
        });
      }

      if (fijoIds.length > 0) {
        await prisma.costoFijo.updateMany({
          where: { id: { in: fijoIds }, usuarioId: user.id },
          data: {
            ...(categoriaId !== undefined && { categoriaId: categoriaId || null }),
            ...(tag !== undefined && { tag: tag ? tag.trim() : null }),
          },
        });
      }

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'eliminar') {
      await prisma.gasto.deleteMany({
        where: { id: { in: ids }, usuarioId: user.id },
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
