'use client';

import React from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import {
  TrendingUp,
  Wallet,
  Home,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FastForward,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export function DashboardClient() {
  const { periodo, resumen, loading } = useFinanzas();

  if (loading || !resumen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Cargando flujo financiero de {formatPeriodoLabel(periodo)}...
        </p>
      </div>
    );
  }

  const moneda = resumen.config.monedaSimbolo;
  const disponible = resumen.dineroDisponible;
  const disponibleEsPositivo = disponible >= 0;

  // Porcentaje de ingresos comprometidos
  const porcentajeComprometido =
    resumen.totalIngresos > 0
      ? Math.min(Math.round((resumen.totalEgresos / resumen.totalIngresos) * 100), 100)
      : 0;

  // Mes especial
  const mesNum = parseInt(periodo.split('-')[1], 10);
  const esGrati = mesNum === 7 || mesNum === 12;
  const esUtilidad = mesNum === 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. HERO CARD: DINERO DISPONIBLE DEL MES */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl transition-all ${
          disponibleEsPositivo
            ? 'bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-900 border-sky-500/30'
            : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Calendar className="w-3.5 h-3.5" />
                Flujo de {formatPeriodoLabel(periodo)}
              </span>
              {esGrati && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Sparkles className="w-3.5 h-3.5" /> Mes con Gratificación
                </span>
              )}
              {esUtilidad && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Sparkles className="w-3.5 h-3.5" /> Mes con Utilidades
                </span>
              )}
            </div>

            <h1 className="text-slate-400 text-sm font-medium">
              Dinero Disponible Estimado
            </h1>
            <div className="flex items-baseline gap-3">
              <span
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${
                  disponibleEsPositivo ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatMoney(disponible, moneda)}
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg ${
                  disponibleEsPositivo
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {disponibleEsPositivo ? 'Superávit libre' : 'Déficit proyectado'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              De los <strong className="text-white">{formatMoney(resumen.totalIngresos, moneda)}</strong> de ingresos esperados, tienes comprometidos <strong className="text-white">{formatMoney(resumen.totalEgresos, moneda)}</strong> ({porcentajeComprometido}% del total).
            </p>
          </div>

          {/* Progreso y Acciones */}
          <div className="flex flex-col gap-3 min-w-[280px] bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Comprometido ({porcentajeComprometido}%)</span>
              <span>Libre ({100 - porcentajeComprometido}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  porcentajeComprometido > 85
                    ? 'bg-rose-500'
                    : porcentajeComprometido > 65
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${porcentajeComprometido}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Adelantado:</span>
                <span className="font-semibold text-amber-400">
                  {formatMoney(resumen.totalAdelantado, moneda)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Por Pagar:</span>
                <span className="font-semibold text-sky-400">
                  {formatMoney(resumen.totalPendiente, moneda)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/gastos"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Compra / Gasto</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. STAT CARDS: DESGLOSE DE COMPROMISOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Ingresos Totales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatMoney(resumen.totalIngresos, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {resumen.ingresos.length}{' '}
              {resumen.ingresos.length === 1 ? 'fuente' : 'fuentes'} este mes
            </span>
          </div>
        </div>

        {/* Costos Fijos */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Costos Fijos</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatMoney(resumen.totalCostosFijos, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span>Casa, comida, netflix, servicios</span>
          </div>
        </div>

        {/* Préstamos Bancarios */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Préstamos Bancarios</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatMoney(resumen.totalPrestamos, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span>{resumen.prestamos.length} {resumen.prestamos.length === 1 ? 'préstamo activo' : 'préstamos activos'}</span>
          </div>
        </div>

        {/* Tarjetas de Crédito */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Tarjetas a Pagar</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatMoney(resumen.totalTarjetas, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Liquidación a fin de este mes</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROL DE ESTADOS: ¿QUÉ HE ADELANTADO Y QUÉ FALTA? */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adelantado vs Pendiente */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FastForward className="w-5 h-5 text-amber-500" />
            <span>Control de Estados</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Seguimiento de pagos cancelados antes de tiempo vs pagos pendientes de liquidar.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FastForward className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Adelantado</div>
                  <div className="text-[11px] text-muted-foreground">Pagado por anticipado</div>
                </div>
              </div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(resumen.totalAdelantado, moneda)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Pendiente</div>
                  <div className="text-[11px] text-muted-foreground">Esperando fecha de pago</div>
                </div>
              </div>
              <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {formatMoney(resumen.totalPendiente, moneda)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Pagado Regular</div>
                  <div className="text-[11px] text-muted-foreground">Cancelado en su fecha</div>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(resumen.totalPagado, moneda)}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Crédito y Regla del Día 10 */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Tarjetas & Ciclo de Facturación</span>
            </h2>
            <Link
              href="/gastos"
              className="text-xs text-sky-500 hover:text-sky-400 font-semibold flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p>
              <strong>Regla del corte (Día 10):</strong> Las compras hechas hasta el día 10 se pagan a fin de este mes. Las compras realizadas desde el día 11 se pasan a la facturación del mes siguiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {resumen.tarjetasCredito.map((tarjeta) => (
              <div
                key={tarjeta.id}
                className="p-4 rounded-xl border border-border bg-gradient-to-br from-card to-secondary/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tarjeta.color }}
                    />
                    <span className="font-bold text-sm text-foreground">
                      {tarjeta.nombre}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 bg-background rounded-md border border-border">
                    Corte: Día {tarjeta.diaCorte}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">A pagar fin de mes:</span>
                    <span className="font-bold text-foreground text-sm">
                      {formatMoney(tarjeta.totalPeriodo, moneda)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Pasa al próximo mes (post-10):</span>
                    <span className="font-medium text-indigo-400">
                      {formatMoney(tarjeta.totalSiguientePeriodo, moneda)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PROYECCIÓN MULTI-MES: DICIEMBRE, ENERO, FEBRERO, MARZO (UTILIDADES) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              <span>Proyección de Disponibilidad (Próximos 6 Meses)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Previsión de ingresos (con picos en Gratificaciones de Jul/Dic y Utilidades en Mar) frente a gastos fijos y deudas.
            </p>
          </div>

          <Link
            href="/flujo-anual"
            className="text-xs text-sky-500 hover:text-sky-400 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver matriz 12 meses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Gráfico Recharts */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resumen.proyeccionMultiMes.map((m) => ({
                periodo: formatPeriodoLabel(m.periodo),
                Ingresos: m.ingresos,
                Egresos: m.egresos,
                Disponible: m.disponible,
                esGrati: m.esGrati,
                esUtilidad: m.esUtilidad,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="periodo" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${moneda} ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 text-white">
                        <div className="font-bold text-slate-300 pb-1 border-b border-slate-800">
                          {label}
                        </div>
                        <div className="text-emerald-400">
                          Ingresos: {formatMoney(payload[0]?.value as number, moneda)}
                        </div>
                        <div className="text-rose-400">
                          Egresos: {formatMoney(payload[1]?.value as number, moneda)}
                        </div>
                        <div className="text-sky-400 font-bold pt-1 border-t border-slate-800">
                          Disponible: {formatMoney(payload[2]?.value as number, moneda)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disponible" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen en fichas de los meses */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border">
          {resumen.proyeccionMultiMes.map((m) => {
            const positivo = m.disponible >= 0;
            return (
              <div
                key={m.periodo}
                className="p-3 rounded-xl bg-secondary/40 border border-border text-center space-y-1"
              >
                <div className="text-[11px] font-semibold text-muted-foreground truncate">
                  {formatPeriodoLabel(m.periodo)}
                </div>
                {m.esGrati && (
                  <div className="text-[9px] font-bold text-amber-500 uppercase">
                    + Gratificación
                  </div>
                )}
                {m.esUtilidad && (
                  <div className="text-[9px] font-bold text-emerald-500 uppercase">
                    + Utilidades
                  </div>
                )}
                <div
                  className={`text-sm font-extrabold ${
                    positivo ? 'text-sky-500' : 'text-rose-500'
                  }`}
                >
                  {formatMoney(m.disponible, moneda)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
