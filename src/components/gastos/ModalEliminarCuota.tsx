'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ModalEliminarCuotaProps {
  gasto: any | null;
  periodo: string;
  moneda: string;
  eliminando: boolean;
  onClose: () => void;
  onEliminarSoloMes: () => void;
  onEliminarTodaLaSerie: () => void;
}

export function ModalEliminarCuota({
  gasto,
  periodo,
  moneda,
  eliminando,
  onClose,
  onEliminarSoloMes,
  onEliminarTodaLaSerie,
}: ModalEliminarCuotaProps) {
  if (!gasto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              Eliminar Gasto en Cuotas
            </h3>
            <p className="text-xs text-muted-foreground">
              {gasto.concepto}
            </p>
          </div>
        </div>

        <p className="text-xs text-foreground/90 leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border">
          Este gasto forma parte de una compra en <strong>{gasto.totalCuotas} cuotas</strong> ({formatMoney(gasto.monto, moneda)}/mes). ¿Qué deseas eliminar?
        </p>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={eliminando}
            onClick={onEliminarSoloMes}
            className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-secondary text-foreground text-xs font-semibold flex items-center justify-between transition disabled:opacity-50"
          >
            <span>Eliminar SOLO la cuota de este mes ({formatPeriodoLabel(periodo)})</span>
            <span className="text-[10px] text-muted-foreground font-normal">Conserva los demás meses</span>
          </button>

          <button
            type="button"
            disabled={eliminando}
            onClick={onEliminarTodaLaSerie}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-between shadow-xs transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Eliminar TODA la compra completa</span>
            </div>
            <span className="text-[10px] text-rose-100 font-medium">Todas las cuotas de todos los meses</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={eliminando}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
