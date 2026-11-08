import prisma from './prisma';
import { EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from './billing-cycles';
import { formatPeriodoLabel } from './utils';

export interface ResumenFinanciero {
  periodo: string;
  config: {
    nombre: string;
    monedaSimbolo: string;
    sueldoBaseMensual: number;
    diaPagoSueldo: number;
    tipoCambioUSD: number;
    metaAhorroMensual: number;
  };
  ingresos: Array<{
    id: string;
    periodo: string;
    tipo: TipoIngreso;
    concepto: string;
    monto: number;
    monedaOriginal: string;
    montoOriginal?: number | null;
    tipoCambio: number;
    fechaEsperada: string;
    recibido: boolean;
  }>;
  totalIngresos: number;
  costosFijos: Array<{
    id: string;
    concepto: string;
    monto: number;
    diaVencimiento: number;
    categoria: string;
    registroId?: string;
    estado: EstadoPago;
    fechaPagoReal?: string | null;
    mesInicio?: string | null;
    mesFin?: string | null;
    notas?: string | null;
    monedaOriginal?: string;
    montoOriginal?: number | null;
    tipoCambio?: number;
  }>;
  totalCostosFijos: number;
  prestamos: Array<{
    id: string;
    cuotaId: string;
    banco: string;
    concepto: string;
    montoTotal: number;
    montoCuota: number;
    cuotaActual: number;
    cuotasTotales: number;
    tasaInteresAnual: number;
    diaPago: number;
    estado: EstadoPago;
    fechaPagoReal?: string | null;
    aplicaEsteMes?: boolean;
    periodoInicio?: string | null;
    periodoFin?: string | null;
    mensajePeriodo?: string | null;
    monedaOriginal?: string;
    montoOriginal?: number | null;
    tipoCambio?: number;
  }>;
  totalPrestamos: number;
  tarjetasCredito: Array<{
    id: string;
    nombre: string;
    banco: string;
    ultimosCuatro?: string | null;
    diaCorte: number;
    diaPago: number;
    color: string;
    totalPeriodo: number;
    gastosPeriodo: Array<any>;
    totalSiguientePeriodo: number;
    gastosSiguientePeriodo: Array<any>;
  }>;
  totalTarjetas: number;
  gastosDirectos: Array<{
    id: string;
    concepto: string;
    monto: number;
    monedaOriginal: string;
    montoOriginal?: number | null;
    tipoCambio: number;
    fechaGasto: string;
    periodoPago: string;
    metodoPago: MetodoPago;
    categoria: string;
    estado: EstadoPago;
    fechaPagoReal?: string | null;
    notas?: string | null;
  }>;
  totalGastosDirectos: number;
  totalEgresos: number;
  totalPagado: number;
  totalAdelantado: number;
  totalPendiente: number;
  dineroDisponibleBruto: number;
  metaAhorro: number;
  dineroDisponibleNeto: number;
  proyeccionMultiMes: Array<{
    periodo: string;
    ingresos: number;
    egresos: number;
    disponible: number;
    esGrati: boolean;
    esUtilidad: boolean;
  }>;
}

export async function getResumenMensual(periodo: string): Promise<ResumenFinanciero> {
  const [sAnio, sMes] = periodo.split('-').map(Number);
  const nextDate = new Date(sAnio, sMes, 1);
  const siguientePeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  // CONSULTAS ULTRA-OPTIMIZADAS EN PARALELO
  const [
    configRaw,
    ingresosDbRaw,
    costosFijosBase,
    prestamosDb,
    tarjetasDb,
    gastosDirectosDb,
    gastosNextAll,
  ] = await Promise.all([
    prisma.configuracionUsuario.findFirst(),
    prisma.ingresoMes.findMany({
      where: { periodo },
      orderBy: { fechaEsperada: 'asc' },
    }),
    prisma.costoFijo.findMany({
      where: { activo: true },
      include: {
        categoria: true,
        registrosMes: {
          where: { periodo },
        },
      },
      orderBy: { diaVencimiento: 'asc' },
    }),
    prisma.prestamo.findMany({
      where: { activo: true },
      include: {
        cuotas: {
          orderBy: { numeroCuota: 'asc' },
        },
      },
      orderBy: { diaPago: 'asc' },
    }),
    prisma.tarjetaCredito.findMany({
      where: { activa: true },
      include: {
        gastos: {
          where: { periodoPago: periodo },
          include: { categoria: true },
          orderBy: { fechaGasto: 'desc' },
        },
      },
      orderBy: { nombre: 'asc' },
    }),
    prisma.gasto.findMany({
      where: {
        periodoPago: periodo,
        metodoPago: { not: MetodoPago.TARJETA_CREDITO },
      },
      include: { categoria: true },
      orderBy: { fechaGasto: 'desc' },
    }),
    prisma.gasto.findMany({
      where: {
        periodoPago: siguientePeriodo,
      },
      include: { categoria: true },
      orderBy: { fechaGasto: 'desc' },
    }),
  ]);

  const config = configRaw || {
    id: 'default',
    nombre: 'Víctor',
    monedaSimbolo: 'S/',
    sueldoBaseMensual: 8200.00,
    diaPagoSueldo: 30,
    tipoCambioUSD: 4.00,
    metaAhorroMensual: 1000.00,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 1. Ingresos
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

  // 2. Costos Fijos
  const costosFijos = [];
  let totalCostosFijos = 0;

  for (const cf of costosFijosBase) {
    if (cf.mesInicio && periodo < cf.mesInicio) continue;
    if (cf.mesFin && periodo > cf.mesFin) continue;

    const reg = cf.registrosMes[0];
    const montoNum = reg ? Number(reg.monto) : Number(cf.monto);
    totalCostosFijos += montoNum;

    let monedaOriginal = 'PEN';
    let montoOriginal: number | null = null;
    let tipoCambio = Number(config.tipoCambioUSD);

    if (reg?.notas && reg.notas.includes('USD: $')) {
      const mUsd = reg.notas.match(/USD:\s*\$([0-9.]+)/);
      const mTc = reg.notas.match(/TC:\s*S\/\s*([0-9.]+)/);
      if (mUsd) {
        monedaOriginal = 'USD';
        montoOriginal = parseFloat(mUsd[1]);
        if (mTc) tipoCambio = parseFloat(mTc[1]);
        else if (montoOriginal > 0) tipoCambio = Number((montoNum / montoOriginal).toFixed(2));
      }
    } else {
      const usdMatch = cf.concepto.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      if (usdMatch) {
        monedaOriginal = 'USD';
        montoOriginal = parseFloat(usdMatch[1]);
        if (montoOriginal > 0 && montoNum > 0) {
          tipoCambio = Number((montoNum / montoOriginal).toFixed(2));
        }
      }
    }

    costosFijos.push({
      id: cf.id,
      concepto: cf.concepto,
      monto: montoNum,
      diaVencimiento: cf.diaVencimiento,
      categoria: cf.categoria?.nombre || 'General',
      registroId: reg?.id || undefined,
      estado: reg ? reg.estado : EstadoPago.PENDIENTE,
      fechaPagoReal: reg?.fechaPagoReal ? reg.fechaPagoReal.toISOString() : null,
      mesInicio: cf.mesInicio,
      mesFin: cf.mesFin,
      notas: reg?.notas || null,
      monedaOriginal,
      montoOriginal,
      tipoCambio,
    });
  }

  // 3. Préstamos
  const prestamos = [];
  let totalPrestamos = 0;

  for (const p of prestamosDb) {
    const cuotaMes = p.cuotas.find((c) => c.periodo === periodo);
    const primeraCuota = p.cuotas[0];
    const ultimaCuota = p.cuotas[p.cuotas.length - 1];

    let pMonedaOriginal = 'PEN';
    let pMontoOriginal: number | null = null;
    let pTipoCambio = Number(config.tipoCambioUSD);
    const pUsdMatch = p.concepto.match(/\$([0-9]+(?:\.[0-9]+)?)/);
    if (pUsdMatch) {
      pMonedaOriginal = 'USD';
      pMontoOriginal = parseFloat(pUsdMatch[1]);
      if (pMontoOriginal > 0 && Number(p.montoCuota) > 0) {
        pTipoCambio = Number((Number(p.montoCuota) / pMontoOriginal).toFixed(2));
      }
    }

    if (cuotaMes) {
      const montoNum = Number(cuotaMes.monto);
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
      });
    } else {
      const proximaCuota = p.cuotas.find((c) => c.periodo > periodo) || ultimaCuota;
      const esFuturo = proximaCuota && proximaCuota.periodo > periodo;
      const mensaje = esFuturo
        ? `Inicia en ${formatPeriodoLabel(proximaCuota.periodo)}`
        : 'Finalizado';

      prestamos.push({
        id: p.id,
        cuotaId: proximaCuota?.id || `preview-${p.id}`,
        banco: p.banco,
        concepto: p.concepto,
        montoTotal: Number(p.montoTotal),
        montoCuota: Number(p.montoCuota),
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
      });
    }
  }

  // 4. Tarjetas
  const tarjetasCredito = [];
  let totalTarjetas = 0;

  for (const t of tarjetasDb) {
    const gastosMes = t.gastos;
    const totalMes = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);
    totalTarjetas += totalMes;

    const gastosNext = gastosNextAll.filter((g) => g.tarjetaId === t.id);
    const totalNext = gastosNext.reduce((acc, g) => acc + Number(g.monto), 0);

    tarjetasCredito.push({
      id: t.id,
      nombre: t.nombre,
      banco: t.banco,
      ultimosCuatro: t.ultimosCuatro,
      diaCorte: t.diaCorte,
      diaPago: t.diaPago,
      color: t.color,
      totalPeriodo: totalMes,
      gastosPeriodo: gastosMes.map((g) => ({
        id: g.id,
        concepto: g.concepto,
        monto: Number(g.monto),
        monedaOriginal: g.monedaOriginal,
        montoOriginal: g.montoOriginal ? Number(g.montoOriginal) : null,
        tipoCambio: Number(g.tipoCambio),
        fechaGasto: g.fechaGasto.toISOString(),
        periodoPago: g.periodoPago,
        categoria: g.categoria?.nombre || 'General',
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
        notas: g.notas || null,
      })),
      totalSiguientePeriodo: totalNext,
      gastosSiguientePeriodo: gastosNext.map((g) => ({
        id: g.id,
        concepto: g.concepto,
        monto: Number(g.monto),
        monedaOriginal: g.monedaOriginal,
        montoOriginal: g.montoOriginal ? Number(g.montoOriginal) : null,
        tipoCambio: Number(g.tipoCambio),
        fechaGasto: g.fechaGasto.toISOString(),
        periodoPago: g.periodoPago,
        categoria: g.categoria?.nombre || 'General',
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        notas: g.notas || null,
      })),
    });
  }

  // 5. Gastos Directos
  const gastosDirectos = gastosDirectosDb.map((g) => ({
    id: g.id,
    concepto: g.concepto,
    monto: Number(g.monto),
    monedaOriginal: g.monedaOriginal,
    montoOriginal: g.montoOriginal ? Number(g.montoOriginal) : null,
    tipoCambio: Number(g.tipoCambio),
    fechaGasto: g.fechaGasto.toISOString(),
    periodoPago: g.periodoPago,
    metodoPago: g.metodoPago,
    categoria: g.categoria?.nombre || 'General',
    estado: g.estado,
    fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
    notas: g.notas || null,
  }));
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
  const dineroDisponibleBruto = totalIngresos - totalEgresos;
  const metaAhorro = Number(config.metaAhorroMensual || 1000);
  const dineroDisponibleNeto = dineroDisponibleBruto - metaAhorro;

  return {
    periodo,
    config: {
      nombre: config.nombre,
      monedaSimbolo: config.monedaSimbolo,
      sueldoBaseMensual: Number(config.sueldoBaseMensual),
      diaPagoSueldo: config.diaPagoSueldo,
      tipoCambioUSD: Number(config.tipoCambioUSD || 4.00),
      metaAhorroMensual: metaAhorro,
    },
    ingresos,
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
    proyeccionMultiMes: [],
  };
}

export async function registrarNuevoGasto(params: {
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
  estado?: EstadoPago;
  notas?: string;
}) {
  const {
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
    estado = EstadoPago.PENDIENTE,
    notas,
  } = params;

  const fecha = typeof fechaGasto === 'string' ? new Date(fechaGasto) : fechaGasto;

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
          categoriaId,
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
        categoriaId,
        estado,
        fechaPagoReal: estado === EstadoPago.PAGADO || estado === EstadoPago.ADELANTADO ? new Date() : null,
        notas,
      },
    });
    return [gasto];
  }
}
