'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { CheckSquare, Square, Check, Wallet } from 'lucide-react';
import { SelectorIngresoPill } from './SelectorIngresoPill';

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
    <div
      onClick={() => onSelectItem(item)}
          }`}
    >
      {/* Fila 1: Checkbox + Concepto + Chip Tag + Montos */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectGasto(item.id, item.monto);
            }}
            className="text-muted-foreground hover:text-foreground transition p-1 -m-1 inline-flex shrink-0 mt-0.5"
            aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${ item.concepto } `}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-foreground" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className="font-bold text-foreground text-sm leading-snug line-clamp-1"
                title={item.concepto}
              >
                {limpiarConceptoCuota(item.concepto)}
              </h4>
              {cleanTag && (
                <span className="bg-secondary text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border/60 shrink-0">
                  #{cleanTag}
                </span>
              )}
            </div>

            {/* Metadatos en Línea 2 */}
            <div className="flex items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground mt-1 flex-wrap">
              {cat && (
                <div className="inline-flex items-center gap-1 shrink-0">
                  <span className={`w - 1.5 h - 1.5 rounded - full shrink - 0 ${ dotColorClass } `} />
                  <span className="font-medium text-foreground/80">{cat}</span>
                </div>
              )}

              {item.cuotaActual ? (
                <>
                  <span className="opacity-40">•</span>
                  <span
                    className={`text - [10px] font - semibold font - mono px - 1.5 py - 0.5 rounded border shrink - 0 ${
    esPrestamo
      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40'
      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
  } `}
                  >
                    Cuota {item.cuotaActual}/{item.totalCuotas || item.cuotasTotales}
                  </span>
                </>
              ) : null}

              {subtextoMobile && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="truncate">{subtextoMobile}</span>
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
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-foreground text-sm tabular-nums block">
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
      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-border/40"
        onClick={(e) => e.stopPropagation()}
      >
        <span
    className = {`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${isAdelantado
          ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20'
          : isPagado
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
          }`
  }
        >
    <span
      className={`w-1.5 h-1.5 rounded-full ${isAdelantado ? 'bg-indigo-500' : isPagado ? 'bg-emerald-500' : 'bg-amber-500'
        }`}
    />
  { isAdelantado ? 'Adelantado' : isPagado ? 'Pagado' : 'Pendiente' }
        </span >

    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onToggleEstadoItem(item, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            {isAdelantado ? 'Adelantado' : 'Adelantar'}
          </button>

          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
        className = {`h-7 px-3 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer ${isPagado
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20'
              : 'bg-primary text-primary-foreground hover:opacity-90 shadow-2xs'
          }`}
          >
      {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
      <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
    </button>
        </div >
      </div >
    </div >
  );
}
