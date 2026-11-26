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
    ? 'bg-primary'
    : is30
      ? 'bg-emerald-600'
      : is20
        ? 'bg-purple-600'
        : 'bg-primary';

  return (
    <td className="py-2.5 px-3 min-w-0">
      {/* Línea 1: Nombre en font-bold + chip sutil de categoría */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-sm font-bold text-foreground truncate max-w-[220px] md:max-w-xs"
          title={item.concepto}
        >
          {limpiarConceptoCuota(item.concepto)}
        </span>
        {cleanTag && (
          <span className="bg-secondary text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border/60 shrink-0">
            #{cleanTag}
          </span>
        )}
      </div>

      {/* Línea 2: Dot sutil regla 50/30 + Metadatos operativos + Selector de cuenta */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-muted-foreground">
        {cat && (
          <div className="inline-flex items-center gap-1.5 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
            <span className="font-medium text-foreground/80">{cat}</span>
          </div>
        )}

        {subtextoLimpio && (
          <>
            <span className="opacity-40">•</span>
            <span className="truncate">{subtextoLimpio}</span>
          </>
        )}

        {ingresosMes && ingresosMes.length > 1 ? (
          <>
            <span className="opacity-40">•</span>
            <SelectorIngresoPill
              ingresoId={item.ingresoId}
              ingresos={ingresosMes}
              onAsignar={(nuevoId) => onAsignarIngreso?.(item, nuevoId)}
            />
          </>
        ) : item.ingresoConcepto ? (
          <>
            <span className="opacity-40">•</span>
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
