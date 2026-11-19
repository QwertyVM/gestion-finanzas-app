'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { CheckSquare, Square, Check, Trash2 } from 'lucide-react';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface GastoMesCardMobileProps {
  gasto: any;
  isSelected: boolean;
  moneda: string;
  onSelectRow: (gasto: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onCambiarEstadoItem: (id: string, nuevoEstado: string) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastoMesCardMobile({
  gasto,
  isSelected,
  moneda,
  onSelectRow,
  onToggleSelectGasto,
  onCambiarEstadoItem,
  onClickTrash,
}: GastoMesCardMobileProps) {
  const fechaObj = new Date(gasto.fechaGasto);
  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
  const esCuota = (gasto.totalCuotas || 1) > 1;
  const isPagado = gasto.estado === 'PAGADO';
  const isAdelantado = gasto.estado === 'ADELANTADO';

  return (
    <div
      onClick={() => onSelectRow(gasto)}
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
              onToggleSelectGasto(gasto.id, gasto.monto);
            }}
            className="text-muted-foreground hover:text-foreground transition p-1 -m-1 inline-flex shrink-0 mt-0.5"
            aria-label={isSelected ? `Deseleccionar ${gasto.concepto}` : `Seleccionar ${gasto.concepto}`}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-foreground" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground text-xs leading-snug line-clamp-1" title={gasto.concepto}>
              {limpiarConceptoCuota(gasto.concepto)}
            </h4>
            <div className="mt-1">
              <CategoriaTagBadge
                categoria={gasto.categoria}
                tag={gasto.tag}
                categoriaColor={gasto.categoriaColor}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 flex-wrap">
              <span className="font-mono">{fechaFormateada}</span>
              {gasto.ingresoConcepto && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    💰 {gasto.ingresoConcepto}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-foreground text-xs tabular-nums block">
            {formatMoney(gasto.monto, moneda)}
          </span>
          {esCuota && (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded text-[10px] border border-indigo-200/50 inline-block mt-0.5">
              Cuota {gasto.cuotaActual}/{gasto.totalCuotas}
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Método de Pago + Estado Badge + Acciones */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 flex-wrap">
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

          {gasto.metodoPago === 'TARJETA_CREDITO' ? (
            <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: gasto.tarjetaColor || '#6366f1' }}
              />
              <span className="truncate max-w-[100px]">{gasto.tarjetaNombre || 'Tarjeta'}</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              {gasto.metodoPago === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo / Débito'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onCambiarEstadoItem(gasto.id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')
            }
            className={`h-7 px-2 rounded-lg text-[11px] transition font-medium ${
              isAdelantado
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {isAdelantado ? 'Adelantado' : 'Adelantar'}
          </button>

          <button
            type="button"
            onClick={() =>
              onCambiarEstadoItem(gasto.id, isPagado ? 'PENDIENTE' : 'PAGADO')
            }
            className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 ${
              isPagado
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                : 'bg-foreground text-background hover:opacity-85 shadow-xs'
            }`}
          >
            {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
            <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
          </button>

          <button
            type="button"
            onClick={() => onClickTrash(gasto)}
            className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition"
            title="Eliminar gasto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
