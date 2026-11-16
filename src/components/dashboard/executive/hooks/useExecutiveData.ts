'use client';

import { useState, useMemo } from 'react';
import type { ResumenFinanciero } from '@/lib/finanzas-service';
import { esItemRecurrente } from '@/lib/utils';

export type TabView = 'general' | 'categorias' | 'tags';

export function useExecutiveData(resumen: ResumenFinanciero | null, periodo: string) {
  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const [tabActiva, setTabActiva] = useState<TabView>('general');
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState<string | null>(null);
  const [busquedaCat, setBusquedaCat] = useState<string>('');
  const [filtroTagActivo, setFiltroTagActivo] = useState<'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE'>('TODOS');

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = 'Gratificación';
  if (mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  const distribucionEgresos = useMemo(() => {
    if (!resumen) return [];
    if (resumen.totalesPorClasificacion) {
      const tot = resumen.totalesPorClasificacion;
      return [
        { name: 'Costos Fijos', value: tot.fijos, color: '#0284c7', dot: 'bg-sky-500' },
        { name: 'Préstamos Bancarios', value: tot.prestamos, color: '#7c3aed', dot: 'bg-purple-500' },
        { name: 'Cuotas de Tarjeta', value: tot.cuotas, color: '#4f46e5', dot: 'bg-indigo-500' },
        { name: 'Compras & Variables', value: tot.variables, color: '#0d9488', dot: 'bg-teal-500' },
      ].filter((item) => item.value > 0);
    }

    let totalFijos = 0;
    let totalRecurrentes = 0;
    let totalPrestamosCuotas = 0;
    let totalVariables = 0;

    for (const cf of resumen.costosFijos) {
      if (esItemRecurrente(cf.concepto, cf.categoria)) {
        totalRecurrentes += cf.monto;
      } else {
        totalFijos += cf.monto;
      }
    }
    for (const p of resumen.prestamos) {
      if (p.aplicaEsteMes !== false) {
        totalPrestamosCuotas += p.montoCuota;
      }
    }
    for (const t of resumen.tarjetasCredito) {
      for (const g of t.gastosPeriodo) {
        if ((g.totalCuotas || 1) > 1) {
          totalPrestamosCuotas += g.monto;
        } else if (esItemRecurrente(g.concepto, g.categoria)) {
          totalRecurrentes += g.monto;
        } else {
          totalVariables += g.monto;
        }
      }
    }
    for (const g of resumen.gastosDirectos) {
      if (esItemRecurrente(g.concepto, g.categoria)) {
        totalRecurrentes += g.monto;
      } else {
        totalVariables += g.monto;
      }
    }

    return [
      { name: 'Costos Fijos', value: Number(totalFijos.toFixed(2)), color: '#0284c7', dot: 'bg-sky-500' },
      { name: 'Préstamos Bancarios', value: Number(totalPrestamosCuotas.toFixed(2)), color: '#7c3aed', dot: 'bg-purple-500' },
      { name: 'Recurrentes', value: Number(totalRecurrentes.toFixed(2)), color: '#f59e0b', dot: 'bg-amber-500' },
      { name: 'Variables', value: Number(totalVariables.toFixed(2)), color: '#0d9488', dot: 'bg-teal-500' },
    ].filter((item) => item.value > 0);
  }, [resumen]);

  const datosFlujoAnual = useMemo(() => {
    if (!resumen?.proyeccionMultiMes) return [];
    return resumen.proyeccionMultiMes.map((m) => {
      const [year, month] = m.periodo.split('-');
      const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
      const label = `${nombres[parseInt(month, 10) - 1]} ${year.slice(2)}`;
      return {
        mes: label,
        periodo: m.periodo,
        Ingresos: m.ingresos,
        Egresos: m.egresos,
        Disponible: m.disponible,
      };
    });
  }, [resumen]);

  const prestamosActivos = useMemo(() => {
    if (!resumen?.prestamos) return [];
    return resumen.prestamos
      .filter((p) => p.mensajePeriodo !== 'Finalizado')
      .map((p) => {
        const pagada = p.estado === 'PAGADO';
        const cuotasRestantes = Math.max(0, p.cuotasTotales - p.cuotaActual + (pagada ? 0 : 1));
        const progreso = Math.round((p.cuotaActual / p.cuotasTotales) * 100);
        const saldoAprox = Math.max(0, cuotasRestantes * p.montoCuota);
        return {
          id: p.id,
          banco: p.banco,
          concepto: p.concepto,
          cuotaActual: p.cuotaActual,
          cuotasTotales: p.cuotasTotales,
          progreso,
          montoCuota: p.montoCuota,
          saldoAprox,
          estado: p.estado,
          diaPago: p.diaPago,
          monedaOriginal: p.monedaOriginal,
          montoOriginal: p.montoOriginal,
        };
      });
  }, [resumen]);

  const deudaTotalConsolidada = useMemo(() => {
    return prestamosActivos.reduce((acc, p) => acc + p.saldoAprox, 0);
  }, [prestamosActivos]);

  const analisisCategorias = resumen?.analisisCategorias;
  const todasCategorias = useMemo(() => analisisCategorias?.categorias || [], [analisisCategorias]);
  const metricasMacro = analisisCategorias?.metricasMacro;
  const clasificaciones = useMemo(() => analisisCategorias?.clasificaciones || [], [analisisCategorias]);
  const metodosPago = useMemo(() => analisisCategorias?.metodosPago || [], [analisisCategorias]);
  const tarjetas = useMemo(() => analisisCategorias?.tarjetas || [], [analisisCategorias]);

  const categoriasFiltradas = useMemo(() => {
    if (!busquedaCat.trim()) return todasCategorias;
    const q = busquedaCat.toLowerCase();
    return todasCategorias.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [todasCategorias, busquedaCat]);

  const categoriaSeleccionada = useMemo(() => {
    if (!categoriaSeleccionadaId) return null;
    return todasCategorias.find((c) => c.id === categoriaSeleccionadaId) || null;
  }, [todasCategorias, categoriaSeleccionadaId]);

  const egresosFiltradosPorTag = useMemo(() => {
    if (!resumen?.egresosConsolidados) return [];
    if (filtroTagActivo === 'TODOS') return resumen.egresosConsolidados;
    return resumen.egresosConsolidados.filter((e) => e.clasificacion === filtroTagActivo);
  }, [resumen, filtroTagActivo]);

  const sueldoBase = resumen?.config?.sueldoBaseMensual ?? 0;
  const totalIngresos = resumen?.totalIngresos ?? 0;
  const totalEgresos = resumen?.totalEgresos ?? 0;
  const disponibleNeto = resumen?.dineroDisponibleNeto ?? 0;
  const disponibleEsPositivo = disponibleNeto >= 0;

  return {
    moneda,
    tabActiva,
    setTabActiva,
    categoriaSeleccionadaId,
    setCategoriaSeleccionadaId,
    busquedaCat,
    setBusquedaCat,
    filtroTagActivo,
    setFiltroTagActivo,
    mesActual,
    esMesEspecial,
    labelEspecial,
    distribucionEgresos,
    datosFlujoAnual,
    prestamosActivos,
    deudaTotalConsolidada,
    todasCategorias,
    categoriasFiltradas,
    categoriaSeleccionada,
    metricasMacro,
    clasificaciones,
    metodosPago,
    tarjetas,
    egresosFiltradosPorTag,
    sueldoBase,
    totalIngresos,
    totalEgresos,
    disponibleNeto,
    disponibleEsPositivo,
  };
}
