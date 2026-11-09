'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel, esItemRecurrente } from '@/lib/utils';
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
  if (mesActual === 7) labelEspecial = 'Gratificación';
  if (mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  // Distribución de egresos
  const distribucionEgresos = useMemo(() => {
    if (!resumen) return [];

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
      { name: 'Préstamos & Cuotas', value: Number(totalPrestamosCuotas.toFixed(2)), color: '#8b5cf6', dot: 'bg-violet-500' },
      { name: 'Recurrentes', value: Number(totalRecurrentes.toFixed(2)), color: '#f59e0b', dot: 'bg-amber-500' },
      { name: 'Variables', value: Number(totalVariables.toFixed(2)), color: '#71717a', dot: 'bg-zinc-500' },
    ].filter((item) => item.value > 0);
  }, [resumen]);

  // Proyección anual
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

  // Préstamos activos
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
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando métricas...</p>
      </div>
    );
  }

  const sueldoBase = resumen.config?.sueldoBaseMensual || 6000;
  const totalIngresos = resumen.totalIngresos;
  const totalEgresos = resumen.totalEgresos;
  const disponibleNeto = resumen.dineroDisponibleNeto;
  const disponibleEsPositivo = disponibleNeto >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard General
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Métricas de rendimiento, distribución de egresos y salud financiera.
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
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

      {/* 2. TARJETAS DE KPIS */}
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
            Tras gastos y ahorro
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

      {/* 3. GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRÁFICO 1: DISTRIBUCIÓN */}
        <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribución de Egresos
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fijos, Préstamos, Recurrentes y Compras.
            </p>
          </div>

          <div className="h-60 w-full">
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
                <Tooltip
                  formatter={(value: any) => [formatMoney(value, moneda), 'Monto']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--foreground)',
                    fontSize: '11px',
                  }}
                />
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

        {/* GRÁFICO 2: FLUJO DE CAJA ANUAL */}
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFlujoAnual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  formatter={(val: any) => formatMoney(val, moneda)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--foreground)',
                    fontSize: '11px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Egresos" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Disponible" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TABLA PRÉSTAMOS ACTIVOS */}
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
                  <th className="py-2.5 px-3 font-medium">Banco / Concepto</th>
                  <th className="py-2.5 px-3 font-medium">Progreso</th>
                  <th className="py-2.5 px-3 text-center font-medium">Día Pago</th>
                  <th className="py-2.5 px-3 text-right font-medium">Cuota Mensual</th>
                  <th className="py-2.5 px-3 text-right font-medium">Saldo Restante</th>
                  <th className="py-2.5 px-3 text-center font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {prestamosActivos.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground text-xs">{p.concepto}</div>
                      <div className="text-[11px] text-muted-foreground">{p.banco}</div>
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
  );
}
