'use client';

import React, { useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import { Layers, Landmark, ShieldCheck } from 'lucide-react';

interface FijosHeroMetricsProps {
  costosFijos: any[];
  prestamos: any[];
  moneda: string;
}

export function FijosHeroMetrics({ costosFijos, prestamos, moneda }: FijosHeroMetricsProps) {
  const metrics = useMemo(() => {
    // 1. Costos fijos
    const totalFijosSoles = costosFijos
      .filter((cf) => cf.monedaOriginal !== 'USD')
      .reduce((sum, cf) => sum + (cf.monto || 0), 0);

    const totalFijosUSD = costosFijos
      .filter((cf) => cf.monedaOriginal === 'USD')
      .reduce((sum, cf) => sum + (cf.montoOriginal != null ? cf.montoOriginal : (cf.monto || 0) / (cf.tipoCambio || 4.0)), 0);

    const totalFijosConsolidado = costosFijos.reduce((sum, cf) => sum + (cf.monto || 0), 0);

    // 2. Préstamos
    const totalPrestamosSoles = prestamos
      .filter((p) => p.monedaOriginal !== 'USD')
      .reduce((sum, p) => sum + (p.montoCuota || 0), 0);

    const totalPrestamosUSD = prestamos
      .filter((p) => p.monedaOriginal === 'USD')
      .reduce((sum, p) => sum + (p.montoOriginal != null ? p.montoOriginal : (p.montoCuota || 0) / (p.tipoCambio || 4.0)), 0);

    const totalPrestamosConsolidado = prestamos.reduce((sum, p) => sum + (p.montoCuota || 0), 0);

    // 3. Gran total consolidado
    const totalComprometido = totalFijosConsolidado + totalPrestamosConsolidado;

    return {
      fijosCount: costosFijos.length,
      fijosConsolidado: totalFijosConsolidado,
      fijosUSD: totalFijosUSD,
      prestamosCount: prestamos.length,
      prestamosConsolidado: totalPrestamosConsolidado,
      prestamosUSD: totalPrestamosUSD,
      totalComprometido,
    };
  }, [costosFijos, prestamos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {/* 1. Costos Fijos */}
      <div className="bg-card/70 dark:bg-card/40 backdrop-blur-xs border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-border transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Costos Fijos Base
          </span>
          <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
            <Layers className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {formatMoney(metrics.fijosConsolidado, moneda)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>{metrics.fijosCount} conceptos activos</span>
            {metrics.fijosUSD > 0 && (
              <span className="font-mono font-medium text-foreground/80">
                (${metrics.fijosUSD.toFixed(2)} USD)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Préstamos */}
      <div className="bg-card/70 dark:bg-card/40 backdrop-blur-xs border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-border transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Cuotas Préstamos Base
          </span>
          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
            <Landmark className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {formatMoney(metrics.prestamosConsolidado, moneda)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>{metrics.prestamosCount} créditos vigentes</span>
            {metrics.prestamosUSD > 0 && (
              <span className="font-mono font-medium text-foreground/80">
                (${metrics.prestamosUSD.toFixed(2)} USD)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Total Comprometido */}
      <div className="bg-card/70 dark:bg-card/40 backdrop-blur-xs border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-border transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Compromiso Mensual Base
          </span>
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {formatMoney(metrics.totalComprometido, moneda)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>Total recurrente estimado</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
              Mensual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
