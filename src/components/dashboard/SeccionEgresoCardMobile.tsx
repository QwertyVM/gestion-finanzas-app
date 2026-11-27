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

  const subtextoFiltradoMobile = subtextoMobile
    ? subtextoMobile.replace(/·?\s*Fin de mes/i, '').replace(/^[·\s]+|[·\s]+$/g, '').trim()
    : null;

  const cleanTag = item.tag ? item.tag.replace(/^#+/, '').trim() : null;
  const cat = item.categoria || '';
  const dotColorClass = cat.includes('50')
    ? 'bg-sky-500 ring-2 ring-sky-500/20'
    : cat.includes('30')
      ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
      : cat.includes('20')
        ? 'bg-purple-500 ring-2 ring-purple-500/20'
        : 'bg-primary/60';

  const estadoBadgeClass = isAdelantado
    ? 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/40'
    : isPagado
      ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40'
      : 'bg-amber-50/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40';

  return (
    <div
      onClick={() => onSelectItem(item)}
      className={`flex flex-col gap-3 p-4 border-b border-border transition-colors cursor-pointer hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''
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
            aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
          >
            {isSelected ? <CheckSquare className="w-4 h-4 text-foreground" /> : <Square className="w-4 h-4" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-1" title={item.concepto}>
                {limpiarConceptoCuota(item.concepto)}
              </h4>
              {cleanTag && (
                <span className="bg-muted/60 text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md border border-border/50 shrink-0 tracking-wide">
                  #{cleanTag}
                </span>
              )}
              {item.esSinIntereses && (
                <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                  0% Interés
                </span>
              )}
              {item.tarjetaNombre && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                  {item.tarjetaNombre}
                </span>
              )}
            </div>

            {/* Metadatos en Línea 2 */}
            <div className="flex items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground mt-1 flex-wrap">
              {cat && (
                <div className="inline-flex items-center gap-1 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
                  <span className="font-medium text-foreground/80">{cat}</span>
                </div>
              )}

              {item.cuotaActual ? (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span
                    className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded border shrink-0 ${esPrestamo
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/40'
                      }`}
                  >
                    Cuota {item.cuotaActual}/{item.totalCuotas || item.cuotasTotales}
                  </span>
                </>
              ) : null}

              {subtextoFiltradoMobile && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="truncate">{subtextoFiltradoMobile}</span>
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
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-foreground text-sm tabular-nums block">
            {formatMoney(item.monto, moneda)}
          </span>
          {item.monedaOriginal === 'USD' && item.montoOriginal && (
            <span className="text-[10px] text-muted-foreground font-mono block">
              {formatMoney(item.montoOriginal, '$')} USD
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Estado Badge + Botones Rápidos Pagar / Adelantar */}
      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-border/40"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${estadoBadgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAdelantado ? 'bg-indigo-500' : isPagado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isAdelantado ? 'Adelantado' : isPagado ? 'Pagado' : 'Pendiente'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition cursor-pointer border active:scale-95 ${isAdelantado
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50 font-semibold'
              : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 border-transparent'
              }`}
          >
            {isAdelantado ? 'Adelantado' : 'Adelantar'}
          </button>

          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
            className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer active:scale-95 ${isPagado
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100/60'
              : 'bg-primary text-primary-foreground hover:opacity-90 shadow-2xs'
              }`}
          >
            {isPagado && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
