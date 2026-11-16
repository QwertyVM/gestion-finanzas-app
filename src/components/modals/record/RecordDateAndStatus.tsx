'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import type { TipoRecordModal } from '@/context/FinanzasContext';

interface RecordDateAndStatusProps {
  tipoActivo: TipoRecordModal;
  fecha: string;
  setFecha: (f: string) => void;
  setQuickDate: (m: 'HOY' | 'AYER') => void;
  ingresoRecibido: boolean;
  setIngresoRecibido: (r: boolean) => void;
  estadoGasto: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO';
  setEstadoGasto: (e: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO') => void;
}

export function RecordDateAndStatus({
  tipoActivo,
  fecha,
  setFecha,
  setQuickDate,
  ingresoRecibido,
  setIngresoRecibido,
  estadoGasto,
  setEstadoGasto,
}: RecordDateAndStatusProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      {/* Fecha con botones de acceso rápido */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">Fecha:</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuickDate('HOY')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium transition cursor-pointer"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setQuickDate('AYER')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium transition cursor-pointer"
            >
              Ayer
            </button>
          </div>
        </div>

        <input
          type="date"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
        />
      </div>

      {/* Estado Inicial */}
      {tipoActivo === 'INGRESO' ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Estado:</label>
          <div className="grid grid-cols-2 gap-1.5 h-[34px]">
            <button
              type="button"
              onClick={() => setIngresoRecibido(true)}
              className={`rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1 cursor-pointer ${
                ingresoRecibido
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Recibido</span>
            </button>
            <button
              type="button"
              onClick={() => setIngresoRecibido(false)}
              className={`rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1 cursor-pointer ${
                !ingresoRecibido
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Esperado</span>
            </button>
          </div>
        </div>
      ) : tipoActivo === 'GASTO' ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Estado:</label>
          <div className="grid grid-cols-3 gap-1 h-[34px]">
            {(['PENDIENTE', 'ADELANTADO', 'PAGADO'] as const).map((est) => (
              <button
                key={est}
                type="button"
                onClick={() => setEstadoGasto(est)}
                className={`rounded-xl text-xs font-medium border transition capitalize cursor-pointer ${
                  estadoGasto === est
                    ? 'bg-foreground text-background border-foreground font-semibold'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {est.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
