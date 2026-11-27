'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Check, Pencil, Trash2 } from 'lucide-react';

interface PrestamoCardMobileProps {
  p: any;
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado?: (cuotaId: string, nuevoEstado: string) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamoCardMobile({
  p,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: PrestamoCardMobileProps) {
  const isPagado = p.estado === 'PAGADO';
  const isAdelantado = p.estado === 'ADELANTADO';

  return (
    <div
      onClick={() =>
        onSelect({
          id: `prestamo-${p.cuotaId}`,
          dbId: p.cuotaId,
          prestamoId: p.id,
          tipo: 'PRESTAMO',
          concepto: `${p.banco} - ${p.concepto}`,
          categoria: 'Préstamo',
          monto: p.montoCuota,
          monedaOriginal: p.monedaOriginal,
          montoOriginal: p.montoOriginal,
          tipoCambio: p.tipoCambio,
          cuotaActual: p.cuotaActual,
          cuotasTotales: p.cuotasTotales,
          diaVencimiento: p.diaPago,
          estado: p.estado,
          subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} (${p.banco})`,
        })
      }
      className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2.5 hover:bg-muted/20 transition cursor-pointer"
    >
      {/* Fila 1: Banco + Concepto + Cuota */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">
              {p.banco}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              TEA: {p.tea ? `${p.tea}%` : 'N/A'}
            </span>
          </div>
          <h4 className="font-semibold text-xs text-foreground truncate">{p.concepto}</h4>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums block">
            {formatMoney(p.montoCuota, moneda)}
          </span>
          <span className="text-[10px] text-muted-foreground block">cuota mensual</span>
        </div>
      </div>

      {/* Fila 2: Progreso de amortización */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Cuota {p.cuotaActual} de {p.cuotasTotales}
          </span>
          <span className="font-mono">
            Saldo: {formatMoney(p.saldoPendiente || 0, moneda)}
          </span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${p.porcentajeProgreso || 0}%` }}
          />
        </div>
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
          {onToggleEstado && (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onToggleEstado(p.cuotaId, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
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
                onClick={() => onToggleEstado(p.cuotaId, isPagado ? 'PENDIENTE' : 'PAGADO')}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 ${
                  isPagado
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                    : 'bg-foreground text-background hover:opacity-85 shadow-xs'
                }`}
              >
                {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onEditarBase(p)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
            title="Editar préstamo"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEliminar(p.id, p.concepto)}
            className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition"
            title="Eliminar préstamo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
