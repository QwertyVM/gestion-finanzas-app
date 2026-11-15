'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface CuotaTarjetaAccionesProps {
  id: string;
  estado: string;
  isLoading: boolean;
  onToggleEstado: (gastoId: string, nuevoEstado: string) => void;
}

export function CuotaTarjetaAcciones({
  id,
  estado,
  isLoading,
  onToggleEstado,
}: CuotaTarjetaAccionesProps) {
  const isPagado = estado === 'PAGADO';
  const isAdelantado = estado === 'ADELANTADO';

  return (
    <div
      className="flex items-center justify-end gap-1.5 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onToggleEstado(id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
        disabled={isLoading}
        className={`h-6.5 px-2 rounded text-[11px] transition font-medium ${
          isAdelantado
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
        title="Marcar Adelantado"
      >
        {isAdelantado ? 'Adelantado' : 'Adelantar'}
      </button>

      <button
        type="button"
        onClick={() => onToggleEstado(id, isPagado ? 'PENDIENTE' : 'PAGADO')}
        disabled={isLoading}
        className={`h-6.5 px-2.5 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 ${
          isPagado
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 hover:bg-emerald-100/70'
            : 'bg-foreground text-background hover:opacity-85 shadow-2xs'
        }`}
        title="Marcar Pagado"
      >
        {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
        <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
      </button>
    </div>
  );
}
