import prisma from './prisma';
import { EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from './billing-cycles';

export interface ResumenFinanciero {
  periodo: string;
  config: {
    nombre: string;
    monedaSimbolo: string;
    sueldoBaseMensual: number;
    diaPagoSueldo: number;
  };
  ingresos: Array<{
    id: string;
    periodo: string;
    tipo: TipoIngreso;
    concepto: string;
    monto: number;
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
  }>;
  totalCostosFijos: number;
  prestamos: Array<{
    id: string;
    cuotaId: string;
    banco: string;
    concepto: string;
    numeroCuota: number;
    cuotasTotales: number;
    montoCuota: number;
    diaPago: number;
    estado: EstadoPago;
    fechaPagoReal?: string | null;
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
    fechaGasto: string;
    metodoPago: MetodoPago;
    categoria: string;
    estado: EstadoPago;
    fechaPagoReal?: string | null;
  }>;
  totalGastosDirectos: number;
  totalEgresos: number;
  totalPagado: number;
  totalAdelantado: number;
  totalPendiente: number;
  dineroDisponible: number;
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
  // 1. Configuración de usuario
  let config = await prisma.configuracionUsuario.findFirst();
  if (!config) {
    config = await prisma.configuracionUsuario.create({
      data: {
        nombre: 'Víctor',
        monedaSimbolo: 'S/',
        sueldoBaseMensual: 6000.00,
        diaPagoSueldo: 30,
      },
    });
  }

  // 2. Ingresos del periodo
  let ingresosDb = await prisma.ingresoMes.findMany({
    where: { periodo },
    orderBy: { fechaEsperada: 'asc' },
  });

  // Si no hay sueldo registrado para el mes, asegurar que figure con el sueldo base
  const tieneSueldo = ingresosDb.some((i) => i.tipo === TipoIngreso.SUELDO);
  if (!tieneSueldo && Number(config.sueldoBaseMensual) > 0) {
    const nuevoSueldo = await prisma.ingresoMes.create({
      data: {
        periodo,
        tipo: TipoIngreso.SUELDO,
        concepto: 'Sueldo Mensual Planilla',
        monto: config.sueldoBaseMensual,
        fechaEsperada: new Date(`${periodo}-28`),
      },
    });
    ingresosDb.push(nuevoSueldo);
  }

  // Comprobar si el mes corresponde a Gratificación (Julio 07 o Diciembre 12)
  const mesNumero = parseInt(periodo.split('-')[1], 10);
  const tieneGrati = ingresosDb.some((i) => i.tipo === TipoIngreso.GRATIFICACION);
  if ((mesNumero === 7 || mesNumero === 12) && !tieneGrati) {
    const montoGrati = Number(config.sueldoBaseMensual) * 1.09; // Sueldo + 9% bono de ley
    const nuevaGrati = await prisma.ingresoMes.create({
      data: {
        periodo,
        tipo: TipoIngreso.GRATIFICACION,
        concepto: mesNumero === 7 ? 'Gratificación Julio (Fiestas Patrias)' : 'Gratificación Diciembre (Navidad)',
        monto: montoGrati,
        fechaEsperada: new Date(`${periodo}-15`),
      },
    });
    ingresosDb.push(nuevaGrati);
  }

  // Comprobar si corresponde a Utilidades (Marzo 03)
  const tieneUtilidades = ingresosDb.some((i) => i.tipo === TipoIngreso.UTILIDADES);
  if (mesNumero === 3 && !tieneUtilidades) {
    const nuevaUtilidad = await prisma.ingresoMes.create({
      data: {
        periodo,
        tipo: TipoIngreso.UTILIDADES,
        concepto: 'Utilidades Anuales',
        monto: Number(config.sueldoBaseMensual) * 1.5,
        fechaEsperada: new Date(`${periodo}-25`),
      },
    });
    ingresosDb.push(nuevaUtilidad);
  }

  const ingresos = ingresosDb.map((i) => ({
    id: i.id,
    periodo: i.periodo,
    tipo: i.tipo,
    concepto: i.concepto,
    monto: Number(i.monto),
    fechaEsperada: i.fechaEsperada.toISOString(),
    recibido: i.recibido,
  }));

  const totalIngresos = ingresos.reduce((acc, curr) => acc + curr.monto, 0);

  // 3. Costos Fijos
  const costosFijosBase = await prisma.costoFijo.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      registrosMes: {
        where: { periodo },
      },
    },
    orderBy: { diaVencimiento: 'asc' },
  });

  const costosFijos = [];
  let totalCostosFijos = 0;

  for (const cf of costosFijosBase) {
    let reg = cf.registrosMes[0];
    if (!reg) {
      // Crear registro automático para este periodo si aún no existe
      reg = await prisma.registroCostoFijoMes.create({
        data: {
          costoFijoId: cf.id,
          periodo,
          monto: cf.monto,
          estado: EstadoPago.PENDIENTE,
        },
      });
    }

    const montoNum = Number(reg.monto);
    totalCostosFijos += montoNum;

    costosFijos.push({
      id: cf.id,
      concepto: cf.concepto,
      monto: montoNum,
      diaVencimiento: cf.diaVencimiento,
      categoria: cf.categoria?.nombre || 'General',
      registroId: reg.id,
      estado: reg.estado,
      fechaPagoReal: reg.fechaPagoReal ? reg.fechaPagoReal.toISOString() : null,
    });
  }

  // 4. Préstamos Bancarios
  const prestamosDb = await prisma.prestamo.findMany({
    where: { activo: true },
    include: {
      cuotas: {
        where: { periodo },
      },
    },
    orderBy: { diaPago: 'asc' },
  });

  const prestamos = [];
  let totalPrestamos = 0;

  for (const p of prestamosDb) {
    let cuota = p.cuotas[0];
    if (!cuota) {
      // Calcular número de cuota correspondiente al periodo
      const fechaInicio = new Date(p.fechaInicio);
      const [pAnio, pMes] = periodo.split('-').map(Number);
      const mesesDiferencia = (pAnio - fechaInicio.getFullYear()) * 12 + (pMes - (fechaInicio.getMonth() + 1)) + 1;

      if (mesesDiferencia >= 1 && mesesDiferencia <= p.cuotasTotales) {
        cuota = await prisma.cuotaPrestamo.create({
          data: {
            prestamoId: p.id,
            numeroCuota: mesesDiferencia,
            periodo,
            monto: p.montoCuota,
            estado: EstadoPago.PENDIENTE,
          },
        });
      }
    }

    if (cuota) {
      const montoNum = Number(cuota.monto);
      totalPrestamos += montoNum;
      prestamos.push({
        id: p.id,
        cuotaId: cuota.id,
        banco: p.banco,
        concepto: p.concepto,
        numeroCuota: cuota.numeroCuota,
        cuotasTotales: p.cuotasTotales,
        montoCuota: montoNum,
        diaPago: p.diaPago,
        estado: cuota.estado,
        fechaPagoReal: cuota.fechaPagoReal ? cuota.fechaPagoReal.toISOString() : null,
      });
    }
  }

  // 5. Tarjetas de Crédito y Gastos en Tarjeta
  const tarjetasDb = await prisma.tarjetaCredito.findMany({
    where: { activa: true },
    include: {
      gastos: {
        where: {
          periodoPago: periodo,
        },
        include: { categoria: true },
        orderBy: { fechaGasto: 'desc' },
      },
    },
    orderBy: { nombre: 'asc' },
  });

  // También obtener gastos de tarjetas para el siguiente periodo (los que pasaron corte)
  const [sAnio, sMes] = periodo.split('-').map(Number);
  const nextDate = new Date(sAnio, sMes, 1);
  const siguientePeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  const tarjetasCredito = [];
  let totalTarjetas = 0;

  for (const t of tarjetasDb) {
    const gastosMes = t.gastos;
    const totalMes = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);
    totalTarjetas += totalMes;

    const gastosNext = await prisma.gasto.findMany({
      where: {
        tarjetaId: t.id,
        periodoPago: siguientePeriodo,
      },
      include: { categoria: true },
      orderBy: { fechaGasto: 'desc' },
    });
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
        fechaGasto: g.fechaGasto.toISOString(),
        categoria: g.categoria?.nombre || 'General',
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
        fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
      })),
      totalSiguientePeriodo: totalNext,
      gastosSiguientePeriodo: gastosNext.map((g) => ({
        id: g.id,
        concepto: g.concepto,
        monto: Number(g.monto),
        fechaGasto: g.fechaGasto.toISOString(),
        categoria: g.categoria?.nombre || 'General',
        estado: g.estado,
        cuotaActual: g.cuotaActual,
        totalCuotas: g.totalCuotas,
      })),
    });
  }

  // 6. Gastos Directos (Débito, Efectivo, Transferencia)
  const gastosDirectosDb = await prisma.gasto.findMany({
    where: {
      periodoPago: periodo,
      metodoPago: { not: MetodoPago.TARJETA_CREDITO },
    },
    include: { categoria: true },
    orderBy: { fechaGasto: 'desc' },
  });

  const gastosDirectos = gastosDirectosDb.map((g) => ({
    id: g.id,
    concepto: g.concepto,
    monto: Number(g.monto),
    fechaGasto: g.fechaGasto.toISOString(),
    metodoPago: g.metodoPago,
    categoria: g.categoria?.nombre || 'General',
    estado: g.estado,
    fechaPagoReal: g.fechaPagoReal ? g.fechaPagoReal.toISOString() : null,
  }));

  const totalGastosDirectos = gastosDirectos.reduce((acc, g) => acc + g.monto, 0);

  // 7. Cálculo de Totales por Estado (Pagado, Adelantado, Pendiente)
  let totalPagado = 0;
  let totalAdelantado = 0;
  let totalPendiente = 0;

  // Costos fijos
  for (const cf of costosFijos) {
    if (cf.estado === EstadoPago.PAGADO) totalPagado += cf.monto;
    else if (cf.estado === EstadoPago.ADELANTADO) totalAdelantado += cf.monto;
    else totalPendiente += cf.monto;
  }

  // Préstamos
  for (const p of prestamos) {
    if (p.estado === EstadoPago.PAGADO) totalPagado += p.montoCuota;
    else if (p.estado === EstadoPago.ADELANTADO) totalAdelantado += p.montoCuota;
    else totalPendiente += p.montoCuota;
  }

  // Tarjetas
  for (const t of tarjetasCredito) {
    for (const g of t.gastosPeriodo) {
      if (g.estado === EstadoPago.PAGADO) totalPagado += g.monto;
      else if (g.estado === EstadoPago.ADELANTADO) totalAdelantado += g.monto;
      else totalPendiente += g.monto;
    }
  }

  // Gastos Directos
  for (const g of gastosDirectos) {
    if (g.estado === EstadoPago.PAGADO) totalPagado += g.monto;
    else if (g.estado === EstadoPago.ADELANTADO) totalAdelantado += g.monto;
    else totalPendiente += g.monto;
  }

  const totalEgresos = totalCostosFijos + totalPrestamos + totalTarjetas + totalGastosDirectos;
  const dineroDisponible = totalIngresos - totalEgresos;

  // 8. Proyección Multi-Mes (Línea de tiempo de 6 meses desde el periodo actual)
  const proyeccionMultiMes = await getMultiMesProyeccion(periodo, 6);

  return {
    periodo,
    config: {
      nombre: config.nombre,
      monedaSimbolo: config.monedaSimbolo,
      sueldoBaseMensual: Number(config.sueldoBaseMensual),
      diaPagoSueldo: config.diaPagoSueldo,
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
    dineroDisponible,
    proyeccionMultiMes,
  };
}

