'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { CategoriaAnalisisItem } from '@/lib/finanzas-service';

interface ExecutiveCategoriasMatrixProps {
  categorias: CategoriaAnalisisItem[];
  selectedCategoriaId: string | null;
  onSelectCategoria: (id: string | null) => void;
  moneda: string;
}

export function ExecutiveCategoriasMatrix({
  categorias,
  selectedCategoriaId,
  onSelectCategoria,
  moneda,
}: ExecutiveCategoriasMatrixProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Matriz Comparativa de Categorías
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Desglose analítico completo de fijos, cuotas, préstamos y variables por categoría.
        </p>
      </div>

      {/* Móvil: Lista de categorías */}
      <div className="md:hidden divide-y divide-border/40">
        {categorias.map((c) => (
          <div
            key={`mob-cat-${c.id}`}
            onClick={() => onSelectCategoria(c.id === selectedCategoriaId ? null : c.id)}
            className="p-3.5 space-y-2 hover:bg-muted/20 transition cursor-pointer"
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
                <span className="text-[10px] text-muted-foreground block">
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
        ))}
      </div>

      {/* Desktop: Matriz comparativa */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Fijos</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Préstamos</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Cuotas</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Variables</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Total Mes</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">% Mes</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">% Pagado</th>
            </tr>
          </thead>
          <tbody className="divide-y border-border/40">
            {categorias.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelectCategoria(c.id === selectedCategoriaId ? null : c.id)}
                className="hover:bg-muted/30 transition cursor-pointer"
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
