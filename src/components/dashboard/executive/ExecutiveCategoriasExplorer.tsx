'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { CategoriaAnalisisItem } from '@/lib/finanzas-service';
import { ExecutiveIconHelper } from './ExecutiveIconHelper';

interface ExecutiveCategoriasExplorerProps {
  categorias: CategoriaAnalisisItem[];
  busqueda: string;
  onSearchChange: (value: string) => void;
  selectedCategoriaId: string | null;
  onSelectCategoria: (id: string | null) => void;
  moneda: string;
}

export function ExecutiveCategoriasExplorer({
  categorias,
  busqueda,
  onSearchChange,
  selectedCategoriaId,
  onSelectCategoria,
  moneda,
}: ExecutiveCategoriasExplorerProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explorador de Categorías
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Haz clic en cualquier categoría para auditar sus transacciones, composición fija vs variable y estado.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {categorias.map((c) => {
          const esSeleccionada = c.id === selectedCategoriaId;
          return (
            <div
              key={c.id}
              onClick={() => onSelectCategoria(esSeleccionada ? null : c.id)}
              className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                esSeleccionada
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                  : 'border-border/80 bg-background hover:border-border hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="p-1.5 rounded-lg text-white shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      <ExecutiveIconHelper name={c.icono} className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-semibold text-xs text-foreground truncate">
                      {c.nombre}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-foreground shrink-0">
                    {c.porcentaje}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-lg font-bold font-mono tracking-tight text-foreground">
                    {formatMoney(c.totalMonto, moneda)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {c.conteoItems} {c.conteoItems === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{c.porcentajePagado}% pagado</span>
                    <span>{formatMoney(c.desgloseEstado.pendiente, moneda)} pendiente</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${c.porcentajePagado}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-[10px]">
                {c.desgloseClasificacion.fijo > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Fijo: {formatMoney(c.desgloseClasificacion.fijo, moneda)}
                  </span>
                )}
                {c.desgloseClasificacion.cuotas > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Cuotas: {formatMoney(c.desgloseClasificacion.cuotas, moneda)}
                  </span>
                )}
                {c.desgloseClasificacion.prestamos > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Préstamo: {formatMoney(c.desgloseClasificacion.prestamos, moneda)}
                  </span>
                )}
                {c.desgloseClasificacion.variables > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Var: {formatMoney(c.desgloseClasificacion.variables, moneda)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
