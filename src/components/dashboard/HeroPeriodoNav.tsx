'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
  const mesLabel = formatPeriodoLabel(periodo);

  return (
        <div className="flex flex-col items-center justify-center text-center">
          {/* Selector de Fin de Mes en grande */}
          <div className="inline-flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={irMesAnterior}
              onMouseEnter={prefetchMesAnterior}
              disabled={!puedeIrMesAnterior}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition active:scale-95 cursor-pointer shadow-2xs ${puedeIrMesAnterior
                  ? 'border-border/70 bg-background/80 hover:bg-muted text-foreground'
                  : 'border-border/40 text-muted-foreground/30 cursor-not-allowed opacity-40'
                }`}
              title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground capitalize">
              Fin de {mesLabel}
            </h1>

            <button
              type="button"
              onClick={irMesSiguiente}
              onMouseEnter={prefetchMesSiguiente}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/70 bg-background/80 hover:bg-muted text-foreground transition active:scale-95 cursor-pointer shadow-2xs"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

              {/* Subtexto aclaratorio de evaluación de cierre */}
              <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Evaluación de compromisos y saldo proyectado al cierre
                </span>
                {esMesEspecial && labelEspecial && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{labelEspecial}</span>
                  </span>
        )}
            </div>
    </div>
        );
}
