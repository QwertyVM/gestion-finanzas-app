'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Sparkles, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

interface Regla503020CardProps {
  regla?: SaludFinancieraKPIs['regla503020'];
  moneda: string;
}

export function Regla503020Card({ regla, moneda }: Regla503020CardProps) {
  if (!regla) return null;

  const { necesidades, deseos, ahorroYDeuda, diagnostico } = regla;

  const renderDesvio = (desvio: number) => {
    if (Math.abs(desvio) <= 2) {
      return (
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
          <Check className="w-3 h-3" /> En objetivo
        </span>
      );
    }
    const positivo = desvio > 0;
    return (
      <span
        className={`text-[10px] font-semibold inline-flex items-center gap-0.5 ${
          positivo
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {positivo ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {positivo ? `+${desvio}%` : `${desvio}%`}
      </span>
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribución Consultora 50 / 30 / 20
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              Benchmark
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            50% Necesidades Básicas · 30% Estilo de Vida · 20% Ahorro &amp; Amortización
          </p>
        </div>
      </div>

      {/* BARRA SEGMENTADA */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5">
          <div
            style={{ width: `${Math.min(100, Math.max(5, necesidades.porcentaje))}%` }}
            className="h-full bg-sky-500 rounded-l-full transition-all duration-500"
            title={`Necesidades: ${necesidades.porcentaje}%`}
          />
          <div
            style={{ width: `${Math.min(100, Math.max(5, deseos.porcentaje))}%` }}
            className="h-full bg-teal-500 transition-all duration-500"
            title={`Deseos: ${deseos.porcentaje}%`}
          />
          <div
            style={{ width: `${Math.min(100, Math.max(5, ahorroYDeuda.porcentaje))}%` }}
            className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
            title={`Ahorro y Deuda: ${ahorroYDeuda.porcentaje}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-1 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* CUBETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Necesidades */}
        <div className="p-3 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-sky-800 dark:text-sky-300">50% Necesidades</span>
            {renderDesvio(necesidades.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {necesidades.porcentaje}%
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {formatMoney(necesidades.monto, moneda)}
          </div>
        </div>

        {/* Deseos */}
        <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-teal-800 dark:text-teal-300">30% Estilo de Vida</span>
            {renderDesvio(deseos.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {deseos.porcentaje}%
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {formatMoney(deseos.monto, moneda)}
          </div>
        </div>

        {/* Ahorro & Deuda */}
        <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-purple-800 dark:text-purple-300">20% Ahorro &amp; Deuda</span>
            {renderDesvio(ahorroYDeuda.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {ahorroYDeuda.porcentaje}%
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {formatMoney(ahorroYDeuda.monto, moneda)}
          </div>
        </div>
      </div>

      {/* DIAGNÓSTICO */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border/40 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground font-semibold">Consejo Consultor: </strong>
          {diagnostico}
        </p>
      </div>
    </div>
  );
}
