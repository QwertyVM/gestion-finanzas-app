import prisma from '../prisma';
import {
  SobreGastoOperativo,
  EscenarioPresupuesto,
  PresupuestoOperativoData,
  GuardarPresupuestoOperativoInput,
  SemanaRunwayItem,
  RunwayBolsilloData,
} from './types';
import { getResumenMensual } from './resumen-service';
import {
  calcularMetricasSobre,
  sincronizarSobresConCapital,
  normalizarSuma100,
  calcularRunwayDesdeMonto,
  calcularPeriodoCobroYSemanas,
} from '../presupuesto-operativo-helpers';

export const DEFAULT_SOBRES_PRESUPUESTO: Array<Omit<SobreGastoOperativo, 'monto' | 'montoSemanal' | 'montoDiario'>> = [
  {
    id: 'ALIMENTACION',
    nombre: 'Alimentación & Despensa',
    descripcion: 'Supermercado, carnes, verduras y comida diaria del hogar',
    icono: 'Utensils',
    color: '#0284c7',
    porcentaje: 45,
  },
  {
    id: 'MOVILIDAD',
    nombre: 'Movilidad & Combustible',
    descripcion: 'Gasolina, transporte, peajes y mantenimiento menor del auto',
    icono: 'Fuel',
    color: '#0d9488',
    porcentaje: 25,
  },
  {
    id: 'HOGAR_IMPREVISTOS',
    nombre: 'Hogar & Farmacia / Imprevistos',
    descripcion: 'Artículos de limpieza, farmacia y pequeñas urgencias',
    icono: 'ShieldAlert',
    color: '#d97706',
    porcentaje: 15,
  },
  {
    id: 'BOLSILLO_OCIO',
    nombre: 'Bolsillo Personal & Ocio Flexible',
    descripcion: 'Salidas de fin de semana, café y recreación sin culpa',
    icono: 'Coffee',
    color: '#7c3aed',
    porcentaje: 15,
  },
];

export const DEFAULT_ESCENARIOS_PRESUPUESTO: EscenarioPresupuesto[] = [
  {
    id: 'EQUILIBRADO',
    nombre: 'Equilibrado (Recomendado)',
    descripcion: 'Distribución balanceada para vivir con tranquilidad y cubrir lo indispensable sin privaciones.',
    icono: 'Scale',
    esPersonalizado: false,
    distribucion: [
      { sobreId: 'ALIMENTACION', porcentaje: 45 },
      { sobreId: 'MOVILIDAD', porcentaje: 25 },
      { sobreId: 'HOGAR_IMPREVISTOS', porcentaje: 15 },
      { sobreId: 'BOLSILLO_OCIO', porcentaje: 15 },
    ],
  },
  {
    id: 'FIESTAS',
    nombre: 'Festivo / Fin de Año',
    descripcion: 'Amplía el bolsillo personal para celebraciones, cenas o salidas especiales reduciendo otros márgenes.',
    icono: 'PartyPopper',
    esPersonalizado: false,
    distribucion: [
      { sobreId: 'ALIMENTACION', porcentaje: 40 },
      { sobreId: 'MOVILIDAD', porcentaje: 20 },
      { sobreId: 'HOGAR_IMPREVISTOS', porcentaje: 15 },
      { sobreId: 'BOLSILLO_OCIO', porcentaje: 25 },
    ],
  },
  {
    id: 'AUSTERO',
    nombre: 'Ahorro Máximo / Austero',
    descripcion: 'Prioriza 100% supervivencia y reserva un colchón de protección eliminando gastos prescindibles.',
    icono: 'ShieldCheck',
    esPersonalizado: false,
    distribucion: [
      { sobreId: 'ALIMENTACION', porcentaje: 50 },
      { sobreId: 'MOVILIDAD', porcentaje: 25 },
      { sobreId: 'HOGAR_IMPREVISTOS', porcentaje: 15 },
      { sobreId: 'BOLSILLO_OCIO', porcentaje: 10 },
    ],
  },
];

