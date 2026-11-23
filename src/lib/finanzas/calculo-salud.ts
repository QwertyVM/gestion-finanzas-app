import { MetodoPago } from '@prisma/client';
import { SaludFinancieraKPIs, EgresoConsolidado, AnalisisCategoriasResumen, Subcategoria503020Item } from './types';

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
  // Basado en las 3 grandes categorías canónicas:
  // - Necesidades (50%): gastos esenciales imprescindibles
  // - Deseos (30%): estilo de vida, compras, salidas, ocio
  // - Ahorro / Inversión (20%): amortización deuda/préstamos + disponible neto + aportes de ahorro
  let montoNecesidades = 0;
  let montoDeseos = 0;
  let montoAhorroDirecto = 0;

  const mapSubcatsNec = new Map<string, { tag: string; monto: number; conteo: number }>();
  const mapSubcatsDes = new Map<string, { tag: string; monto: number; conteo: number }>();
  const mapSubcatsAho = new Map<string, { tag: string; monto: number; conteo: number }>();

  const registrarSubcat = (
    map: Map<string, { tag: string; monto: number; conteo: number }>,
    tag: string,
    monto: number
  ) => {
    const key = tag || 'Sin subcategoría';
    const item = map.get(key) || { tag: key, monto: 0, conteo: 0 };
    item.monto += monto;
    item.conteo += 1;
    map.set(key, item);
  };

  for (const item of egresosConsolidados) {
    if (item.clasificacion === 'PRESTAMO') {
      // Los préstamos bancarios se acumulan en totalDeudas
      const tagPrestamo = item.banco ? `Préstamo ${item.banco}` : (item.tag || item.concepto || 'Préstamo Bancario');
      registrarSubcat(mapSubcatsAho, tagPrestamo, item.monto);
      continue;
    }
    const cat = (item.categoria || '').toLowerCase();
    const tag = item.tag || (item.concepto ? item.concepto.split('(')[0].trim() : 'General');

    if (cat.includes('necesidad') || cat.includes('50')) {
      montoNecesidades += item.monto;
      registrarSubcat(mapSubcatsNec, tag, item.monto);
    } else if (cat.includes('ahorro') || cat.includes('invers') || cat.includes('20')) {
      montoAhorroDirecto += item.monto;
      registrarSubcat(mapSubcatsAho, tag, item.monto);
    } else if (cat.includes('deseo') || cat.includes('30')) {
      montoDeseos += item.monto;
      registrarSubcat(mapSubcatsDes, tag, item.monto);
    } else {
      const conc = (item.concepto || '').toLowerCase();
      const esNecesidad =
        cat.includes('vivienda') ||
        cat.includes('alquiler') ||
        cat.includes('servicio') ||
        cat.includes('luz') ||
        cat.includes('agua') ||
        cat.includes('net') ||
        cat.includes('gas') ||
        cat.includes('alimen') ||
        cat.includes('super') ||
        cat.includes('mercado') ||
        cat.includes('salud') ||
        conc.includes('alquiler') ||
        conc.includes('luz');
      if (esNecesidad) {
        montoNecesidades += item.monto;
        registrarSubcat(mapSubcatsNec, tag, item.monto);
      } else {
        montoDeseos += item.monto;
        registrarSubcat(mapSubcatsDes, tag, item.monto);
      }
    }
  }

  // Si hay compras en cuotas de tarjeta diferidas y no se sumaron a préstamos, registrarlas para transparencia en Ahorro & Deuda
  const cuotasDiferidas = egresosConsolidados.filter((e) => e.clasificacion === 'CUOTA');
  if (cuotasDiferidas.length > 0) {
    for (const c of cuotasDiferidas) {
      const tagCuota = c.tarjetaNombre ? `Cuotas ${c.tarjetaNombre}` : 'Compras en Cuotas';
      registrarSubcat(mapSubcatsAho, tagCuota, c.monto);
    }
  }

  // Ahorro & Deuda ejecutada real (préstamos + compras en cuotas + ahorro directo registrado)
  // Desacoplado: YA NO se infla con el superávit/disponible neto
  const totalCuotasMonto = cuotasDiferidas.reduce((s, c) => s + c.monto, 0);
  const montoAhorroDeuda = totalDeudas + montoAhorroDirecto + totalCuotasMonto;
  const montoCapitalLibre = Math.max(0, dineroDisponibleNeto);

  const formatearSubcats = (
    map: Map<string, { tag: string; monto: number; conteo: number }>,
    totalBucket: number
  ): Subcategoria503020Item[] => {
    return Array.from(map.values())
      .map((s) => ({
        tag: s.tag,
        monto: Number(s.monto.toFixed(2)),
        porcentaje: totalBucket > 0 ? Number(((s.monto / totalBucket) * 100).toFixed(1)) : 0,
        conteo: s.conteo,
      }))
      .sort((a, b) => b.monto - a.monto);
  };

  const subcategoriasNec = formatearSubcats(mapSubcatsNec, montoNecesidades);
  const subcategoriasDes = formatearSubcats(mapSubcatsDes, montoDeseos);
  const subcategoriasAho = formatearSubcats(mapSubcatsAho, montoAhorroDeuda);

  const base503020 = totalIngresos > 0 ? totalIngresos : Math.max(1, totalEgresos);
  const pctNec = Number(((montoNecesidades / base503020) * 100).toFixed(1));
  const pctDes = Number(((montoDeseos / base503020) * 100).toFixed(1));
  const pctAho = Number(((montoAhorroDeuda / base503020) * 100).toFixed(1));
  const pctLibre = Number(((montoCapitalLibre / base503020) * 100).toFixed(1));

  // Modelo Adaptativo según Nivel de Endeudamiento (Debt-Constrained Budgeting)
  const esModeloAdaptativoDeuda = pctAho > 20 || (totalDeudas > 0 && Number(((totalDeudas / base503020) * 100).toFixed(1)) >= 15);
  let objetivoNec = 50;
  let objetivoAho = 20;
  let objetivoDes = 30;

  if (esModeloAdaptativoDeuda) {
    objetivoAho = Math.max(20, Math.min(50, Math.ceil(pctAho)));
    objetivoNec = 50;
    objetivoDes = Math.max(10, 100 - objetivoAho - objetivoNec);
  }

  let estadoNec: 'OPTIMO' | 'EXCEDIDO' | 'BAJO' = 'OPTIMO';
  if (pctNec > objetivoNec + 5) estadoNec = 'EXCEDIDO';
  else if (pctNec < objetivoNec - 10) estadoNec = 'BAJO';

  let estadoDes: 'OPTIMO' | 'EXCEDIDO' | 'BAJO' = 'OPTIMO';
  if (pctDes > objetivoDes + 5) estadoDes = 'EXCEDIDO';
  else if (pctDes < objetivoDes - 15) estadoDes = 'BAJO';

  let estadoAho: 'OPTIMO' | 'EXCEDIDO' | 'DEFICIT' = 'OPTIMO';
  if (pctAho < 15) estadoAho = 'DEFICIT';
  else if (pctAho >= objetivoAho) estadoAho = 'OPTIMO';

  // Distribución Recomendada del Capital Libre
  let sugerenciaCapitalLibre = '';
  let distribucionRecomendada = {
    deuda: 0,
    ahorroEmergencia: 0,
    estiloVida: 0,
  };

  if (montoCapitalLibre > 0) {
    if (totalDeudas > 0 || pctAho > 20) {
      distribucionRecomendada = {
        deuda: Number((montoCapitalLibre * 0.5).toFixed(2)),
        ahorroEmergencia: Number((montoCapitalLibre * 0.35).toFixed(2)),
        estiloVida: Number((montoCapitalLibre * 0.15).toFixed(2)),
      };
      sugerenciaCapitalLibre = `Tienes compromisos de deuda activos. Te sugerimos destinar el 50% (S/ ${distribucionRecomendada.deuda.toFixed(2)}) a amortizar capital, 35% (S/ ${distribucionRecomendada.ahorroEmergencia.toFixed(2)}) a Fondo de Emergencia y 15% como margen libre.`;
    } else {
      distribucionRecomendada = {
        deuda: 0,
        ahorroEmergencia: Number((montoCapitalLibre * 0.7).toFixed(2)),
        estiloVida: Number((montoCapitalLibre * 0.3).toFixed(2)),
      };
      sugerenciaCapitalLibre = `Sin deudas pesadas. Te sugerimos destinar el 70% (S/ ${distribucionRecomendada.ahorroEmergencia.toFixed(2)}) a Fondo de Tranquilidad e Inversiones, y 30% a Estilo de Vida sin culpa.`;
    }
  }

  let diagnostico503020 = 'Estructura financiera balanceada conforme al estándar consultor 50/30/20.';
  if (esModeloAdaptativoDeuda) {
    diagnostico503020 = `Modelo adaptado a tu endeudamiento: tus préstamos y cuotas comprometen el ${pctAho}% de tus ingresos. Para proteger tu solvencia, la meta de Estilo de Vida se ajustó al ${objetivoDes}%. Dispones de S/ ${montoCapitalLibre.toFixed(2)} (${pctLibre}%) de Capital Libre por redistribuir.`;
  } else if (pctNec > 55) {
    diagnostico503020 = 'Tus necesidades básicas sobrepasan el 50% ideal. Conviene revisar costos fijos y servicios.';
  } else if (pctDes > 35) {
    diagnostico503020 = 'El estilo de vida y ocio supera el 30% ideal. Aquí reside tu mayor potencial de ahorro inmediato.';
  } else if (montoCapitalLibre > 0) {
    diagnostico503020 = `Cuentas con S/ ${montoCapitalLibre.toFixed(2)} (${pctLibre}%) de Capital Libre disponible. Tú defines estratégicamente a qué cubeta destinarlo.`;
  }

  // 6. Alertas de Categorías y Minitags (Vivienda, Alimentación, Concentración Pareto, Fugas)
  const cats = analisisCategorias.categorias;

  const montoViv = egresosConsolidados
    .filter((e) => {
      const t = (e.tag || '').toLowerCase();
      const c = (e.concepto || '').toLowerCase();
      return t.includes('vivienda') || t.includes('alquiler') || c.includes('alquiler');
    })
    .reduce((sum, e) => sum + e.monto, 0);

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

  const montoAlim = egresosConsolidados
    .filter((e) => {
      const t = (e.tag || '').toLowerCase();
      const c = (e.concepto || '').toLowerCase();
      return t.includes('alimen') || t.includes('super') || t.includes('mercado') || c.includes('comida') || c.includes('super');
    })
    .reduce((sum, e) => sum + e.monto, 0);

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

  const catDeseosObj = cats.find((c) => c.nombre.toLowerCase().includes('deseo'));
  if (catDeseosObj && catDeseosObj.minitags) {
    for (const m of catDeseosObj.minitags) {
      if (m.conteo >= 3) {
        fugasHormiga.push({
          categoria: m.tag,
          total: m.totalMonto,
          conteo: m.conteo,
          ticketPromedio: Number((m.totalMonto / m.conteo).toFixed(2)),
          aviso: `${m.conteo} transacciones de #${m.tag} sumaron S/ ${m.totalMonto.toFixed(2)}.`,
        });
      }
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
        objetivo: objetivoNec,
        desvio: Number((pctNec - objetivoNec).toFixed(1)),
        estado: estadoNec,
        subcategorias: subcategoriasNec,
      },
      deseos: {
        monto: Number(montoDeseos.toFixed(2)),
        porcentaje: pctDes,
        objetivo: objetivoDes,
        desvio: Number((pctDes - objetivoDes).toFixed(1)),
        estado: estadoDes,
        subcategorias: subcategoriasDes,
      },
      ahorroYDeuda: {
        monto: Number(montoAhorroDeuda.toFixed(2)),
        porcentaje: pctAho,
        objetivo: objetivoAho,
        desvio: Number((pctAho - objetivoAho).toFixed(1)),
        estado: estadoAho,
        subcategorias: subcategoriasAho,
      },
      capitalLibre: {
        monto: Number(montoCapitalLibre.toFixed(2)),
        porcentaje: pctLibre,
        sugerencia: sugerenciaCapitalLibre,
        distribucionRecomendada,
      },
      esModeloAdaptativoDeuda,
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
