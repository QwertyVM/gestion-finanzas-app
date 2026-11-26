'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Home, Landmark, Layers, Banknote } from 'lucide-react';

export interface TotalesPorClasificacion {
  total: number;
  fijos: number;
  conteoFijos: number;
  porcentajeFijos: number;
  prestamos: number;
  conteoPrestamos: number;
  porcentajePrestamos: number;
  cuotas: number;
  conteoCuotas: number;
  porcentajeCuotas: number;
  variables: number;
  conteoVariables: number;
  porcentajeVariables: number;
}

interface EgresosCategoriasBarProps {
  totales?: TotalesPorClasificacion | null;
  filtroEgreso: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';
  onSelectFiltroEgreso: (f: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES') => void;
  moneda: string;
}

export function EgresosCategoriasBar({
  totales,
  filtroEgreso,
  onSelectFiltroEgreso,
  moneda,
}: EgresosCategoriasBarProps) {
  if (!totales) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground text-xs tracking-tight">
          Distribución por Categoría
        </span>
        <span className="font-mono text-muted-foreground text-xs font-medium">
          Total: {formatMoney(totales.total, moneda)}
        </span>
      </div>

      {/* Micro barra segmentada pastel */}
      <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden flex shadow-2xs">
        {totales.porcentajeFijos > 0 && (
          <div
            style={{ width: `${totales.porcentajeFijos}%` }}
            className="bg-sky-400 dark:bg-sky-500 h-full transition-all duration-300"
            title={`Costos Fijos: ${totales.porcentajeFijos}%`}
          />
        )}
        {totales.porcentajePrestamos > 0 && (
          <div
            style={{ width: `${totales.porcentajePrestamos}%` }}
            className="bg-purple-400 dark:bg-purple-500 h-full transition-all duration-300"
            title={`Préstamos: ${totales.porcentajePrestamos}%`}
          />
        )}
        {totales.porcentajeCuotas > 0 && (
          <div
            style={{ width: `${totales.porcentajeCuotas}%` }}
            className="bg-indigo-400 dark:bg-indigo-500 h-full transition-all duration-300"
            title={`Cuotas: ${totales.porcentajeCuotas}%`}
          />
        )}
        {totales.porcentajeVariables > 0 && (
          <div
            style={{ width: `${totales.porcentajeVariables}%` }}
            className="bg-teal-400 dark:bg-teal-500 h-full transition-all duration-300"
            title={`Variables: ${totales.porcentajeVariables}%`}
          />
        )}
      </div>

      {/* 4 Botones interactivos de filtrado por categoría con paleta pastel suave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs">
        <button
          type="button"
          onClick={() => onSelectFiltroEgreso(filtroEgreso === 'FIJOS' ? 'TODOS' : 'FIJOS')}
          className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${filtroEgreso === 'FIJOS'
              ? 'border-sky-400/80 bg-sky-50 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
              : 'border-border/60 bg-card/60 hover:bg-muted/40'
            }`}
        >
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-semibold text-xs">
            <Home className="w-3.5 h-3.5 shrink-0 text-sky-500" />
            <span>Costos Fijos</span>
          </div>
          <div className="font-mono font-bold text-foreground text-xs sm:text-sm mt-0.5">
            {formatMoney(totales.fijos, moneda)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totales.conteoFijos} fijos · {totales.porcentajeFijos}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEgreso(filtroEgreso === 'PRESTAMOS' ? 'TODOS' : 'PRESTAMOS')}
          className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${filtroEgreso === 'PRESTAMOS'
              ? 'border-purple-400/80 bg-purple-50 dark:bg-purple-950/40 shadow-xs ring-2 ring-purple-500/20'
              : 'border-border/60 bg-card/60 hover:bg-muted/40'
            }`}
        >
          <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold text-xs">
            <Landmark className="w-3.5 h-3.5 shrink-0 text-purple-500" />
            <span>Préstamos</span>
          </div>
          <div className="font-mono font-bold text-foreground text-xs sm:text-sm mt-0.5">
            {formatMoney(totales.prestamos, moneda)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totales.conteoPrestamos} deudas · {totales.porcentajePrestamos}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEgreso(filtroEgreso === 'CUOTAS' ? 'TODOS' : 'CUOTAS')}
          className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${filtroEgreso === 'CUOTAS'
              ? 'border-indigo-400/80 bg-indigo-50 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
              : 'border-border/60 bg-card/60 hover:bg-muted/40'
            }`}
        >
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
            <Layers className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span>Cuotas Tarjeta</span>
          </div>
          <div className="font-mono font-bold text-foreground text-xs sm:text-sm mt-0.5">
            {formatMoney(totales.cuotas, moneda)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totales.conteoCuotas} compras · {totales.porcentajeCuotas}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltroEgreso(filtroEgreso === 'VARIABLES' ? 'TODOS' : 'VARIABLES')}
          className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${filtroEgreso === 'VARIABLES'
              ? 'border-teal-400/80 bg-teal-50 dark:bg-teal-950/40 shadow-xs ring-2 ring-teal-500/20'
              : 'border-border/60 bg-card/60 hover:bg-muted/40'
            }`}
        >
          <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-semibold text-xs">
            <Banknote className="w-3.5 h-3.5 shrink-0 text-teal-500" />
            <span>Gastos Variables</span>
          </div>
          <div className="font-mono font-bold text-foreground text-xs sm:text-sm mt-0.5">
            {formatMoney(totales.variables, moneda)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totales.conteoVariables} gastos · {totales.porcentajeVariables}%
          </div>
        </button>
      </div>
    </div>
  );
}
