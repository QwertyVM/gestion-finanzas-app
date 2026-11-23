import { esItemRecurrente } from '../utils';
import prisma from '../prisma';
import { ClasificacionEgreso, EstadoPago, MetodoPago } from '@prisma/client';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '../billing-cycles';

export async function registrarNuevoGasto(params: {
  usuarioId?: string;
  concepto: string;
  monto: number;
  monedaOriginal?: string;
  montoOriginal?: number;
  tipoCambio?: number;
  fechaGasto: string | Date;
  metodoPago: MetodoPago;
  tarjetaId?: string;
  totalCuotas?: number;
  categoriaId?: string;
  tag?: string;
  ingresoId?: string;
  estado?: EstadoPago;
  notas?: string;
}) {
  const {
    usuarioId,
    concepto,
    monto,
    monedaOriginal = 'PEN',
    montoOriginal,
    tipoCambio = 4.00,
    fechaGasto,
    metodoPago,
    tarjetaId,
    totalCuotas = 1,
    categoriaId,
    tag,
    ingresoId,
    estado = EstadoPago.PENDIENTE,
    notas,
  } = params;

  const uId = usuarioId;
  if (!uId) {
    throw new Error('usuarioId es requerido para registrar un gasto');
  }

  const fecha = typeof fechaGasto === 'string' ? new Date(fechaGasto) : fechaGasto;

  // Calcular categoría para clasificación (necesaria para detectar recurrentes)
  let catNombre = '';
  if (categoriaId) {
    const cat = await prisma.categoria.findUnique({ where: { id: categoriaId }, select: { nombre: true } });
    catNombre = cat?.nombre || '';
  }

  // Determinar y persistir la clasificación al momento del registro
  const clasificacion: ClasificacionEgreso =
    totalCuotas > 1 ? 'CUOTA' :
      esItemRecurrente(concepto, catNombre) ? 'FIJO' :
        'VARIABLE';

  let periodoInicial = '';

  if (metodoPago === MetodoPago.TARJETA_CREDITO && tarjetaId) {
    const tarjeta = await prisma.tarjetaCredito.findUnique({ where: { id: tarjetaId } });
    const diaCorte = tarjeta?.diaCorte || 10;
    const diaPago = tarjeta?.diaPago || 30;
    const calculo = calcularPeriodoFacturacion(fecha, diaCorte, diaPago);
    periodoInicial = calculo.periodoPago;
  } else {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    periodoInicial = `${anio}-${mes}`;
  }

  if (totalCuotas > 1 && metodoPago === MetodoPago.TARJETA_CREDITO) {
    const periodos = calcularCuotasPeriodos(periodoInicial, totalCuotas);
    const montoCuota = Number((monto / totalCuotas).toFixed(2));
    const montoOrigCuota = montoOriginal ? Number((montoOriginal / totalCuotas).toFixed(2)) : null;
    const padreId = crypto.randomUUID();

    const gastosCreados = [];
    for (let i = 0; i < totalCuotas; i++) {
      const g = await prisma.gasto.create({
        data: {
          id: i === 0 ? padreId : undefined,
          usuarioId: uId,
          concepto: `${concepto} (Cuota ${i + 1}/${totalCuotas})`,
          monto: montoCuota,
          monedaOriginal,
          montoOriginal: montoOrigCuota,
          tipoCambio,
          fechaGasto: fecha,
          periodoPago: periodos[i],
          metodoPago,
          tarjetaId,
          cuotaActual: i + 1,
          totalCuotas,
          clasificacion,  // ← persistido en BD
          categoriaId,
          tag: tag ? tag.trim() : null,
          ingresoId: i === 0 ? (ingresoId || null) : null,
          estado: i === 0 ? estado : EstadoPago.PENDIENTE,
          gastoPadreId: i === 0 ? null : padreId,
          notas,
        },
      });
      gastosCreados.push(g);
    }
    return gastosCreados;
  } else {
    const gasto = await prisma.gasto.create({
      data: {
        usuarioId: uId,
        concepto,
        monto,
        monedaOriginal,
        montoOriginal: montoOriginal || null,
        tipoCambio,
        fechaGasto: fecha,
        periodoPago: periodoInicial,
        metodoPago,
        tarjetaId: metodoPago === MetodoPago.TARJETA_CREDITO ? tarjetaId : null,
        cuotaActual: 1,
        totalCuotas: 1,
        clasificacion,  // ← persistido en BD
        categoriaId,
        tag: tag ? tag.trim() : null,
        ingresoId: ingresoId || null,
        estado,
        fechaPagoReal: estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO ? new Date() : null,
        notas,
      },
    });
    return [gasto];
  }
}

