'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { FijoMetodoPagoSelector } from './FijoMetodoPagoSelector';
import { Pencil, Trash2 } from 'lucide-react';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface FijoCardMobileProps {
  cf: any;
  tarjetas: any[];
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado?: (id: string, nuevoEstado: string) => void;
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
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijoCardMobileProps) {
  const isUSD = cf.monedaOriginal === 'USD';
  const montoUSD = cf.montoOriginal != null ? cf.montoOriginal : (cf.monto / (cf.tipoCambio || 4.0));

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
          estado: 'PENDIENTE',
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
            {cf.diaVencimiento && (
              <span>· Vence día {cf.diaVencimiento}</span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          {isUSD ? (
            <div>
              <span className="font-mono font-bold text-xs text-foreground tabular-nums flex items-center justify-end gap-1">
                ${montoUSD.toFixed(2)}
                <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  USD
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                ≈ {formatMoney(cf.monto, moneda)}
              </span>
            </div>
          ) : (
            <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
              {formatMoney(cf.monto, moneda)}
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Selector Forma de Pago Base */}
      <div className="flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-muted-foreground font-medium">Forma de pago base:</span>
        <FijoMetodoPagoSelector
          costoFijoId={cf.id}
          metodoPago={cf.metodoPago}
          tarjetaId={cf.tarjetaId}
          tarjetas={tarjetas}
          disabled={isLoading}
          onCambiarMetodoPago={onCambiarMetodoPago}
        />
      </div>

      {/* Fila 3: Acciones Base (Plantilla Concurrente) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Plantilla concurrente
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditarBase(cf)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition"
            title="Editar costo fijo base"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onEliminar(cf.id, cf.concepto)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 transition"
            title="Eliminar costo fijo base"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
