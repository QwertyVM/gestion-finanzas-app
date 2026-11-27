'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ExecutiveTagsTable } from './ExecutiveTagsTable';

export interface EgresoItemTag {
  id: string;
  concepto: string;
  subtexto?: string | null;
  monto: number;
  clasificacion: string;
  badgeLabel: string;
  categoria: string;
  categoriaColor: string;
  estado: string;
  tag?: string | null;
  tarjetaId?: string | null;
}

interface ExecutiveTagsExplorerProps {
  egresos: EgresoItemTag[];
  filtroTagActivo: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  onFiltroTagChange: (tag: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE') => void;
  totalEgresosCount: number;
  moneda: string;
}

const TAG_STYLES: Record<string, { badge: string; dot: string }> = {
  FIJO: { badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60', dot: 'bg-sky-500' },
  PRESTAMO: { badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60', dot: 'bg-purple-500' },
  CUOTA: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60', dot: 'bg-indigo-500' },
  VARIABLE: { badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60', dot: 'bg-teal-500' },
};

export function ExecutiveTagsExplorer({
  egresos,
  filtroTagActivo,
  onFiltroTagChange,
  totalEgresosCount,
  moneda,
}: ExecutiveTagsExplorerProps) {
  const getStyle = (clasif: string) => TAG_STYLES[clasif] || TAG_STYLES.VARIABLE;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explorador de Transacciones por Tag
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filtra al instante tus egresos según su clasificación técnica.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-muted/60 rounded-lg text-xs font-medium self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => onFiltroTagChange('TODOS')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              filtroTagActivo === 'TODOS'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos ({totalEgresosCount})
          </button>
          <button
            type="button"
            onClick={() => onFiltroTagChange('FIJO')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              filtroTagActivo === 'FIJO'
                ? 'bg-sky-500 text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Fijos
          </button>
          <button
            type="button"
            onClick={() => onFiltroTagChange('PRESTAMO')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              filtroTagActivo === 'PRESTAMO'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Préstamos
          </button>
          <button
            type="button"
            onClick={() => onFiltroTagChange('CUOTA')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              filtroTagActivo === 'CUOTA'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Cuotas
          </button>
          <button
            type="button"
            onClick={() => onFiltroTagChange('VARIABLE')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              filtroTagActivo === 'VARIABLE'
                ? 'bg-teal-600 text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Variables
          </button>
        </div>
      </div>

      {/* Móvil: Lista de egresos por tag */}
      <div className="md:hidden divide-y divide-border/40">
        {egresos.map((item) => (
          <div key={`mob-tag-item-${item.id}`} className="p-3 space-y-1.5 hover:bg-muted/20 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getStyle(item.clasificacion).badge}`}>
                    {item.badgeLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.categoriaColor }}
                    />
                    <span className="truncate">{item.categoria}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-xs text-foreground truncate">{item.concepto}</h4>
                {item.subtexto && (
                  <div className="text-[11px] text-muted-foreground truncate">{item.subtexto}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
                  {formatMoney(item.monto, moneda)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium mt-1 ${
                    item.estado === 'PAGADO'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.estado === 'ADELANTADO'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ExecutiveTagsTable egresos={egresos} moneda={moneda} getStyle={getStyle} />
    </div>
  );
}
