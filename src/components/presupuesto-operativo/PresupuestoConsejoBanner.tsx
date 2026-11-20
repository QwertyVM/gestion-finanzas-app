'use client';

import React from 'react';
import { Lightbulb, History, Info } from 'lucide-react';

interface PresupuestoConsejoBannerProps {
  consejoConsultor: string;
  benchmarkHistorico: {
    promedioAlimentacion: number;
    promedioMovilidad: number;
    comentario: string;
  };
}

export function PresupuestoConsejoBanner({
  consejoConsultor,
  benchmarkHistorico,
}: PresupuestoConsejoBannerProps) {
  return (
    <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-3 shadow-2xs">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Consejo del Consultor Financiero
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {consejoConsultor}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{benchmarkHistorico.comentario}</span>
        </div>

        <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Tip: Usa débito o transferencias para comidas y gasolina para no ciclar deuda de tarjeta.</span>
        </div>
      </div>
    </div>
  );
}
