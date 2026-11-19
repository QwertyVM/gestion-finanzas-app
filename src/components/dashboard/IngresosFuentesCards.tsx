'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Briefcase, Gift, TrendingUp, Coins, Sparkles } from 'lucide-react';
import type { IngresoItem } from './IngresoCardMobile';

interface IngresosFuentesCardsProps {
  ingresos: IngresoItem[];
  totalIngresos?: number;
  moneda: string;
}

function getFuenteConfig(tipo: string) {
  switch (tipo) {
    case 'SUELDO':
      return {
        label: 'Sueldo Planilla',
        Icon: Briefcase,
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    case 'GRATIFICACION':
      return {
        label: 'Gratificación',
        Icon: Gift,
        iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      };
    case 'UTILIDADES':
      return {
        label: 'Utilidades',
        Icon: TrendingUp,
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      };
    default:
      return {
        label: 'Ingreso Extra',
        Icon: Coins,
        iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      };
  }
}

export function IngresosFuentesCards({
  ingresos,
  totalIngresos,
  moneda,
}: IngresosFuentesCardsProps) {
  if (!ingresos || ingresos.length === 0) return null;

  const totalIngresosMonto = totalIngresos ?? ingresos.reduce((s, i) => s + (i.monto || 0), 0);
  const totalGastosMonto = ingresos.reduce((s, i) => s + (i.totalGastosAsignados || 0), 0);
  const totalRestoMonto = Number((totalIngresosMonto - totalGastosMonto).toFixed(2));
  const totalPctGastado = totalIngresosMonto > 0 ? Math.min(100, Math.round((totalGastosMonto / totalIngresosMonto) * 100)) : 0;
  const totalPctLibre = totalIngresosMonto > 0 ? Math.max(0, 100 - totalPctGastado) : 0;
  const totalDeficit = totalRestoMonto < 0;

  return (
    <div className={`grid gap-3 ${
      ingresos.length === 1
        ? 'grid-cols-1'
        : ingresos.length === 2
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    }`}>
      {/* Cards por cada fuente de ingreso */}
      {ingresos.map((ing) => {
        const config = getFuenteConfig(ing.tipo);
        const IconComponent = config.Icon;
        const gastos = ing.totalGastosAsignados || 0;
        const resto = ing.disponible ?? Number((ing.monto - gastos).toFixed(2));
        const pctGastado = ing.monto > 0 ? Math.min(100, Math.round((gastos / ing.monto) * 100)) : 0;
        const pctLibre = ing.monto > 0 ? Math.max(0, 100 - pctGastado) : 0;
        const esDeficit = resto < 0;

        return (
          <div
            key={ing.id}
            className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 transition hover:border-border"
          >
            {/* Cabecera de la fuente */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-foreground truncate" title={ing.concepto}>
                    {ing.concepto}
                  </h4>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {config.label}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${
                  esDeficit
                    ? 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {esDeficit ? 'Sobregiro' : `${pctLibre}% libre`}
              </span>
            </div>

            {/* Resto disponible */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Resto que te queda
              </span>
              <span className={`font-mono text-base sm:text-lg font-bold tabular-nums tracking-tight block ${
                esDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatMoney(resto, moneda)}
              </span>
            </div>

            {/* Barra y desglose */}
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex" title={`${pctGastado}% asignado, ${pctLibre}% libre`}>
                <div
                  className={`h-full transition-all duration-300 ${esDeficit ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, pctGastado)}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, pctLibre)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Gastos: <strong className="text-foreground">{formatMoney(gastos, moneda)}</strong></span>
                <span>Ingreso: {formatMoney(ing.monto, moneda)}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Card consolidada de Remanente Global (si hay 2 o más fuentes) */}
      {ingresos.length > 1 && (
        <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 bg-gradient-to-br from-card via-card to-muted/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">
                  Resto Total del Mes
                </h4>
                <span className="text-[10px] text-muted-foreground block">
                  Consolidado ({ingresos.length} fuentes)
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${
                totalDeficit
                  ? 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {totalDeficit ? 'Déficit' : `${totalPctLibre}% libre`}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Total libre consolidado
            </span>
            <span className={`font-mono text-base sm:text-lg font-bold tabular-nums tracking-tight block ${
              totalDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
            }`}>
              {formatMoney(totalRestoMonto, moneda)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex" title={`${totalPctGastado}% asignado, ${totalPctLibre}% libre`}>
              <div
                className={`h-full transition-all duration-300 ${totalDeficit ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, totalPctGastado)}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.max(0, totalPctLibre)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Gastos: <strong className="text-foreground">{formatMoney(totalGastosMonto, moneda)}</strong></span>
              <span>Ingresos: {formatMoney(totalIngresosMonto, moneda)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