export async function getPresupuestoOperativo(
  periodoOrigen: string,
  usuarioOrId?: string | any
): Promise<PresupuestoOperativoData> {
  const resumen = await getResumenMensual(periodoOrigen, usuarioOrId);
  const moneda = resumen.config?.monedaSimbolo || 'S/';

  let usuario: any = null;
  if (usuarioOrId && typeof usuarioOrId === 'object' && usuarioOrId.id) {
    usuario = usuarioOrId;
  } else if (typeof usuarioOrId === 'string') {
    usuario = await prisma.usuario.findUnique({ where: { id: usuarioOrId } });
  }
  if (!usuario) {
    usuario = await prisma.usuario.findFirst({ where: { activo: true }, orderBy: { createdAt: 'asc' } });
  }
  const uId = usuario?.id;

  const [anoStr, mesStr] = periodoOrigen.split('-');
  const ano = parseInt(anoStr, 10);
  const mes = parseInt(mesStr, 10);

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const nextDate = new Date(ano, mes, 1);
  const nextAno = nextDate.getFullYear();
  const nextMesNum = nextDate.getMonth() + 1;
  const periodoDestino = `${nextAno}-${String(nextMesNum).padStart(2, '0')}`;

  const nombreMesOrigen = `${mesesNombres[mes - 1]} ${ano}`;
  const nombreMesDestino = `${mesesNombres[nextDate.getMonth()]} ${nextAno}`;

  // 1. Obtener configuración guardada de Presupuesto Operativo (o heredar del periodo más reciente)
  let configDb = uId
    ? await prisma.presupuestoOperativoConfig.findUnique({
      where: {
        usuarioId_periodoDestino: {
          usuarioId: uId,
          periodoDestino,
        },
      },
    })
    : null;

  if (!configDb && uId) {
    configDb = await prisma.presupuestoOperativoConfig.findFirst({
      where: { usuarioId: uId },
      orderBy: { createdAt: 'desc' },
    });
  }

  const diaPagoSueldo = configDb?.diaPagoSueldo || resumen.config?.diaPagoSueldo || 30;
  const escenarioActivo = configDb?.escenarioActivo || 'EQUILIBRADO';

  const diasTotales = new Date(nextAno, nextMesNum, 0).getDate();
  const semanasTotales = Number((diasTotales / 7).toFixed(1));

  const ingresosCierreOrigen = resumen.totalIngresos || 0;
  const totalEgresosSueldoMes = Math.max(0, (resumen.totalEgresos || 0) - (resumen.totalAdelantado || 0));
  const compromisosCierreOrigen = {
    total: totalEgresosSueldoMes,
    totalOriginal: resumen.totalEgresos || 0,
    adelantado: resumen.totalAdelantado || 0,
    fijos: resumen.totalesPorClasificacion?.fijos || 0,
    prestamos: resumen.totalesPorClasificacion?.prestamos || 0,
    cuotas: resumen.totalesPorClasificacion?.cuotas || 0,
    variables: resumen.totalesPorClasificacion?.variables || 0,
  };

  const netoDisponible = Number(
    (resumen.dineroDisponibleNeto ?? (ingresosCierreOrigen - totalEgresosSueldoMes)).toFixed(2)
  );
  const capitalOperativoParaVivir = Math.max(0, netoDisponible);

  let estadoSaludCapital: 'OPTIMO' | 'ADECUADO' | 'AJUSTADO' | 'DEFICIT' = 'ADECUADO';
  if (netoDisponible < 0) {
    estadoSaludCapital = 'DEFICIT';
  } else if (capitalOperativoParaVivir >= 2500) {
    estadoSaludCapital = 'OPTIMO';
  } else if (capitalOperativoParaVivir >= 1400) {
    estadoSaludCapital = 'ADECUADO';
  } else {
    estadoSaludCapital = 'AJUSTADO';
  }

  const limiteDiario = diasTotales > 0
    ? Number((capitalOperativoParaVivir / diasTotales).toFixed(2))
    : 0;
  // Una semana son estrictamente 7 días del ritmo diario recomendado
  const limiteSemanal = Number((limiteDiario * 7).toFixed(2));

  const mesAbrev = mesesNombres[nextDate.getMonth()].slice(0, 3);
  const semanasDetalle: SemanaRunwayItem[] = [
    {
      semana: 1,
      etiqueta: 'Semana 1',
      rangoFechas: `01 al 07 de ${mesAbrev}`,
      montoSugerido: limiteSemanal,
    },
    {
      semana: 2,
      etiqueta: 'Semana 2',
      rangoFechas: `08 al 14 de ${mesAbrev}`,
      montoSugerido: limiteSemanal,
    },
    {
      semana: 3,
      etiqueta: 'Semana 3',
      rangoFechas: `15 al 21 de ${mesAbrev}`,
      montoSugerido: limiteSemanal,
    },
    {
      semana: 4,
      etiqueta: 'Semana 4',
      rangoFechas: `22 al 28 de ${mesAbrev}`,
      montoSugerido: limiteSemanal,
    },
  ];

  if (diasTotales > 28) {
    const diasRem = diasTotales - 28;
    const montoRem = Number((limiteDiario * diasRem).toFixed(2));
    semanasDetalle.push({
      semana: 5,
      etiqueta: 'Cierre de mes',
      rangoFechas: `29 al ${diasTotales} de ${mesAbrev}`,
      montoSugerido: montoRem,
    });
  }

  // Cargar sobres desde configDb o usar los valores predeterminados
  const sobresConfig: any[] = (configDb?.sobres as any[]) || DEFAULT_SOBRES_PRESUPUESTO;
  const sobresMapeados = sobresConfig.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      icono: s.icono || 'Utensils',
      color: s.color || '#0284c7',
      porcentaje: Number(s.porcentaje) || 0,
      monto: s.monto !== undefined ? Number(s.monto) : undefined,
      montoSemanal: s.montoSemanal !== undefined ? Number(s.montoSemanal) : undefined,
      montoDiario: s.montoDiario !== undefined ? Number(s.montoDiario) : undefined,
      bloqueado: Boolean(s.bloqueado),
    }));
  const sobres: SobreGastoOperativo[] = sincronizarSobresConCapital(
    sobresMapeados,
    capitalOperativoParaVivir,
    diasTotales
  );

  // Calcular Runway específico para el sobre de Bolsillo Personal & Ocio Flexible
  const sobreBolsillo = sobres.find(
    (s) => s.id === 'BOLSILLO_OCIO' || /bolsillo|ocio/i.test(s.nombre)
  ) || sobres[0];

  const montoBolsillo = sobreBolsillo?.monto || 0;
  const pctBolsillo = sobreBolsillo?.porcentaje || 0;
  const runwayBolsilloCalc = calcularPeriodoCobroYSemanas(
    montoBolsillo,
    periodoOrigen,
    periodoDestino,
    diaPagoSueldo
  );

  const runwayBolsillo: RunwayBolsilloData = {
    sobreId: sobreBolsillo?.id || 'BOLSILLO_OCIO',
    nombreSobre: sobreBolsillo?.nombre || 'Bolsillo Personal & Ocio Flexible',
    montoAsignado: montoBolsillo,
    porcentajeAsignado: pctBolsillo,
    ...runwayBolsilloCalc,
  };

  // Cargar escenarios desde configDb o usar los predeterminados
  const escenarios: EscenarioPresupuesto[] = (configDb?.escenarios as any[]) || DEFAULT_ESCENARIOS_PRESUPUESTO;

  const promedioAlimentacion = resumen.saludFinanciera?.alertasCategorias?.ratioAlimentacion?.monto || 1200;
  const promedioMovilidad = 450;

  const consejoConsultor = capitalOperativoParaVivir >= promedioAlimentacion + promedioMovilidad
    ? `Cuentas con ${moneda} ${capitalOperativoParaVivir.toLocaleString('es-PE', { minimumFractionDigits: 2 })} disponibles para vivir en ${nombreMesDestino}. Mantén un ritmo promedio de ${moneda} ${limiteSemanal.toFixed(2)} por semana para llegar al siguiente cierre de mes con tranquilidad.`
    : `Tu saldo operativo para ${nombreMesDestino} (${moneda} ${capitalOperativoParaVivir.toFixed(2)}) está ajustado respecto a tus gastos de subsistencia históricos. Prioriza alimentación y combustible y modera el gasto flexible.`;

  return {
    periodoOrigen,
    nombreMesOrigen,
    periodoDestino,
    nombreMesDestino,
    moneda,
    diaPagoSueldo,
    escenarioActivo,
    ingresosCierreOrigen,
    compromisosCierreOrigen,
    capitalOperativoParaVivir,
    estadoSaludCapital,
    runway: {
      diasTotales,
      semanasTotales,
      limiteDiario,
      limiteSemanal,
      desgloseSemanas: semanasDetalle,
    },
    runwayBolsillo,
    sobres,
    escenarios,
    benchmarkHistorico: {
      promedioAlimentacion,
      promedioMovilidad,
      comentario: `Historial de referencia: Alimentación ~${moneda} ${promedioAlimentacion.toFixed(0)}, Movilidad ~${moneda} ${promedioMovilidad.toFixed(0)}.`,
    },
    consejoConsultor,
  };
}


