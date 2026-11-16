import prisma from './prisma';
import { ClasificacionEgreso, EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from './billing-cycles';
import { formatPeriodoLabel, esItemRecurrente } from './utils';

export interface EgresoConsolidado {
  id: string;
  dbId: string;
  tipo: 'FIJO' | 'PRESTAMO' | 'TARJETA' | 'DIRECTO';
  clasificacion: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  badgeLabel: string;
  tipoLabel: string;
  colorHex: string;
  colorKey: 'sky' | 'purple' | 'indigo' | 'teal';
  icono: string;
  concepto: string;
  subtexto: string;
  categoria: string;
  categoriaColor: string;
  categoriaIcono: string;
  monto: number;
  monedaOriginal: string;
  montoOriginal: number | null;
  tipoCambio: number;
  diaVencimiento: number | null;
  estado: EstadoPago;
  fechaPagoReal: string | null;
  fechaGasto?: string | null;
  periodoPago: string;
  metodoPago?: MetodoPago | string | null;
  tarjetaId?: string | null;
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  tarjetaColor?: string | null;
  tarjetaUltimosCuatro?: string | null;
  tarjetaDiaCorte?: number | null;
  tarjetaDiaPago?: number | null;
  cuotaActual?: number | null;
  totalCuotas?: number | null;
  cuotasTotales?: number | null;
  banco?: string | null;
  montoTotal?: number | null;
  tasaInteresAnual?: number | null;
  notas?: string | null;
  mesInicio?: string | null;
  mesFin?: string | null;
  prestamoId?: string | null;
  orden?: number | null;
}

export interface SeccionCompromiso {
  id: 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';
  clave: string;
  titulo: string;
  descripcion: string;
  icono: string;
  colorKey: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  borderColor: string;
  totalMonto: number;
  totalItems: number;
  items: EgresoConsolidado[];
}

export interface TotalesPorClasificacion {
  fijos: number;
  prestamos: number;
  cuotas: number;
  variables: number;
  total: number;
  conteoFijos: number;
  conteoPrestamos: number;
  conteoCuotas: number;
  conteoVariables: number;
  porcentajeFijos: number;
  porcentajePrestamos: number;
  porcentajeCuotas: number;
  porcentajeVariables: number;
}

export interface DesgloseMonedaDetalle {
  total: number;
  pendiente: number;
  pagado: number;
  adelantado: number;
  porcentaje: number;
  conteo: number;
  conteoPendiente?: number;
}

export interface DesgloseDolaresDetalle extends DesgloseMonedaDetalle {
  totalUSD: number;
  pendienteUSD: number;
  pagadoUSD: number;
  adelantadoUSD: number;
  tipoCambio: number;
  tipoCambioPromedio: number;
}

export interface ResumenDivisasEgresos {
  soles: DesgloseMonedaDetalle;
  dolares: DesgloseDolaresDetalle;
  tieneMultiplesMonedas: boolean;
  consolidado: {
    totalEgresosPEN: number;
    totalPendientePEN: number;
    totalPagadoPEN: number;
    totalAdelantadoPEN: number;
    totalCompromisos: number;
    totalPendientes?: number;
    cuadraSumatoria: boolean;
  };
}

export interface CategoriaAnalisisItem {
  id: string;
  nombre: string;
  color: string;
  icono: string;
  totalMonto: number;
  porcentaje: number;
  conteoItems: number;
  desgloseClasificacion: {
    fijo: number;
    prestamos: number;
    cuotas: number;
    variables: number;
  };
  desgloseEstado: {
    pagado: number;
    adelantado: number;
    pendiente: number;
  };
  porcentajePagado: number;
  items: EgresoConsolidado[];
}

export interface MetricasMacroCategorias {
  totalCategoriasActivas: number;
  categoriaMayorGasto: {
    nombre: string;
    monto: number;
    porcentaje: number;
    color: string;
    icono: string;
  } | null;
  promedioGastoPorCategoria: number;
  totalGastoComprometido: number;
  porcentajeComprometido: number;
  totalGastoFlexible: number;
  porcentajeFlexible: number;
  nivelCompromiso: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO';
  top5Categorias: Array<{
    nombre: string;
    monto: number;
    porcentaje: number;
    color: string;
    icono: string;
  }>;
}

export interface TagClasificacionItem {
  id: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  nombre: string;
  badgeLabel: string;
  tipoLabel: string;
  colorHex: string;
  colorKey: 'sky' | 'purple' | 'indigo' | 'teal';
  icono: string;
  total: number;
  porcentaje: number;
  conteo: number;
  totalPagado: number;
  totalPendiente: number;
  ticketPromedio: number;
}

export interface MetodoPagoAnalisisItem {
  metodo: string;
  label: string;
  total: number;
  porcentaje: number;
  conteo: number;
  color: string;
}

export interface TarjetaAnalisisItem {
  id: string;
  nombre: string;
  banco: string;
  color: string;
  total: number;
  porcentaje: number;
  conteo: number;
}

export interface AnalisisCategoriasResumen {
  categorias: CategoriaAnalisisItem[];
  metricasMacro: MetricasMacroCategorias;
  clasificaciones: TagClasificacionItem[];
  metodosPago: MetodoPagoAnalisisItem[];
  tarjetas: TarjetaAnalisisItem[];
}

export interface SaludFinancieraKPIs {
  dti: {
    porcentaje: number;
    totalDeudas: number;
    estado: 'OPTIMO' | 'PRECAUCION' | 'CRITICO';
    label: string;
    recomendacion: string;
  };
  rigidez: {
    porcentaje: number;
    totalComprometido: number;
    totalFlexible: number;
    estado: 'FLEXIBLE' | 'MODERADO' | 'CRITICO';
    label: string;
    recomendacion: string;
  };
  ahorro: {
    tasaAhorro: number;
    metaAhorro: number;
    disponibleNeto: number;
    cumplimientoMeta: number;
    gap: number;
    estado: 'SUPERAVIT' | 'CUMPLIDO' | 'DEFICIT';
    recomendacion: string;
  };
  dependenciaCredito: {
    porcentaje: number;
    totalCredito: number;
    totalDebitoEfectivo: number;
    estado: 'SALUDABLE' | 'MODERADO' | 'ALTO';
    label: string;
  };
  regla503020: {
    necesidades: {
      monto: number;
      porcentaje: number;
      objetivo: number;
      desvio: number;
      estado: 'OPTIMO' | 'EXCEDIDO' | 'BAJO';
    };
    deseos: {
      monto: number;
      porcentaje: number;
      objetivo: number;
      desvio: number;
      estado: 'OPTIMO' | 'EXCEDIDO' | 'BAJO';
    };
    ahorroYDeuda: {
      monto: number;
      porcentaje: number;
      objetivo: number;
      desvio: number;
      estado: 'OPTIMO' | 'EXCEDIDO' | 'DEFICIT';
    };
    diagnostico: string;
  };
  alertasCategorias: {
    ratioVivienda: {
      porcentaje: number;
      monto: number;
      estado: 'OPTIMO' | 'ALERTA';
      aviso: string;
    };
    ratioAlimentacion: {
      porcentaje: number;
      monto: number;
      estado: 'OPTIMO' | 'ALERTA';
      aviso: string;
    };
    concentracionTop3: {
      porcentaje: number;
      nombres: string[];
      aviso: string;
    };
    fugasHormiga: Array<{
      categoria: string;
      total: number;
      conteo: number;
      ticketPromedio: number;
      aviso: string;
    }>;
  };
}

export function obtenerColorCategoriaBackend(nombre?: string | null): { color: string; icono: string } {
  if (!nombre) return { color: '#64748b', icono: 'Tag' };
  const n = nombre.toLowerCase();
  if (n.includes('vivienda') || n.includes('alquiler') || n.includes('depa')) {
    return { color: '#10b981', icono: 'Home' };
  }
  if (n.includes('servicio') || n.includes('luz') || n.includes('agua') || n.includes('net') || n.includes('gas')) {
    return { color: '#3b82f6', icono: 'Zap' };
  }
  if (n.includes('alimen') || n.includes('super') || n.includes('mercado') || n.includes('comida')) {
    return { color: '#f59e0b', icono: 'ShoppingCart' };
  }
  if (n.includes('transporte') || n.includes('vehic') || n.includes('auto') || n.includes('gasolina')) {
    return { color: '#64748b', icono: 'Car' };
  }
  if (n.includes('suscrip') || n.includes('stream') || n.includes('netflix') || n.includes('spotify')) {
    return { color: '#8b5cf6', icono: 'Tv' };
  }
  if (n.includes('salud') || n.includes('médic') || n.includes('medic') || n.includes('gym') || n.includes('personal')) {
    return { color: '#ec4899', icono: 'HeartPulse' };
  }
  if (n.includes('préstamo') || n.includes('prestamo') || n.includes('crédito') || n.includes('banco') || n.includes('deuda')) {
    return { color: '#6366f1', icono: 'Landmark' };
  }
  if (n.includes('educa') || n.includes('curso') || n.includes('estudio')) {
    return { color: '#06b6d4', icono: 'GraduationCap' };
  }
  if (n.includes('salida') || n.includes('ocio') || n.includes('restauran') || n.includes('bar')) {
    return { color: '#f97316', icono: 'Coffee' };
  }
  if (n.includes('familiar') || n.includes('compromiso') || n.includes('regalo')) {
    return { color: '#f43f5e', icono: 'HeartPulse' };
  }
  return { color: '#64748b', icono: 'Tag' };
}

export function clasificarItemBackend(item: {
  tipo: 'FIJO' | 'PRESTAMO' | 'TARJETA' | 'DIRECTO';
  concepto?: string;
  categoria?: string;
  totalCuotas?: number;
  /** Clasificación persistida en BD — tiene prioridad sobre el cálculo en runtime */
  clasificacionBD?: ClasificacionEgreso | null;
}): {
  clasificacion: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  badgeLabel: string;
  tipoLabel: string;
  colorHex: string;
  colorKey: 'sky' | 'purple' | 'indigo' | 'teal';
  icono: string;
} {
  // Los préstamos siempre son PRESTAMO (provienen de su propio modelo, no de Gasto)
  if (item.tipo === 'PRESTAMO') {
    return {
      clasificacion: 'PRESTAMO',
      badgeLabel: 'Préstamo',
      tipoLabel: 'Préstamo Bancario',
      colorHex: '#7c3aed',
      colorKey: 'purple',
      icono: 'Landmark',
    };
  }

  // Los CostoFijo siempre son FIJO (provienen de su propio modelo, no de Gasto)
  if (item.tipo === 'FIJO') {
    return {
      clasificacion: 'FIJO',
      badgeLabel: 'Fijo',
      tipoLabel: 'Costo Fijo',
      colorHex: '#0284c7',
      colorKey: 'sky',
      icono: 'Home',
    };
  }

  // Para gastos (TARJETA o DIRECTO): usar la clasificación persistida en BD como fuente de verdad
  const clasificacion: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE' =
    item.clasificacionBD ?? (
      (item.totalCuotas && item.totalCuotas > 1) ? 'CUOTA' :
        esItemRecurrente(item.concepto || '', item.categoria || '') ? 'FIJO' :
          'VARIABLE'
    );

  if (clasificacion === 'CUOTA') {
    return {
      clasificacion: 'CUOTA',
      badgeLabel: 'Cuota',
      tipoLabel: 'Compra en Cuotas',
      colorHex: '#4f46e5',
      colorKey: 'indigo',
      icono: 'Layers',
    };
  }

  if (clasificacion === 'FIJO') {
    return {
      clasificacion: 'FIJO',
      badgeLabel: 'Fijo',
      tipoLabel: 'Costo Fijo',
      colorHex: '#0284c7',
      colorKey: 'sky',
      icono: 'Home',
    };
  }

  return {
    clasificacion: 'VARIABLE',
    badgeLabel: 'Variable',
    tipoLabel: 'Compra / Variable',
    colorHex: '#0d9488',
    colorKey: 'teal',
    icono: 'Banknote',
  };
}

export interface ResumenFinanciero {
  periodo: string;
  minPeriodo?: string;
  config: {
    id: string;
    nombre: string;
    slug?: string;
    color?: string;
    avatar?: string | null;
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
    metodoPago: MetodoPago;
    tarjetaId?: string | null;
    tarjetaNombre?: string | null;
    tarjetaBanco?: string | null;
    tarjetaColor?: string | null;
    tarjetaUltimosCuatro?: string | null;
    orden?: number | null;
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
    orden?: number | null;
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
    totalRegistros?: number;
    cantidadGastos?: number;
    cantidadCostosFijos?: number;
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
    orden?: number | null;
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
  egresosConsolidados: Array<EgresoConsolidado>;
  totalesPorClasificacion: TotalesPorClasificacion;
  seccionesCompromisos: Array<SeccionCompromiso>;
  analisisCategorias: AnalisisCategoriasResumen;
  saludFinanciera: SaludFinancieraKPIs;
  resumenDivisas: ResumenDivisasEgresos;
}

export async function getResumenMensual(periodo: string, usuarioId?: string): Promise<ResumenFinanciero> {
  const [sAnio, sMes] = periodo.split('-').map(Number);
  const nextDate = new Date(sAnio, sMes, 1);
  const siguientePeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  const periodos12: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(sAnio, sMes - 1 + i, 1);
    periodos12.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  // Resolver usuario activo para la instancia financiera
  let usuario = null;
  if (usuarioId) {
    usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
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
          include: { categoria: true },
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
      include: { categoria: true },
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
    }),
    prisma.registroCostoFijoMes.findMany({
      where: { periodo: { in: periodos12 }, costoFijo: { usuarioId: uId } },
    }),
    prisma.cuotaPrestamo.findMany({
      where: { periodo: { in: periodos12 }, prestamo: { usuarioId: uId } },
    }),
    prisma.gasto.findMany({
      where: { periodoPago: { in: periodos12 }, usuarioId: uId },
      select: { monto: true, periodoPago: true },
    }),
  ]);

  // Obtener el periodo mínimo con registros para el usuario
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

  const minPeriodo = periodosExistentes.length > 0 ? periodosExistentes.sort()[0] : '2026-10';

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

  // 2. Costos Fijos
  const costosFijos = [];
  let totalCostosFijos = 0;

  for (const cf of costosFijosBase) {
    if (cf.mesInicio && periodo < cf.mesInicio) continue;
    if (cf.mesFin && periodo > cf.mesFin) continue;

    const reg = cf.registrosMes[0];
    let montoNum = reg ? Number(reg.monto) : Number(cf.monto);

    let monedaOriginal = 'PEN';
    let montoOriginal: number | null = null;
    const tcConfig = Number(config.tipoCambioUSD || 4.00);
    let tipoCambio = tcConfig;

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

    if (monedaOriginal === 'USD' && montoOriginal && montoOriginal > 0) {
      tipoCambio = tcConfig;
      montoNum = Number((montoOriginal * tcConfig).toFixed(2));
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
    const pTcConfig = Number(config.tipoCambioUSD || 4.00);
    let pTipoCambio = pTcConfig;
    const pUsdMatch = p.concepto.match(/\$([0-9]+(?:\.[0-9]+)?)/);
    if (pUsdMatch) {
      pMonedaOriginal = 'USD';
      pMontoOriginal = parseFloat(pUsdMatch[1]);
      pTipoCambio = pTcConfig;
    }

    const pCatNombre = 'Préstamos & Créditos';
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

    // Gastos
    const gastosMes = gastosMulti.filter((g) => g.periodoPago === p);
    const totalGas = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);

    const totalEgr = Number((totalFij + totalPres + totalGas).toFixed(2));
    const disp = Number((totalIng - totalEgr).toFixed(2));

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
    proyeccionMultiMes,
    egresosConsolidados,
    totalesPorClasificacion,
    seccionesCompromisos,
    analisisCategorias,
    saludFinanciera,
    resumenDivisas,
  };
}

