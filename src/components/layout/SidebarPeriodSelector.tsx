'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';

interface SidebarPeriodSelectorProps {
  periodo: string;
  puedeIrMesAnterior: boolean;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  prefetchMesAnterior: () => void;
  prefetchMesSiguiente: () => void;
  esMesEspecial: boolean;
  labelEspecial: string;
}

export function SidebarPeriodSelector({
  periodo,
  puedeIrMesAnterior,
  irMesAnterior,
  irMesSiguiente,
  prefetchMesAnterior,
  prefetchMesSiguiente,
  esMesEspecial,
  labelEspecial,
}: SidebarPeriodSelectorProps) {
  return (
    <div className="bg-muted/40 p-1.5 rounded-xl border border-border/60">
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={irMesAnterior}
          onMouseEnter={prefetchMesAnterior}
          disabled={!puedeIrMesAnterior}
          className={`p-1.5 rounded-lg transition ${
            puedeIrMesAnterior
              ? 'hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer'
              : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
          }`}
          title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="text-center truncate px-1">
          <span className="text-xs font-semibold text-foreground capitalize tracking-tight block">
            {formatPeriodoLabel(periodo)}
          </span>
          {esMesEspecial && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
              {labelEspecial}
            </span>
          )}
        </div>

        <button
          onClick={irMesSiguiente}
          onMouseEnter={prefetchMesSiguiente}
          className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
          title="Mes siguiente"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
