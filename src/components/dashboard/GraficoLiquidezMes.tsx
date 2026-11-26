'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Sparkles, ArrowRight, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

interface GraficoLiquidezMesProps {
  totalIngresos: number;
  totalEgresos: number;
  totalAdelantado?: number;
  disponibleNeto: number;
  moneda: string;
}

export function GraficoLiquidezMes({
  totalIngresos,
  totalEgresos,
  totalAdelantado = 0,
  disponibleNeto,
  moneda,
}: GraficoLiquidezMesProps) {
  // Regla de Negocio:
  // Egresos que realmente consumen el ingreso del mes (sin considerar lo pagado con ahorros previos / ADELANTADO)
  const egresosEfectivosDelMes = Math.max(0, totalEgresos - totalAdelantado);
  
  // Cuánto queda realmente:
  // Margen Libre = Ingresos - Egresos Efectivos
  const remanenteReal = disponibleNeto;
  const esDeficit = remanenteReal < 0;

  // Porcentajes proporcionales sobre el total de ingresos
  const baseCalculo = totalIngresos > 0 ? totalIngresos : (egresosEfectivosDelMes || 1);
  const pctComprometido = Math.min(100, Math.round((egresosEfectivosDelMes / baseCalculo) * 100));
  const pctRemanente = Math.max(0, 100 - pctComprometido);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* 1. Header con métricas de síntesis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Balance de Liquidez del Mes
            </span>
            <span className="text-[11px] text-muted-foreground">
              Ingresos vs. Egresos netos (sin restar lo adelantado)
            </span>
          </div>
        </div>

        {/* Resumen numérico visual de cuánto queda */}
        <div className="flex items-baseline gap-2 self-start sm:self-auto bg-muted/40 dark:bg-muted/20 px-3 py-1.5 rounded-xl border border-border/50">
          <span className="text-xs text-muted-foreground font-medium">Te queda libre:</span>
          <span
            className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
              esDeficit
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatMoney(remanenteReal, moneda)}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
              esDeficit
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            }`}
          >
            {esDeficit ? 'Déficit' : `${pctRemanente}% libre`}
          </span>
        </div>
      </div>

      {/* 2. Barra Visual Proporcional Continua */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full bg-muted/60 dark:bg-muted/40 rounded-full overflow-hidden flex p-0.5 gap-1 border border-border/50 shadow-inner">
          {/* Segmento Egresos que consumen sueldo */}
          <div
            style={{ width: `${pctComprometido}%` }}
            className={`h-full rounded-full transition-all duration-500 relative group cursor-pointer ${
              pctComprometido > 90
                ? 'bg-rose-500'
                : pctComprometido > 75
                ? 'bg-amber-500'
                : 'bg-sky-500 dark:bg-sky-400'
            }`}
            title={`Compromisos del mes: ${formatMoney(egresosEfectivosDelMes, moneda)} (${pctComprometido}%)`}
          />

          {/* Segmento Cuánto queda libre */}
          {!esDeficit && pctRemanente > 0 && (
            <div
              style={{ width: `${pctRemanente}%` }}
              className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500 cursor-pointer"
              title={`Margen Libre Disponible: ${formatMoney(remanenteReal, moneda)} (${pctRemanente}%)`}
            />
          )}
        </div>
      </div>

      {/* 3. Leyenda Gráfica y Desglose Explícito */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        {/* Total Ingresos */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/20 px-2.5 py-1.5 rounded-lg border border-border/40">
          <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
            <span className="w-2 h-2 rounded-full bg-foreground shrink-0" />
            Total Ingresos:
          </span>
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {formatMoney(totalIngresos, moneda)}
          </span>
        </div>

        {/* Egresos del Mes (descontado adelantado) */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/20 px-2.5 py-1.5 rounded-lg border border-border/40">
          <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
            Egresos del Mes:
          </span>
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {formatMoney(egresosEfectivosDelMes, moneda)}
          </span>
        </div>

        {/* Lo que está cubierto por Adelantados */}
        {totalAdelantado > 0 ? (
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40">
            <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              Adelantado (no resta):
            </span>
            <span className="font-mono font-semibold text-indigo-800 dark:text-indigo-200 tabular-nums">
              {formatMoney(totalAdelantado, moneda)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/20 px-2.5 py-1.5 rounded-lg border border-border/40">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              Adelantos previos:
            </span>
            <span className="font-mono text-muted-foreground tabular-nums">
              {formatMoney(0, moneda)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
