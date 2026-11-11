'use client';

import React from 'react';
import { GripVertical, CheckSquare } from 'lucide-react';

interface FiltrosEstadoBarProps {
  filtroEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS';
  onSelectEstado: (estado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS') => void;
  conteoPendiente: number;
  conteoAdelantado: number;
  conteoPagado: number;
  conteoTotal: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  hasItems: boolean;
}

export function FiltrosEstadoBar({
  filtroEstado,
  onSelectEstado,
  conteoPendiente,
  conteoAdelantado,
  conteoPagado,
  conteoTotal,
  isAllSelected,
  onToggleSelectAll,
  hasItems,
}: FiltrosEstadoBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      {/* Botones de filtro de estado */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onSelectEstado('PENDIENTE')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Pendientes ({conteoPendiente})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectEstado('ADELANTADO')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filtroEstado === 'ADELANTADO'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Adelantados ({conteoAdelantado})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectEstado('PAGADO')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filtroEstado === 'PAGADO'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Pagados ({conteoPagado})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectEstado('TODOS')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filtroEstado === 'TODOS'
              ? 'bg-foreground text-background shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span>Todos ({conteoTotal})</span>
        </button>
      </div>

      {/* Controles de ordenamiento y selección múltiple */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/40 font-medium">
          <GripVertical className="w-3.5 h-3.5" />
          Arrastra para reordenar
        </span>

        {hasItems && (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              isAllSelected
                ? 'bg-foreground text-background border-foreground shadow-xs'
                : 'bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isAllSelected ? 'Deseleccionar' : 'Sumar lista'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