export async function getMultiMesProyeccion(periodoInicio: string, cantidadMeses: number = 6) {
  const [initAnio, initMes] = periodoInicio.split('-').map(Number);
  const result = [];

  const config = await prisma.configuracionUsuario.findFirst();
  const sueldoBase = Number(config?.sueldoBaseMensual || 6000);

  // Costos fijos base activos
  const fijosActivos = await prisma.costoFijo.aggregate({
    where: { activo: true },
    _sum: { monto: true },
  });
  const totalFijosBase = Number(fijosActivos._sum.monto || 0);

  for (let i = 0; i < cantidadMeses; i++) {
    const d = new Date(initAnio, initMes - 1 + i, 1);
    const pAnio = d.getFullYear();
    const pMes = d.getMonth() + 1;
    const p = `${pAnio}-${String(pMes).padStart(2, '0')}`;

    const esGrati = pMes === 7 || pMes === 12;
    const esUtilidad = pMes === 3;

    // Ingresos del periodo en BD
    const ingresosDb = await prisma.ingresoMes.findMany({ where: { periodo: p } });
    let totalIngresos = ingresosDb.reduce((acc, curr) => acc + Number(curr.monto), 0);

    if (totalIngresos === 0) {
      totalIngresos += sueldoBase;
      if (esGrati) totalIngresos += sueldoBase * 1.09;
      if (esUtilidad) totalIngresos += sueldoBase * 1.5;
    }

    // Egresos del periodo en BD
    // Préstamos para el mes
    const prestamosCuotas = await prisma.cuotaPrestamo.aggregate({
      where: { periodo: p },
      _sum: { monto: true },
    });
    const totalPrestamos = Number(prestamosCuotas._sum.monto || 0);

    // Gastos asignados para el mes
    const gastosMes = await prisma.gasto.aggregate({
      where: { periodoPago: p },
      _sum: { monto: true },
    });
    const totalGastos = Number(gastosMes._sum.monto || 0);

    const egresosEstimados = totalFijosBase + totalPrestamos + totalGastos;
    const disponible = totalIngresos - egresosEstimados;

    result.push({
      periodo: p,
      ingresos: totalIngresos,
      egresos: egresosEstimados,
      disponible,
      esGrati,
      esUtilidad,
    });
  }

  return result;
}

export async function registrarNuevoGasto(params: {
  concepto: string;
  monto: number;
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
    // Si es débito/efectivo, impacta en el mes de la fecha del gasto
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    periodoInicial = `${anio}-${mes}`;
  }

  if (totalCuotas > 1 && metodoPago === MetodoPago.TARJETA_CREDITO) {
    // Distribuir en cuotas
    const periodos = calcularCuotasPeriodos(periodoInicial, totalCuotas);
    const montoCuota = Number((monto / totalCuotas).toFixed(2));
    const padreId = crypto.randomUUID();

    const gastosCreados = [];
    for (let i = 0; i < totalCuotas; i++) {
      const g = await prisma.gasto.create({
        data: {
          id: i === 0 ? padreId : undefined,
          concepto: `${concepto} (Cuota ${i + 1}/${totalCuotas})`,
          monto: montoCuota,
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
