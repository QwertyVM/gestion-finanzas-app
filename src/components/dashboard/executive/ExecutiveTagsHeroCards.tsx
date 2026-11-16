'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

export interface ClasificacionStats {
  id: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  nombre: string;
  badgeLabel: string;
  total: number;
  totalPagado: number;
  totalPendiente: number;
  porcentaje: number;
  conteo: number;
  ticketPromedio: number;
  colorHex: string;
}

interface ExecutiveTagsHeroCardsProps {
  clasificaciones: ClasificacionStats[];
  filtroTagActivo: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  onFiltroTagChange: (tag: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE') => void;
  moneda: string;
}

const TAG_STYLES: Record<string, string> = {
  FIJO: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
  PRESTAMO: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
  CUOTA: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
  VARIABLE: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
};

export function ExecutiveTagsHeroCards({
  clasificaciones,
  filtroTagActivo,
  onFiltroTagChange,
  moneda,
}: ExecutiveTagsHeroCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {clasificaciones.map((tag) => (
        <div
          key={tag.id}
          onClick={() => onFiltroTagChange(filtroTagActivo === tag.id ? 'TODOS' : tag.id)}
          className={`rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
            filtroTagActivo === tag.id
              ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-primary'
              : 'bg-card border-border/80 hover:border-border hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${TAG_STYLES[tag.id]}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.colorHex }} />
                {tag.badgeLabel}
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {tag.porcentaje}% del total
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight font-mono text-foreground">
                {formatMoney(tag.total, moneda)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {tag.conteo} {tag.conteo === 1 ? 'operación' : 'operaciones'} · Promedio:{' '}
                <span className="font-mono">{formatMoney(tag.ticketPromedio, moneda)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Pagado: {formatMoney(tag.totalPagado, moneda)}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Pendiente: {formatMoney(tag.totalPendiente, moneda)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: tag.colorHex,
                  width: tag.total > 0 ? `${Math.round((tag.totalPagado / tag.total) * 100)}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
