'use client';

import React from 'react';
import { Landmark } from 'lucide-react';

interface DetallePropiedadesPrestamoProps {
  banco?: string;
  tasaInteresAnual?: number;
  categoria?: string;
}

export function DetallePropiedadesPrestamo({
  banco,
  tasaInteresAnual,
  categoria,
}: DetallePropiedadesPrestamoProps) {
  return (
    <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2.5 text-xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Landmark className="w-3.5 h-3.5 text-purple-500" />
        <span>Condiciones del Crédito Bancario</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Banco / Entidad</span>
          <span className="font-bold text-foreground mt-0.5 block">{banco || 'Banco'}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Tasa Anual (TEA)</span>
          <span className="font-bold text-purple-600 dark:text-purple-400 mt-0.5 block font-mono">
            {tasaInteresAnual ? `${tasaInteresAnual.toFixed(2)}%` : 'Sin interés'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Liquidación</span>
          <span className="font-medium text-foreground mt-0.5 block">Fin de mes</span>
        </div>
      </div>
    </div>
  );
}
