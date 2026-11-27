'use client';

import React, { useState, useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import type { CategoriaAnalisisItem } from '@/lib/finanzas-service';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ExecutiveCategoriasMatrixProps {
  categorias: CategoriaAnalisisItem[];
  selectedCategoriaId: string | null;
  onSelectCategoria: (id: string | null) => void;
  moneda: string;
}

type SortCol = 'nombre' | 'fijo' | 'prestamos' | 'cuotas' | 'variables' | 'totalMonto' | 'porcentaje' | 'porcentajePagado';

export function ExecutiveCategoriasMatrix({
  categorias,
  selectedCategoriaId,
  onSelectCategoria,
  moneda,
}: ExecutiveCategoriasMatrixProps) {
  const [sortCol, setSortCol] = useState<SortCol>('totalMonto');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortAsc((prev) => !prev);
    } else {
      setSortCol(col);
      setSortAsc(col === 'nombre');
    }
  };

  const categoriasOrdenadas = useMemo(() => {
    return [...categorias].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortCol) {
        case 'nombre':
          valA = a.nombre.toLowerCase();
          valB = b.nombre.toLowerCase();
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'fijo':
          valA = a.desgloseClasificacion.fijo;
          valB = b.desgloseClasificacion.fijo;
          break;
        case 'prestamos':
          valA = a.desgloseClasificacion.prestamos;
          valB = b.desgloseClasificacion.prestamos;
          break;
        case 'cuotas':
          valA = a.desgloseClasificacion.cuotas;
          valB = b.desgloseClasificacion.cuotas;
          break;
        case 'variables':
          valA = a.desgloseClasificacion.variables;
          valB = b.desgloseClasificacion.variables;
          break;
        case 'totalMonto':
          valA = a.totalMonto;
          valB = b.totalMonto;
          break;
        case 'porcentaje':
          valA = a.porcentaje;
          valB = b.porcentaje;
          break;
        case 'porcentajePagado':
          valA = a.porcentajePagado;
          valB = b.porcentajePagado;
          break;
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [categorias, sortCol, sortAsc]);

  const renderSortIcon = (col: SortCol) => {
    if (sortCol !== col) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover/col:opacity-100 transition-opacity" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Matriz Comparativa de Categorías
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Haz clic en las cabeceras para ordenar por cualquier columna.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
          {categorias.length} categorías registradas
        </span>
      </div>

      {/* Móvil: Lista de categorías */}
      <div className="md:hidden divide-y divide-border/40">
        {categoriasOrdenadas.map((c) => {
          const esSeleccionada = c.id === selectedCategoriaId;
          return (
            <div
              key={`mob-cat-${c.id}`}
              onClick={() => onSelectCategoria(esSeleccionada ? null : c.id)}
              className={`p-3.5 space-y-2 transition cursor-pointer rounded-xl ${
                esSeleccionada ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-muted/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-semibold text-foreground text-xs">{c.nombre}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
                    {formatMoney(c.totalMonto, moneda)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {c.porcentaje}% del mes
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                <div className="flex items-center gap-2 text-[10px] flex-wrap">
                  {c.desgloseClasificacion.fijo > 0 && <span>Fijos: {formatMoney(c.desgloseClasificacion.fijo, moneda)}</span>}
                  {c.desgloseClasificacion.cuotas > 0 && <span>Cuotas: {formatMoney(c.desgloseClasificacion.cuotas, moneda)}</span>}
                  {c.desgloseClasificacion.variables > 0 && <span>Var: {formatMoney(c.desgloseClasificacion.variables, moneda)}</span>}
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {c.porcentajePagado}% pag.
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Matriz comparativa interactiva */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60 select-none">
            <tr>
              <th
                scope="col"
                onClick={() => handleSort('nombre')}
                className="py-2.5 px-3 font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <span>Categoría</span>
                  {renderSortIcon('nombre')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('fijo')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Fijos</span>
                  {renderSortIcon('fijo')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('prestamos')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Préstamos</span>
                  {renderSortIcon('prestamos')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('cuotas')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Cuotas</span>
                  {renderSortIcon('cuotas')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('variables')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Variables</span>
                  {renderSortIcon('variables')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('totalMonto')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Mes</span>
                  {renderSortIcon('totalMonto')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('porcentaje')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>% Mes</span>
                  {renderSortIcon('porcentaje')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('porcentajePagado')}
                className="py-2.5 px-3 text-center font-semibold cursor-pointer group/col hover:text-foreground"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>% Pagado</span>
                  {renderSortIcon('porcentajePagado')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {categoriasOrdenadas.map((c) => {
              const esSeleccionada = c.id === selectedCategoriaId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCategoria(esSeleccionada ? null : c.id)}
                  className={`transition cursor-pointer ${
                    esSeleccionada
                      ? 'bg-primary/5 ring-1 ring-primary/30 font-medium'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="font-semibold text-foreground text-xs">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {c.desgloseClasificacion.fijo > 0 ? formatMoney(c.desgloseClasificacion.fijo, moneda) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {c.desgloseClasificacion.prestamos > 0 ? formatMoney(c.desgloseClasificacion.prestamos, moneda) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {c.desgloseClasificacion.cuotas > 0 ? formatMoney(c.desgloseClasificacion.cuotas, moneda) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    {c.desgloseClasificacion.variables > 0 ? formatMoney(c.desgloseClasificacion.variables, moneda) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    {formatMoney(c.totalMonto, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                    {c.porcentaje}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {c.porcentajePagado}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
