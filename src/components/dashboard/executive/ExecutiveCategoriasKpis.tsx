'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { MetricasMacroCategorias } from '@/lib/finanzas-service';
import { renderExecutiveIcon } from './ExecutiveIconHelper';

interface ExecutiveCategoriasKpisProps {
  metricasMacro?: MetricasMacroCategorias | null;
  moneda: string;
}

export function ExecutiveCategoriasKpis({ metricasMacro, moneda }: ExecutiveCategoriasKpisProps) {
  return (
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
              {renderExecutiveIcon(metricasMacro.categoriaMayorGasto.icono, 'w-4 h-4')}
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
  );
}
