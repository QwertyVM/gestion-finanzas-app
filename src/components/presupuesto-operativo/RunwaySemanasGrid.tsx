'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { SemanaRunwayItem } from '@/lib/finanzas-service';

interface RunwaySemanasGridProps {
  desgloseSemanas: SemanaRunwayItem[];
  moneda: string;
}

export function RunwaySemanasGrid({ desgloseSemanas, moneda }: RunwaySemanasGridProps) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Presupuesto de ocio distribuido por semanas
        </span>
        <span className="text-[10px] text-muted-foreground/80 font-mono">
          Semana = 7 días de ritmo diario
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {desgloseSemanas.map((s) => (
          <div
            key={s.semana}
            className="p-2.5 rounded-lg border border-border/50 bg-card hover:border-border transition space-y-1"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">{s.etiqueta}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Sem {s.semana}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-purple-700 dark:text-purple-300 tabular-nums">
              {formatMoney(s.montoSugerido, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block truncate">
              {s.rangoFechas}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
