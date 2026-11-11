import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodoActual = searchParams.get('periodo') || '2026-11';

    const gastos = await prisma.gasto.findMany({
      where: {
        usuarioId: user.id,
        OR: [
          { totalCuotas: { gt: 1 } },
          { gastoPadreId: { not: null } },
        ],
      },
      include: { tarjeta: true, categoria: true },
      orderBy: [{ periodoPago: 'asc' }, { cuotaActual: 'asc' }],
    });

    const groups = new Map<string, any>();

    for (const g of gastos) {
      const baseConcepto = g.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();
      const key = `${g.tarjetaId || 'no_card'}_${baseConcepto.toLowerCase()}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          padreId: g.gastoPadreId || g.id,
          primerGastoId: g.id,
          conceptoBase: baseConcepto,
          tarjetaId: g.tarjetaId,
          tarjetaNombre: g.tarjeta?.nombre || 'Tarjeta de Crédito',
          tarjetaColor: g.tarjeta?.color || '#4f46e5',
          categoriaNombre: g.categoria?.nombre || 'Compras',
          categoriaColor: g.categoria?.color || '#64748b',
          montoCuota: Number(g.monto),
          totalCuotas: g.totalCuotas || 1,
          cuotas: [],
        });
      }

      const grp = groups.get(key);
      grp.cuotas.push({
        id: g.id,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        periodoPago: g.periodoPago,
        monto: Number(g.monto),
        estado: g.estado,
        fechaGasto: g.fechaGasto,
        gastoPadreId: g.gastoPadreId,
      });
    }

    const result = Array.from(groups.values()).map((grp) => {
      const totalCuotas = grp.totalCuotas;
      const pagadas = grp.cuotas.filter((c: any) => c.estado === 'PAGADO').length;
      const pendientes = grp.cuotas.filter((c: any) => c.estado === 'PENDIENTE').length;
      const adelantadas = grp.cuotas.filter((c: any) => c.estado === 'ADELANTADO').length;
      const primerPeriodo = grp.cuotas[0]?.periodoPago || '';
      const ultimoPeriodo = grp.cuotas[grp.cuotas.length - 1]?.periodoPago || '';

      // Determinar la cuota para el periodo que se está viendo
      const cuotaEnPeriodo = grp.cuotas.find((c: any) => c.periodoPago === periodoActual);
      const cuotaActualNum = cuotaEnPeriodo?.cuotaActual || grp.cuotas[0]?.cuotaActual || 1;

      return {
        padreId: grp.padreId,
        idReferencia: grp.primerGastoId,
        conceptoBase: grp.conceptoBase,
        tarjetaId: grp.tarjetaId,
        tarjetaNombre: grp.tarjetaNombre,
        tarjetaColor: grp.tarjetaColor,
        categoriaNombre: grp.categoriaNombre,
        categoriaColor: grp.categoriaColor,
        montoCuota: grp.montoCuota,
        montoTotal: Number((grp.montoCuota * totalCuotas).toFixed(2)),
        totalCuotas,
        cuotaActual: cuotaActualNum,
        cuotasRestantes: Math.max(0, totalCuotas - cuotaActualNum),
        porcentajeProgreso: Math.min(100, Math.round((cuotaActualNum / totalCuotas) * 100)),
        totalRegistrosEnDB: grp.cuotas.length,
        pagadas,
        pendientes,
        adelantadas,
        primerPeriodo,
        ultimoPeriodo,
        cuotas: grp.cuotas,
      };
    });

    return NextResponse.json({ success: true, compras: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const padreId = searchParams.get('padreId') || searchParams.get('id');
    const conceptoBase = searchParams.get('conceptoBase');
    const tarjetaId = searchParams.get('tarjetaId');

    let whereClause: any = { usuarioId: user.id };

    if (padreId) {
      const gasto = await prisma.gasto.findUnique({ where: { id: padreId } });
      const rootId = gasto?.gastoPadreId || padreId;
      const baseConcepto = gasto?.concepto
        ? gasto.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim()
        : conceptoBase;

      whereClause = {
        usuarioId: user.id,
        OR: [
          { id: rootId },
          { gastoPadreId: rootId },
          ...(gasto?.tarjetaId && baseConcepto
            ? [{ tarjetaId: gasto.tarjetaId, concepto: { startsWith: baseConcepto } }]
            : []),
          ...(tarjetaId && conceptoBase
            ? [{ tarjetaId, concepto: { startsWith: conceptoBase } }]
            : []),
        ],
      };
    } else if (conceptoBase && tarjetaId) {
      whereClause = {
        usuarioId: user.id,
        tarjetaId,
        concepto: { startsWith: conceptoBase },
      };
    } else {
      return NextResponse.json(
        { error: 'Se requiere padreId o conceptoBase + tarjetaId' },
        { status: 400 }
      );
    }

    const res = await prisma.gasto.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

