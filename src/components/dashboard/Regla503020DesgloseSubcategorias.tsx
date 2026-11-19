'use client';

import React from 'react';
import type { Subcategoria503020Item } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { X, Tag, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface Regla503020DesgloseSubcategoriasProps {
  titulo: string;
  subcategorias?: Subcategoria503020Item[];
  montoTotal: number;
  moneda: string;
  colorKey: 'sky' | 'teal' | 'purple';
  onCerrar: () => void;
  onAsignarSuperavit?: (monto: number) => void;
}

export function Regla503020DesgloseSubcategorias({
  titulo,
  subcategorias = [],
  montoTotal,
  moneda,
  colorKey,
  onCerrar,
  onAsignarSuperavit,
}: Regla503020DesgloseSubcategoriasProps) {
  const colorStyles = {
    sky: {
      border: 'border-sky-200 dark:border-sky-900/60',
      bg: 'bg-sky-50/40 dark:bg-sky-950/20',
      accent: 'text-sky-700 dark:text-sky-300',
    },
    teal: {
      border: 'border-teal-200 dark:border-teal-900/60',
      bg: 'bg-teal-50/40 dark:bg-teal-950/20',
      accent: 'text-teal-700 dark:text-teal-300',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-900/60',
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      accent: 'text-purple-700 dark:text-purple-300',
    },
  }[colorKey];

  const itemSuperavit = subcategorias.find((s) => s.esSuperavit || s.tag.toLowerCase().includes('superávit'));
  const otrasSubcategorias = subcategorias.filter((s) => !s.esSuperavit && !s.tag.toLowerCase().includes('superávit'));

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

      {/* Banner Especial de Superávit no asignado */}
      {itemSuperavit && (
        <div className="p-3 rounded-lg border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  Superávit / Disponible Neto
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  {itemSuperavit.porcentaje}% del bloque · Liquidez Libre
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Capital no gastado. Asígnalo a tu Fondo de Emergencia, Inversiones o Prepagar Deuda para evitar fugas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <span className="font-mono font-bold text-sm text-foreground tabular-nums">
              {formatMoney(itemSuperavit.monto, moneda)}
            </span>
            {onAsignarSuperavit && (
              <button
                type="button"
                onClick={() => onAsignarSuperavit(itemSuperavit.monto)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer"
                title="Crear registro de ahorro o inversión con este monto"
              >
                <span>Asignar a Meta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Otras Subcategorías estructuradas */}
      {otrasSubcategorias.length === 0 && !itemSuperavit ? (
        <p className="text-xs text-muted-foreground italic py-1">
          No hay subcategorías registradas en este bloque.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {otrasSubcategorias.map((sub) => (
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
