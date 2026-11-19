'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Wallet, Gift, Layers } from 'lucide-react';

interface IngresoFuenteItem {
  id: string;
  concepto: string;
  tipo: string;
  monto: number;
  totalGastosAsignados?: number;
  disponible?: number;
  gastosAsignadosCount?: number;
}

interface FiltroFuenteIngresoBarProps {
  ingresos?: IngresoFuenteItem[];
  filtroFuenteIngreso: string;
  onSelectFiltroFuente: (id: string) => void;
  moneda: string;
  totalCompromisos: number;
  totalMontoEgresos: number;
}

export function FiltroFuenteIngresoBar({
  ingresos = [],
  filtroFuenteIngreso,
  onSelectFiltroFuente,
  moneda,
  totalCompromisos,
  totalMontoEgresos,
}: FiltroFuenteIngresoBarProps) {
  if (!ingresos || ingresos.length <= 1) return null;

  const sueldoBase = ingresos.find((i) => i.tipo === 'SUELDO') || ingresos[0];
  const fuenteActiva = ingresos.find((i) => i.id === filtroFuenteIngreso);

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-3">
      {/* 1. Header con Pestañas de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Vistas por Fuente de Pago</span>
          </span>
          <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
            {ingresos.length} fuentes disponibles
          </span>
        </div>

        {/* Pestañas de Cambio de Vista */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => onSelectFiltroFuente('TODOS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filtroFuenteIngreso === 'TODOS'
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>Todos ({totalCompromisos})</span>
          </button>

          {ingresos.map((ing) => {
            const isSelected = filtroFuenteIngreso === ing.id;
            const isGrati = ing.tipo === 'GRATIFICACION';
            const count = ing.gastosAsignadosCount ?? 0;

            return (
              <button
                key={ing.id}
                type="button"
                onClick={() => onSelectFiltroFuente(ing.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? isGrati
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-xs dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500'
                    : 'bg-muted/60 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'
                }`}
              >
                {isGrati ? <Gift className="w-3 h-3 shrink-0" /> : <Wallet className="w-3 h-3 shrink-0" />}
                <span>
                  Vista {isGrati ? 'Gratificación' : ing.concepto.split(' ')[0]} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Banner de Control & Balance de la Fuente Seleccionada */}
      {fuenteActiva ? (
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>{fuenteActiva.tipo === 'GRATIFICACION' ? '🎁' : '💰'}</span>
              <span>{fuenteActiva.concepto}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Filtrando lista exclusivamente para esta fuente)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Total de la fuente: <strong className="text-foreground">{formatMoney(fuenteActiva.monto, moneda)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Reducido / Gastos</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                - {formatMoney(fuenteActiva.totalGastosAsignados || 0, moneda)}
              </span>
            </div>
            <div className="h-6 w-px bg-border/60" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Disponible Restante</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                {formatMoney(fuenteActiva.disponible || 0, moneda)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Resumen Comparativo Sueldo vs Gratificación en Vista "Todos" */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
          {ingresos.map((ing) => {
            const isGrati = ing.tipo === 'GRATIFICACION';
            return (
              <div
                key={ing.id}
                onClick={() => onSelectFiltroFuente(ing.id)}
                className="p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/60 transition cursor-pointer flex items-center justify-between"
                title={`Click para abrir Vista ${ing.concepto}`}
              >
                <div className="truncate mr-2">
                  <div className="font-semibold text-foreground truncate flex items-center gap-1.5 text-xs">
                    <span>{isGrati ? '🎁' : '💰'}</span>
                    <span>{ing.concepto}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    Reducido: -{formatMoney(ing.totalGastosAsignados || 0, moneda)} ({ing.gastosAsignadosCount || 0} items)
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-[10px] text-muted-foreground block">Disponible</span>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {formatMoney(ing.disponible || 0, moneda)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