export async function guardarPresupuestoOperativo(
  input: GuardarPresupuestoOperativoInput,
  usuarioOrId?: string | any
): Promise<{ success: boolean; data?: any }> {
  let usuario: any = null;
  if (usuarioOrId && typeof usuarioOrId === 'object' && usuarioOrId.id) {
    usuario = usuarioOrId;
  } else if (typeof usuarioOrId === 'string') {
    usuario = await prisma.usuario.findUnique({ where: { id: usuarioOrId } });
  }
  if (!usuario) {
    usuario = await prisma.usuario.findFirst({ where: { activo: true }, orderBy: { createdAt: 'asc' } });
  }
  const uId = usuario?.id;
  if (!uId) throw new Error('Usuario no encontrado');

  const sobresNormalizados = normalizarSuma100(input.sobres);

  const config = await prisma.presupuestoOperativoConfig.upsert({
    where: {
      usuarioId_periodoDestino: {
        usuarioId: uId,
        periodoDestino: input.periodoDestino,
      },
    },
    update: {
      diaPagoSueldo: input.diaPagoSueldo !== undefined ? input.diaPagoSueldo : undefined,
      sobres: sobresNormalizados as any,
      escenarios: input.escenarios !== undefined ? (input.escenarios as any) : undefined,
      escenarioActivo: input.escenarioActivo !== undefined ? input.escenarioActivo : undefined,
    },
    create: {
      usuarioId: uId,
      periodoDestino: input.periodoDestino,
      diaPagoSueldo: input.diaPagoSueldo || 30,
      sobres: sobresNormalizados as any,
      escenarios: (input.escenarios as any) || (DEFAULT_ESCENARIOS_PRESUPUESTO as any),
      escenarioActivo: input.escenarioActivo || 'EQUILIBRADO',
    },
  });

  return { success: true, data: config };
}

export async function restablecerPresupuestoOperativo(
  periodoDestino: string,
  usuarioOrId?: string | any
): Promise<{ success: boolean }> {
  let usuario: any = null;
  if (usuarioOrId && typeof usuarioOrId === 'object' && usuarioOrId.id) {
    usuario = usuarioOrId;
  } else if (typeof usuarioOrId === 'string') {
    usuario = await prisma.usuario.findUnique({ where: { id: usuarioOrId } });
  }
  if (!usuario) {
    usuario = await prisma.usuario.findFirst({ where: { activo: true }, orderBy: { createdAt: 'asc' } });
  }
  const uId = usuario?.id;
  if (!uId) throw new Error('Usuario no encontrado');

  await prisma.presupuestoOperativoConfig.deleteMany({
    where: {
      usuarioId: uId,
      periodoDestino,
    },
  });

  return { success: true };
}
