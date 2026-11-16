'use client';

import React from 'react';
import type { ResumenDivisasEgresos } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Coins, CheckCircle2, ArrowRight } from 'lucide-react';
import { ResumenDivisasDistribucionBar } from './ResumenDivisasDistribucionBar';

interface ResumenDivisasCardProps {
  divisas?: ResumenDivisasEgresos | null;
  moneda?: string;
}

export function ResumenDivisasCard({ divisas, moneda = 'S/' }: ResumenDivisasCardProps) {
  if (!divisas || !divisas.tieneMultiplesMonedas || divisas.dolares.pendienteUSD <= 0) return null;

  const { soles, dolares, consolidado } = divisas;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Cabecera del Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Resumen de Egresos por Moneda
            </h3>
            <p className="text-xs text-muted-foreground">
              Cuánto debes por pagar en Soles y Dólares al tipo de cambio de tu cuenta ({moneda} {dolares.tipoCambio.toFixed(2)}).
            </p>
          </div>
        </div>

        {consolidado.cuadraSumatoria && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold self-start sm:self-auto border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sumatoria exacta por pagar</span>
          </div>
        )}
      </div>

      {/* Barra visual de distribución bimodal */}
      <ResumenDivisasDistribucionBar
        porcentajeSoles={soles.porcentaje}
        porcentajeDolares={dolares.porcentaje}
      />

      {/* Grid de 3 Tarjetas Atómicas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Soles (PEN) */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                En Soles (PEN)
              </span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                {soles.conteoPendiente ?? soles.conteo} {(soles.conteoPendiente ?? soles.conteo) === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground">
              {formatMoney(soles.pendiente, moneda)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Por pagar este mes
            </div>
          </div>
          <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
            {soles.adelantado > 0 && (
              <div className="flex justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span>⚡ Adelantado:</span>
                <span className="font-mono">
                  {formatMoney(soles.adelantado, moneda)}
                </span>
              </div>
            )}
            {soles.pagado > 0 && (
              <div className="flex justify-between text-[11px]">
                <span>Ya pagado:</span>
                <span className="font-mono text-muted-foreground">
                  {formatMoney(soles.pagado, moneda)}
                </span>
              </div>
            )}
            {(soles.adelantado > 0 || soles.pagado > 0) && (
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
                <span>Total egresos mes:</span>
                <span className="font-mono">
                  {formatMoney(soles.total, moneda)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Dólares (USD) */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-sky-700 dark:text-sky-300">
                En Dólares (USD)
              </span>
              <span className="text-[10px] bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-medium">
                {dolares.conteoPendiente ?? dolares.conteo} {(dolares.conteoPendiente ?? dolares.conteo) === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground">
              ${dolares.pendienteUSD.toFixed(2)}{' '}
              <span className="text-xs font-normal text-muted-foreground">USD</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              ≈ {formatMoney(dolares.pendiente, moneda)} (TC cuenta: {moneda} {dolares.tipoCambio.toFixed(2)})
            </div>
          </div>
          <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
            {dolares.adelantadoUSD > 0 && (
              <div className="flex justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span>⚡ Adelantado:</span>
                <span className="font-mono">
                  ${dolares.adelantadoUSD.toFixed(2)} USD
                </span>
              </div>
            )}
            {dolares.pagadoUSD > 0 && (
              <div className="flex justify-between text-[11px]">
                <span>Ya pagado:</span>
                <span className="font-mono text-muted-foreground">
                  ${dolares.pagadoUSD.toFixed(2)} USD
                </span>
              </div>
            )}
            {(dolares.adelantadoUSD > 0 || dolares.pagadoUSD > 0) && (
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
                <span>Total egresos mes:</span>
                <span className="font-mono">
                  ${dolares.totalUSD.toFixed(2)} USD (≈ {formatMoney(dolares.total, moneda)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Total Consolidado por Pagar */}
        <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-foreground">Total por Pagar</span>
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                {consolidado.totalPendientes ?? consolidado.totalCompromisos} {(consolidado.totalPendientes ?? consolidado.totalCompromisos) === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground">
              {formatMoney(consolidado.totalPendientePEN, moneda)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono flex items-center gap-1 flex-wrap">
              <span>S/ {soles.pendiente.toFixed(2)}</span>
              <span>+</span>
              <span>S/ {dolares.pendiente.toFixed(2)}</span>
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">100%</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
            {consolidado.totalAdelantadoPEN > 0 && (
              <div className="flex justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span>⚡ Total adelantado:</span>
                <span className="font-mono">
                  {formatMoney(consolidado.totalAdelantadoPEN, moneda)}
                </span>
              </div>
            )}
            {consolidado.totalPagadoPEN > 0 && (
              <div className="flex justify-between text-[11px]">
                <span>Total pagado:</span>
                <span className="font-mono text-muted-foreground">
                  {formatMoney(consolidado.totalPagadoPEN, moneda)}
                </span>
              </div>
            )}
            {(consolidado.totalAdelantadoPEN > 0 || consolidado.totalPagadoPEN > 0) && (
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
                <span>Total egresos mes:</span>
                <span className="font-mono">
                  {formatMoney(consolidado.totalEgresosPEN, moneda)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
