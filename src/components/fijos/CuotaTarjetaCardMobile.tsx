'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Check } from 'lucide-react';

interface CuotaTarjetaCardMobileProps {
  c: any;
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (gastoId: string, nuevoEstado: string) => void;
}

export function CuotaTarjetaCardMobile({
  c,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
}: CuotaTarjetaCardMobileProps) {
  const isPagado = c.estado === 'PAGADO';
  const isAdelantado = c.estado === 'ADELANTADO';

  return (
    <div
      onClick={() =>
        onSelect({
          id: c.id,
          dbId: c.id,
          tipo: 'TARJETA',
          concepto: c.concepto,
          categoria: c.categoria,
          monto: c.monto,
          fechaGasto: c.fechaGasto,
          periodoPago: c.periodoPago,
          cuotaActual: c.cuotaActual,
          totalCuotas: c.totalCuotas,
          estado: c.estado,
          subtexto: `${c.tarjetaNombre} · Cuota ${c.cuotaActual}/${c.totalCuotas}`,
        })
      }
      className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2.5 hover:bg-muted/20 transition cursor-pointer"
    >
      {/* Fila 1: Tarjeta + Concepto + Monto */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: c.tarjetaColor || '#6366f1' }}
            />
            <span className="text-[11px] font-semibold text-foreground truncate">
              {c.tarjetaNombre}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              ({c.tarjetaBanco || 'Tarjeta'})
            </span>
          </div>
          <h4 className="font-semibold text-xs text-foreground truncate">{c.concepto}</h4>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {c.categoria || 'Sin categoría'}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
            {formatMoney(c.monto, moneda)}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded text-[10px] border border-indigo-200/50 inline-block mt-0.5">
            Cuota {c.cuotaActual}/{c.totalCuotas}
          </span>
        </div>
      </div>

      {/* Fila 2: Estado Badge + Acciones */}
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
            disabled={isLoading}
            onClick={() => onToggleEstado(c.id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
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
            disabled={isLoading}
            onClick={() => onToggleEstado(c.id, isPagado ? 'PENDIENTE' : 'PAGADO')}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 ${
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
