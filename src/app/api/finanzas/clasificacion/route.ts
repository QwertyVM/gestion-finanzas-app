import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { ClasificacionEgreso } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, tipo, nuevaClasificacion, periodo } = body;

    if (!id || !nuevaClasificacion) {
      return NextResponse.json(
        { error: 'ID y nueva clasificación son requeridos' },
        { status: 400 }
      );
    }

    if (!['FIJO', 'VARIABLE'].includes(nuevaClasificacion)) {
      return NextResponse.json(
        { error: 'La clasificación debe ser FIJO o VARIABLE' },
        { status: 400 }
      );
    }

    // 1. Caso: Item que ya es un Gasto (TARJETA o DIRECTO)
    if (tipo === 'TARJETA' || tipo === 'DIRECTO') {
      const gasto = await prisma.gasto.findFirst({
        where: { id, usuarioId: user.id },
      });

      if (!gasto) {
        return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
      }

      const gastoActualizado = await prisma.gasto.update({
        where: { id },
        data: {
          clasificacion: nuevaClasificacion as ClasificacionEgreso,
        },
      });

      return NextResponse.json({
        success: true,
        tipo: 'GASTO_ACTUALIZADO',
        data: gastoActualizado,
      });
    }

    // 2. Caso: Item que proviene de CostoFijo (tipo === 'FIJO')
    if (tipo === 'FIJO') {
      const limpioId = id.replace('fijo-', '');
      const cf = await prisma.costoFijo.findFirst({
        where: { id: limpioId, usuarioId: user.id },
        include: {
          registrosMes: periodo ? { where: { periodo } } : undefined,
        },
      });

      if (!cf) {
        return NextResponse.json({ error: 'Costo fijo no encontrado' }, { status: 404 });
      }

      // Si se quiere cambiar a VARIABLE: se convierte a un Gasto para este mes
      if (nuevaClasificacion === 'VARIABLE') {
        const reg = cf.registrosMes?.[0];
        const periodoDestino = periodo || cf.mesInicio || new Date().toISOString().slice(0, 7);

        const nuevoGasto = await prisma.gasto.create({
          data: {
            usuarioId: user.id,
            concepto: cf.concepto,
            monto: reg ? reg.monto : cf.monto,
            monedaOriginal: 'PEN',
            fechaGasto: new Date(),
            periodoPago: periodoDestino,
            metodoPago: (reg?.metodoPago || cf.metodoPago || 'EFECTIVO_DEBITO') as any,
            tarjetaId: reg?.tarjetaId || cf.tarjetaId,
            totalCuotas: 1,
            cuotaActual: 1,
            clasificacion: 'VARIABLE',
            categoriaId: cf.categoriaId,
            estado: reg?.estado || 'PENDIENTE',
            fechaPagoReal: reg?.fechaPagoReal || null,
            notas: reg?.notas || null,
          },
        });

        // Eliminar registro del mes o el costo fijo si ya no aplica
        const totalRegistros = await prisma.registroCostoFijoMes.count({
          where: { costoFijoId: cf.id },
        });

        if (totalRegistros <= 1) {
          await prisma.costoFijo.delete({ where: { id: cf.id } });
        } else if (periodo) {
          await prisma.registroCostoFijoMes.deleteMany({
            where: { costoFijoId: cf.id, periodo },
          });
        }

        return NextResponse.json({
          success: true,
          tipo: 'CONVERTIDO_A_GASTO',
          nuevoGastoId: nuevoGasto.id,
        });
      }

      // Si ya es FIJO
      return NextResponse.json({
        success: true,
        tipo: 'SIN_CAMBIOS',
        mensaje: 'Ya es un costo fijo',
      });
    }

    return NextResponse.json(
      { error: `Tipo de egreso no soportado para reclasificación: ${tipo}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error al cambiar clasificación de egreso:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

