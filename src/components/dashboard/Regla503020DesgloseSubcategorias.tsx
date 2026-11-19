'use client';

import React from 'react';
import type { Subcategoria503020Item } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { X, Tag, Layers } from 'lucide-react';

interface Regla503020DesgloseSubcategoriasProps {
  titulo: string;
  subcategorias?: Subcategoria503020Item[];
  montoTotal: number;
  moneda: string;
  colorKey: 'sky' | 'teal' | 'purple';
  onCerrar: () => void;
}

export function Regla503020DesgloseSubcategorias({
  titulo,
  subcategorias = [],
  montoTotal,
  moneda,
  colorKey,
  onCerrar,
}: Regla503020DesgloseSubcategoriasProps) {
  const colorStyles = {
    sky: {
      border: 'border-sky-200 dark:border-sky-900/60',
      bg: 'bg-sky-50/40 dark:bg-sky-950/20',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/50',
      accent: 'text-sky-700 dark:text-sky-300',
    },
    teal: {
      border: 'border-teal-200 dark:border-teal-900/60',
      bg: 'bg-teal-50/40 dark:bg-teal-950/20',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300/50',
      accent: 'text-teal-700 dark:text-teal-300',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-900/60',
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/50',
      accent: 'text-purple-700 dark:text-purple-300',
    },
  }[colorKey];

  return (
    <div
      className={`p-3.5 rounded-xl border ${colorStyles.border} ${colorStyles.bg} space-y-3 animate-in fade-in duration-200`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className={`w-3.5 h-3.5 ${colorStyles.accent}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${colorStyles.accent}`}>
            {titulo}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            ({subcategorias.length} {subcategorias.length === 1 ? 'subcategoría' : 'subcategorías'})
          </span>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
          title="Cerrar desglose"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {subcategorias.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          No hay subcategorías registradas en este bloque.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {subcategorias.map((sub) => (
            <div
              key={sub.tag}
              className="p-2 rounded-lg bg-card/80 border border-border/60 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate block">
                    #{sub.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {sub.conteo} {sub.conteo === 1 ? 'ítem' : 'ítems'} · {sub.porcentaje}%
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs text-foreground shrink-0 tabular-nums">
                {formatMoney(sub.monto, moneda)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
