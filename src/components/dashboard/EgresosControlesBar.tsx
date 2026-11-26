'use client';

import React from 'react';
import { GripVertical, CheckSquare, Square, Wallet, CheckCircle2, Clock, Sparkles, LayoutGrid } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2.5 border-t border-border/50">
      {/* Segmented Control Pill Bar para Filtro de Estado */}
      <div className="inline-flex p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/50 text-xs font-semibold overflow-x-auto no-scrollbar gap-1">
        {/* PENDIENTES */}
        <button
          type="button"
          onClick={() => onSelectFiltroEstado('PENDIENTE')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-background text-foreground shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${filtroEstado === 'PENDIENTE' ? 'text-amber-500' : 'text-muted-foreground/60'}`} />
          <span>Pendientes</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filtroEstado === 'PENDIENTE' 
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold' 
              : 'bg-muted text-muted-foreground font-mono'
          }`}>
            {conteoPendiente}
          </span>
        </button>

        {/* ADELANTADOS */}
        <button
          type="button"
          onClick={() => onSelectFiltroEstado('ADELANTADO')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
            filtroEstado === 'ADELANTADO'
              ? 'bg-background text-foreground shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${filtroEstado === 'ADELANTADO' ? 'text-indigo-500' : 'text-muted-foreground/60'}`} />
          <span>Adelantados</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filtroEstado === 'ADELANTADO' 
              ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono font-bold' 
              : 'bg-muted text-muted-foreground font-mono'
          }`}>
            {conteoAdelantado}
          </span>
        </button>

        {/* PAGADOS */}
        <button
          type="button"
          onClick={() => onSelectFiltroEstado('PAGADO')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
            filtroEstado === 'PAGADO'
              ? 'bg-background text-foreground shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${filtroEstado === 'PAGADO' ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
          <span>Pagados</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filtroEstado === 'PAGADO' 
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold' 
              : 'bg-muted text-muted-foreground font-mono'
          }`}>
            {conteoPagado}
          </span>
        </button>

        {/* TODOS */}
        <button
          type="button"
          onClick={() => onSelectFiltroEstado('TODOS')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
            filtroEstado === 'TODOS'
              ? 'bg-foreground text-background shadow-2xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Todos</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            filtroEstado === 'TODOS' ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
          }`}>
            {conteoTotal}
          </span>
        </button>
      </div>

      {/* Controles del Lado Derecho: Fuente de Ingreso & Selección */}
      <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
        {tieneMultiplesIngresos && (
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border/60 text-xs">
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

        <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-xl border border-border/50 font-medium">
          <GripVertical className="w-3 h-3 text-muted-foreground/60" />
          <span>Arrastra para ordenar</span>
        </span>

        {hasItems && (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-2xs ${
              isAllSelected
                ? 'bg-foreground text-background border-foreground font-semibold'
                : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/60'
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
