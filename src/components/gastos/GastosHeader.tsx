'use client';

import React, { useEffect } from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';

interface GastosHeaderProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior: boolean;
  prefetchMesAnterior?: () => void;
  prefetchMesSiguiente?: () => void;
  vistaActiva: 'MES' | 'COMPRAS_CUOTAS';
  setVistaActiva: (v: 'MES' | 'COMPRAS_CUOTAS') => void;
  totalComprasCuotas: number;
  openRecordModal: (tipo: 'GASTO') => void;
  // Métricas rápidas
  totalGastosMes: number;
  totalPagadoMes: number;
  totalPendienteMes: number;
  totalSiguienteMes: number;
  moneda: string;
  // Filtro activo interactivo
  filtroEstadoActual?: string;
  onSelectFiltroKpi?: (estado: string) => void;
  onScrollToSiguiente?: () => void;
}

export function GastosHeader({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior,
  prefetchMesAnterior,
  prefetchMesSiguiente,
  vistaActiva,
  setVistaActiva,
  totalComprasCuotas,
  openRecordModal,
  totalGastosMes,
  totalPagadoMes,
  totalPendienteMes,
  totalSiguienteMes,
  moneda,
  filtroEstadoActual,
  onSelectFiltroKpi,
  onScrollToSiguiente,
}: GastosHeaderProps) {
  const mesLabel = formatPeriodoLabel(periodo);

  // Atajo global tecla "N" para abrir Registrar Gasto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase()) &&
        !(e.target as HTMLElement)?.isContentEditable &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        openRecordModal('GASTO');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openRecordModal]);

  return (
    <div className="space-y-4">
      {/* Barra Principal: Título + Navegador de Período + Vistas + Registrar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Izquierda: Período y Contexto */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Navegador de mes compacto */}
          <div className="inline-flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={irMesAnterior}
              onMouseEnter={prefetchMesAnterior}
              disabled={!puedeIrMesAnterior}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                puedeIrMesAnterior
                  ? 'hover:bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
              }`}
              title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes disponible'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2.5 py-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-bold text-foreground capitalize whitespace-nowrap">
                {mesLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={irMesSiguiente}
              onMouseEnter={prefetchMesSiguiente}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card text-foreground transition cursor-pointer shadow-2xs"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Gastos & Compras</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Corte al día 10 · Control diferido en cuotas
            </p>
          </div>
        </div>

        {/* Derecha: Tabs de vista y Registrar Gasto */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2.5">
          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setVistaActiva('MES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                vistaActiva === 'MES'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos del Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('COMPRAS_CUOTAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                vistaActiva === 'COMPRAS_CUOTAS'
                  ? 'bg-card text-indigo-500 dark:text-indigo-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Compras en Cuotas</span>
              {totalComprasCuotas > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30">
                  {totalComprasCuotas}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => openRecordModal('GASTO')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition active:scale-98 shadow-xs cursor-pointer group"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono bg-background/20 text-background rounded font-semibold ml-0.5 group-hover:bg-background/30 transition">
              N
            </kbd>
          </button>
        </div>
      </div>

      {/* Mini KPIs de Resumen del Mes Interactivos (Solo visibles en vista Gastos del Mes) */}
      {vistaActiva === 'MES' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Total Facturado (Filtro Todos) */}
          <div
            onClick={() => onSelectFiltroKpi?.('TODOS')}
            className={`p-3 rounded-xl bg-card border shadow-2xs space-y-1 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99] group ${
              filtroEstadoActual === 'TODOS'
                ? 'border-foreground/40 ring-2 ring-foreground/20'
                : 'border-border/70 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-medium group-hover:text-foreground transition">Total Facturado</span>
              <div className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 opacity-60" />
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {formatMoney(totalGastosMes, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Compromisos con corte este mes · Ver todos
            </span>
          </div>

          {/* 2. Pagado / Adelantado */}
          <div
            onClick={() => onSelectFiltroKpi?.('PAGADO')}
            className={`p-3 rounded-xl bg-card border shadow-2xs space-y-1 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99] group ${
              filtroEstadoActual === 'PAGADO' || filtroEstadoActual === 'ADELANTADO'
                ? 'border-emerald-500/50 ring-2 ring-emerald-500/20'
                : 'border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
              <span className="font-semibold">Pagado / Adelantado</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMoney(totalPagadoMes, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {totalGastosMes > 0 ? Math.round((totalPagadoMes / totalGastosMes) * 100) : 0}% liquidado · Filtrar
            </span>
          </div>

          {/* 3. Pendiente por Pagar */}
          <div
            onClick={() => onSelectFiltroKpi?.('PENDIENTE')}
            className={`p-3 rounded-xl bg-card border shadow-2xs space-y-1 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99] group ${
              filtroEstadoActual === 'PENDIENTE'
                ? 'border-amber-500/50 ring-2 ring-amber-500/20'
                : 'border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-[11px]">
              <span className="font-semibold">Pendiente por Pagar</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-amber-600 dark:text-amber-400 tabular-nums">
              {formatMoney(totalPendienteMes, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Por conciliar en banco · Filtrar
            </span>
          </div>

          {/* 4. Próximo Mes */}
          <div
            onClick={() => onScrollToSiguiente?.()}
            className="p-3 rounded-xl bg-card border border-indigo-500/20 hover:border-indigo-500/40 shadow-2xs space-y-1 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99] group"
          >
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-[11px]">
              <span className="font-semibold">Próximo Mes</span>
              <div className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {formatMoney(totalSiguienteMes, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Consumos post-corte (Día 10) · Ir a sección
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
