'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Pencil, Trash2 } from 'lucide-react';

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
  onEditarBase,
  onEliminar,
}: PrestamoCardMobileProps) {
  const progreso = Math.round(((p.cuotaActual || 1) / (p.cuotasTotales || 1)) * 100);
  const esCompletado = progreso >= 100;
  const isUSD = p.monedaOriginal === 'USD';
  const cuotaUSD = p.montoOriginal != null ? p.montoOriginal : (p.montoCuota / (p.tipoCambio || 4.0));

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
          estado: 'PENDIENTE',
          subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} (${p.banco})`,
        })
      }
      className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2.5 hover:bg-muted/20 transition cursor-pointer"
    >
      {/* Fila 1: Banco + Concepto + Cuota */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">
              {p.banco}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {p.tasaInteresAnual}% TEA
            </span>
            <span className="text-[10px] text-muted-foreground">
              · Día {p.diaPago}
            </span>
          </div>
          <h4 className="font-semibold text-xs text-foreground truncate">{p.concepto}</h4>
        </div>

        <div className="text-right shrink-0">
          {isUSD ? (
            <div>
              <span className="font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums flex items-center justify-end gap-1">
                ${cuotaUSD.toFixed(2)}
                <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  USD
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground block font-mono">
                ≈ {formatMoney(p.montoCuota, moneda)}
              </span>
            </div>
          ) : (
            <div>
              <span className="font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums block">
                {formatMoney(p.montoCuota, moneda)}
              </span>
              <span className="text-[10px] text-muted-foreground block">cuota base</span>
            </div>
          )}
        </div>
      </div>

      {/* Fila 2: Progreso de amortización */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Cuota {p.cuotaActual} de {p.cuotasTotales}
          </span>
          <span className={`font-semibold ${esCompletado ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
            {esCompletado ? '100% Amortizado' : `${progreso}% amortizado`}
          </span>
        </div>
        <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              esCompletado
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-purple-600 dark:bg-purple-500'
            }`}
            style={{ width: `${Math.min(progreso, 100)}%` }}
          />
        </div>
      </div>

      {/* Fila 3: Acciones Base */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] text-muted-foreground font-mono">
          Total: {p.montoTotal ? formatMoney(p.montoTotal, moneda) : '—'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditarBase(p)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 hover:bg-muted text-foreground transition"
            title="Editar condiciones del préstamo"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onEliminar(p.id, p.concepto)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 transition"
            title="Eliminar préstamo base"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
