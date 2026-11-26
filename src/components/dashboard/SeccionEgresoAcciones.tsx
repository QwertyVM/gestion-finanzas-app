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
          className={`h-7 px-2.5 rounded-lg text-[11px] font-medium transition cursor-pointer border active:scale-95 ${isAdelantado
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50 font-semibold'
            : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 border-transparent'
            }`}
          title="Alternar Adelantado"
        >
          {isAdelantado ? 'Adelantado' : 'Adelantar'}
        </button>

        <button
          type="button"
          onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
          className={`h-7 px-3 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer active:scale-95 ${isPagado
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100/60'
            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-2xs'
            }`}
          title={isPagado ? 'Marcar como pendiente' : 'Marcar como pagado'}
        >
          {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
          <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
        </button>
      </div>
    </td>
  );
}
