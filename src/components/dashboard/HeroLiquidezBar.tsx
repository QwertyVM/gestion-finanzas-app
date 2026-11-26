'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

interface HeroLiquidezBarProps {
  totalIngresos: number;
  totalEgresos: number;
  totalAdelantado?: number;
  disponibleNeto: number;
  moneda: string;
}

export function HeroLiquidezBar({
  totalIngresos,
  totalEgresos,
  totalAdelantado = 0,
  disponibleNeto,
  moneda,
}: HeroLiquidezBarProps) {
  if (totalIngresos <= 0) return null;

  // El egreso real que absorbe el sueldo (descontando lo que ya fue cubierto por adelantos)
  const egresoEfectivoDelMes = Math.max(0, totalEgresos - totalAdelantado);
  
  // Porcentajes de absorción sobre los ingresos
  const pctEfectivo = Math.min(100, Math.round((egresoEfectivoDelMes / totalIngresos) * 100));
  const pctAdelantado = totalAdelantado > 0 
    ? Math.min(100 - pctEfectivo, Math.round((totalAdelantado / totalIngresos) * 100))
    : 0;
  const pctLibre = Math.max(0, 100 - pctEfectivo - pctAdelantado);

  const esDeficit = disponibleNeto < 0;

  return (
    <div className="pt-4 border-t border-border/50 space-y-2">
      {/* Barra de Distribución Proporcional Continua */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-muted-foreground flex items-center gap-1.5">
            <span>Distribución de Liquidez</span>
            <span className="text-[10px] text-muted-foreground/70 font-normal">
              (Absorción de ingresos)
            </span>
          </span>
          <span className="font-mono text-[11px] font-semibold text-foreground">
            {pctEfectivo}% Comprometido · {pctLibre}% Libre
          </span>
        </div>

        {/* Track de la barra */}
        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-border/40">
          {/* Segmento: Egresos efectivos del mes */}
          <div
            style={{ width: `${pctEfectivo}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              pctEfectivo > 85 
                ? 'bg-rose-500' 
                : pctEfectivo > 70 
                ? 'bg-amber-500' 
                : 'bg-primary'
            }`}
            title={`Compromisos del mes: ${formatMoney(egresoEfectivoDelMes, moneda)} (${pctEfectivo}%)`}
          />

          {/* Segmento: Cubierto con Adelantos (Fondos previos) */}
          {pctAdelantado > 0 && (
            <div
              style={{ width: `${pctAdelantado}%` }}
              className="h-full rounded-full bg-emerald-500/50 dark:bg-emerald-400/50 transition-all duration-500"
              title={`Cubierto previamente: ${formatMoney(totalAdelantado, moneda)} (${pctAdelantado}%)`}
            />
          )}

          {/* Segmento: Saldo Libre */}
          {!esDeficit && pctLibre > 0 && (
            <div
              style={{ width: `${pctLibre}%` }}
              className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
              title={`Saldo libre disponible: ${formatMoney(disponibleNeto, moneda)} (${pctLibre}%)`}
            />
          )}
        </div>
      </div>

      {/* Leyenda minimalista */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span>Comprometido ({formatMoney(egresoEfectivoDelMes, moneda)})</span>
        </div>

        {totalAdelantado > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/50 shrink-0" />
            <span className="text-muted-foreground/90">
              Adelantado ({formatMoney(totalAdelantado, moneda)})
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <span className={`w-2 h-2 rounded-full shrink-0 ${esDeficit ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <span className={`font-medium ${esDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {esDeficit ? 'Déficit proyectado' : 'Margen libre'}
          </span>
        </div>
      </div>
    </div>
  );
}
