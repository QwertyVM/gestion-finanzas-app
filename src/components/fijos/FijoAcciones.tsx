'use client';

import React from 'react';
import { Pencil, Trash2, Check } from 'lucide-react';

interface FijoAccionesProps {
  id: string;
  concepto: string;
  estado?: string;
  isLoading: boolean;
  onToggleEstado?: (id: string, nuevoEstado: string) => void;
  onEditar: () => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function FijoAcciones({
  id,
  concepto,
  estado,
  isLoading,
  onToggleEstado,
  onEditar,
  onEliminar,
}: FijoAccionesProps) {
  const isPagado = estado === 'PAGADO';
  const isAdelantado = estado === 'ADELANTADO';

  return (
    <div
      className="flex items-center justify-end gap-1.5 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón Adelantar (si aplica estado en contexto mensual) */}
      {onToggleEstado && (
        <button
          type="button"
          onClick={() => onToggleEstado(id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
          disabled={isLoading}
          className={`h-6.5 px-2 rounded text-[11px] transition font-medium ${
            isAdelantado
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          title={isAdelantado ? 'Revertir estado adelantado' : 'Marcar como adelantado'}
        >
          {isAdelantado ? 'Adelantado' : 'Adelantar'}
        </button>
      )}

      {/* Botón Pagar / Pagado (si aplica estado en contexto mensual) */}
      {onToggleEstado && (
        <button
          type="button"
          onClick={() => onToggleEstado(id, isPagado ? 'PENDIENTE' : 'PAGADO')}
          disabled={isLoading}
          className={`h-6.5 px-2.5 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 ${
            isPagado
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 hover:bg-emerald-100/70'
              : 'bg-foreground text-background hover:opacity-85 shadow-2xs'
          }`}
          title={isPagado ? 'Click para marcar como pendiente' : 'Marcar como pagado'}
        >
          {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
          <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
        </button>
      )}

      {/* Grupo Iconos: Editar y Eliminar de plantilla concurrente */}
      <div className="flex items-center gap-1 ml-1">
        <button
          type="button"
          onClick={onEditar}
          disabled={isLoading}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Editar costo fijo base"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onEliminar(id, concepto)}
          disabled={isLoading}
          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
          title="Eliminar costo fijo base"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
