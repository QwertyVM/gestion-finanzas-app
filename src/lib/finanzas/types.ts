import { ClasificacionEgreso, EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';

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
  categoriaId?: string | null;
  tag?: string | null;
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
  ingresoId?: string | null;
  ingresoConcepto?: string | null;
  ingresoTipo?: TipoIngreso | string | null;
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
  minitags?: Array<{ tag: string; totalMonto: number; conteo: number }>;
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

export interface Subcategoria503020Item {
  tag: string;
  monto: number;
  porcentaje: number;
  conteo: number;
  esSuperavit?: boolean;
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
      subcategorias?: Subcategoria503020Item[];
    };
    deseos: {
      monto: number;
      porcentaje: number;
      objetivo: number;
      desvio: number;
      estado: 'OPTIMO' | 'EXCEDIDO' | 'BAJO';
      subcategorias?: Subcategoria503020Item[];
    };
    ahorroYDeuda: {
      monto: number;
      porcentaje: number;
      objetivo: number;
      desvio: number;
      estado: 'OPTIMO' | 'EXCEDIDO' | 'DEFICIT';
      subcategorias?: Subcategoria503020Item[];
    };
    capitalLibre: {
      monto: number;
      porcentaje: number;
      sugerencia: string;
      distribucionRecomendada: {
        deuda: number;
        ahorroEmergencia: number;
        estiloVida: number;
      };
    };
    esModeloAdaptativoDeuda?: boolean;
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
    totalGastosAsignados?: number;
    disponible?: number;
    gastosAsignadosCount?: number;
  }>;
  hayMultiplesIngresos?: boolean;
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

export interface SobreGastoOperativo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  porcentaje: number;
  monto: number;
  montoSemanal: number;
  montoDiario: number;
  bloqueado?: boolean;
}

export interface EscenarioPresupuesto {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  esPersonalizado?: boolean;
  distribucion: Array<{ sobreId: string; porcentaje: number }>;
}

export interface SemanaRunwayItem {
  semana: number;
  etiqueta: string;
  rangoFechas: string;
  montoSugerido: number;
}

export interface RunwayBolsilloData {
  sobreId: string;
  nombreSobre: string;
  montoAsignado: number;
  porcentajeAsignado: number;
  diasTotales: number;
  semanasTotales?: number;
  semanasCompletas?: number;
  diasRemanentes?: number;
  textoPeriodo?: string;
  limiteDiario: number;
  limiteSemanal: number;
  desgloseSemanas: SemanaRunwayItem[];
}

export interface PresupuestoOperativoData {
  periodoOrigen: string;
  nombreMesOrigen: string;
  periodoDestino: string;
  nombreMesDestino: string;
  moneda: string;
  diaPagoSueldo: number;
  escenarioActivo: string;
  ingresosCierreOrigen: number;
  compromisosCierreOrigen: {
    total: number;
    fijos: number;
    prestamos: number;
    cuotas: number;
    variables: number;
  };
  capitalOperativoParaVivir: number;
  estadoSaludCapital: 'OPTIMO' | 'ADECUADO' | 'AJUSTADO' | 'DEFICIT';
  runway: {
    diasTotales: number;
    semanasTotales: number;
    limiteDiario: number;
    limiteSemanal: number;
    desgloseSemanas: SemanaRunwayItem[];
  };
  runwayBolsillo?: RunwayBolsilloData;
  sobres: SobreGastoOperativo[];
  escenarios: EscenarioPresupuesto[];
  benchmarkHistorico: {
    promedioAlimentacion: number;
    promedioMovilidad: number;
    comentario: string;
  };
  consejoConsultor: string;
}


export interface GuardarPresupuestoOperativoInput {
  periodoDestino: string;
  diaPagoSueldo?: number;
  sobres: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    porcentaje: number;
    monto?: number;
    montoSemanal?: number;
    montoDiario?: number;
    bloqueado?: boolean;
  }>;
  escenarios?: EscenarioPresupuesto[];
  escenarioActivo?: string;
}
