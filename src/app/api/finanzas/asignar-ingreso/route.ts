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
    const { items, ingresoId, periodo } = body;

    const itemsList: Array<{ id: string; tipo: string }> = items
      ? items
      : body.id && body.tipo
      ? [{ id: body.id, tipo: body.tipo }]
      : [];

    if (itemsList.length === 0) {
      return NextResponse.json({ error: 'No se especificaron ítems para asignar' }, { status: 400 });
    }

    // Validar ingresoId si se proporciona
    if (ingresoId) {
      const ingresoExiste = await prisma.ingresoMes.findFirst({
        where: { id: ingresoId, usuarioId: user.id },
      });
      if (!ingresoExiste) {
        return NextResponse.json({ error: 'Ingreso especificado no existe o no pertenece al usuario' }, { status: 400 });
      }
    }

    const periodoEfectivo = periodo || new Date().toISOString().slice(0, 7);
    let updatedCount = 0;

    for (const item of itemsList) {
      const rawId = item.id.replace('fijo-', '').replace('prestamo-', '');

      if (item.tipo === 'FIJO') {
        const costoFijo = await prisma.costoFijo.findFirst({
          where: { id: rawId, usuarioId: user.id },
        });
        if (costoFijo) {
          await prisma.registroCostoFijoMes.upsert({
            where: {
              costoFijoId_periodo: {
                costoFijoId: costoFijo.id,
                periodo: periodoEfectivo,
              },
            },
            update: {
              ingresoId: ingresoId || null,
            },
            create: {
              costoFijoId: costoFijo.id,
              periodo: periodoEfectivo,
              monto: costoFijo.monto,
              ingresoId: ingresoId || null,
              metodoPago: costoFijo.metodoPago,
              tarjetaId: costoFijo.tarjetaId,
            },
          });
          updatedCount++;
        }
      } else if (item.tipo === 'PRESTAMO') {
        const cuota = await prisma.cuotaPrestamo.findFirst({
          where: {
            id: rawId,
            prestamo: { usuarioId: user.id },
          },
        });
        if (cuota) {
          await prisma.cuotaPrestamo.update({
            where: { id: cuota.id },
            data: { ingresoId: ingresoId || null },
          });
          updatedCount++;
        }
      } else {
        // TARJETA o DIRECTO (Gasto)
        const gasto = await prisma.gasto.findFirst({
          where: { id: rawId, usuarioId: user.id },
        });
        if (gasto) {
          await prisma.gasto.update({
            where: { id: gasto.id },
            data: { ingresoId: ingresoId || null },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, count: updatedCount });
  } catch (error: any) {
    console.error('Error al asignar ingreso:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
