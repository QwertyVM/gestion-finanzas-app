'use client';

import React from 'react';
import { Clock, FastForward, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DetalleEstadoSelectorProps {
  estado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO';
  fechaPagoReal?: string | null;
  updating: boolean;
  onCambiarEstado: (nuevoEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO') => void;
}

export function DetalleEstadoSelector({
  estado,
  fechaPagoReal,
  updating,
  onCambiarEstado,
}: DetalleEstadoSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Estado del Pago
        </span>
        {fechaPagoReal && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Liquidado el {new Date(fechaPagoReal).toLocaleDateString('es-PE')}</span>
          </span>
        )}
      </div>

      <div className="bg-muted/50 p-1 rounded-xl border border-border/60 grid grid-cols-3 gap-1">
        <button
          type="button"
          disabled={updating}
          onClick={() => onCambiarEstado('PENDIENTE')}
          className={`h-8 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            estado === 'PENDIENTE'
              ? 'bg-background text-amber-700 dark:text-amber-400 font-semibold shadow-2xs border border-amber-200/50 dark:border-amber-900/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendiente</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onCambiarEstado('ADELANTADO')}
          className={`h-8 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            estado === 'ADELANTADO'
              ? 'bg-background text-indigo-700 dark:text-indigo-400 font-semibold shadow-2xs border border-indigo-200/50 dark:border-indigo-900/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Adelantado</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onCambiarEstado('PAGADO')}
          className={`h-8 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            estado === 'PAGADO'
              ? 'bg-background text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs border border-emerald-200/50 dark:border-emerald-900/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Pagado</span>
        </button>
      </div>
    </div>
  );
}
