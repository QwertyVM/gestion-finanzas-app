'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { CheckSquare, Square, Check } from 'lucide-react';
import { SelectorIngresoPill } from './SelectorIngresoPill';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface SeccionEgresoCardMobileProps {
  item: any;
  isSelected: boolean;
  moneda: string;
  ingresosMes?: any[];
  onAsignarIngreso?: (item: any, ingresoId: string | null) => Promise<void> | void;
  onSelectItem: (item: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onToggleEstadoItem: (item: any, nuevoEstado: string) => void;
}

export function SeccionEgresoCardMobile({
  item,
  isSelected,
  moneda,
  ingresosMes,
  onAsignarIngreso,
  onSelectItem,
  onToggleSelectGasto,
  onToggleEstadoItem,
}: SeccionEgresoCardMobileProps) {
  const isPagado = item.estado === 'PAGADO';
  const isAdelantado = item.estado === 'ADELANTADO';
  const esPrestamo = item.tipo === 'PRESTAMO' || item.clasificacion === 'PRESTAMO';
  const subtextoMobile = item.cuotaActual
    ? esPrestamo
      ? (item.banco || item.subtexto?.replace(/Cuota\s+\d+\/\d+\s*·?\s*/i, '').replace(/\s*\([^)]*\)/, '') || '')
      : (item.tarjetaNombre || item.subtexto?.replace(/·?\s*Cuota\s+\d+\/\d+/i, '') || '')
    : item.subtexto;

  return (
    <div
      onClick={() => onSelectItem(item)}
      className={`p-3.5 transition-colors cursor-pointer border-b border-border/40 last:border-b-0 space-y-2.5 ${
        isSelected ? 'bg-muted/50' : 'hover:bg-muted/20'
      }`}
    >
      {/* Fila 1: Checkbox + Concepto + Monto */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectGasto(item.id, item.monto);
            }}
            className="text-muted-foreground hover:text-foreground transition p-1 -m-1 inline-flex shrink-0 mt-0.5"
            aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-foreground" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground text-xs leading-snug line-clamp-1" title={item.concepto}>
              {limpiarConceptoCuota(item.concepto)}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 flex-wrap">
              <CategoriaTagBadge
                categoria={item.categoria}
                tag={item.tag}
                categoriaColor={item.categoriaColor}
              />
              {item.cuotaActual ? (
                <span
                  className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    esPrestamo
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                  }`}
                >
                  Cuota {item.cuotaActual}/{item.totalCuotas || item.cuotasTotales}
                </span>
              ) : null}
              {subtextoMobile && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="truncate">{subtextoMobile}</span>
                </>
              )}
              {ingresosMes && ingresosMes.length > 1 ? (
                <>
                  <span className="opacity-40">·</span>
                  <SelectorIngresoPill
                    ingresoId={item.ingresoId}
                    ingresos={ingresosMes}
                    onAsignar={(nuevoId) => onAsignarIngreso?.(item, nuevoId)}
                  />
                </>
              ) : item.ingresoConcepto ? (
                <>
                  <span className="opacity-40">·</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    💰 {item.ingresoConcepto}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-foreground text-xs tabular-nums block">
            {formatMoney(item.monto, moneda)}
          </span>
          {item.monedaOriginal === 'USD' && item.montoOriginal && (
            <span className="text-[10px] text-muted-foreground font-mono block">
              ${item.montoOriginal.toFixed(2)} USD
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Estado Badge + Botones Rápidos Pagar / Adelantar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isAdelantado
              ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40'
              : isPagado
                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAdelantado ? 'bg-indigo-500' : isPagado ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {isAdelantado ? 'Adelantado' : isPagado ? 'Pagado' : 'Pendiente'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
            className={`h-7 px-2.5 rounded-lg text-[11px] transition font-medium ${
              isAdelantado
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {isAdelantado ? 'Adelantado' : 'Adelantar'}
          </button>

          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
            className={`h-7 px-3 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 ${
              isPagado
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                : 'bg-foreground text-background hover:opacity-85 shadow-xs'
            }`}
          >
            {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
            <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
