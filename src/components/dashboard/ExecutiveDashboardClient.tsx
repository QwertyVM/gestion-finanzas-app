'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel, ESTILOS_CLASIFICACION, esItemRecurrente } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  Wallet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
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

export function ExecutiveDashboardClient() {
  const { periodo, irMesAnterior, irMesSiguiente, resumen, loading } = useFinanzas();
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = '🎁 Gratificación';
  if (mesActual === 12) labelEspecial = '🎄 Gratificación';
  if (mesActual === 3) labelEspecial = '💼 Utilidades';

  // Cálculos de distribución de egresos por tipo
  const distribucionEgresos = useMemo(() => {
    if (!resumen) return [];

    let totalFijos = 0;
    let totalRecurrentes = 0;
    let totalPrestamosCuotas = 0;
    let totalVariables = 0;

    // 1. Costos fijos
    for (const cf of resumen.costosFijos) {
      if (esItemRecurrente(cf.concepto, cf.categoria)) {
        totalRecurrentes += cf.monto;
      } else {
        totalFijos += cf.monto;
      }
    }

    // 2. Préstamos bancarios
    for (const p of resumen.prestamos) {
      if (p.aplicaEsteMes !== false) {
        totalPrestamosCuotas += p.montoCuota;
      }
    }

    // 3. Tarjetas
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

    // 4. Gastos directos
    for (const g of resumen.gastosDirectos) {
      if (esItemRecurrente(g.concepto, g.categoria)) {
        totalRecurrentes += g.monto;
      } else {
        totalVariables += g.monto;
      }
    }

    return [
      { name: 'Costos Fijos', value: Number(totalFijos.toFixed(2)), color: '#0284c7', dot: 'bg-sky-500' },
      { name: 'Préstamos & Cuotas', value: Number(totalPrestamosCuotas.toFixed(2)), color: '#9333ea', dot: 'bg-purple-500' },
      { name: 'Recurrentes / Apps', value: Number(totalRecurrentes.toFixed(2)), color: '#ec4899', dot: 'bg-pink-500' },
      { name: 'Variables / Compras', value: Number(totalVariables.toFixed(2)), color: '#64748b', dot: 'bg-slate-400' },
    ].filter((item) => item.value > 0);
  }, [resumen]);

  // Datos para gráfico anual proyectado
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
        Disponible: Math.max(0, m.disponible),
      };
    });
  }, [resumen]);

  // Préstamos activos y progreso
  const prestamosActivos = useMemo(() => {
    if (!resumen?.prestamos) return [];
    return resumen.prestamos.map((p) => {
      const progreso = Math.round((p.cuotaActual / p.cuotasTotales) * 100);
      const saldoAprox = Math.max(0, (p.cuotasTotales - p.cuotaActual + 1) * p.montoCuota);
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
      };
    });
  }, [resumen]);

  const deudaTotalConsolidada = useMemo(() => {
    return prestamosActivos.reduce((acc, p) => acc + p.saldoAprox, 0);
  }, [prestamosActivos]);

  if (loading || !resumen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando métricas y gráficos...</p>
      </div>
    );
  }

  const sueldoBase = resumen.config?.sueldoBaseMensual || 6000;
  const totalIngresos = resumen.totalIngresos;
  const totalEgresos = resumen.totalEgresos;
  const disponibleNeto = resumen.dineroDisponibleNeto;
  const metaAhorro = resumen.metaAhorro;
  const tasaAhorro = totalIngresos > 0 ? Math.round((metaAhorro / totalIngresos) * 100) : 0;
  const disponibleEsPositivo = disponibleNeto >= 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. CABECERA CON SELECTOR DE PERIODO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-sky-500" />
              <span>Dashboard Ejecutivo</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              Análisis Visual
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Métricas ejecutivas, ratios de salud financiera y distribución de egresos de tus finanzas.
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="inline-flex items-center gap-1.5 bg-card dark:bg-slate-900 px-3 py-1.5 rounded-2xl border border-border shadow-xs">
          <button
            type="button"
            onClick={irMesAnterior}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-foreground px-2 capitalize">
            {formatPeriodoLabel(periodo)}
          </span>
          <button
            type="button"
            onClick={irMesSiguiente}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {esMesEspecial && (
            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {labelEspecial}
            </span>
          )}
        </div>
      </div>

      {/* 2. TARJETAS DE KPIS PRINCIPALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Ingresos Totales */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Ingresos del Mes
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatMoney(totalIngresos, moneda)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Sueldo base: {formatMoney(sueldoBase, moneda)}
          </div>
        </div>

        {/* KPI 2: Total Egresos */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Total Egresos
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatMoney(totalEgresos, moneda)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {formatMoney(resumen.totalPendiente, moneda)} aún por pagar
          </div>
        </div>

        {/* KPI 3: Dinero Libre Neto */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${disponibleEsPositivo ? 'bg-sky-500' : 'bg-rose-500'}`} />
              Dinero Libre Neto
            </span>
            <Wallet className="w-4 h-4 text-sky-500" />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${disponibleEsPositivo ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatMoney(disponibleNeto, moneda)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Limpio tras gastos y ahorro
          </div>
        </div>

        {/* KPI 4: Deuda Total en Préstamos */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Deuda Total Préstamos
            </span>
            <Landmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {formatMoney(deudaTotalConsolidada, moneda)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            En {prestamosActivos.length} créditos activos
          </div>
        </div>
      </div>

      {/* 3. GRÁFICOS: DISTRIBUCIÓN DE EGRESOS & COMPARATIVA ANUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRÁFICO 1: DISTRIBUCIÓN CIRCULAR (5 Columnas) */}
        <div className="lg:col-span-5 bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-sky-500" />
              <span>Distribución de Egresos del Mes</span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Composición por Fijos, Préstamos, Recurrentes y Compras.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribucionEgresos}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distribucionEgresos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatMoney(value, moneda), 'Monto']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda con valores y porcentajes */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60 dark:border-slate-800">
            {distribucionEgresos.map((item) => {
              const porcentaje = totalEgresos > 0 ? Math.round((item.value / totalEgresos) * 100) : 0;
              return (
                <div key={item.name} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-bold text-foreground text-xs">
                      {formatMoney(item.value, moneda)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {porcentaje}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRÁFICO 2: FLUJO DE CAJA ANUAL (7 Columnas) */}
        <div className="lg:col-span-7 bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>Evolución Anual (Ingresos vs Egresos)</span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Comportamiento de liquidez mensual en los próximos 12 meses.
              </p>
            </div>
            <Link
              href="/flujo-anual"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Ver tabla completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFlujoAnual} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => formatMoney(val, moneda)}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Disponible" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TABLA EJECUTIVA: AMORTIZACIÓN Y PRÉSTAMOS ACTIVOS */}
      <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-500" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Estado de Préstamos y Créditos Activos
              </h2>
              <p className="text-xs text-muted-foreground">
                Seguimiento de amortización de cuotas y saldo pendiente por saldar.
              </p>
            </div>
          </div>
          <Link
            href="/fijos-y-prestamos"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Gestionar préstamos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {prestamosActivos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
            No tienes préstamos bancarios registrados actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/70 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Banco / Concepto</th>
                  <th className="py-3 px-3">Progreso de Cuotas</th>
                  <th className="py-3 px-3 text-center">Día Pago</th>
                  <th className="py-3 px-3 text-right">Cuota Mensual</th>
                  <th className="py-3 px-3 text-right">Saldo Restante</th>
                  <th className="py-3 px-3 text-center">Estado Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800/80">
                {prestamosActivos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          {p.banco}
                        </span>
                        <span className="font-bold text-foreground text-xs">{p.concepto}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[160px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground">
                            Cuota {p.cuotaActual} de {p.cuotasTotales}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {p.progreso}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${p.progreso}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-muted-foreground whitespace-nowrap">
                      Día {p.diaPago}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-foreground whitespace-nowrap">
                      {formatMoney(p.montoCuota, moneda)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      ~ {formatMoney(p.saldoAprox, moneda)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {p.estado === 'PAGADO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                          ✓ Pagado
                        </span>
                      ) : p.estado === 'ADELANTADO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40">
                          ⚡ Adelantado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                          ⏳ Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