export function calcularResumenDivisas(
  egresosConsolidados: EgresoConsolidado[],
  totalEgresos: number,
  tipoCambioConfigurado: number = 4.0
): ResumenDivisasEgresos {
  let sTotal = 0;
  let sPendiente = 0;
  let sPagado = 0;
  let sAdelantado = 0;
  let sConteo = 0;
  let sConteoPendiente = 0;

  let dTotalUSD = 0;
  let dPendienteUSD = 0;
  let dPagadoUSD = 0;
  let dAdelantadoUSD = 0;
  let dConteo = 0;
  let dConteoPendiente = 0;

  for (const item of egresosConsolidados) {
    if (item.monedaOriginal === 'USD') {
      const montoUSD = item.montoOriginal != null
        ? item.montoOriginal
        : Number((item.monto / tipoCambioConfigurado).toFixed(2));

      dTotalUSD += montoUSD;
      dConteo += 1;

      if (item.estado === EstadoPago.PENDIENTE) {
        dPendienteUSD += montoUSD;
        dConteoPendiente += 1;
      } else if (item.estado === EstadoPago.PAGADO) {
        dPagadoUSD += montoUSD;
      } else if (item.estado === EstadoPago.ADELANTADO) {
        dAdelantadoUSD += montoUSD;
      }
    } else {
      const montoPEN = item.monto;
      sTotal += montoPEN;
      sConteo += 1;

      if (item.estado === EstadoPago.PENDIENTE) {
        sPendiente += montoPEN;
        sConteoPendiente += 1;
      } else if (item.estado === EstadoPago.PAGADO) {
        sPagado += montoPEN;
      } else if (item.estado === EstadoPago.ADELANTADO) {
        sAdelantado += montoPEN;
      }
    }
  }

  const sTotalNum = Number(sTotal.toFixed(2));
  const sPendienteNum = Number(sPendiente.toFixed(2));
  const dTotalUSDNum = Number(dTotalUSD.toFixed(2));
  const dPendienteUSDNum = Number(dPendienteUSD.toFixed(2));

  const dTotalPENNum = Number((dTotalUSDNum * tipoCambioConfigurado).toFixed(2));
  const dPendientePENNum = Number((dPendienteUSDNum * tipoCambioConfigurado).toFixed(2));
  const dPagadoPENNum = Number((Number(dPagadoUSD.toFixed(2)) * tipoCambioConfigurado).toFixed(2));
  const dAdelantadoPENNum = Number((Number(dAdelantadoUSD.toFixed(2)) * tipoCambioConfigurado).toFixed(2));

  const totalConsolidado = Number((sTotalNum + dTotalPENNum).toFixed(2));
  const totalPendienteConsolidado = Number((sPendienteNum + dPendientePENNum).toFixed(2));

  // Solo se considera que tiene múltiples monedas si existen compromisos en USD pendientes de pago.
  // Si los egresos en dólares ya fueron adelantados o pagados (dPendienteUSDNum === 0), no hay divisa extranjera por liquidar
  // y por ende ya no debe mostrarse el resumen de divisas en el dashboard.
  const tieneMultiplesMonedas = sConteo > 0 && dConteo > 0 && dPendienteUSDNum > 0;

  const porcentajeSoles = totalPendienteConsolidado > 0
    ? Number(((sPendienteNum / totalPendienteConsolidado) * 100).toFixed(1))
    : 0;
  const porcentajeDolares = totalPendienteConsolidado > 0
    ? Number(((dPendientePENNum / totalPendienteConsolidado) * 100).toFixed(1))
    : 0;

  return {
    soles: {
      total: sTotalNum,
      pendiente: sPendienteNum,
      pagado: Number(sPagado.toFixed(2)),
      adelantado: Number(sAdelantado.toFixed(2)),
      porcentaje: porcentajeSoles,
      conteo: sConteo,
      conteoPendiente: sConteoPendiente,
    },
    dolares: {
      totalUSD: dTotalUSDNum,
      total: dTotalPENNum,
      pendienteUSD: dPendienteUSDNum,
      pendiente: dPendientePENNum,
      pagadoUSD: Number(dPagadoUSD.toFixed(2)),
      pagado: dPagadoPENNum,
      adelantadoUSD: Number(dAdelantadoUSD.toFixed(2)),
      adelantado: dAdelantadoPENNum,
      tipoCambio: tipoCambioConfigurado,
      tipoCambioPromedio: tipoCambioConfigurado,
      porcentaje: porcentajeDolares,
      conteo: dConteo,
      conteoPendiente: dConteoPendiente,
    },
    tieneMultiplesMonedas,
    consolidado: {
      totalEgresosPEN: totalConsolidado,
      totalPendientePEN: totalPendienteConsolidado,
      totalPagadoPEN: Number((Number(sPagado.toFixed(2)) + dPagadoPENNum).toFixed(2)),
      totalAdelantadoPEN: Number((Number(sAdelantado.toFixed(2)) + dAdelantadoPENNum).toFixed(2)),
      totalCompromisos: sConteo + dConteo,
      totalPendientes: sConteoPendiente + dConteoPendiente,
      cuadraSumatoria: Math.abs(totalConsolidado - totalEgresos) < 0.05,
    },
  };
}