/**
 * Calcula la diferencia en meses entre dos periodos (YYYY-MM).
 * Positivo si periodo es posterior a refPeriodo, negativo si es anterior.
 */
export function getDeltaMonths(periodo: string, refPeriodo: string): number {
  const [a1, m1] = periodo.split('-').map(Number);
  const [a2, m2] = refPeriodo.split('-').map(Number);
  return (a1 - a2) * 12 + (m1 - m2);
}

/**
 * Calcula el periodo (YYYY-MM) correspondiente a una cuota destino tomando como base una cuota de referencia.
 */
export function getPeriodoForCuota(periodoRef: string, cuotaRef: number, cuotaDestino: number): string {
  const [anioStr, mesStr] = periodoRef.split('-');
  const anio = parseInt(anioStr, 10);
  const mes = parseInt(mesStr, 10) - 1;
  const delta = cuotaDestino - cuotaRef;
  const d = new Date(anio, mes + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Ajusta la cantidad de cuotas (totales o restantes) o la cuota actual (cuántas voy pagando) de un préstamo bancario.
 * Preserva las cuotas ya pagadas y recalcula el plan de amortización futuro.
 */
export async function ajustarCuotasPrestamo(params: {
  prestamoId?: string;
  cuotaId?: string;
  cuotaActual?: number;
  cuotasRestantes?: number;
  cuotasTotales?: number;
  periodoActual?: string;
}) {
  let prestamo = null;

  if (params.prestamoId) {
    prestamo = await prisma.prestamo.findUnique({
      where: { id: params.prestamoId },
      include: { cuotas: { orderBy: { numeroCuota: 'asc' } } },
    });
  } else if (params.cuotaId) {
    const cuota = await prisma.cuotaPrestamo.findUnique({
      where: { id: params.cuotaId },
      include: {
        prestamo: {
          include: { cuotas: { orderBy: { numeroCuota: 'asc' } } },
        },
      },
    });
    if (cuota) {
      prestamo = cuota.prestamo;
      if (!params.cuotaActual) {
        params.cuotaActual = cuota.numeroCuota;
      }
      if (!params.periodoActual) {
        params.periodoActual = cuota.periodo;
      }
    }
  }

  if (!prestamo) {
    throw new Error('Préstamo no encontrado');
  }

  const pId = prestamo.id;

  // 1. Determinar periodo actual de referencia
  const refPeriodo =
    params.periodoActual ||
    prestamo.cuotas.find((c) => c.numeroCuota === params.cuotaActual)?.periodo ||
    prestamo.cuotas[0]?.periodo ||
    '2026-11';

  // 2. Determinar cuota actual para refPeriodo
  let targetCuotaActual: number;
  if (params.cuotaActual !== undefined && params.cuotaActual !== null) {
    targetCuotaActual = Math.max(1, parseInt(String(params.cuotaActual), 10));
  } else {
    const c = prestamo.cuotas.find((q) => q.periodo === refPeriodo);
    targetCuotaActual = c?.numeroCuota || prestamo.cuotas[0]?.numeroCuota || 1;
  }

  // 3. Determinar nuevo total de cuotas y cuotas restantes
  let nuevoCuotasTotales: number;
  let nuevasRestantes: number;

  if (params.cuotasTotales !== undefined && params.cuotasTotales !== null) {
    nuevoCuotasTotales = Math.max(targetCuotaActual, parseInt(String(params.cuotasTotales), 10));
    nuevasRestantes = Math.max(0, nuevoCuotasTotales - targetCuotaActual);
  } else if (params.cuotasRestantes !== undefined && params.cuotasRestantes !== null) {
    nuevasRestantes = Math.max(0, parseInt(String(params.cuotasRestantes), 10));
    nuevoCuotasTotales = targetCuotaActual + nuevasRestantes;
  } else {
    nuevoCuotasTotales = Math.max(targetCuotaActual, prestamo.cuotasTotales);
    nuevasRestantes = Math.max(0, nuevoCuotasTotales - targetCuotaActual);
  }

  // 4. Renumeración y sincronización de cuotas:
  // Para evitar colisiones con @@unique([prestamoId, numeroCuota]),
  // pasamos todos los numeroCuota temporalmente a números negativos.
  await prisma.$executeRaw`
    UPDATE "CuotaPrestamo"
    SET "numeroCuota" = -1 * ("numeroCuota" + 10000)
    WHERE "prestamoId" = ${pId}
  `;

  const cuotasExistentes = await prisma.cuotaPrestamo.findMany({
    where: { prestamoId: pId },
  });

  const periodosMapeados = new Set<string>();

  // 5. Ajustar cuotas existentes según su periodo respecto a refPeriodo
  for (const c of cuotasExistentes) {
    const delta = getDeltaMonths(c.periodo, refPeriodo);
    const calculatedNumero = targetCuotaActual + delta;

    // Si la cuota calculada excede el nuevo total de cuotas y no está pagada, se elimina
    if (calculatedNumero > nuevoCuotasTotales && c.estado !== EstadoPago.PAGADO) {
      await prisma.cuotaPrestamo.delete({ where: { id: c.id } });
      continue;
    }

    if (calculatedNumero >= 1) {
      await prisma.cuotaPrestamo.update({
        where: { id: c.id },
        data: { numeroCuota: calculatedNumero },
      });
      periodosMapeados.add(c.periodo);
    } else {
      if (c.estado === EstadoPago.PAGADO) {
        await prisma.cuotaPrestamo.update({
          where: { id: c.id },
          data: { numeroCuota: Math.abs(c.numeroCuota) - 10000 },
        });
      } else {
        await prisma.cuotaPrestamo.delete({ where: { id: c.id } });
      }
    }
  }

  // 6. Generar cuotas faltantes desde targetCuotaActual hasta nuevoCuotasTotales
  for (let n = targetCuotaActual; n <= nuevoCuotasTotales; n++) {
    const periodo = getPeriodoForCuota(refPeriodo, targetCuotaActual, n);
    if (!periodosMapeados.has(periodo)) {
      const existeCuota = await prisma.cuotaPrestamo.findFirst({
        where: {
          prestamoId: pId,
          OR: [{ numeroCuota: n }, { periodo }],
        },
      });

      if (!existeCuota) {
        await prisma.cuotaPrestamo.create({
          data: {
            prestamoId: pId,
            numeroCuota: n,
            periodo,
            monto: prestamo.montoCuota,
            estado: EstadoPago.PENDIENTE,
          },
        });
        periodosMapeados.add(periodo);
      }
    }
  }

  // 7. Actualizar el total de cuotas en la cabecera del préstamo
  await prisma.prestamo.update({
    where: { id: pId },
    data: {
      cuotasTotales: nuevoCuotasTotales,
    },
  });

  return {
    success: true,
    prestamoId: pId,
    cuotaActual: targetCuotaActual,
    cuotasTotales: nuevoCuotasTotales,
    cuotasRestantes: nuevasRestantes,
  };
}

/**
 * Ajusta la cantidad de cuotas (totales o restantes) o la cuota actual (cuántas voy pagando) de una compra con tarjeta en cuotas.
 */
export async function ajustarCuotasGasto(params: {
  gastoId: string;
  cuotaActual?: number;
  cuotasRestantes?: number;
  cuotasTotales?: number;
  periodoActual?: string;
}) {
  const gasto = await prisma.gasto.findUnique({
    where: { id: params.gastoId },
  });

  if (!gasto) {
    throw new Error('Gasto no encontrado');
  }

  const padreId = gasto.gastoPadreId || gasto.id;
  const allCuotas = await prisma.gasto.findMany({
    where: {
      OR: [{ id: padreId }, { gastoPadreId: padreId }],
    },
    orderBy: { cuotaActual: 'asc' },
  });

  const refPeriodo = params.periodoActual || gasto.periodoPago;
  const cuotaMes = allCuotas.find((c) => c.periodoPago === refPeriodo) || gasto;

  let targetCuotaActual: number;
  if (params.cuotaActual !== undefined && params.cuotaActual !== null) {
    targetCuotaActual = Math.max(1, parseInt(String(params.cuotaActual), 10));
  } else {
    targetCuotaActual = cuotaMes.cuotaActual || 1;
  }

  const currentTotal = gasto.totalCuotas || allCuotas.length || 1;

  let nuevoCuotasTotales: number;
  let nuevasRestantes: number;

  if (params.cuotasTotales !== undefined && params.cuotasTotales !== null) {
    nuevoCuotasTotales = Math.max(targetCuotaActual, parseInt(String(params.cuotasTotales), 10));
    nuevasRestantes = Math.max(0, nuevoCuotasTotales - targetCuotaActual);
  } else if (params.cuotasRestantes !== undefined && params.cuotasRestantes !== null) {
    nuevasRestantes = Math.max(0, parseInt(String(params.cuotasRestantes), 10));
    nuevoCuotasTotales = targetCuotaActual + nuevasRestantes;
  } else {
    nuevoCuotasTotales = Math.max(targetCuotaActual, currentTotal);
    nuevasRestantes = Math.max(0, nuevoCuotasTotales - targetCuotaActual);
  }

  // Extraer el nombre base limpio del concepto sin "(Cuota X/Y)"
  const baseConcepto = gasto.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();

  // Detectar y unificar posibles registros hermanos huérfanos con el mismo concepto y tarjeta
  const matchingOrphans = await prisma.gasto.findMany({
    where: {
      usuarioId: gasto.usuarioId,
      tarjetaId: gasto.tarjetaId,
      concepto: { startsWith: baseConcepto },
      gastoPadreId: null,
      id: { not: padreId },
    },
  });

  for (const orphan of matchingOrphans) {
    await prisma.gasto.update({
      where: { id: orphan.id },
      data: { gastoPadreId: padreId },
    });
    allCuotas.push(orphan);
  }

  // Renumerar cuotas existentes según delta respecto a refPeriodo
  const periodosMapeados = new Set<string>();

  for (const c of allCuotas) {
    const delta = getDeltaMonths(c.periodoPago, refPeriodo);
    const calculatedNumero = targetCuotaActual + delta;

    if (calculatedNumero > nuevoCuotasTotales && c.estado !== EstadoPago.PAGADO) {
      await prisma.gasto.delete({ where: { id: c.id } });
      continue;
    }

    if (calculatedNumero >= 1) {
      await prisma.gasto.update({
        where: { id: c.id },
        data: {
          cuotaActual: calculatedNumero,
          totalCuotas: nuevoCuotasTotales,
          concepto: `${baseConcepto} (Cuota ${calculatedNumero}/${nuevoCuotasTotales})`,
        },
      });
      periodosMapeados.add(c.periodoPago);
    }
  }

  // Generar cuotas faltantes desde targetCuotaActual hasta nuevoCuotasTotales
  for (let n = targetCuotaActual; n <= nuevoCuotasTotales; n++) {
    const periodo = getPeriodoForCuota(refPeriodo, targetCuotaActual, n);
    if (!periodosMapeados.has(periodo)) {
      // Verificar si ya existe en la base de datos un gasto para este usuario, tarjeta y concepto en este periodo
      const existeGasto = await prisma.gasto.findFirst({
        where: {
          usuarioId: gasto.usuarioId,
          tarjetaId: gasto.tarjetaId,
          periodoPago: periodo,
          concepto: { startsWith: baseConcepto },
        },
      });

      if (existeGasto) {
        await prisma.gasto.update({
          where: { id: existeGasto.id },
          data: {
            gastoPadreId: padreId,
            cuotaActual: n,
            totalCuotas: nuevoCuotasTotales,
            concepto: `${baseConcepto} (Cuota ${n}/${nuevoCuotasTotales})`,
          },
        });
        periodosMapeados.add(periodo);
      } else {
        await prisma.gasto.create({
          data: {
            usuarioId: gasto.usuarioId,
            concepto: `${baseConcepto} (Cuota ${n}/${nuevoCuotasTotales})`,
            monto: gasto.monto,
            monedaOriginal: gasto.monedaOriginal,
            montoOriginal: gasto.montoOriginal,
            tipoCambio: gasto.tipoCambio,
            fechaGasto: gasto.fechaGasto,
            periodoPago: periodo,
            metodoPago: gasto.metodoPago,
            tarjetaId: gasto.tarjetaId,
            cuotaActual: n,
            totalCuotas: nuevoCuotasTotales,
            clasificacion: ClasificacionEgreso.CUOTA,
            categoriaId: gasto.categoriaId,
            estado: EstadoPago.PENDIENTE,
            gastoPadreId: padreId,
            notas: gasto.notas,
          },
        });
        periodosMapeados.add(periodo);
      }
    }
  }

  return {
    success: true,
    gastoId: gasto.id,
    cuotaActual: targetCuotaActual,
    cuotasTotales: nuevoCuotasTotales,
    cuotasRestantes: nuevasRestantes,
  };
}
