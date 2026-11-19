'use client';

import React from 'react';
import { GripVertical, CheckSquare, Square, Wallet } from 'lucide-react';

interface EgresosControlesBarProps {
  filtroEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS';
  onSelectFiltroEstado: (f: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS') => void;
  filtroFuenteIngreso?: string;
  onSelectFiltroFuenteIngreso?: (f: string) => void;
  ingresosMes?: any[];
  conteoPendiente: number;
  conteoAdelantado: number;
  conteoPagado: number;
  conteoTotal: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  hasItems: boolean;
}

export function EgresosControlesBar({
  filtroEstado,
  onSelectFiltroEstado,
  filtroFuenteIngreso = 'TODOS',
  onSelectFiltroFuenteIngreso,
  ingresosMes = [],
  conteoPendiente,
  conteoAdelantado,
  conteoPagado,
  conteoTotal,
  isAllSelected,
  onToggleSelectAll,
  hasItems,
}: EgresosControlesBarProps) {
  const tieneMultiplesIngresos = ingresosMes.length > 1 && !!onSelectFiltroFuenteIngreso;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 border-t border-border/40">
      {/* Selector de Estado */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => onSelectFiltroEstado('PENDIENTE')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
          <span>Pendientes ({conteoPendiente})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEstado('ADELANTADO')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            filtroEstado === 'ADELANTADO'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
          <span>Adelantados ({conteoAdelantado})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEstado('PAGADO')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            filtroEstado === 'PAGADO'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
          <span>Pagados ({conteoPagado})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEstado('TODOS')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            filtroEstado === 'TODOS'
              ? 'bg-foreground text-background shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span>Todos ({conteoTotal})</span>
        </button>
      </div>

      {/* Controles de Lado Derecho: Fuente de Ingreso & Selección */}
      <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
        {tieneMultiplesIngresos && (
          <div className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-lg border border-border/50 text-xs">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={filtroFuenteIngreso}
              onChange={(e) => onSelectFiltroFuenteIngreso?.(e.target.value)}
              className="bg-transparent text-foreground text-xs font-medium focus:outline-none cursor-pointer"
              title="Filtrar por fuente de pago asignada"
            >
              <option value="TODOS">Todas las fuentes</option>
              {ingresosMes.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.concepto}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/40 font-medium">
          <GripVertical className="w-3 h-3" />
          Arrastra para reordenar
        </span>

        {hasItems && (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition cursor-pointer ${
              isAllSelected
                ? 'bg-foreground text-background border-foreground shadow-2xs'
                : 'bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/60'
            }`}
          >
            {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>{isAllSelected ? 'Deseleccionar' : 'Seleccionar todo'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