export function calcularAnalisisCategoriasYTags(
  egresosConsolidados: EgresoConsolidado[],
  totalEgresos: number
): AnalisisCategoriasResumen {
  const mapCategorias = new Map<
    string,
    {
      id: string;
      nombre: string;
      color: string;
      icono: string;
      totalMonto: number;
      conteoItems: number;
      desgloseClasificacion: { fijo: number; prestamos: number; cuotas: number; variables: number };
      desgloseEstado: { pagado: number; adelantado: number; pendiente: number };
      items: EgresoConsolidado[];
    }
  >();

  for (const item of egresosConsolidados) {
    const catNombre = item.categoria || 'General';
    let entry = mapCategorias.get(catNombre);
    if (!entry) {
      entry = {
        id: catNombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        nombre: catNombre,
        color: item.categoriaColor || obtenerColorCategoriaBackend(catNombre).color,
        icono: item.categoriaIcono || obtenerColorCategoriaBackend(catNombre).icono,
        totalMonto: 0,
        conteoItems: 0,
        desgloseClasificacion: { fijo: 0, prestamos: 0, cuotas: 0, variables: 0 },
        desgloseEstado: { pagado: 0, adelantado: 0, pendiente: 0 },
        items: [],
      };
      mapCategorias.set(catNombre, entry);
    }

    entry.totalMonto += item.monto;
    entry.conteoItems++;
    entry.items.push(item);

    if (item.clasificacion === 'FIJO') {
      entry.desgloseClasificacion.fijo += item.monto;
    } else if (item.clasificacion === 'PRESTAMO') {
      entry.desgloseClasificacion.prestamos += item.monto;
    } else if (item.clasificacion === 'CUOTA') {
      entry.desgloseClasificacion.cuotas += item.monto;
    } else {
      entry.desgloseClasificacion.variables += item.monto;
    }

    if (item.estado === EstadoPago.PAGADO) {
      entry.desgloseEstado.pagado += item.monto;
    } else if (item.estado === EstadoPago.ADELANTADO) {
      entry.desgloseEstado.adelantado += item.monto;
    } else {
      entry.desgloseEstado.pendiente += item.monto;
    }
  }

  const categorias: CategoriaAnalisisItem[] = Array.from(mapCategorias.values())
    .map((c) => {
      const totalM = Number(c.totalMonto.toFixed(2));
      const pagadoTot = c.desgloseEstado.pagado + c.desgloseEstado.adelantado;
      return {
        id: c.id,
        nombre: c.nombre,
        color: c.color,
        icono: c.icono,
        totalMonto: totalM,
        porcentaje: totalEgresos > 0 ? Number(((totalM / totalEgresos) * 100).toFixed(1)) : 0,
        conteoItems: c.conteoItems,
        desgloseClasificacion: {
          fijo: Number(c.desgloseClasificacion.fijo.toFixed(2)),
          prestamos: Number(c.desgloseClasificacion.prestamos.toFixed(2)),
          cuotas: Number(c.desgloseClasificacion.cuotas.toFixed(2)),
          variables: Number(c.desgloseClasificacion.variables.toFixed(2)),
        },
        desgloseEstado: {
          pagado: Number(c.desgloseEstado.pagado.toFixed(2)),
          adelantado: Number(c.desgloseEstado.adelantado.toFixed(2)),
          pendiente: Number(c.desgloseEstado.pendiente.toFixed(2)),
        },
        porcentajePagado: totalM > 0 ? Number(((pagadoTot / totalM) * 100).toFixed(1)) : 0,
        items: c.items,
      };
    })
    .sort((a, b) => b.totalMonto - a.totalMonto);

  const totalCategoriasActivas = categorias.length;
  const categoriaMayorGasto = categorias.length > 0 ? {
    nombre: categorias[0].nombre,
    monto: categorias[0].totalMonto,
    porcentaje: categorias[0].porcentaje,
    color: categorias[0].color,
    icono: categorias[0].icono,
  } : null;

  const promedioGastoPorCategoria = totalCategoriasActivas > 0
    ? Number((totalEgresos / totalCategoriasActivas).toFixed(2))
    : 0;

  let totalComprometido = 0;
  let totalFlexible = 0;
  for (const item of egresosConsolidados) {
    if (item.clasificacion === 'VARIABLE') {
      totalFlexible += item.monto;
    } else {
      totalComprometido += item.monto;
    }
  }

  const porcentajeComprometido = totalEgresos > 0 ? Number(((totalComprometido / totalEgresos) * 100).toFixed(1)) : 0;
  const porcentajeFlexible = totalEgresos > 0 ? Number(((totalFlexible / totalEgresos) * 100).toFixed(1)) : 0;

  let nivelCompromiso: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO' = 'BAJO';
  if (porcentajeComprometido >= 80) nivelCompromiso = 'CRITICO';
  else if (porcentajeComprometido >= 65) nivelCompromiso = 'ALTO';
  else if (porcentajeComprometido >= 45) nivelCompromiso = 'MODERADO';

  const top5Categorias = categorias.slice(0, 5).map((c) => ({
    nombre: c.nombre,
    monto: c.totalMonto,
    porcentaje: c.porcentaje,
    color: c.color,
    icono: c.icono,
  }));

  const configClasif = [
    { id: 'FIJO' as const, nombre: 'Costos Fijos', badgeLabel: 'Fijo', tipoLabel: 'Costo Fijo', colorHex: '#0284c7', colorKey: 'sky' as const, icono: 'Home' },
    { id: 'PRESTAMO' as const, nombre: 'Préstamos Bancarios', badgeLabel: 'Préstamo', tipoLabel: 'Préstamo Bancario', colorHex: '#7c3aed', colorKey: 'purple' as const, icono: 'Landmark' },
    { id: 'CUOTA' as const, nombre: 'Compras en Cuotas', badgeLabel: 'Cuota', tipoLabel: 'Compra en Cuotas', colorHex: '#4f46e5', colorKey: 'indigo' as const, icono: 'Layers' },
    { id: 'VARIABLE' as const, nombre: 'Compras Variables', badgeLabel: 'Variable', tipoLabel: 'Compra / Variable', colorHex: '#0d9488', colorKey: 'teal' as const, icono: 'Banknote' },
  ];

  const clasificaciones: TagClasificacionItem[] = configClasif.map((cfg) => {
    const items = egresosConsolidados.filter((e) => e.clasificacion === cfg.id);
    const total = Number(items.reduce((acc, e) => acc + e.monto, 0).toFixed(2));
    const pagado = Number(items.filter((e) => e.estado === EstadoPago.PAGADO || e.estado === EstadoPago.ADELANTADO).reduce((acc, e) => acc + e.monto, 0).toFixed(2));
    const pendiente = Number((total - pagado).toFixed(2));
    const conteo = items.length;
    const ticketPromedio = conteo > 0 ? Number((total / conteo).toFixed(2)) : 0;
    const porcentaje = totalEgresos > 0 ? Number(((total / totalEgresos) * 100).toFixed(1)) : 0;

    return {
      id: cfg.id,
      nombre: cfg.nombre,
      badgeLabel: cfg.badgeLabel,
      tipoLabel: cfg.tipoLabel,
      colorHex: cfg.colorHex,
      colorKey: cfg.colorKey,
      icono: cfg.icono,
      total,
      porcentaje,
      conteo,
      totalPagado: pagado,
      totalPendiente: pendiente,
      ticketPromedio,
    };
  });

  const metodosMap = new Map<string, { total: number; conteo: number }>();
  for (const item of egresosConsolidados) {
    const m = (item.metodoPago as string) || 'EFECTIVO_DEBITO';
    const curr = metodosMap.get(m) || { total: 0, conteo: 0 };
    curr.total += item.monto;
    curr.conteo++;
    metodosMap.set(m, curr);
  }

  const metodosConfig: Record<string, { label: string; color: string }> = {
    TARJETA_CREDITO: { label: 'Tarjeta de Crédito', color: '#6366f1' },
    EFECTIVO_DEBITO: { label: 'Efectivo / Débito', color: '#10b981' },
    TRANSFERENCIA: { label: 'Transferencia Directa', color: '#0ea5e9' },
  };

  const metodosPago: MetodoPagoAnalisisItem[] = Array.from(metodosMap.entries()).map(([metodo, data]) => {
    const cfg = metodosConfig[metodo] || { label: metodo, color: '#64748b' };
    const tot = Number(data.total.toFixed(2));
    return {
      metodo,
      label: cfg.label,
      total: tot,
      porcentaje: totalEgresos > 0 ? Number(((tot / totalEgresos) * 100).toFixed(1)) : 0,
      conteo: data.conteo,
      color: cfg.color,
    };
  }).sort((a, b) => b.total - a.total);

  const tarjetasMap = new Map<string, { id: string; nombre: string; banco: string; color: string; total: number; conteo: number }>();
  for (const item of egresosConsolidados) {
    if (item.tarjetaId && item.tarjetaNombre) {
      let tEntry = tarjetasMap.get(item.tarjetaId);
      if (!tEntry) {
        tEntry = {
          id: item.tarjetaId,
          nombre: item.tarjetaNombre,
          banco: item.tarjetaBanco || 'Banco',
          color: item.tarjetaColor || '#2563eb',
          total: 0,
          conteo: 0,
        };
        tarjetasMap.set(item.tarjetaId, tEntry);
      }
      tEntry.total += item.monto;
      tEntry.conteo++;
    }
  }

  const tarjetas: TarjetaAnalisisItem[] = Array.from(tarjetasMap.values()).map((t) => {
    const tot = Number(t.total.toFixed(2));
    return {
      id: t.id,
      nombre: t.nombre,
      banco: t.banco,
      color: t.color,
      total: tot,
      porcentaje: totalEgresos > 0 ? Number(((tot / totalEgresos) * 100).toFixed(1)) : 0,
      conteo: t.conteo,
    };
  }).sort((a, b) => b.total - a.total);

  return {
    categorias,
    metricasMacro: {
      totalCategoriasActivas,
      categoriaMayorGasto,
      promedioGastoPorCategoria,
      totalGastoComprometido: Number(totalComprometido.toFixed(2)),
      porcentajeComprometido,
      totalGastoFlexible: Number(totalFlexible.toFixed(2)),
      porcentajeFlexible,
      nivelCompromiso,
      top5Categorias,
    },
    clasificaciones,
    metodosPago,
    tarjetas,
  };
}

