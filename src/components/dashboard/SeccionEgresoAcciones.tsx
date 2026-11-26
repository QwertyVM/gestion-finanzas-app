'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SeccionEgresoAccionesProps {
  item: any;
  isPagado: boolean;
  isAdelantado: boolean;
  onToggleEstadoItem: (item: any, nuevoEstado: string) => void;
}

export function SeccionEgresoAcciones({
  item,
  isPagado,
  isAdelantado,
  onToggleEstadoItem,
}: SeccionEgresoAccionesProps) {
  return (
      <td className="py-2.5 pr-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
                    ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
          title="Alternar Adelantado"
        >
          {isAdelantado ? 'Adelantado' : 'Adelantar'}
        </button>

        <button
          type="button"
          onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
            className = {`h-7 px-3 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer ${isPagado
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20'
                  : 'bg-primary text-primary-foreground hover:opacity-90 shadow-2xs'
              }`}
          title="Alternar Pagado"
        >
          {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
          <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
        </button>
      </div>
    </td>
  );
}
