'use client';

import React from 'react';
import { Search, X, CheckSquare, Square } from 'lucide-react';

interface GastosFiltrosBarProps {
  filtroEstado: string;
  onFiltroEstadoChange: (estado: string) => void;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  totalItems: number;
  todosSeleccionados: boolean;
  onToggleSelectAll: () => void;
}

export function GastosFiltrosBar({
  filtroEstado,
  onFiltroEstadoChange,
  busqueda,
  onBusquedaChange,
  totalItems,
  todosSeleccionados,
  onToggleSelectAll,
}: GastosFiltrosBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50">
          {(['PENDIENTE', 'ADELANTADO', 'PAGADO', 'TODOS'] as const).map((est) => {
            const isSelected = filtroEstado === est;
            return (
              <button
                key={est}
                type="button"
                onClick={() => onFiltroEstadoChange(est)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isSelected
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {est === 'TODOS'
                  ? 'Todos'
                  : est === 'PENDIENTE'
                    ? 'Por Pagar'
                    : est === 'ADELANTADO'
                      ? 'Adelantados'
                      : 'Pagados'}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar concepto o tarjeta..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-muted/40 border border-border/70 text-xs focus:border-foreground outline-none text-foreground placeholder:text-muted-foreground transition"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition font-medium self-end sm:self-auto py-1 px-2 rounded-lg hover:bg-muted/50"
        >
          {todosSeleccionados ? (
            <>
              <CheckSquare className="w-4 h-4 text-foreground" />
              <span>Deseleccionar todos</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              <span>Seleccionar todos</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
