'use client';

import React from 'react';
import { limpiarConceptoCuota } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { SelectorIngresoPill } from './SelectorIngresoPill';

interface SeccionEgresoDetalleCellProps {
  item: any;
  subtextoLimpio?: string | null;
  ingresosMes?: any[];
  onAsignarIngreso?: (item: any, ingresoId: string | null) => Promise<void> | void;
}

export function SeccionEgresoDetalleCell({
  item,
  subtextoLimpio,
  ingresosMes,
  onAsignarIngreso,
}: SeccionEgresoDetalleCellProps) {
  const cleanTag = item.tag ? item.tag.replace(/^#+/, '').trim() : null;
  const cat = item.categoria || '';
  const is50 = cat.includes('50');
  const is30 = cat.includes('30');
  const is20 = cat.includes('20');
  const dotColorClass = is50
      ? 'bg-sky-500 ring-2 ring-sky-500/20'
      : is30
          ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
          : is20
        ?'bg-purple-500 ring-2 ring-purple-500/20'
        : 'bg-primary/60';

  const subtextoFiltrado = subtextoLimpio
    ? subtextoLimpio.replace(/·?\s*Fin de mes/i, '').replace(/^[·\s]+|[·\s]+$/g, '').trim()
    : null;

  return (
    <td className="py-2.5 px-3 min-w-0">
      {/* Línea 1: Nombre en font-bold + chip sutil de categoría */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-sm font-semibold text-foreground truncate max-w-[220px] md:max-w-xs"
          title={item.concepto}
        >
          {limpiarConceptoCuota(item.concepto)}
        </span>
        {cleanTag && (
            <span className="bg-muted/60 text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md border border-border/50 shrink-0 tracking-wide">
              #{cleanTag}
            </span>
        )}
          </div>

      {/* Línea 2: Dot sutil regla 50/30 + Metadatos operativos + Selector de cuenta */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-muted-foreground">
            {cat && (
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
                <span className="font-medium text-foreground/80">{cat}</span>
              </div>
            )}

              { subtextoFiltrado && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="truncate">{subtextoFiltrado}</span>
                </>
              )}

            {ingresosMes && ingresosMes.length > 1 ? (
              <>
                <span className="text-muted-foreground/30">•</span>
                <SelectorIngresoPill
                  ingresoId={item.ingresoId}
                  ingresos={ingresosMes}
                  onAsignar={(nuevoId) => onAsignarIngreso?.(item, nuevoId)}
                />
              </>
            ) : item.ingresoConcepto ? (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span className="inline-flex items-center gap-1 bg-secondary/70 border border-border/70 text-foreground text-[11px] font-medium px-2 py-0.5 rounded-lg shrink-0">
                  <Wallet className="w-3 h-3 text-primary" />
                  <span>{item.ingresoConcepto}</span>
                </span>
              </>
            ) : null}
          </div>
        </td>
        );
}
