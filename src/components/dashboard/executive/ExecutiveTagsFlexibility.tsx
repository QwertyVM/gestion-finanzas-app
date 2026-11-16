'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { MetricasMacroCategorias } from '@/lib/finanzas-service';

interface ExecutiveTagsFlexibilityProps {
  metricasMacro?: MetricasMacroCategorias | null;
  moneda: string;
}

export function ExecutiveTagsFlexibility({
  metricasMacro,
  moneda,
}: ExecutiveTagsFlexibilityProps) {
  if (!metricasMacro) return null;

  return (
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-muted/40">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Índice de Flexibilidad: {metricasMacro.porcentajeFlexible}%</span>
        </div>
      </div>

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
    </div>
  );
}
