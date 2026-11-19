'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';
import { useFinanzas } from '@/context/FinanzasContext';

interface HeroPeriodoNavProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior?: boolean;
  esMesEspecial?: boolean;
  labelEspecial?: string;
}

export function HeroPeriodoNav({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior = true,
  esMesEspecial = false,
  labelEspecial,
}: HeroPeriodoNavProps) {
  const { prefetchMesAnterior, prefetchMesSiguiente } = useFinanzas();

  return (
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground">
        Periodo
      </span>
      <div className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md text-xs font-medium border border-border/40">
        <button
          type="button"
          onClick={irMesAnterior}
          onMouseEnter={prefetchMesAnterior}
          disabled={!puedeIrMesAnterior}
          className={`transition ${
            puedeIrMesAnterior
              ? 'hover:text-foreground text-muted-foreground cursor-pointer'
              : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
          }`}
          title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="capitalize px-1 text-foreground font-semibold">
          {formatPeriodoLabel(periodo)}
        </span>
        <button
          type="button"
          onClick={irMesSiguiente}
          onMouseEnter={prefetchMesSiguiente}
          className="hover:text-foreground text-muted-foreground transition cursor-pointer"
          title="Mes siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {esMesEspecial && labelEspecial && (
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          · {labelEspecial}
        </span>
      )}
    </div>
  );
}
