'use client';

import React, { useRef, useEffect } from 'react';
import { Search, CheckSquare, Square, Wallet, CheckCircle2, Clock, Sparkles, LayoutGrid, ChevronsUpDown, X } from 'lucide-react';

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
  busquedaTexto?: string;
  onBuscarTexto?: (texto: string) => void;
  onToggleColapsarTodas?: (colapsar: boolean) => void;
  estanTodasColapsadas?: boolean;
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
  busquedaTexto = '',
  onBuscarTexto,
  onToggleColapsarTodas,
  estanTodasColapsadas = false,
}: EgresosControlesBarProps) {
  const tieneMultiplesIngresos = ingresosMes.length > 1 && !!onSelectFiltroFuenteIngreso;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const tagName = (document.activeElement as HTMLElement)?.tagName;
        if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Fila 1: Píldoras de Estado + Buscador de Texto Rápido */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Segmented Control Pill Bar para Filtro de Estado */}
        <div className="inline-flex p-0.5 sm:p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/50 text-xs font-semibold overflow-x-auto no-scrollbar gap-0.5 sm:gap-1 max-w-full shrink-0">
          {/* PENDIENTES */}
          <button
            type="button"
            onClick={() => onSelectFiltroEstado('PENDIENTE')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
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

        {/* Buscador Rápido de Compromisos por Texto con atajo '/' */}
        {onBuscarTexto && (
          <div className="relative flex-1 max-w-full md:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={busquedaTexto}
              onChange={(e) => onBuscarTexto(e.target.value)}
              placeholder="Buscar gasto, tarjeta... (Presiona /)"
              className="w-full pl-8 pr-12 py-1.5 rounded-xl bg-background/80 hover:bg-background border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {busquedaTexto ? (
                <button
                  type="button"
                  onClick={() => onBuscarTexto('')}
                  className="p-0.5 text-muted-foreground hover:text-foreground rounded-md"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground/60 border border-border/50 rounded px-1 py-0.2 bg-muted/30">
                  /
                </kbd>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fila 2: Fuente de Ingreso, Colapsar/Expandir Todo y Selección */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {tieneMultiplesIngresos && (
            <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-xl border border-border/50 text-xs">
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

          {/* Contador de resultados cuando se busca */}
          {busquedaTexto && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
              Coincidencias:{' '}
              <strong className="text-foreground font-mono">{conteoTotal}</strong>
            </span>
          )}

          {/* Botón Colapsar / Expandir Todo */}
          {onToggleColapsarTodas && (
            <button
              type="button"
              onClick={() => onToggleColapsarTodas(!estanTodasColapsadas)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition active:scale-95 shadow-2xs font-medium text-xs cursor-pointer"
              title={estanTodasColapsadas ? 'Expandir todas las secciones' : 'Colapsar todas las secciones'}
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{estanTodasColapsadas ? 'Expandir todo' : 'Colapsar todo'}</span>
            </button>
          )}
        </div>

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
