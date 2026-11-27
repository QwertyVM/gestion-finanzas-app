'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ModalConfirmarEliminarCompraProps {
  compra: any | null;
  moneda: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmar: () => void;
}

export function ModalConfirmarEliminarCompra({
  compra,
  moneda,
  isDeleting,
  onClose,
  onConfirmar,
}: ModalConfirmarEliminarCompraProps) {
  if (!compra) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                Eliminar Compra Completa
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {compra.conceptoBase}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs space-y-1.5 text-rose-900 dark:text-rose-200">
          <p className="font-semibold">Esta acción eliminará toda la serie diferida:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
            <li><strong>{compra.totalRegistrosEnDB} cuotas</strong> registradas en todos los periodos.</li>
            <li>Cuota mensual: <strong>{formatMoney(compra.montoCuota, moneda)}</strong>.</li>
            <li>Total financiado: <strong>{formatMoney(compra.montoTotal, moneda)}</strong> ({compra.tarjetaNombre}).</li>
          </ul>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Los registros de pagos pasados y futuros asociados a esta compra serán removidos permanentemente.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
