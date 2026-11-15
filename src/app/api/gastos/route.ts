import { NextRequest, NextResponse } from 'next/server';
import { registrarNuevoGasto } from '@/lib/finanzas-service';
import { calcularPeriodoFacturacion } from '@/lib/billing-cycles';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo');

    const where: any = { usuarioId: user.id };
    if (periodo) {
      where.periodoPago = periodo;
    }

    const gastos = await prisma.gasto.findMany({
      where,
      include: {
        categoria: true,
        tarjeta: true,
      },
      orderBy: { fechaGasto: 'desc' },
    });

    return NextResponse.json(gastos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const result = await registrarNuevoGasto({
      usuarioId: user.id,
      concepto: body.concepto,
      monto: parseFloat(body.monto),
      monedaOriginal: body.monedaOriginal || 'PEN',
      montoOriginal: body.montoOriginal ? parseFloat(body.montoOriginal) : undefined,
      tipoCambio: body.tipoCambio ? parseFloat(body.tipoCambio) : 4.00,
      fechaGasto: body.fechaGasto || new Date(),
      metodoPago: body.metodoPago,
      tarjetaId: body.tarjetaId,
      totalCuotas: body.totalCuotas ? parseInt(body.totalCuotas, 10) : 1,
      categoriaId: body.categoriaId || undefined,
      estado: body.estado,
      notas: body.notas,
    });

    return NextResponse.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    console.error('Error al registrar gasto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, monto, concepto, estado, notas, clasificacion, metodoPago, tarjetaId, periodoPago } = await request.json();
    const updateData: any = {};
    if (monto !== undefined) updateData.monto = parseFloat(monto);
    if (concepto !== undefined) updateData.concepto = concepto;
    if (estado !== undefined) {
      updateData.estado = estado;
      updateData.fechaPagoReal = (estado === 'PAGADO' || estado === 'ADELANTADO') ? new Date() : null;
    }
    if (notas !== undefined) updateData.notas = notas;
    if (clasificacion !== undefined) {
      updateData.clasificacion = clasificacion;
    }

    if (metodoPago !== undefined) {
      updateData.metodoPago = metodoPago;
      const gasto = await prisma.gasto.findFirst({
        where: { id, usuarioId: user.id },
      });

      if (metodoPago === 'TARJETA_CREDITO') {
        const tId = tarjetaId !== undefined ? tarjetaId : gasto?.tarjetaId;
        updateData.tarjetaId = tId || null;
        if (gasto && tId) {
          const tarjeta = await prisma.tarjetaCredito.findUnique({ where: { id: tId } });
          if (tarjeta) {
            const calculo = calcularPeriodoFacturacion(
              gasto.fechaGasto,
              tarjeta.diaCorte || 10,
              tarjeta.diaPago || 30
            );
            updateData.periodoPago = calculo.periodoPago;
          }
        }
      } else {
        updateData.tarjetaId = null;
        if (gasto) {
          const fg = new Date(gasto.fechaGasto);
          const anio = fg.getFullYear();
          const mes = String(fg.getMonth() + 1).padStart(2, '0');
          updateData.periodoPago = `${anio}-${mes}`;
        }
      }
    } else if (tarjetaId !== undefined) {
      updateData.tarjetaId = tarjetaId || null;
      if (tarjetaId) {
        updateData.metodoPago = 'TARJETA_CREDITO';
        const gasto = await prisma.gasto.findFirst({
          where: { id, usuarioId: user.id },
        });
        if (gasto) {
          const tarjeta = await prisma.tarjetaCredito.findUnique({ where: { id: tarjetaId } });
          if (tarjeta) {
            const calculo = calcularPeriodoFacturacion(
              gasto.fechaGasto,
              tarjeta.diaCorte || 10,
              tarjeta.diaPago || 30
            );
            updateData.periodoPago = calculo.periodoPago;
          }
        }
      }
    }

    if (periodoPago !== undefined) {
      updateData.periodoPago = periodoPago;
    }

    const res = await prisma.gasto.updateMany({
      where: { id, usuarioId: user.id },
      data: updateData,
    });
    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const eliminarSerie = searchParams.get('eliminarSerie') === 'true' || searchParams.get('todo') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    if (eliminarSerie) {
      const gasto = await prisma.gasto.findUnique({ where: { id } });
      if (!gasto || gasto.usuarioId !== user.id) {
        return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
      }

      const padreId = gasto.gastoPadreId || gasto.id;
      const baseConcepto = gasto.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();

      const res = await prisma.gasto.deleteMany({
        where: {
          usuarioId: user.id,
          OR: [
            { id: padreId },
            { gastoPadreId: padreId },
            ...(gasto.tarjetaId
              ? [{ tarjetaId: gasto.tarjetaId, concepto: { startsWith: baseConcepto } }]
              : []),
          ],
        },
      });

      return NextResponse.json({ success: true, count: res.count, concepto: baseConcepto });
    }

    const res = await prisma.gasto.deleteMany({
      where: { id, usuarioId: user.id },
    });

    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
