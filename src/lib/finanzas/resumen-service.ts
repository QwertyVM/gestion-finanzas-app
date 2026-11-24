import prisma from '../prisma';
import { ClasificacionEgreso, EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';
import { formatPeriodoLabel, esItemRecurrente } from '../utils';
import { autoEnsureSchema, minPeriodoCache } from './cache';
import { clasificarItemBackend, obtenerColorCategoriaBackend } from './clasificacion';
import { calcularResumenDivisas } from './calculo-divisas';
import { calcularAnalisisCategoriasYTags } from './calculo-categorias';
import { calcularSaludFinancieraKPIs } from './calculo-salud';
import {
  ResumenFinanciero,
  EgresoConsolidado,
  SeccionCompromiso,
  TotalesPorClasificacion,
} from './types';

export async function getResumenMensual(periodo: string, usuarioOrId?: string | any): Promise<ResumenFinanciero> {
  await autoEnsureSchema();
  const [sAnio, sMes] = periodo.split('-').map(Number);
  const nextDate = new Date(sAnio, sMes, 1);
  const siguientePeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  const periodos12: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(sAnio, sMes - 1 + i, 1);
    periodos12.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  // Resolver usuario activo para la instancia financiera (usar objeto directo si ya fue validado en la sesión)
  let usuario: any = null;
  if (usuarioOrId && typeof usuarioOrId === 'object' && usuarioOrId.id) {
    usuario = usuarioOrId;
  } else if (typeof usuarioOrId === 'string') {
    usuario = await prisma.usuario.findUnique({ where: { id: usuarioOrId } });
  }
  if (!usuario) {
    usuario = await prisma.usuario.findFirst({ where: { activo: true }, orderBy: { createdAt: 'asc' } });
  }
  if (!usuario) {
    throw new Error('Usuario no encontrado para generar el resumen financiero');
  }
  const uId = usuario.id;

  // CONSULTAS ULTRA-OPTIMIZADAS EN PARALELO FILTRADAS POR USUARIO
  const [
    ingresosDbRaw,
    costosFijosBase,
    prestamosDb,
    tarjetasDb,
    gastosDirectosDb,
    gastosNextAll,
    ingresosMulti,
    registrosFijosMulti,
    cuotasMulti,
    gastosMulti,
  ] = await Promise.all([
    prisma.ingresoMes.findMany({
      where: { periodo, usuarioId: uId },
      orderBy: { fechaEsperada: 'asc' },
    }),
    prisma.costoFijo.findMany({
      where: { activo: true, usuarioId: uId },
      include: {
        categoria: true,
        tarjeta: true,
        registrosMes: {
          where: { periodo },
          include: {
            tarjeta: true,
            ingreso: {
              select: { id: true, concepto: true, tipo: true },
            },
          },
        },
      },
      orderBy: [{ orden: 'asc' }, { diaVencimiento: 'asc' }],
    }),
    prisma.prestamo.findMany({
      where: { activo: true, usuarioId: uId },
      include: {
        cuotas: {
          orderBy: { numeroCuota: 'asc' },
        },
      },
      orderBy: [{ orden: 'asc' }, { diaPago: 'asc' }],
    }),
    prisma.tarjetaCredito.findMany({
      where: { activa: true, usuarioId: uId },
      include: {
        gastos: {
          where: { periodoPago: periodo, usuarioId: uId },
          include: {
            categoria: true,
            ingreso: {
              select: { id: true, concepto: true, tipo: true },
            },
          },
          orderBy: [{ orden: 'asc' }, { fechaGasto: 'desc' }],
        },
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    }),
    prisma.gasto.findMany({
      where: {
        periodoPago: periodo,
        metodoPago: { not: MetodoPago.TARJETA_CREDITO },
        usuarioId: uId,
      },
      include: {
        categoria: true,
        ingreso: {
          select: { id: true, concepto: true, tipo: true },
        },
      },
      orderBy: [{ orden: 'asc' }, { fechaGasto: 'desc' }],
    }),
    prisma.gasto.findMany({
      where: {
        periodoPago: siguientePeriodo,
        usuarioId: uId,
      },
      include: { categoria: true },
      orderBy: { fechaGasto: 'desc' },
    }),
    prisma.ingresoMes.findMany({
      where: { periodo: { in: periodos12 }, usuarioId: uId },
      select: { periodo: true, monto: true, tipo: true },
    }),
    prisma.registroCostoFijoMes.findMany({
      where: { periodo: { in: periodos12 }, costoFijo: { usuarioId: uId } },
      select: { periodo: true, monto: true, estado: true },
    }),
    prisma.cuotaPrestamo.findMany({
      where: { periodo: { in: periodos12 }, prestamo: { usuarioId: uId } },
      select: { periodo: true, monto: true, estado: true },
    }),
    prisma.gasto.findMany({
      where: { periodoPago: { in: periodos12 }, usuarioId: uId },
      select: { monto: true, periodoPago: true, estado: true },
    }),
  ]);

  // Obtener el periodo mínimo con registros para el usuario (con caché en memoria para eliminar 4 roundtrips a la BD)
  let minPeriodo = '2026-10';
  const cachedMin = minPeriodoCache.get(uId);
  const now = Date.now();
  if (cachedMin && cachedMin.expiresAt > now) {
    minPeriodo = cachedMin.minPeriodo;
  } else {
    const [minIngreso, minGasto, minFijo, minCuota] = await Promise.all([
      prisma.ingresoMes.findFirst({
        where: { usuarioId: uId },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
      prisma.gasto.findFirst({
        where: { usuarioId: uId },
        orderBy: { periodoPago: 'asc' },
        select: { periodoPago: true },
      }),
      prisma.registroCostoFijoMes.findFirst({
        where: { costoFijo: { usuarioId: uId } },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
      prisma.cuotaPrestamo.findFirst({
        where: { prestamo: { usuarioId: uId } },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
    ]);
    const periodosExistentes = [
      minIngreso?.periodo,
      minGasto?.periodoPago,
      minFijo?.periodo,
      minCuota?.periodo,
    ].filter(Boolean) as string[];

    minPeriodo = periodosExistentes.length > 0 ? periodosExistentes.sort()[0] : '2026-10';
    minPeriodoCache.set(uId, { minPeriodo, expiresAt: now + 30 * 60 * 1000 });
  }

  const config = {
    id: usuario.id,
    nombre: usuario.nombre,
    slug: usuario.slug,
    color: usuario.color,
    avatar: usuario.avatar,
    monedaSimbolo: usuario.monedaSimbolo,
    sueldoBaseMensual: Number(usuario.sueldoBaseMensual),
    diaPagoSueldo: usuario.diaPagoSueldo,
    tipoCambioUSD: Number(usuario.tipoCambioUSD || 4.00),
    metaAhorroMensual: Number(usuario.metaAhorroMensual ?? 0),
  };

  // 1. Carga automática de sueldo si no existe en el periodo (solo para periodos >= minPeriodo)
  const sueldoExistente = ingresosDbRaw.find((i) => i.tipo === 'SUELDO');
  if (!sueldoExistente && config.sueldoBaseMensual > 0 && periodo >= minPeriodo) {
    const ultimoSueldo = await prisma.ingresoMes.findFirst({
      where: {
        usuarioId: uId,
        tipo: 'SUELDO',
        periodo: { lte: periodo },
      },
      orderBy: { periodo: 'desc' },
    });
    const montoAutoSueldo = ultimoSueldo ? Number(ultimoSueldo.monto) : config.sueldoBaseMensual;

    const dia = config.diaPagoSueldo || 30;
    const [yr, mn] = periodo.split('-').map(Number);
    const maxDia = new Date(yr, mn, 0).getDate();
    const diaEfectivo = Math.min(dia, maxDia);
    const fechaEsperada = new Date(Date.UTC(yr, mn - 1, diaEfectivo, 12, 0, 0));

    try {
      const nuevoSueldo = await prisma.ingresoMes.upsert({
        where: {
          usuarioId_periodo_tipo_concepto: {
            usuarioId: uId,
            periodo,
            tipo: 'SUELDO',
            concepto: 'Sueldo Mensual Planilla',
          },
        },
        update: {},
        create: {
          usuarioId: uId,
          periodo,
          tipo: 'SUELDO',
          concepto: 'Sueldo Mensual Planilla',
          monto: montoAutoSueldo,
          fechaEsperada,
          recibido: false,
        },
      });
      ingresosDbRaw.push(nuevoSueldo);
    } catch {
      const sueldoReintento = await prisma.ingresoMes.findFirst({
        where: { usuarioId: uId, periodo, tipo: 'SUELDO' },
      });
      if (sueldoReintento) ingresosDbRaw.push(sueldoReintento);
    }
  }

  // 2. Ingresos
  const ingresos = ingresosDbRaw.map((i) => ({
    id: i.id,
    periodo: i.periodo,
    tipo: i.tipo,
    concepto: i.concepto,
    monto: Number(i.monto),
    monedaOriginal: i.monedaOriginal,
    montoOriginal: i.montoOriginal ? Number(i.montoOriginal) : null,
    tipoCambio: Number(i.tipoCambio),
    fechaEsperada: i.fechaEsperada.toISOString(),
    recibido: i.recibido,
  }));
  const totalIngresos = ingresos.reduce((acc, curr) => acc + curr.monto, 0);
  const mapIngresosMes = new Map(ingresosDbRaw.map((ing) => [ing.id, ing]));

  // 2. Costos Fijos
  const costosFijos = [];
  let totalCostosFijos = 0;

  for (const cf of costosFijosBase) {
    if (cf.mesInicio && periodo < cf.mesInicio) continue;
    if (cf.mesFin && periodo > cf.mesFin) continue;

    const reg = cf.registrosMes[0];
    let montoNum = reg ? Number(reg.monto) : Number(cf.monto);

    const tcConfig = Number(config.tipoCambioUSD || 4.00);
    let monedaOriginal = reg?.monedaOriginal || cf.monedaOriginal || 'PEN';
    let montoOriginal: number | null = reg?.montoOriginal !== null && reg?.montoOriginal !== undefined
      ? Number(reg.montoOriginal)
      : (cf.montoOriginal !== null && cf.montoOriginal !== undefined ? Number(cf.montoOriginal) : null);
    let tipoCambio = reg?.tipoCambio
      ? Number(reg.tipoCambio)
      : (cf.tipoCambio ? Number(cf.tipoCambio) : tcConfig);

    // Fallback retrocompatible para registros historicos sin campos de divisa explicitos
    if (monedaOriginal !== 'USD') {
      if (reg?.notas && reg.notas.includes('USD: $')) {
        const mUsd = reg.notas.match(/USD:\s*\$([0-9.]+)/);
        if (mUsd) {
          monedaOriginal = 'USD';
          montoOriginal = parseFloat(mUsd[1]);
        }
      } else {
        const usdMatch = cf.concepto.match(/\$([0-9]+(?:\.[0-9]+)?)/);
        if (usdMatch) {
          monedaOriginal = 'USD';
          montoOriginal = parseFloat(usdMatch[1]);
        }
      }
    }

    if (monedaOriginal === 'USD' && montoOriginal && montoOriginal > 0) {
      montoNum = Number((montoOriginal * tipoCambio).toFixed(2));
    }
    totalCostosFijos += montoNum;

    const metodoPago = reg?.metodoPago || cf.metodoPago || MetodoPago.EFECTIVO_DEBITO;
    const tarjetaObj = metodoPago === MetodoPago.TARJETA_CREDITO
      ? (reg?.tarjeta || cf.tarjeta || null)
      : null;
    const tarjetaId = tarjetaObj?.id || (metodoPago === MetodoPago.TARJETA_CREDITO ? (reg?.tarjetaId || cf.tarjetaId || null) : null);

    const catNombre = cf.categoria?.nombre || 'General';
    const catMeta = obtenerColorCategoriaBackend(catNombre);
    const catColor = cf.categoria?.color || catMeta.color;
    const catIcono = cf.categoria?.icono || catMeta.icono;
    const clasif = clasificarItemBackend({
      tipo: 'FIJO',
      concepto: cf.concepto,
      categoria: catNombre,
    });

    costosFijos.push({
      id: cf.id,
      concepto: cf.concepto,
      monto: montoNum,
      diaVencimiento: cf.diaVencimiento,
      categoria: catNombre,
      categoriaId: cf.categoriaId || null,
      tag: cf.tag || null,
      categoriaColor: catColor,
      categoriaIcono: catIcono,
      clasificacion: clasif.clasificacion,
      colorHex: clasif.colorHex,
      colorKey: clasif.colorKey,
      badgeLabel: clasif.badgeLabel,
      tipoLabel: clasif.tipoLabel,
      registroId: reg?.id || undefined,
      estado: reg ? reg.estado : EstadoPago.PENDIENTE,
      fechaPagoReal: reg?.fechaPagoReal ? reg.fechaPagoReal.toISOString() : null,
      mesInicio: cf.mesInicio,
      mesFin: cf.mesFin,
      notas: reg?.notas || null,
      monedaOriginal,
      montoOriginal,
      tipoCambio,
      metodoPago,
      tarjetaId,
      tarjetaNombre: tarjetaObj?.nombre || null,
      tarjetaBanco: tarjetaObj?.banco || null,
      tarjetaColor: tarjetaObj?.color || null,
      tarjetaUltimosCuatro: tarjetaObj?.ultimosCuatro || null,
      orden: cf.orden ?? 0,
      ingresoId: reg?.ingresoId || null,
      ingresoConcepto: (reg?.ingresoId ? mapIngresosMes.get(reg.ingresoId)?.concepto : null) || (reg as any)?.ingreso?.concepto || null,
      ingresoTipo: (reg?.ingresoId ? mapIngresosMes.get(reg.ingresoId)?.tipo : null) || (reg as any)?.ingreso?.tipo || null,
    });
  }

  // 3. Préstamos
  const prestamos = [];
  let totalPrestamos = 0;

  for (const p of prestamosDb) {
    const cuotaMes = p.cuotas.find((c) => c.periodo === periodo);
    const primeraCuota = p.cuotas[0];
    const ultimaCuota = p.cuotas[p.cuotas.length - 1];

    const pTcConfig = Number(config.tipoCambioUSD || 4.00);
    let pMonedaOriginal = cuotaMes?.monedaOriginal || p.monedaOriginal || 'PEN';
    let pMontoOriginal: number | null = cuotaMes?.montoOriginal !== null && cuotaMes?.montoOriginal !== undefined
      ? Number(cuotaMes.montoOriginal)
      : (p.montoOriginal !== null && p.montoOriginal !== undefined ? Number(p.montoOriginal) : null);
    let pTipoCambio = cuotaMes?.tipoCambio
      ? Number(cuotaMes.tipoCambio)
      : (p.tipoCambio ? Number(p.tipoCambio) : pTcConfig);

    if (pMonedaOriginal !== 'USD') {
      const pUsdMatch = p.concepto.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      if (pUsdMatch) {
        pMonedaOriginal = 'USD';
        pMontoOriginal = parseFloat(pUsdMatch[1]);
        pTipoCambio = pTcConfig;
      }
    }

    const pCatNombre = '20% Ahorro & Deuda';
    const pCatMeta = obtenerColorCategoriaBackend(pCatNombre);
    const pClasif = clasificarItemBackend({
      tipo: 'PRESTAMO',
      concepto: p.concepto,
      categoria: pCatNombre,
    });

    if (cuotaMes) {
      let montoNum = Number(cuotaMes.monto);
      if (pMonedaOriginal === 'USD' && pMontoOriginal && pMontoOriginal > 0) {
        montoNum = Number((pMontoOriginal * pTipoCambio).toFixed(2));
      }
      totalPrestamos += montoNum;
      prestamos.push({
        id: p.id,
        cuotaId: cuotaMes.id,
        banco: p.banco,
        concepto: p.concepto,
        montoTotal: Number(p.montoTotal),
        montoCuota: montoNum,
        cuotaActual: cuotaMes.numeroCuota,
        cuotasTotales: p.cuotasTotales,
        tasaInteresAnual: Number(p.tasaInteresAnual),
        diaPago: p.diaPago,
        estado: cuotaMes.estado,
        fechaPagoReal: cuotaMes.fechaPagoReal ? cuotaMes.fechaPagoReal.toISOString() : null,
        aplicaEsteMes: true,
        periodoInicio: primeraCuota?.periodo || null,
        periodoFin: ultimaCuota?.periodo || null,
        monedaOriginal: pMonedaOriginal,
        montoOriginal: pMontoOriginal,
        tipoCambio: pTipoCambio,
        categoria: pCatNombre,
        categoriaColor: pCatMeta.color,
        categoriaIcono: pCatMeta.icono,
        clasificacion: pClasif.clasificacion,
        colorHex: pClasif.colorHex,
        colorKey: pClasif.colorKey,
        badgeLabel: pClasif.badgeLabel,
        tipoLabel: pClasif.tipoLabel,
        orden: p.orden ?? 0,
        ingresoId: cuotaMes.ingresoId || null,
        ingresoConcepto: (cuotaMes.ingresoId ? mapIngresosMes.get(cuotaMes.ingresoId)?.concepto : null) || (cuotaMes as any).ingreso?.concepto || null,
        ingresoTipo: (cuotaMes.ingresoId ? mapIngresosMes.get(cuotaMes.ingresoId)?.tipo : null) || (cuotaMes as any).ingreso?.tipo || null,
      });
    } else {
      const proximaCuota = p.cuotas.find((c) => c.periodo > periodo) || ultimaCuota;
      const esFuturo = proximaCuota && proximaCuota.periodo > periodo;
      const mensaje = esFuturo
        ? `Inicia en ${formatPeriodoLabel(proximaCuota.periodo)}`
        : 'Finalizado';

      let montoCuotaPreview = Number(p.montoCuota);
      if (pMonedaOriginal === 'USD' && pMontoOriginal && pMontoOriginal > 0) {
        montoCuotaPreview = Number((pMontoOriginal * pTipoCambio).toFixed(2));
      }

      prestamos.push({
        id: p.id,
        cuotaId: proximaCuota?.id || `preview-${p.id}`,
        banco: p.banco,
        concepto: p.concepto,
        montoTotal: Number(p.montoTotal),
        montoCuota: montoCuotaPreview,
        cuotaActual: proximaCuota?.numeroCuota || 1,
        cuotasTotales: p.cuotasTotales,
        tasaInteresAnual: Number(p.tasaInteresAnual),
        diaPago: p.diaPago,
        estado: EstadoPago.PENDIENTE,
        fechaPagoReal: null,
        aplicaEsteMes: false,
        periodoInicio: primeraCuota?.periodo || null,
        periodoFin: ultimaCuota?.periodo || null,
        mensajePeriodo: mensaje,
        monedaOriginal: pMonedaOriginal,
        montoOriginal: pMontoOriginal,
        tipoCambio: pTipoCambio,
        categoria: pCatNombre,
        categoriaColor: pCatMeta.color,
        categoriaIcono: pCatMeta.icono,
        clasificacion: pClasif.clasificacion,
        colorHex: pClasif.colorHex,
        colorKey: pClasif.colorKey,
        badgeLabel: pClasif.badgeLabel,
        tipoLabel: pClasif.tipoLabel,
        orden: p.orden ?? 0,
        ingresoId: null,
        ingresoConcepto: null,
        ingresoTipo: null,
      });
    }
  }

  // 4. Tarjetas
  const tarjetasCredito = [];
  let totalTarjetas = 0;
  const tcConfigGlobal = Number(config.tipoCambioUSD || 4.00);

  for (const t of tarjetasDb) {
    const gastosPeriodo = t.gastos.map((g) => {
      const esUSD = g.monedaOriginal === 'USD';
      const montoUSD = esUSD
        ? (g.montoOriginal ? Number(g.montoOriginal) : (Number(g.monto) / (Number(g.tipoCambio) || tcConfigGlobal)))
        : null;
      const montoCalculado = esUSD && montoUSD != null
        ? Number((montoUSD * tcConfigGlobal).toFixed(2))
        : Number(g.monto);

      const esCuota = (g.totalCuotas || 1) > 1;
      const gCatNombre = g.categoria?.nombre || 'General';
      const gCatMeta = obtenerColorCategoriaBackend(gCatNombre);
      const gCatColor = g.categoria?.color || gCatMeta.color;
      const gCatIcono = g.categoria?.icono || (esCuota ? 'Layers' : gCatMeta.icono);
      const gClasif = clasificarItemBackend({
        tipo: 'TARJETA',
        concepto: g.concepto,
        categoria: gCatNombre,
        totalCuotas: g.totalCuotas,
        clasificacionBD: g.clasificacion,
      });

      return {
        id: g.id,
        concepto: g.concepto,
        monto: montoCalculado,
        monedaOriginal: g.monedaOriginal,
        montoOriginal: montoUSD,
        tipoCambio: esUSD ? tcConfigGlobal : Number(g.tipoCambio),
        fechaGasto: g.fechaGasto.toISOString(),
        periodoPago: g.periodoPago,
        categoria: gCatNombre,
        categoriaId: g.categoriaId || null,
        tag: g.tag || null,
        categoriaColor: gCatColor,
        categoriaIcono: gCatIcono,
        clasificacion: gClasif.clasificacion,
        colorHex: gClasif.colorHex,
        colorKey: gClasif.colorKey,
        badgeLabel: gClasif.badgeLabel,
        tipoLabel: gClasif.tipoLabel,
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
        notas: g.notas || null,
        orden: g.orden ?? 0,
        ingresoId: g.ingresoId || null,
        ingresoConcepto: g.ingreso?.concepto || null,
        ingresoTipo: g.ingreso?.tipo || null,
      };
    });

    const totalMes = gastosPeriodo.reduce((acc, g) => acc + g.monto, 0);
    totalTarjetas += totalMes;

    const gastosNext = gastosNextAll.filter((g) => g.tarjetaId === t.id);
    const gastosSiguientePeriodo = gastosNext.map((g) => {
      const esUSD = g.monedaOriginal === 'USD';
      const montoUSD = esUSD
        ? (g.montoOriginal ? Number(g.montoOriginal) : (Number(g.monto) / (Number(g.tipoCambio) || tcConfigGlobal)))
        : null;
      const montoCalculado = esUSD && montoUSD != null
        ? Number((montoUSD * tcConfigGlobal).toFixed(2))
        : Number(g.monto);

      const esCuota = (g.totalCuotas || 1) > 1;
      const gCatNombre = g.categoria?.nombre || 'General';
      const gCatMeta = obtenerColorCategoriaBackend(gCatNombre);
      const gCatColor = g.categoria?.color || gCatMeta.color;
      const gCatIcono = g.categoria?.icono || (esCuota ? 'Layers' : gCatMeta.icono);
      const gClasif = clasificarItemBackend({
        tipo: 'TARJETA',
        concepto: g.concepto,
        categoria: gCatNombre,
        totalCuotas: g.totalCuotas,
        clasificacionBD: g.clasificacion,
      });

      return {
        id: g.id,
        concepto: g.concepto,
        monto: montoCalculado,
        monedaOriginal: g.monedaOriginal,
        montoOriginal: montoUSD,
        tipoCambio: esUSD ? tcConfigGlobal : Number(g.tipoCambio),
        fechaGasto: g.fechaGasto.toISOString(),
        periodoPago: g.periodoPago,
        categoria: gCatNombre,
        categoriaId: g.categoriaId || null,
        tag: g.tag || null,
        categoriaColor: gCatColor,
        categoriaIcono: gCatIcono,
        clasificacion: gClasif.clasificacion,
        colorHex: gClasif.colorHex,
        colorKey: gClasif.colorKey,
        badgeLabel: gClasif.badgeLabel,
        tipoLabel: gClasif.tipoLabel,
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        notas: g.notas || null,
      };
    });
    const totalNext = gastosSiguientePeriodo.reduce((acc, g) => acc + g.monto, 0);

    tarjetasCredito.push({
      id: t.id,
      nombre: t.nombre,
      banco: t.banco,
      ultimosCuatro: t.ultimosCuatro,
      diaCorte: t.diaCorte,
      diaPago: t.diaPago,
      color: t.color,
      totalPeriodo: totalMes,
      totalRegistros: ((t as any)._count?.gastos || 0) + ((t as any)._count?.costosFijos || 0),
      cantidadGastos: (t as any)._count?.gastos || 0,
      cantidadCostosFijos: (t as any)._count?.costosFijos || 0,
      gastosPeriodo,
      totalSiguientePeriodo: totalNext,
      gastosSiguientePeriodo,
    });
  }

  // 5. Gastos Directos
  const gastosDirectos = gastosDirectosDb.map((g) => {
    const gdCatNombre = g.categoria?.nombre || 'General';
    const gdCatMeta = obtenerColorCategoriaBackend(gdCatNombre);
    const gdCatColor = g.categoria?.color || gdCatMeta.color;
    const gdCatIcono = g.categoria?.icono || gdCatMeta.icono;
    const gdClasif = clasificarItemBackend({
      tipo: 'DIRECTO',
      concepto: g.concepto,
      categoria: gdCatNombre,
      clasificacionBD: g.clasificacion,
    });

    const esUSD = g.monedaOriginal === 'USD';
    const montoUSD = esUSD
      ? (g.montoOriginal ? Number(g.montoOriginal) : (Number(g.monto) / (Number(g.tipoCambio) || tcConfigGlobal)))
      : null;
    const montoCalculado = esUSD && montoUSD != null
      ? Number((montoUSD * tcConfigGlobal).toFixed(2))
      : Number(g.monto);

    return {
      id: g.id,
      concepto: g.concepto,
      monto: montoCalculado,
      monedaOriginal: g.monedaOriginal,
      montoOriginal: montoUSD,
      tipoCambio: esUSD ? tcConfigGlobal : Number(g.tipoCambio),
      fechaGasto: g.fechaGasto.toISOString(),
      periodoPago: g.periodoPago,
      metodoPago: g.metodoPago,
      categoria: gdCatNombre,
      categoriaId: g.categoriaId || null,
      tag: g.tag || null,
      categoriaColor: gdCatColor,
      categoriaIcono: gdCatIcono,
      clasificacion: gdClasif.clasificacion,
      colorHex: gdClasif.colorHex,
      colorKey: gdClasif.colorKey,
      badgeLabel: gdClasif.badgeLabel,
      tipoLabel: gdClasif.tipoLabel,
      estado: g.estado,
      fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
      notas: g.notas || null,
      orden: g.orden ?? 0,
      ingresoId: g.ingresoId || null,
      ingresoConcepto: g.ingreso?.concepto || null,
      ingresoTipo: g.ingreso?.tipo || null,
    };
  });
  const totalGastosDirectos = gastosDirectos.reduce((acc, g) => acc + g.monto, 0);

  // 6. Totales por Estado
  let totalPagado = 0;
  let totalAdelantado = 0;
  let totalPendiente = 0;

  for (const cf of costosFijos) {
    if (cf.estado === EstadoPago.PAGADO) totalPagado += cf.monto;
    else if (cf.estado === EstadoPago.ADELANTADO) totalAdelantado += cf.monto;
    else totalPendiente += cf.monto;
  }

  for (const p of prestamos) {
    if (p.aplicaEsteMes === false) continue;
    if (p.estado === EstadoPago.PAGADO) totalPagado += p.montoCuota;
    else if (p.estado === EstadoPago.ADELANTADO) totalAdelantado += p.montoCuota;
    else totalPendiente += p.montoCuota;
  }

  for (const t of tarjetasCredito) {
    for (const g of t.gastosPeriodo) {
      if (g.estado === EstadoPago.PAGADO) totalPagado += g.monto;
      else if (g.estado === EstadoPago.ADELANTADO) totalAdelantado += g.monto;
      else totalPendiente += g.monto;
    }
  }

  for (const g of gastosDirectos) {
    if (g.estado === EstadoPago.PAGADO) totalPagado += g.monto;
    else if (g.estado === EstadoPago.ADELANTADO) totalAdelantado += g.monto;
    else totalPendiente += g.monto;
  }

  const totalEgresos = totalCostosFijos + totalPrestamos + totalTarjetas + totalGastosDirectos;
  // Egresos a liquidar con los ingresos de este mes (Pendientes + Pagados con sueldo).
  // Los compromisos en estado ADELANTADO se pagaron con otro dinero (ahorros o fondos previos),
  // por lo que no restan del dinero disponible del sueldo de este mes.
  const egresosSueldoMes = Math.max(0, totalEgresos - totalAdelantado);
  const dineroDisponibleBruto = totalIngresos - egresosSueldoMes;
  const metaAhorro = Number(config.metaAhorroMensual ?? 0);
  const dineroDisponibleNeto = dineroDisponibleBruto;

  const sueldoBaseNum = Number(config.sueldoBaseMensual ?? 0);

  const proyeccionMultiMes = periodos12.map((p, idx) => {
    // Para el mes seleccionado (idx 0), usar los totales exactos calculados
    if (idx === 0) {
      const esGratiMes0 = ingresos.some((i) => i.tipo === 'GRATIFICACION');
      const esUtilidadMes0 = ingresos.some((i) => i.tipo === 'UTILIDADES');
      return {
        periodo: p,
        ingresos: totalIngresos,
        egresos: totalEgresos,
        disponible: dineroDisponibleNeto,
        esGrati: esGratiMes0,
        esUtilidad: esUtilidadMes0,
      };
    }

    // Ingresos
    const ingMes = ingresosMulti.filter((i) => i.periodo === p);
    let totalIng = ingMes.reduce((acc, curr) => acc + Number(curr.monto), 0);
    const tieneGrati = ingMes.some((i) => i.tipo === 'GRATIFICACION');
    const tieneUtilidad = ingMes.some((i) => i.tipo === 'UTILIDADES');
    if (totalIng === 0) {
      totalIng += sueldoBaseNum;
    }

    // Costos fijos
    const fijosReg = registrosFijosMulti.filter((r) => r.periodo === p);
    let totalFij = fijosReg.reduce((acc, r) => acc + Number(r.monto), 0);
    const adelantoFij = fijosReg.filter((r) => r.estado === EstadoPago.ADELANTADO).reduce((acc, r) => acc + Number(r.monto), 0);
    if (totalFij === 0) {
      const vigentes = costosFijosBase.filter((f) => {
        const inicioOk = !f.mesInicio || f.mesInicio <= p;
        const finOk = !f.mesFin || f.mesFin >= p;
        return inicioOk && finOk;
      });
      totalFij = vigentes.reduce((acc, f) => acc + Number(f.monto), 0);
    }

    // Préstamos
    const cuotasMes = cuotasMulti.filter((c) => c.periodo === p);
    const totalPres = cuotasMes.reduce((acc, c) => acc + Number(c.monto), 0);
    const adelantoPres = cuotasMes.filter((c) => c.estado === EstadoPago.ADELANTADO).reduce((acc, c) => acc + Number(c.monto), 0);

    // Gastos
    const gastosMes = gastosMulti.filter((g) => g.periodoPago === p);
    const totalGas = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);
    const adelantoGas = gastosMes.filter((g) => g.estado === EstadoPago.ADELANTADO).reduce((acc, g) => acc + Number(g.monto), 0);

    const totalEgr = Number((totalFij + totalPres + totalGas).toFixed(2));
    const totalAdel = adelantoFij + adelantoPres + adelantoGas;
    const egresosSueldo = Math.max(0, totalEgr - totalAdel);
    const disp = Number((totalIng - egresosSueldo).toFixed(2));

    return {
      periodo: p,
      ingresos: totalIng,
      egresos: totalEgr,
      disponible: disp,
      esGrati: tieneGrati,
      esUtilidad: tieneUtilidad,
    };
  });

  // 7. Consolidación de todos los egresos del mes para entrega unificada y clasificación
  const egresosConsolidados: EgresoConsolidado[] = [];

  // A. Costos Fijos
  for (const cf of costosFijos) {
    egresosConsolidados.push({
      id: `fijo-${cf.id}`,
      dbId: cf.id,
      tipo: 'FIJO',
      clasificacion: cf.clasificacion,
      badgeLabel: cf.badgeLabel,
      tipoLabel: cf.tipoLabel,
      colorHex: cf.colorHex,
      colorKey: cf.colorKey,
      icono: 'Home',
      concepto: cf.concepto,
      subtexto: cf.metodoPago === MetodoPago.TARJETA_CREDITO
        ? `${cf.tarjetaNombre || 'Tarjeta'} · Fin de mes`
        : cf.metodoPago === MetodoPago.TRANSFERENCIA
          ? `Transferencia · Fin de mes`
          : esItemRecurrente(cf.concepto, cf.categoria)
            ? `Suscripción · Fin de mes`
            : `Efectivo / Débito · Fin de mes`,
      categoria: cf.categoria,
      categoriaId: cf.categoriaId || null,
      tag: cf.tag || null,
      categoriaColor: cf.categoriaColor,
      categoriaIcono: cf.categoriaIcono,
      monto: cf.monto,
      monedaOriginal: cf.monedaOriginal || 'PEN',
      montoOriginal: cf.montoOriginal || null,
      tipoCambio: cf.tipoCambio || Number(config.tipoCambioUSD || 4.0),
      diaVencimiento: cf.diaVencimiento,
      estado: cf.estado,
      fechaPagoReal: cf.fechaPagoReal,
      periodoPago: periodo,
      metodoPago: cf.metodoPago,
      tarjetaId: cf.tarjetaId,
      tarjetaNombre: cf.tarjetaNombre,
      tarjetaBanco: cf.tarjetaBanco,
      tarjetaColor: cf.tarjetaColor,
      tarjetaUltimosCuatro: cf.tarjetaUltimosCuatro,
      notas: cf.notas,
      mesInicio: cf.mesInicio,
      mesFin: cf.mesFin,
      orden: cf.orden ?? 0,
      ingresoId: cf.ingresoId || null,
      ingresoConcepto: cf.ingresoConcepto || null,
      ingresoTipo: cf.ingresoTipo || null,
    });
  }

  // B. Préstamos bancarios del mes
  for (const p of prestamos) {
    if (p.aplicaEsteMes === false) continue;
    egresosConsolidados.push({
      id: `prestamo-${p.cuotaId}`,
      dbId: p.cuotaId,
      prestamoId: p.id,
      tipo: 'PRESTAMO',
      clasificacion: 'PRESTAMO',
      badgeLabel: p.badgeLabel,
      tipoLabel: p.tipoLabel,
      colorHex: p.colorHex,
      colorKey: p.colorKey,
      icono: 'Landmark',
      concepto: `${p.banco} - ${p.concepto}`,
      subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} · Fin de mes`,
      categoria: p.categoria,
      categoriaId: null,
      tag: p.concepto || 'Préstamos & Créditos',
      categoriaColor: p.categoriaColor,
      categoriaIcono: p.categoriaIcono,
      monto: p.montoCuota,
      monedaOriginal: p.monedaOriginal || 'PEN',
      montoOriginal: p.montoOriginal || null,
      tipoCambio: p.tipoCambio || Number(config.tipoCambioUSD || 4.0),
      diaVencimiento: p.diaPago,
      estado: p.estado,
      fechaPagoReal: p.fechaPagoReal,
      periodoPago: periodo,
      cuotaActual: p.cuotaActual,
      totalCuotas: p.cuotasTotales,
      cuotasTotales: p.cuotasTotales,
      banco: p.banco,
      montoTotal: p.montoTotal,
      tasaInteresAnual: p.tasaInteresAnual,
      orden: p.orden ?? 0,
      ingresoId: p.ingresoId || null,
      ingresoConcepto: p.ingresoConcepto || null,
      ingresoTipo: p.ingresoTipo || null,
    });
  }

  // C. Gastos de Tarjetas de Crédito del periodo
  for (const t of tarjetasCredito) {
    for (const g of t.gastosPeriodo) {
      const esCuota = (g.totalCuotas || 1) > 1;
      egresosConsolidados.push({
        id: g.id,
        dbId: g.id,
        tipo: 'TARJETA',
        clasificacion: g.clasificacion,
        badgeLabel: g.badgeLabel,
        tipoLabel: g.tipoLabel,
        colorHex: g.colorHex,
        colorKey: g.colorKey,
        icono: esCuota ? 'Layers' : 'CreditCard',
        concepto: g.concepto,
        subtexto: esCuota
          ? `${t.nombre} · Cuota ${g.cuotaActual}/${g.totalCuotas}`
          : `${t.nombre} · Fin de mes`,
        categoria: g.categoria,
        categoriaId: g.categoriaId || null,
        tag: g.tag || null,
        categoriaColor: g.categoriaColor,
        categoriaIcono: g.categoriaIcono,
        monto: g.monto,
        monedaOriginal: g.monedaOriginal || 'PEN',
        montoOriginal: g.montoOriginal || null,
        tipoCambio: g.tipoCambio || Number(config.tipoCambioUSD || 4.0),
        diaVencimiento: t.diaPago,
        estado: g.estado,
        fechaPagoReal: g.fechaPagoReal,
        fechaGasto: g.fechaGasto,
        periodoPago: g.periodoPago || periodo,
        metodoPago: MetodoPago.TARJETA_CREDITO,
        tarjetaId: t.id,
        tarjetaNombre: t.nombre,
        tarjetaBanco: t.banco,
        tarjetaColor: t.color,
        tarjetaUltimosCuatro: t.ultimosCuatro,
        tarjetaDiaCorte: t.diaCorte,
        tarjetaDiaPago: t.diaPago,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        notas: g.notas,
        orden: g.orden ?? 0,
        ingresoId: g.ingresoId || null,
        ingresoConcepto: g.ingresoConcepto || null,
        ingresoTipo: g.ingresoTipo || null,
      });
    }
  }

  // D. Gastos Directos
  for (const g of gastosDirectos) {
    const diaGasto = g.fechaGasto ? new Date(g.fechaGasto).getDate() : 30;
    egresosConsolidados.push({
      id: g.id,
      dbId: g.id,
      tipo: 'DIRECTO',
      clasificacion: g.clasificacion,
      badgeLabel: g.badgeLabel,
      tipoLabel: g.tipoLabel,
      colorHex: g.colorHex,
      colorKey: g.colorKey,
      icono: 'Banknote',
      concepto: g.concepto,
      subtexto: g.metodoPago === MetodoPago.TRANSFERENCIA ? 'Transferencia directa' : 'Efectivo / Débito',
      categoria: g.categoria,
      categoriaId: g.categoriaId || null,
      tag: g.tag || null,
      categoriaColor: g.categoriaColor,
      categoriaIcono: g.categoriaIcono,
      monto: g.monto,
      monedaOriginal: g.monedaOriginal || 'PEN',
      montoOriginal: g.montoOriginal || null,
      tipoCambio: g.tipoCambio || Number(config.tipoCambioUSD || 4.0),
      diaVencimiento: diaGasto,
      estado: g.estado,
      fechaPagoReal: g.fechaPagoReal,
      fechaGasto: g.fechaGasto,
      periodoPago: g.periodoPago || periodo,
      metodoPago: g.metodoPago,
      notas: g.notas,
      orden: g.orden ?? 0,
      ingresoId: g.ingresoId || null,
      ingresoConcepto: g.ingresoConcepto || null,
      ingresoTipo: g.ingresoTipo || null,
    });
  }

  // Ordenar egresos consolidados: si tienen orden personalizado (> 0), respetarlo en orden ascendente; de lo contrario por día de vencimiento
  egresosConsolidados.sort((a, b) => {
    const ordenA = (a.orden !== undefined && a.orden !== null && a.orden > 0) ? a.orden : 999999;
    const ordenB = (b.orden !== undefined && b.orden !== null && b.orden > 0) ? b.orden : 999999;
    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }
    const diaA = a.diaVencimiento ?? 31;
    const diaB = b.diaVencimiento ?? 31;
    return diaA - diaB;
  });

  // Calcular métricas exactas por Clasificación
  let fijosSum = 0;
  let prestamosSum = 0;
  let cuotasSum = 0;
  let variablesSum = 0;
  let conteoFijos = 0;
  let conteoPrestamos = 0;
  let conteoCuotas = 0;
  let conteoVariables = 0;

  for (const item of egresosConsolidados) {
    if (item.clasificacion === 'FIJO') {
      fijosSum += item.monto;
      conteoFijos++;
    } else if (item.clasificacion === 'PRESTAMO') {
      prestamosSum += item.monto;
      conteoPrestamos++;
    } else if (item.clasificacion === 'CUOTA') {
      cuotasSum += item.monto;
      conteoCuotas++;
    } else {
      variablesSum += item.monto;
      conteoVariables++;
    }
  }

  const totalConsolidado = fijosSum + prestamosSum + cuotasSum + variablesSum;
  const totalesPorClasificacion: TotalesPorClasificacion = {
    fijos: Number(fijosSum.toFixed(2)),
    prestamos: Number(prestamosSum.toFixed(2)),
    cuotas: Number(cuotasSum.toFixed(2)),
    variables: Number(variablesSum.toFixed(2)),
    total: Number(totalConsolidado.toFixed(2)),
    conteoFijos,
    conteoPrestamos,
    conteoCuotas,
    conteoVariables,
    porcentajeFijos: totalConsolidado > 0 ? Number(((fijosSum / totalConsolidado) * 100).toFixed(1)) : 0,
    porcentajePrestamos: totalConsolidado > 0 ? Number(((prestamosSum / totalConsolidado) * 100).toFixed(1)) : 0,
    porcentajeCuotas: totalConsolidado > 0 ? Number(((cuotasSum / totalConsolidado) * 100).toFixed(1)) : 0,
    porcentajeVariables: totalConsolidado > 0 ? Number(((variablesSum / totalConsolidado) * 100).toFixed(1)) : 0,
  };

  const seccionesCompromisos: SeccionCompromiso[] = [
    {
      id: 'FIJOS',
      clave: 'fijos',
      titulo: 'Compras fijas',
      descripcion: 'Gastos y servicios fijos programados para este mes',
      icono: 'Home',
      colorKey: 'sky',
      colorHex: '#0284c7',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200 dark:border-sky-800/60',
      borderColor: 'border-l-sky-500',
      totalMonto: Number(fijosSum.toFixed(2)),
      totalItems: conteoFijos,
      items: egresosConsolidados.filter((e) => e.clasificacion === 'FIJO'),
    },
    {
      id: 'PRESTAMOS',
      clave: 'prestamos',
      titulo: 'Compras de préstamos bancario',
      descripcion: 'Amortización de préstamos personales, vehiculares y créditos',
      icono: 'Landmark',
      colorKey: 'purple',
      colorHex: '#a855f7',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-200 dark:border-purple-800/60',
      borderColor: 'border-l-purple-500',
      totalMonto: Number(prestamosSum.toFixed(2)),
      totalItems: conteoPrestamos,
      items: egresosConsolidados.filter((e) => e.clasificacion === 'PRESTAMO'),
    },
    {
      id: 'CUOTAS',
      clave: 'cuotas',
      titulo: 'Compras en tarjeta en cuotas',
      descripcion: 'Cuotas mensuales de consumos financiados con tarjeta de crédito',
      icono: 'CreditCard',
      colorKey: 'indigo',
      colorHex: '#6366f1',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      badgeBorder: 'border-indigo-200 dark:border-indigo-800/60',
      borderColor: 'border-l-indigo-500',
      totalMonto: Number(cuotasSum.toFixed(2)),
      totalItems: conteoCuotas,
      items: egresosConsolidados.filter((e) => e.clasificacion === 'CUOTA'),
    },
    {
      id: 'VARIABLES',
      clave: 'variables',
      titulo: 'Otras compras / Gastos variables',
      descripcion: 'Compras directas y gastos corrientes del mes',
      icono: 'Banknote',
      colorKey: 'teal',
      colorHex: '#14b8a6',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
      badgeText: 'text-teal-700 dark:text-teal-300',
      badgeBorder: 'border-teal-200 dark:border-teal-800/60',
      borderColor: 'border-l-teal-500',
      totalMonto: Number(variablesSum.toFixed(2)),
      totalItems: conteoVariables,
      items: egresosConsolidados.filter((e) => e.clasificacion === 'VARIABLE'),
    },
  ];

  // Cálculo de Inteligencia Analítica: Categorías, Tags, Métodos de Pago y Flexibilidad
  const analisisCategorias = calcularAnalisisCategoriasYTags(egresosConsolidados, totalEgresos);

  // Cálculo de Ratios Macro, Salud Financiera y Modelo Consultor 50/30/20
  const saludFinanciera = calcularSaludFinancieraKPIs({
    totalIngresos,
    totalEgresos,
    dineroDisponibleNeto,
    metaAhorro,
    egresosConsolidados,
    analisisCategorias,
  });

  // Cálculo de Resumen por Divisas / Moneda (Soles vs Dólares)
  const resumenDivisas = calcularResumenDivisas(
    egresosConsolidados,
    totalEgresos,
    Number(config.tipoCambioUSD || 4.00)
  );

  // Identificar el Sueldo principal del mes
  const sueldoPrincipal = ingresos.find((i) => i.tipo === 'SUELDO') || ingresos[0];

  const ingresosEnriquecidos = ingresos.map((ing) => {
    const esSueldoBase = ing.id === sueldoPrincipal?.id;
    const asignados = egresosConsolidados.filter((item) => {
      if (item.ingresoId === ing.id) return true;
      if (esSueldoBase && !item.ingresoId) return true;
      return false;
    });
    const totalGastosAsignados = Number(
      asignados.reduce((sum, g) => sum + (g.monto || 0), 0).toFixed(2)
    );
    return {
      ...ing,
      totalGastosAsignados,
      disponible: Number((ing.monto - totalGastosAsignados).toFixed(2)),
      gastosAsignadosCount: asignados.length,
    };
  });

  return {
    periodo,
    minPeriodo,
    config: {
      id: config.id,
      nombre: config.nombre,
      slug: config.slug,
      color: config.color,
      avatar: config.avatar,
      monedaSimbolo: config.monedaSimbolo,
      sueldoBaseMensual: Number(config.sueldoBaseMensual),
      diaPagoSueldo: config.diaPagoSueldo,
      tipoCambioUSD: Number(config.tipoCambioUSD || 4.00),
      metaAhorroMensual: metaAhorro,
    },
    ingresos: ingresosEnriquecidos,
    hayMultiplesIngresos: ingresos.length > 1,
    totalIngresos,
    costosFijos,
    totalCostosFijos,
    prestamos,
    totalPrestamos,
    tarjetasCredito,
    totalTarjetas,
    gastosDirectos,
    totalGastosDirectos,
    totalEgresos,
    totalPagado,
    totalAdelantado,
    totalPendiente,
    dineroDisponibleBruto,
    metaAhorro,
    dineroDisponibleNeto,
    proyeccionMultiMes,
    egresosConsolidados,
    totalesPorClasificacion,
    seccionesCompromisos,
    analisisCategorias,
    saludFinanciera,
    resumenDivisas,
  };
}
