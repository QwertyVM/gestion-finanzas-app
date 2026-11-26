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
    <div className="bg-card border border-border/70 rounded-2xl px-5 py-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Izquierda: Indicador con icono sutil y descripción */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <Coins className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-semibold text-foreground tracking-tight block">
            Egresos Multimoneda
          </span>
          <span className="text-[11px] text-muted-foreground">
            Tipo de cambio referencial: {moneda} {dolares.tipoCambio.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Derecha: 3 Importes en línea limpia sin cajas internas */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap md:flex-nowrap">
        {/* Soles */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Soles (PEN)
          </span>
          <span className="font-mono text-sm font-bold text-foreground tabular-nums">
            {formatMoney(soles.pendiente, moneda)}
          </span>
        </div>

        <span className="text-border/60 hidden sm:inline">|</span>

        {/* Dólares */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-sky-600 dark:text-sky-400 block">
            Dólares (USD)
          </span>
          <span className="font-mono text-sm font-bold text-foreground tabular-nums">
            {formatMoney(dolares.pendienteUSD, '$')}{' '}
            <span className="text-[11px] font-normal text-muted-foreground font-mono">
              (≈ {formatMoney(dolares.pendiente, moneda)})
            </span>
          </span>
        </div>

        <span className="text-border/60 hidden sm:inline">|</span>

        {/* Total Consolidado */}
        <div className="bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Total por Pagar
          </span>
          <span className="font-mono text-sm font-extrabold text-foreground tabular-nums">
            {formatMoney(consolidado.totalPendientePEN, moneda)}
          </span>
        </div>
      </div>
    </div>
  );
}
