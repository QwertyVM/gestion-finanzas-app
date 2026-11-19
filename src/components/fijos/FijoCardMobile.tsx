'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { FijoMetodoPagoSelector } from './FijoMetodoPagoSelector';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface FijoCardMobileProps {
  cf: any;
  tarjetas: any[];
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (id: string, nuevoEstado: string) => void;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
  onEditarBase: (cf: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function FijoCardMobile({
  cf,
  tarjetas,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijoCardMobileProps) {
  const isPagado = cf.estado === 'PAGADO';
  const isAdelantado = cf.estado === 'ADELANTADO';

  return (
    <div
      onClick={() =>
        onSelect({
          id: `fijo-${cf.id}`,
          dbId: cf.id,
          tipo: 'FIJO',
          concepto: cf.concepto,
          categoria: cf.categoria,
          categoriaId: cf.categoriaId || null,
          tag: cf.tag || null,
          monto: cf.monto,
          monedaOriginal: cf.monedaOriginal,
          montoOriginal: cf.montoOriginal,
          tipoCambio: cf.tipoCambio,
          diaVencimiento: cf.diaVencimiento,
          estado: cf.estado,
          fechaPagoReal: cf.fechaPagoReal,
          subtexto: cf.metodoPago === 'TARJETA_CREDITO' ? 'Tarjeta de Crédito' : cf.metodoPago === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo / Débito',
        })
      }
      className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2.5 hover:bg-muted/20 transition cursor-pointer"
    >
      {/* Fila 1: Concepto + Monto */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-foreground truncate">{cf.concepto}</h4>
          <div className="mt-1">
            <CategoriaTagBadge
              categoria={cf.categoria}
              tag={cf.tag}
              categoriaColor={cf.categoriaColor}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
            <span>{cf.mesFin ? `Hasta ${formatPeriodoLabel(cf.mesFin)}` : 'Indefinido'}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
            {formatMoney(cf.monto, moneda)}
          </span>
          {cf.monedaOriginal === 'USD' && cf.montoOriginal && (
            <span className="text-[10px] text-muted-foreground font-mono block">
              ${cf.montoOriginal.toFixed(2)} USD
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Selector Forma de Pago */}
      <div className="flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-muted-foreground font-medium">Forma de pago:</span>
        <FijoMetodoPagoSelector
          costoFijoId={cf.id}
          metodoPago={cf.metodoPago}
          tarjetaId={cf.tarjetaId}
          tarjetas={tarjetas}
          onCambiarMetodoPago={onCambiarMetodoPago}
        />
      </div>

      {/* Fila 3: Estado Badge + Acciones */}
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
            onClick={() => onToggleEstado(cf.id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
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
            onClick={() => onToggleEstado(cf.id, isPagado ? 'PENDIENTE' : 'PAGADO')}
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
            onClick={() => onEditarBase(cf)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
            title="Editar costo fijo"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEliminar(cf.id, cf.concepto)}
            className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition"
            title="Eliminar costo fijo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
