'use client';

import React from 'react';
import type { ResumenDivisasEgresos } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Coins, CheckCircle2 } from 'lucide-react';

interface ResumenDivisasCardProps {
  divisas?: ResumenDivisasEgresos | null;
  moneda?: string;
}

export function ResumenDivisasCard({ divisas, moneda = 'S/' }: ResumenDivisasCardProps) {
  if (!divisas || !divisas.tieneMultiplesMonedas || divisas.dolares.pendienteUSD <= 0) return null;

  const { soles, dolares, consolidado } = divisas;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Cabecera del Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
              Egresos por Moneda
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Desglose en Soles y Dólares al tipo de cambio de tu cuenta ({moneda} {dolares.tipoCambio.toFixed(2)}).
            </p>
          </div>
        </div>

        {consolidado.cuadraSumatoria && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold self-start sm:self-auto border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Sumatoria exacta por pagar</span>
          </div>
        )}
      </div>

      {/* Grid de 3 Tarjetas Compactas y Limpias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Soles (PEN) */}
        <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              En Soles (PEN)
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-medium">
              {soles.conteoPendiente ?? soles.conteo} {(soles.conteoPendiente ?? soles.conteo) === 1 ? 'pendiente' : 'pendientes'}
            </span>
          </div>
          <div>
            <div className="font-mono text-base sm:text-lg font-bold text-foreground">
              {formatMoney(soles.pendiente, moneda)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {soles.adelantado > 0 ? (
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  ⚡ {formatMoney(soles.adelantado, moneda)} adelantado
                </span>
              ) : (
                'Por pagar este periodo'
              )}
            </div>
          </div>
        </div>

        {/* 2. Dólares (USD) */}
        <div className="p-3 rounded-xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/15 flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-800 dark:text-sky-300">
              En Dólares (USD)
            </span>
            <span className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-medium">
              {dolares.conteoPendiente ?? dolares.conteo} {(dolares.conteoPendiente ?? dolares.conteo) === 1 ? 'pendiente' : 'pendientes'}
            </span>
          </div>
          <div>
            <div className="font-mono text-base sm:text-lg font-bold text-foreground">
              ${dolares.pendienteUSD.toFixed(2)}{' '}
              <span className="text-xs font-normal text-muted-foreground">USD</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              ≈ {formatMoney(dolares.pendiente, moneda)} al cambio
            </div>
          </div>
        </div>

        {/* 3. Total Consolidado por Pagar */}
        <div className="p-3 rounded-xl bg-muted/40 dark:bg-muted/15 border border-border/70 flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Total Consolidado</span>
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
              {consolidado.totalPendientes ?? consolidado.totalCompromisos} {(consolidado.totalPendientes ?? consolidado.totalCompromisos) === 1 ? 'pendiente' : 'pendientes'}
            </span>
          </div>
          <div>
            <div className="font-mono text-base sm:text-lg font-bold text-foreground">
              {formatMoney(consolidado.totalPendientePEN, moneda)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Soles + USD unificados por pagar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
