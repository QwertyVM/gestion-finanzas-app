'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { EgresoItemTag } from './ExecutiveTagsExplorer';

interface ExecutiveTagsTableProps {
  egresos: EgresoItemTag[];
  moneda: string;
  getStyle: (clasif: string) => { badge: string; dot: string };
}

export function ExecutiveTagsTable({ egresos, moneda, getStyle }: ExecutiveTagsTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
          <tr>
            <th scope="col" className="py-2.5 px-3 font-medium">Tag</th>
            <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
            <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
            <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
            <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {egresos.map((item) => (
            <tr key={item.id} className="hover:bg-muted/30 transition">
              <td className="py-2.5 px-3 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStyle(item.clasificacion).badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStyle(item.clasificacion).dot}`} />
                  {item.badgeLabel}
                </span>
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.categoriaColor }}
                  />
                  <span className="font-medium text-foreground">{item.categoria}</span>
                </div>
              </td>
              <td className="py-2.5 px-3">
                <div className="font-semibold text-foreground text-xs">{item.concepto}</div>
                {item.subtexto && (
                  <div className="text-[11px] text-muted-foreground">{item.subtexto}</div>
                )}
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                {formatMoney(item.monto, moneda)}
              </td>
              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    item.estado === 'PAGADO'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.estado === 'ADELANTADO'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.estado === 'PAGADO'
                        ? 'bg-emerald-500'
                        : item.estado === 'ADELANTADO'
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                    }`}
                  />
                  {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
