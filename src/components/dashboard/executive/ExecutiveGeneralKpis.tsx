'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { ResumenFinanciero } from '@/lib/finanzas-service';

interface ExecutiveGeneralKpisProps {
  totalIngresos: number;
  sueldoBase: number;
  totalEgresos: number;
  totalPendiente: number;
  totalAdelantado: number;
  disponibleNeto: number;
  disponibleEsPositivo: boolean;
  deudaTotalConsolidada: number;
  prestamosActivosCount: number;
  moneda: string;
}

export function ExecutiveGeneralKpis({
  totalIngresos,
  sueldoBase,
  totalEgresos,
  totalPendiente,
  totalAdelantado,
  disponibleNeto,
  disponibleEsPositivo,
  deudaTotalConsolidada,
  prestamosActivosCount,
  moneda,
}: ExecutiveGeneralKpisProps) {
  return (
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
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
          <span>{formatMoney(totalPendiente, moneda)} pendientes</span>
          {totalAdelantado > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              · ⚡ {formatMoney(totalAdelantado, moneda)} adelantado
            </span>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-1">
        <span className="text-xs text-muted-foreground font-medium block">
          Dinero Libre
        </span>
        <div className={`text-2xl font-semibold tracking-tight font-mono ${disponibleEsPositivo ? 'text-foreground' : 'text-rose-600'}`}>
          {formatMoney(disponibleNeto, moneda)}
        </div>
        <span className="text-[11px] text-muted-foreground block">
          {totalAdelantado > 0 ? 'Sueldo libre (sin descontar pagos adelantados)' : 'Ingresos menos egresos'}
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
          {prestamosActivosCount} créditos activos
        </span>
      </div>
    </div>
  );
}