export function calcularSaludFinancieraKPIs(params: {
  totalIngresos: number;
  totalEgresos: number;
  dineroDisponibleNeto: number;
  metaAhorro: number;
  egresosConsolidados: EgresoConsolidado[];
  analisisCategorias: AnalisisCategoriasResumen;
}): SaludFinancieraKPIs {
  const {
    totalIngresos,
    totalEgresos,
    dineroDisponibleNeto,
    metaAhorro,
    egresosConsolidados,
    analisisCategorias,
  } = params;

  // 1. DTI (Debt-to-Income / Ratio de Endeudamiento)
  const totalDeudas = egresosConsolidados
    .filter((e) => e.clasificacion === 'PRESTAMO' || e.clasificacion === 'CUOTA')
    .reduce((acc, e) => acc + e.monto, 0);

  const dtiPorcentaje = totalIngresos > 0 ? Number(((totalDeudas / totalIngresos) * 100).toFixed(1)) : 0;
  let dtiEstado: 'OPTIMO' | 'PRECAUCION' | 'CRITICO' = 'OPTIMO';
  let dtiLabel = 'Carga Saludable';
  let dtiRec = 'Tu endeudamiento mensual está dentro del estándar recomendado (<30%).';

  if (dtiPorcentaje > 40) {
    dtiEstado = 'CRITICO';
    dtiLabel = 'Endeudamiento Crítico';
    dtiRec = 'Destinas más del 40% de tus ingresos a deudas. Prioriza amortizar cuotas.';
  } else if (dtiPorcentaje >= 30) {
    dtiEstado = 'PRECAUCION';
    dtiLabel = 'Carga Moderada';
    dtiRec = 'Endeudamiento entre 30% y 40%. Evita adquirir nuevos compromisos o cuotas.';
  }

  // 2. Rigidez Financiera (Compromiso Fijo)
  const totalComprometido = egresosConsolidados
    .filter((e) => e.clasificacion !== 'VARIABLE')
    .reduce((acc, e) => acc + e.monto, 0);
  const totalFlexible = egresosConsolidados
    .filter((e) => e.clasificacion === 'VARIABLE')
    .reduce((acc, e) => acc + e.monto, 0);

  const rigidezPorcentaje = totalIngresos > 0 ? Number(((totalComprometido / totalIngresos) * 100).toFixed(1)) : 0;
  let rigidezEstado: 'FLEXIBLE' | 'MODERADO' | 'CRITICO' = 'FLEXIBLE';
  let rigidezLabel = 'Presupuesto Flexible';
  let rigidezRec = 'Excelente colchón operativo para responder ante cualquier imprevisto.';

  if (rigidezPorcentaje > 80) {
    rigidezEstado = 'CRITICO';
    rigidezLabel = 'Presupuesto Inflexible';
    rigidezRec = 'Más del 80% de tus ingresos ya está comprometido antes de salir de casa.';
  } else if (rigidezPorcentaje >= 65) {
    rigidezEstado = 'MODERADO';
    rigidezLabel = 'Presupuesto Ajustado';
    rigidezRec = 'Compromiso moderado (65%-80%). Vigila de cerca las compras variables.';
  }

  // 3. Tasa de Ahorro y Cumplimiento de Meta
  const tasaAhorro = totalIngresos > 0 ? Number(((dineroDisponibleNeto / totalIngresos) * 100).toFixed(1)) : 0;
  const cumplimientoMeta = metaAhorro > 0 ? Number(((dineroDisponibleNeto / metaAhorro) * 100).toFixed(1)) : (dineroDisponibleNeto > 0 ? 100 : 0);
  const gap = Number((dineroDisponibleNeto - metaAhorro).toFixed(2));

  let ahorroEstado: 'SUPERAVIT' | 'CUMPLIDO' | 'DEFICIT' = 'CUMPLIDO';
  let ahorroRec = 'Meta mensual de ahorro cubierta según lo programado.';

  if (dineroDisponibleNeto >= metaAhorro) {
    if (gap >= 500) {
      ahorroEstado = 'SUPERAVIT';
      ahorroRec = 'Excelente: superas con creces tu meta mensual de ahorro proyectada.';
    } else {
      ahorroEstado = 'CUMPLIDO';
    }
  } else if (dineroDisponibleNeto > 0) {
    ahorroEstado = 'DEFICIT';
    ahorroRec = `Generas saldo libre pero quedas a S/ ${Math.abs(gap).toFixed(2)} de tu meta de ahorro.`;
  } else {
    ahorroEstado = 'DEFICIT';
    ahorroRec = 'Déficit en el periodo: los compromisos superan los ingresos disponibles.';
  }

  // 4. Dependencia de Tarjeta de Crédito
  const totalCredito = egresosConsolidados
    .filter((e) => e.metodoPago === MetodoPago.TARJETA_CREDITO)
    .reduce((acc, e) => acc + e.monto, 0);
  const totalDebitoEfectivo = Number(Math.max(0, totalEgresos - totalCredito).toFixed(2));
  const dependenciaPorcentaje = totalEgresos > 0 ? Number(((totalCredito / totalEgresos) * 100).toFixed(1)) : 0;

  let depEstado: 'SALUDABLE' | 'MODERADO' | 'ALTO' = 'SALUDABLE';
  let depLabel = 'Uso Controlado';
  if (dependenciaPorcentaje > 70) {
    depEstado = 'ALTO';
    depLabel = 'Alta Dependencia';
  } else if (dependenciaPorcentaje > 40) {
    depEstado = 'MODERADO';
    depLabel = 'Uso Moderado';
  }

  // 5. Regla 50 / 30 / 20
  // Necesidades (50%): Vivienda, Servicios, Supermercado/Alimentación, Salud, Educación
  // Deseos (30%): Ocio, Streaming, Compras Varias, Variables discrecionales
  // Ahorro y Deuda (20%): Amortización capital (Préstamos + Cuotas) + Disponible Neto
  let montoNecesidades = 0;
  let montoDeseos = 0;
  const montoAhorroDeuda = totalDeudas + Math.max(0, dineroDisponibleNeto);

  for (const item of egresosConsolidados) {
    if (item.clasificacion === 'PRESTAMO' || item.clasificacion === 'CUOTA') {
      continue;
    }
    const cat = (item.categoria || '').toLowerCase();
    const conc = (item.concepto || '').toLowerCase();
    const esNecesidad =
      cat.includes('vivienda') ||
      cat.includes('alquiler') ||
      cat.includes('depa') ||
      cat.includes('servicio') ||
      cat.includes('luz') ||
      cat.includes('agua') ||
      cat.includes('net') ||
      cat.includes('gas') ||
      cat.includes('alimen') ||
      cat.includes('super') ||
      cat.includes('mercado') ||
      cat.includes('salud') ||
      cat.includes('medic') ||
      cat.includes('educa') ||
      conc.includes('alquiler') ||
      conc.includes('luz') ||
      conc.includes('agua') ||
      conc.includes('mantenimiento');

    if (esNecesidad) {
      montoNecesidades += item.monto;
    } else {
      montoDeseos += item.monto;
    }
  }

  const base503020 = totalIngresos > 0 ? totalIngresos : Math.max(1, totalEgresos);
  const pctNec = Number(((montoNecesidades / base503020) * 100).toFixed(1));
  const pctDes = Number(((montoDeseos / base503020) * 100).toFixed(1));
  const pctAho = Number(((montoAhorroDeuda / base503020) * 100).toFixed(1));

  let estadoNec: 'OPTIMO' | 'EXCEDIDO' | 'BAJO' = 'OPTIMO';
  if (pctNec > 55) estadoNec = 'EXCEDIDO';
  else if (pctNec < 40) estadoNec = 'BAJO';

  let estadoDes: 'OPTIMO' | 'EXCEDIDO' | 'BAJO' = 'OPTIMO';
  if (pctDes > 35) estadoDes = 'EXCEDIDO';
  else if (pctDes < 15) estadoDes = 'BAJO';

  let estadoAho: 'OPTIMO' | 'EXCEDIDO' | 'DEFICIT' = 'OPTIMO';
  if (pctAho < 15) estadoAho = 'DEFICIT';
  else if (pctAho >= 20) estadoAho = 'OPTIMO';

  let diagnostico503020 = 'Estructura financiera balanceada conforme al estándar consultor 50/30/20.';
  if (pctNec > 55) {
    diagnostico503020 = 'Tus necesidades básicas sobrepasan el 50% ideal. Conviene revisar costos fijos y servicios.';
  } else if (pctDes > 35) {
    diagnostico503020 = 'El estilo de vida y ocio supera el 30% ideal. Aquí reside tu mayor potencial de ahorro inmediato.';
  } else if (pctAho >= 20) {
    diagnostico503020 = 'Excelente disciplina: destinas al menos el 20% de tu flujo a amortizar deuda y consolidar ahorro.';
  }

  // 6. Alertas de Categorías (Vivienda, Alimentación, Concentración Pareto, Fugas)
  const cats = analisisCategorias.categorias;
  const catViv = cats.find(
    (c) => c.nombre.toLowerCase().includes('vivienda') || c.nombre.toLowerCase().includes('alquiler')
  );
  const montoViv = catViv?.totalMonto || 0;
  const pctViv = totalIngresos > 0 ? Number(((montoViv / totalIngresos) * 100).toFixed(1)) : 0;
  const ratioVivienda = {
    porcentaje: pctViv,
    monto: montoViv,
    estado: (pctViv > 30 ? 'ALERTA' : 'OPTIMO') as 'OPTIMO' | 'ALERTA',
    aviso:
      pctViv > 30
        ? 'El gasto en vivienda supera el 30% de tus ingresos (regla prudencial).'
        : 'Costo habitacional saludable dentro del límite del 30%.',
  };

  const catAlim = cats.find(
    (c) =>
      c.nombre.toLowerCase().includes('alimen') ||
      c.nombre.toLowerCase().includes('super') ||
      c.nombre.toLowerCase().includes('mercado')
  );
  const montoAlim = catAlim?.totalMonto || 0;
  const pctAlim = totalIngresos > 0 ? Number(((montoAlim / totalIngresos) * 100).toFixed(1)) : 0;
  const ratioAlimentacion = {
    porcentaje: pctAlim,
    monto: montoAlim,
    estado: (pctAlim > 22 ? 'ALERTA' : 'OPTIMO') as 'OPTIMO' | 'ALERTA',
    aviso:
      pctAlim > 22
        ? 'Alimentación absorbe más del 22% del ingreso mensual.'
        : 'Gasto de alimentación en rango adecuado (12% - 20%).',
  };

  const top3Cats = cats.slice(0, 3);
  const montoTop3 = top3Cats.reduce((acc, c) => acc + c.totalMonto, 0);
  const pctTop3 = totalEgresos > 0 ? Number(((montoTop3 / totalEgresos) * 100).toFixed(1)) : 0;
  const concentracionTop3 = {
    porcentaje: pctTop3,
    nombres: top3Cats.map((c) => c.nombre),
    aviso: `Tus 3 categorías principales concentran el ${pctTop3}% del gasto mensual.`,
  };

  const fugasHormiga: Array<{
    categoria: string;
    total: number;
    conteo: number;
    ticketPromedio: number;
    aviso: string;
  }> = [];

  for (const c of cats) {
    const n = c.nombre.toLowerCase();
    const esDiscrecional =
      n.includes('ocio') ||
      n.includes('salida') ||
      n.includes('compra') ||
      n.includes('imprevisto') ||
      n.includes('otros');
    if (esDiscrecional && c.conteoItems >= 3) {
      fugasHormiga.push({
        categoria: c.nombre,
        total: c.totalMonto,
        conteo: c.conteoItems,
        ticketPromedio: Number((c.totalMonto / c.conteoItems).toFixed(2)),
        aviso: `${c.conteoItems} microtransacciones sumaron S/ ${(c.totalMonto).toFixed(2)}.`,
      });
    }
  }

  return {
    dti: {
      porcentaje: dtiPorcentaje,
      totalDeudas: Number(totalDeudas.toFixed(2)),
      estado: dtiEstado,
      label: dtiLabel,
      recomendacion: dtiRec,
    },
    rigidez: {
      porcentaje: rigidezPorcentaje,
      totalComprometido: Number(totalComprometido.toFixed(2)),
      totalFlexible: Number(totalFlexible.toFixed(2)),
      estado: rigidezEstado,
      label: rigidezLabel,
      recomendacion: rigidezRec,
    },
    ahorro: {
      tasaAhorro,
      metaAhorro,
      disponibleNeto: Number(dineroDisponibleNeto.toFixed(2)),
      cumplimientoMeta,
      gap,
      estado: ahorroEstado,
      recomendacion: ahorroRec,
    },
    dependenciaCredito: {
      porcentaje: dependenciaPorcentaje,
      totalCredito: Number(totalCredito.toFixed(2)),
      totalDebitoEfectivo,
      estado: depEstado,
      label: depLabel,
    },
    regla503020: {
      necesidades: {
        monto: Number(montoNecesidades.toFixed(2)),
        porcentaje: pctNec,
        objetivo: 50,
        desvio: Number((pctNec - 50).toFixed(1)),
        estado: estadoNec,
      },
      deseos: {
        monto: Number(montoDeseos.toFixed(2)),
        porcentaje: pctDes,
        objetivo: 30,
        desvio: Number((pctDes - 30).toFixed(1)),
        estado: estadoDes,
      },
      ahorroYDeuda: {
        monto: Number(montoAhorroDeuda.toFixed(2)),
        porcentaje: pctAho,
        objetivo: 20,
        desvio: Number((pctAho - 20).toFixed(1)),
        estado: estadoAho,
      },
      diagnostico: diagnostico503020,
    },
    alertasCategorias: {
      ratioVivienda,
      ratioAlimentacion,
      concentracionTop3,
      fugasHormiga,
    },
  };
}

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
