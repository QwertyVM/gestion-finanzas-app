'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel, esItemRecurrente } from '@/lib/utils';
import type {
  CategoriaAnalisisItem,
  TagClasificacionItem,
  EgresoConsolidado,
} from '@/lib/finanzas-service';
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Tag,
  Home,
  Zap,
  ShoppingCart,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  Coffee,
  CreditCard,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Info,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ExecutiveDashboardSkeleton } from '@/components/common/Skeleton';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

type TabView = 'general' | 'categorias' | 'tags';

export function ExecutiveDashboardClient() {
  const router = useRouter();
  const { periodo, irMesAnterior, irMesSiguiente, resumen, loading } = useFinanzas();
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  // Estado de Navegación por Pestañas del Dashboard
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

  // 1. Distribución de egresos calculada directamente por el backend
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

  // Proyección anual (próximos 12 meses)
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

  // Préstamos activos
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

  // Inteligencia de Categorías y Tags entregada por el Backend
  const analisisCategorias = resumen?.analisisCategorias;
  const todasCategorias = useMemo(() => analisisCategorias?.categorias || [], [analisisCategorias]);
  const metricasMacro = analisisCategorias?.metricasMacro;
  const clasificaciones = useMemo(() => analisisCategorias?.clasificaciones || [], [analisisCategorias]);
  const metodosPago = useMemo(() => analisisCategorias?.metodosPago || [], [analisisCategorias]);
  const tarjetas = useMemo(() => analisisCategorias?.tarjetas || [], [analisisCategorias]);

  // Filtrado de categorías por término de búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!busquedaCat.trim()) return todasCategorias;
    const q = busquedaCat.toLowerCase();
    return todasCategorias.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [todasCategorias, busquedaCat]);

  // Categoría seleccionada actualmente para desglose detallado
  const categoriaSeleccionada = useMemo(() => {
    if (!categoriaSeleccionadaId) return null;
    return todasCategorias.find((c) => c.id === categoriaSeleccionadaId) || null;
  }, [todasCategorias, categoriaSeleccionadaId]);

  // Transacciones filtradas por tag en la pestaña de Tags
  const egresosFiltradosPorTag = useMemo(() => {
    if (!resumen?.egresosConsolidados) return [];
    if (filtroTagActivo === 'TODOS') return resumen.egresosConsolidados;
    return resumen.egresosConsolidados.filter((e) => e.clasificacion === filtroTagActivo);
  }, [resumen, filtroTagActivo]);

  if (loading || !resumen) {
    return <ExecutiveDashboardSkeleton />;
  }

  const sueldoBase = resumen.config?.sueldoBaseMensual || 6000;
  const totalIngresos = resumen.totalIngresos;
  const totalEgresos = resumen.totalEgresos;
  const disponibleNeto = resumen.dineroDisponibleNeto;
  const disponibleEsPositivo = disponibleNeto >= 0;

  // Helper para renderizar íconos según categoría
  const renderIcono = (iconoNombre?: string, className = 'w-4 h-4') => {
    switch (iconoNombre) {
      case 'Home':
        return <Home className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'ShoppingCart':
        return <ShoppingCart className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'Tv':
        return <Tv className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Banknote':
        return <Banknote className={className} />;
      default:
        return <Tag className={className} />;
    }
  };

  // Custom tooltips accesibles y adaptados a modo oscuro/claro
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-3 text-xs space-y-1.5 min-w-[170px]">
        <p className="font-semibold text-foreground border-b border-border/60 pb-1 text-xs">
          {label}
        </p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-medium text-foreground text-[11px]">
              {formatMoney(entry.value, moneda)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0];
    const porcentaje = totalEgresos > 0 ? Math.round((data.value / totalEgresos) * 100) : 0;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-2.5 text-xs min-w-[140px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: data.payload.color || data.color }} />
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2 text-[11px]">
          <span className="font-mono font-bold text-foreground">{formatMoney(data.value, moneda)}</span>
          <span className="text-muted-foreground font-medium">({porcentaje}%)</span>
        </div>
      </div>
    );
  };

  const CustomCategoryBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as CategoriaAnalisisItem;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-3 text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-foreground text-xs">{data.nombre}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Monto Total:</span>
          <span className="font-mono font-bold text-foreground">{formatMoney(data.totalMonto, moneda)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">% del Presupuesto:</span>
          <span className="font-medium text-foreground">{data.porcentaje}%</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Transacciones:</span>
          <span className="font-medium text-foreground">{data.conteoItems} items</span>
        </div>
        <div className="pt-1.5 border-t border-border/40 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
          <div>Fijos: <span className="font-mono text-foreground">{formatMoney(data.desgloseClasificacion.fijo, moneda)}</span></div>
          <div>Cuotas: <span className="font-mono text-foreground">{formatMoney(data.desgloseClasificacion.cuotas, moneda)}</span></div>
          <div>Préstamos: <span className="font-mono text-foreground">{formatMoney(data.desgloseClasificacion.prestamos, moneda)}</span></div>
          <div>Variables: <span className="font-mono text-foreground">{formatMoney(data.desgloseClasificacion.variables, moneda)}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. CABECERA & SELECTOR DE PESTAÑAS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>Dashboard Financiero</span>
            {metricasMacro?.nivelCompromiso && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  metricasMacro.nivelCompromiso === 'BAJO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                    : metricasMacro.nivelCompromiso === 'MODERADO'
                    ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                    : metricasMacro.nivelCompromiso === 'ALTO'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                }`}
                title={`Nivel de compromiso: ${metricasMacro.porcentajeComprometido}% de egresos fijos y deudas`}
              >
                Compromiso {metricasMacro.nivelCompromiso}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inteligencia visual, análisis por categorías, tags y compromisos del mes.
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium self-start md:self-auto">
          <button
            type="button"
            onClick={irMesAnterior}
            className="p-1 hover:text-foreground text-muted-foreground rounded transition"
            title="Mes anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="capitalize px-2 text-foreground font-semibold">
            {formatPeriodoLabel(periodo)}
          </span>
          <button
            type="button"
            onClick={irMesSiguiente}
            className="p-1 hover:text-foreground text-muted-foreground rounded transition"
            title="Mes siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {esMesEspecial && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium ml-1">
              · {labelEspecial}
            </span>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN ENTRE DASHBOARDS (PESTAÑAS) */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setTabActiva('general')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            tabActiva === 'general'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Visión General</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('categorias')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            tabActiva === 'categorias'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Categorías</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
            {todasCategorias.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('tags')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            tabActiva === 'tags'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tags & Clasificación</span>
          <div className="flex items-center -space-x-1 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* PESTAÑA 1: VISIÓN GENERAL                               */}
      {/* ======================================================== */}
      {tabActiva === 'general' && (
        <div className="space-y-6">
          {/* TARJETAS DE KPIS PRINCIPALES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Ingresos
              </span>
              <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(totalIngresos, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Base: {formatMoney(sueldoBase, moneda)}
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Egresos
              </span>
              <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(totalEgresos, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {formatMoney(resumen.totalPendiente, moneda)} pendientes
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Dinero Libre
              </span>
              <div className={`text-2xl font-semibold tracking-tight font-mono ${disponibleEsPositivo ? 'text-foreground' : 'text-rose-600'}`}>
                {formatMoney(disponibleNeto, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Ingresos menos egresos
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Deuda en Préstamos
              </span>
              <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(deudaTotalConsolidada, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {prestamosActivos.length} créditos activos
              </span>
            </div>
          </div>

          {/* GRÁFICOS: DISTRIBUCIÓN Y EVOLUCIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* DISTRIBUCIÓN DE EGRESOS */}
            <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Distribución de Egresos
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fijos, Préstamos, Cuotas y Compras Variables.
                </p>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribucionEgresos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distribucionEgresos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
                    >
                      Total
                    </text>
                    <text
                      x="50%"
                      y="56%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-xs font-semibold font-mono"
                    >
                      {formatMoney(totalEgresos, moneda)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/40">
                {distribucionEgresos.map((item) => {
                  const porcentaje = totalEgresos > 0 ? Math.round((item.value / totalEgresos) * 100) : 0;
                  return (
                    <div key={item.name} className="p-2 rounded-lg bg-muted/40 border border-border/40">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono font-medium text-foreground text-xs">
                          {formatMoney(item.value, moneda)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {porcentaje}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FLUJO DE CAJA ANUAL */}
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Evolución Anual Proyectada
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ingresos vs Egresos en los próximos 12 meses.
                  </p>
                </div>
                <Link
                  href="/flujo-anual"
                  className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
                >
                  <span>Ver tabla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="h-72 w-full pt-2">
                {datosFlujoAnual.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No hay datos de proyección disponibles
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosFlujoAnual} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                        width={38}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Egresos" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Disponible" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* TABLA PRÉSTAMOS ACTIVOS */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Créditos & Préstamos Activos
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seguimiento de amortización de cuotas y saldo restante.
                </p>
              </div>
              <Link
                href="/fijos-y-prestamos"
                className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
              >
                <span>Gestionar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {prestamosActivos.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No tienes préstamos bancarios registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                    <tr>
                      <th scope="col" className="py-2.5 px-3 font-medium">Banco / Concepto</th>
                      <th scope="col" className="py-2.5 px-3 font-medium">Progreso</th>
                      <th scope="col" className="py-2.5 px-3 text-center font-medium">Día Pago</th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">Cuota Mensual</th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">Saldo Restante</th>
                      <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {prestamosActivos.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => router.push('/fijos-y-prestamos')}
                        className="hover:bg-muted/40 transition cursor-pointer"
                        title="Ver detalle en Fijos y Préstamos"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-foreground text-xs">{p.concepto}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span>{p.banco}</span>
                            {p.monedaOriginal === 'USD' && p.montoOriginal && (
                              <span className="text-[10px] text-muted-foreground">
                                · ${p.montoOriginal.toFixed(2)} USD
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Cuota {p.cuotaActual}/{p.cuotasTotales}</span>
                              <span>{p.progreso}%</span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-foreground rounded-full transition-all"
                                style={{ width: `${p.progreso}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                          Día {p.diaPago}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                          {formatMoney(p.montoCuota, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                          ~ {formatMoney(p.saldoAprox, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              p.estado === 'PAGADO'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : p.estado === 'ADELANTADO'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.estado === 'PAGADO'
                                  ? 'bg-emerald-500'
                                  : p.estado === 'ADELANTADO'
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            {p.estado === 'PAGADO' ? 'Pagado' : p.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 2: DASHBOARD DE CATEGORÍAS                       */}
      {/* ======================================================== */}
      {tabActiva === 'categorias' && (
        <div className="space-y-6">
          {/* MACRO KPIS DE CATEGORÍAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Categoría Mayor Gasto
              </span>
              <div className="flex items-center gap-2 mt-1">
                {metricasMacro?.categoriaMayorGasto && (
                  <span
                    className="p-1.5 rounded-lg shrink-0 text-white"
                    style={{ backgroundColor: metricasMacro.categoriaMayorGasto.color }}
                  >
                    {renderIcono(metricasMacro.categoriaMayorGasto.icono, 'w-4 h-4')}
                  </span>
                )}
                <div className="truncate">
                  <div className="text-base font-bold text-foreground truncate">
                    {metricasMacro?.categoriaMayorGasto?.nombre || 'Sin datos'}
                  </div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {metricasMacro?.categoriaMayorGasto
                      ? `${formatMoney(metricasMacro.categoriaMayorGasto.monto, moneda)} (${metricasMacro.categoriaMayorGasto.porcentaje}%)`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Categorías Activas
              </span>
              <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {metricasMacro?.totalCategoriasActivas || 0}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Promedio: {formatMoney(metricasMacro?.promedioGastoPorCategoria || 0, moneda)}/cat
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Gasto Comprometido
              </span>
              <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(metricasMacro?.totalGastoComprometido || 0, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {metricasMacro?.porcentajeComprometido || 0}% (Fijos + Préstamos)
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-muted-foreground font-medium block">
                Margen Flexible / Variable
              </span>
              <div className="text-2xl font-semibold tracking-tight text-teal-600 dark:text-teal-400 font-mono">
                {formatMoney(metricasMacro?.totalGastoFlexible || 0, moneda)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {metricasMacro?.porcentajeFlexible || 0}% ajustable a voluntad
              </span>
            </div>
          </div>

          {/* GRÁFICOS DE CATEGORÍAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* RANKING HORIZONTAL DE CATEGORÍAS */}
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ranking de Egresos por Categoría
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    De mayor a menor gasto presupuestado en este periodo.
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  {todasCategorias.length} categorías
                </span>
              </div>

              <div className="w-full pt-1" style={{ minHeight: `${Math.max(260, todasCategorias.length * 36)}px` }}>
                <ResponsiveContainer width="100%" height={Math.max(260, todasCategorias.length * 36)}>
                  <BarChart
                    layout="vertical"
                    data={todasCategorias}
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={130}
                      tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                    />
                    <Tooltip content={<CustomCategoryBarTooltip />} />
                    <Bar dataKey="totalMonto" radius={[0, 4, 4, 0]}>
                      {todasCategorias.map((entry, index) => (
                        <Cell key={`cat-bar-${index}`} fill={entry.color || '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DISTRIBUCIÓN DONUT POR CATEGORÍA */}
            <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Participación Presupuestaria
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proporción porcentual de cada categoría en el total.
                </p>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todasCategorias}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="totalMonto"
                      nameKey="nombre"
                    >
                      {todasCategorias.map((entry, index) => (
                        <Cell key={`cat-pie-${index}`} fill={entry.color || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomCategoryBarTooltip />} />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
                    >
                      Categorías
                    </text>
                    <text
                      x="50%"
                      y="56%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-xs font-semibold font-mono"
                    >
                      {todasCategorias.length} activas
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top 4 Categorías resumen visual */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/40">
                {todasCategorias.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setCategoriaSeleccionadaId(c.id === categoriaSeleccionadaId ? null : c.id)}
                    className="p-2 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/80 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="truncate font-medium">{c.nombre}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono font-medium text-foreground text-xs">
                        {formatMoney(c.totalMonto, moneda)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {c.porcentaje}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EXPLORADOR INTERACTIVO DE CATEGORÍAS */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explorador de Categorías
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Haz clic en cualquier categoría para auditar sus transacciones, composición fija vs variable y estado.
                </p>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={busquedaCat}
                  onChange={(e) => setBusquedaCat(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Grid de Tarjetas de Categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoriasFiltradas.map((c) => {
                const esSeleccionada = c.id === categoriaSeleccionadaId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setCategoriaSeleccionadaId(esSeleccionada ? null : c.id)}
                    className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      esSeleccionada
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                        : 'border-border/80 bg-background hover:border-border hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="p-1.5 rounded-lg text-white shrink-0"
                            style={{ backgroundColor: c.color }}
                          >
                            {renderIcono(c.icono, 'w-3.5 h-3.5')}
                          </span>
                          <span className="font-semibold text-xs text-foreground truncate">
                            {c.nombre}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-foreground shrink-0">
                          {c.porcentaje}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div className="text-lg font-bold font-mono tracking-tight text-foreground">
                          {formatMoney(c.totalMonto, moneda)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.conteoItems} {c.conteoItems === 1 ? 'item' : 'items'}
                        </div>
                      </div>

                      {/* Barra de progreso de pago */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{c.porcentajePagado}% pagado</span>
                          <span>{formatMoney(c.desgloseEstado.pendiente, moneda)} pendiente</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${c.porcentajePagado}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desglose Fijo / Cuotas / Préstamos / Variables */}
                    <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-[10px]">
                      {c.desgloseClasificacion.fijo > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Fijo: {formatMoney(c.desgloseClasificacion.fijo, moneda)}
                        </span>
                      )}
                      {c.desgloseClasificacion.cuotas > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Cuotas: {formatMoney(c.desgloseClasificacion.cuotas, moneda)}
                        </span>
                      )}
                      {c.desgloseClasificacion.prestamos > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Préstamo: {formatMoney(c.desgloseClasificacion.prestamos, moneda)}
                        </span>
                      )}
                      {c.desgloseClasificacion.variables > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          Var: {formatMoney(c.desgloseClasificacion.variables, moneda)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETALLE DRILL-DOWN SI HAY UNA CATEGORÍA SELECCIONADA */}
            {categoriaSeleccionada && (
              <div className="mt-4 p-5 rounded-xl border border-primary/40 bg-card shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="p-2 rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: categoriaSeleccionada.color }}
                    >
                      {renderIcono(categoriaSeleccionada.icono, 'w-5 h-5')}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>Detalle de {categoriaSeleccionada.nombre}</span>
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {categoriaSeleccionada.conteoItems} items
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Total:{' '}
                        <span className="font-mono font-bold text-foreground">
                          {formatMoney(categoriaSeleccionada.totalMonto, moneda)}
                        </span>{' '}
                        · ({categoriaSeleccionada.porcentaje}% del mes)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCategoriaSeleccionadaId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition self-start sm:self-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cerrar filtro</span>
                  </button>
                </div>

                {/* Lista de transacciones de esta categoría */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                      <tr>
                        <th scope="col" className="py-2.5 px-3 font-medium">Clasificación</th>
                        <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                        <th scope="col" className="py-2.5 px-3 font-medium">Detalle</th>
                        <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                        <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {categoriaSeleccionada.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.clasificacion === 'FIJO'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                                  : item.clasificacion === 'PRESTAMO'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
                                  : item.clasificacion === 'CUOTA'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                                  : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.clasificacion === 'FIJO'
                                    ? 'bg-sky-500'
                                    : item.clasificacion === 'PRESTAMO'
                                    ? 'bg-purple-500'
                                    : item.clasificacion === 'CUOTA'
                                    ? 'bg-indigo-500'
                                    : 'bg-teal-500'
                                }`}
                              />
                              {item.badgeLabel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-foreground text-xs">{item.concepto}</div>
                            {item.subtexto && (
                              <div className="text-[11px] text-muted-foreground">{item.subtexto}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                            {item.tarjetaNombre ? `Tarjeta · ${item.tarjetaNombre}` : 'Fin de mes'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                            {formatMoney(item.monto, moneda)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                item.estado === 'PAGADO'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : item.estado === 'ADELANTADO'
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.estado === 'PAGADO'
                                    ? 'bg-emerald-500'
                                    : item.estado === 'ADELANTADO'
                                    ? 'bg-indigo-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* MATRIZ GENERAL DE CATEGORÍAS */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Matriz Comparativa de Categorías
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Desglose analítico completo de fijos, cuotas, préstamos y variables por categoría.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Fijos</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Préstamos</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Cuotas</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Variables</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Total Mes</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">% Mes</th>
                    <th scope="col" className="py-2.5 px-3 text-center font-medium">% Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border/40">
                  {todasCategorias.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setCategoriaSeleccionadaId(c.id === categoriaSeleccionadaId ? null : c.id)}
                      className="hover:bg-muted/30 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-semibold text-foreground text-xs">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {c.desgloseClasificacion.fijo > 0 ? formatMoney(c.desgloseClasificacion.fijo, moneda) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {c.desgloseClasificacion.prestamos > 0 ? formatMoney(c.desgloseClasificacion.prestamos, moneda) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {c.desgloseClasificacion.cuotas > 0 ? formatMoney(c.desgloseClasificacion.cuotas, moneda) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {c.desgloseClasificacion.variables > 0 ? formatMoney(c.desgloseClasificacion.variables, moneda) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatMoney(c.totalMonto, moneda)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                        {c.porcentaje}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.porcentajePagado}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑA 3: DASHBOARD DE TAGS & CLASIFICACIÓN             */}
      {/* ======================================================== */}
      {tabActiva === 'tags' && (
        <div className="space-y-6">
          {/* 4 HERO CARDS DE CLASIFICACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clasificaciones.map((tag) => (
              <div
                key={tag.id}
                onClick={() => setFiltroTagActivo(filtroTagActivo === tag.id ? 'TODOS' : tag.id)}
                className={`rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  filtroTagActivo === tag.id
                    ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-primary'
                    : 'bg-card border-border/80 hover:border-border hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        tag.id === 'FIJO'
                          ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                          : tag.id === 'PRESTAMO'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
                          : tag.id === 'CUOTA'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                          : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.colorHex }} />
                      {tag.badgeLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {tag.porcentaje}% del total
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-bold tracking-tight font-mono text-foreground">
                      {formatMoney(tag.total, moneda)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {tag.conteo} {tag.conteo === 1 ? 'operación' : 'operaciones'} · Promedio:{' '}
                      <span className="font-mono">{formatMoney(tag.ticketPromedio, moneda)}</span>
                    </div>
                  </div>
                </div>

                {/* Progreso Pagado vs Pendiente */}
                <div className="space-y-1.5 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Pagado: {formatMoney(tag.totalPagado, moneda)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Pendiente: {formatMoney(tag.totalPendiente, moneda)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: tag.colorHex,
                        width: tag.total > 0 ? `${Math.round((tag.totalPagado / tag.total) * 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MATRIZ DE RIGIDEZ Y FLEXIBILIDAD FINANCIERA */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Índice de Compromiso y Flexibilidad Financiera
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compara los compromisos ineludibles (Fijos + Préstamos + Cuotas) frente al gasto discrecional libre (Variables).
                </p>
              </div>

              {metricasMacro && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-muted/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Índice de Flexibilidad: {metricasMacro.porcentajeFlexible}%</span>
                </div>
              )}
            </div>

            {/* Barra Stacked Visual */}
            {metricasMacro && (
              <div className="space-y-2 pt-1">
                <div className="w-full h-4 rounded-xl bg-muted overflow-hidden flex shadow-inner">
                  <div
                    className="h-full bg-linear-to-r from-sky-500 to-indigo-600 transition-all"
                    style={{ width: `${metricasMacro.porcentajeComprometido}%` }}
                    title={`Comprometido: ${metricasMacro.porcentajeComprometido}%`}
                  />
                  <div
                    className="h-full bg-teal-500 transition-all"
                    style={{ width: `${metricasMacro.porcentajeFlexible}%` }}
                    title={`Flexible: ${metricasMacro.porcentajeFlexible}%`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-foreground">
                      Comprometido: {formatMoney(metricasMacro.totalGastoComprometido, moneda)}
                    </span>
                    <span className="text-muted-foreground">({metricasMacro.porcentajeComprometido}%)</span>
                    <span className="text-[11px] text-muted-foreground hidden md:inline">
                      — Costos que debes cubrir sí o sí
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      Flexible: {formatMoney(metricasMacro.totalGastoFlexible, moneda)}
                    </span>
                    <span className="text-muted-foreground">({metricasMacro.porcentajeFlexible}%)</span>
                    <span className="text-[11px] text-muted-foreground hidden md:inline">
                      — Margen disponible para ahorro voluntario
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MÉTODOS DE PAGO Y TARJETAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CANALES / MÉTODOS DE PAGO */}
            <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Egresos por Medio de Pago
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tarjeta de Crédito vs Efectivo / Débito vs Transferencias.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {metodosPago.map((mp) => (
                  <div key={mp.metodo} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mp.color }} />
                        <span className="text-xs font-semibold text-foreground">{mp.label}</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-foreground">
                        {formatMoney(mp.total, moneda)}{' '}
                        <span className="text-muted-foreground font-normal text-[11px]">({mp.porcentaje}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ backgroundColor: mp.color, width: `${mp.porcentaje}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right">
                      {mp.conteo} transacciones
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TARJETAS DE CRÉDITO ACTIVAS */}
            <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Consumo por Tarjeta de Crédito
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Facturación del mes desglosada por cada plástico activo.
                </p>
              </div>

              {tarjetas.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No hay gastos con tarjeta de crédito en este periodo.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {tarjetas.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                            style={{ backgroundColor: t.color }}
                          />
                          <div>
                            <div className="text-xs font-bold text-foreground">{t.nombre}</div>
                            <div className="text-[10px] text-muted-foreground">{t.banco}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-foreground">
                            {formatMoney(t.total, moneda)}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {t.porcentaje}% de los egresos
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ backgroundColor: t.color, width: `${t.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EXPLORADOR DE TRANSACCIONES FILTRADO POR TAG */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explorador de Transacciones por Tag
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Filtra al instante tus egresos según su clasificación técnica.
                </p>
              </div>

              {/* Botonera de Filtro por Tag */}
              <div className="inline-flex items-center gap-1 p-1 bg-muted/60 rounded-lg text-xs font-medium self-start sm:self-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFiltroTagActivo('TODOS')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filtroTagActivo === 'TODOS'
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todos ({resumen.egresosConsolidados.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTagActivo('FIJO')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    filtroTagActivo === 'FIJO'
                      ? 'bg-sky-500 text-white shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Fijos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTagActivo('PRESTAMO')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    filtroTagActivo === 'PRESTAMO'
                      ? 'bg-purple-600 text-white shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Préstamos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTagActivo('CUOTA')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    filtroTagActivo === 'CUOTA'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Cuotas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTagActivo('VARIABLE')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    filtroTagActivo === 'VARIABLE'
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  Variables
                </button>
              </div>
            </div>

            {/* Tabla de Egresos por Tag */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 font-medium">Tag</th>
                    <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
                    <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                    <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {egresosFiltradosPorTag.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.clasificacion === 'FIJO'
                              ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                              : item.clasificacion === 'PRESTAMO'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
                              : item.clasificacion === 'CUOTA'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                              : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.clasificacion === 'FIJO'
                                ? 'bg-sky-500'
                                : item.clasificacion === 'PRESTAMO'
                                ? 'bg-purple-500'
                                : item.clasificacion === 'CUOTA'
                                ? 'bg-indigo-500'
                                : 'bg-teal-500'
                            }`}
                          />
                          {item.badgeLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.categoriaColor }}
                          />
                          <span className="font-medium text-foreground">{item.categoria}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground text-xs">{item.concepto}</div>
                        {item.subtexto && (
                          <div className="text-[11px] text-muted-foreground">{item.subtexto}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatMoney(item.monto, moneda)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            item.estado === 'PAGADO'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : item.estado === 'ADELANTADO'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.estado === 'PAGADO'
                                ? 'bg-emerald-500'
                                : item.estado === 'ADELANTADO'
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
