'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Home, Landmark, Layers, Banknote } from 'lucide-react';

interface TotalesPorClasificacion {
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

interface DiferenciacionEgresosBarProps {
  totales?: TotalesPorClasificacion | null;
  filtroEgreso: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';
  onSelectFiltro: (filtro: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES') => void;
  moneda: string;
}

export function DiferenciacionEgresosBar({
  totales,
  filtroEgreso,
  onSelectFiltro,
  moneda,
}: DiferenciacionEgresosBarProps) {
  if (!totales) return null;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
          Diferenciación de Egresos por Tipo
        </span>
        <span className="font-mono text-muted-foreground text-xs font-medium">
          Total: {formatMoney(totales.total, moneda)}
        </span>
      </div>

      {/* Barra segmentada de colores */}
      <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
        {totales.porcentajeFijos > 0 && (
          <div
            style={{ width: `${totales.porcentajeFijos}%` }}
            className="bg-sky-500 h-full transition-all duration-300"
            title={`Costos Fijos: ${totales.porcentajeFijos}%`}
          />
        )}
        {totales.porcentajePrestamos > 0 && (
          <div
            style={{ width: `${totales.porcentajePrestamos}%` }}
            className="bg-purple-500 h-full transition-all duration-300"
            title={`Préstamos: ${totales.porcentajePrestamos}%`}
          />
        )}
        {totales.porcentajeCuotas > 0 && (
          <div
            style={{ width: `${totales.porcentajeCuotas}%` }}
            className="bg-indigo-500 h-full transition-all duration-300"
            title={`Cuotas: ${totales.porcentajeCuotas}%`}
          />
        )}
        {totales.porcentajeVariables > 0 && (
          <div
            style={{ width: `${totales.porcentajeVariables}%` }}
            className="bg-teal-500 h-full transition-all duration-300"
            title={`Variables: ${totales.porcentajeVariables}%`}
          />
        )}
      </div>

      {/* Botones / Tarjetas de métricas con color distintivo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs">
        <button
          type="button"
          onClick={() => onSelectFiltro(filtroEgreso === 'FIJOS' ? 'TODOS' : 'FIJOS')}
          className={`p-3 rounded-xl border text-left transition ${
            filtroEgreso === 'FIJOS'
              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-xs'
              : 'border-border/60 hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold text-xs">
            <Home className="w-4 h-4 shrink-0" />
            <span>Costos Fijos</span>
          </div>
          <div className="font-mono font-bold text-foreground text-sm mt-1">
            {formatMoney(totales.fijos, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {totales.conteoFijos} fijos · {totales.porcentajeFijos}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltro(filtroEgreso === 'PRESTAMOS' ? 'TODOS' : 'PRESTAMOS')}
          className={`p-3 rounded-xl border text-left transition ${
            filtroEgreso === 'PRESTAMOS'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-xs'
              : 'border-border/60 hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs">
            <Landmark className="w-4 h-4 shrink-0" />
            <span>Préstamos</span>
          </div>
          <div className="font-mono font-bold text-foreground text-sm mt-1">
            {formatMoney(totales.prestamos, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {totales.conteoPrestamos} cuotas · {totales.porcentajePrestamos}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltro(filtroEgreso === 'CUOTAS' ? 'TODOS' : 'CUOTAS')}
          className={`p-3 rounded-xl border text-left transition ${
            filtroEgreso === 'CUOTAS'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-xs'
              : 'border-border/60 hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Cuotas Tarjeta</span>
          </div>
          <div className="font-mono font-bold text-foreground text-sm mt-1">
            {formatMoney(totales.cuotas, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {totales.conteoCuotas} items · {totales.porcentajeCuotas}%
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectFiltro(filtroEgreso === 'VARIABLES' ? 'TODOS' : 'VARIABLES')}
          className={`p-3 rounded-xl border text-left transition ${
            filtroEgreso === 'VARIABLES'
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 shadow-xs'
              : 'border-border/60 hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold text-xs">
            <Banknote className="w-4 h-4 shrink-0" />
            <span>Variables</span>
          </div>
          <div className="font-mono font-bold text-foreground text-sm mt-1">
            {formatMoney(totales.variables, moneda)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {totales.conteoVariables} items · {totales.porcentajeVariables}%
          </div>
        </button>
      </div>
    </div>
  );
}
