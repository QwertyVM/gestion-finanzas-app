'use client';

import React from 'react';
import { Pencil, Trash2, Check } from 'lucide-react';

interface PrestamoAccionesProps {
  cuotaId: string;
  prestamoId: string;
  conceptoCompleto: string;
  estado: string;
  aplicaEsteMes: boolean;
  isLoading: boolean;
  onToggleEstado: (cuotaId: string, nuevoEstado: string) => void;
  onEditarBase: () => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamoAcciones({
  cuotaId,
  prestamoId,
  conceptoCompleto,
  estado,
  aplicaEsteMes,
  isLoading,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: PrestamoAccionesProps) {
  const isPagado = estado === 'PAGADO';
  const isAdelantado = estado === 'ADELANTADO';

  return (
    <div
      className="flex items-center justify-end gap-1.5 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {aplicaEsteMes && (
        <>
          <button
            type="button"
            onClick={() => onToggleEstado(cuotaId, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
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
            onClick={() => onToggleEstado(cuotaId, isPagado ? 'PENDIENTE' : 'PAGADO')}
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
        </>
      )}

      <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity ml-1">
        <button
          type="button"
          onClick={onEditarBase}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
          title="Editar condiciones base"
          aria-label="Editar préstamo"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onEliminar(prestamoId, conceptoCompleto)}
          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition"
          title="Eliminar préstamo"
          aria-label="Eliminar préstamo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
