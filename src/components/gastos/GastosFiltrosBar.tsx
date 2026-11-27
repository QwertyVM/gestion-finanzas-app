'use client';

import React, { useEffect, useRef } from 'react';
import { Search, X, CheckSquare, Square } from 'lucide-react';

interface GastosFiltrosBarProps {
  filtroEstado: string;
  onFiltroEstadoChange: (estado: string) => void;
  filtroTarjeta?: string;
  onFiltroTarjetaChange?: (tarjeta: string) => void;
  tarjetasDisponibles?: Array<{ id: string; nombre: string; color: string }>;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  totalItems: number;
  totalCoincidencias?: number;
  todosSeleccionados: boolean;
  onToggleSelectAll: () => void;
}

export function GastosFiltrosBar({
  filtroEstado,
  onFiltroEstadoChange,
  filtroTarjeta = 'TODAS',
  onFiltroTarjetaChange,
  tarjetasDisponibles = [],
  busqueda,
  onBusquedaChange,
  totalItems,
  totalCoincidencias,
  todosSeleccionados,
  onToggleSelectAll,
}: GastosFiltrosBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajo global tecla "/" para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const tagName = document.activeElement?.tagName.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea' && !document.activeElement?.getAttribute('contenteditable')) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
        <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/50 overflow-x-auto no-scrollbar max-w-full">
          {(['PENDIENTE', 'ADELANTADO', 'PAGADO', 'TODOS'] as const).map((est) => {
            const isSelected = filtroEstado === est;
            return (
              <button
                key={est}
                type="button"
                onClick={() => onFiltroEstadoChange(est)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
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

        {/* Selector de Tarjeta / Medio de Pago */}
        {onFiltroTarjetaChange && tarjetasDisponibles.length > 0 && (
          <div className="inline-flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => onFiltroTarjetaChange('TODAS')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                filtroTarjeta === 'TODAS'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos medios
            </button>
            {tarjetasDisponibles.map((t) => {
              const isSelected = filtroTarjeta === t.nombre;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onFiltroTarjetaChange(t.nombre)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span>{t.nombre}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onFiltroTarjetaChange('DIRECTO')}
              className={`px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                filtroTarjeta === 'DIRECTO'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Efectivo / Transferencia
            </button>
          </div>
        )}

        <div className="relative w-full sm:w-auto sm:min-w-[240px] max-w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar concepto o tarjeta... (/)"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full pl-8 pr-16 py-1.5 rounded-lg bg-muted/40 border border-border/70 text-xs focus:border-foreground outline-none text-foreground placeholder:text-muted-foreground transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {busqueda ? (
              <button
                type="button"
                onClick={() => onBusquedaChange('')}
                className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono text-muted-foreground/70 bg-muted border border-border/60 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {busqueda.trim() && (
          <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
            {totalCoincidencias ?? totalItems} coincidencia{(totalCoincidencias ?? totalItems) === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {totalItems > 0 && (
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition font-medium self-end sm:self-auto py-1 px-2 rounded-lg hover:bg-muted/50 cursor-pointer"
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
