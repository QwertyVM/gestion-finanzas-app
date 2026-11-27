'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import type { TipoRecordModal } from '@/context/FinanzasContext';

export interface TarjetaOption {
  id: string;
  nombre: string;
  diaCorte?: number;
  diaPago?: number;
}

export interface PreviewTarjetaInfo {
  esMesSiguiente: boolean;
  diaCorte: number;
  diaPago: number;
  periodoPago: string;
  cuotasNum: number;
  periodosCuotas: string[];
  montoCuota: number;
}

interface RecordCardFieldsProps {
  tarjetas: TarjetaOption[];
  tarjetaId: string;
  setTarjetaId: (id: string) => void;
  tipoActivo: TipoRecordModal;
  totalCuotas: string;
  setTotalCuotas: (c: string) => void;
  previewTarjeta: PreviewTarjetaInfo | null;
}

export function RecordCardFields({
  tarjetas,
  tarjetaId,
  setTarjetaId,
  tipoActivo,
  totalCuotas,
  setTotalCuotas,
  previewTarjeta,
}: RecordCardFieldsProps) {
  return (
    <div className="p-3 rounded-xl bg-secondary/35 border border-border/70 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Tarjeta:</span>
          <select
            value={tarjetaId}
            onChange={(e) => setTarjetaId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/80 text-foreground text-xs outline-none focus:border-foreground"
          >
            {tarjetas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} (Corte {t.diaCorte || 10})
              </option>
            ))}
          </select>
        </div>

        {tipoActivo === 'GASTO' && (
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Cuotas:</span>
            <select
              value={totalCuotas}
              onChange={(e) => setTotalCuotas(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/80 text-foreground text-xs outline-none focus:border-foreground font-medium"
            >
              <option value="1">1 cuota (Directo)</option>
              <option value="2">2 cuotas</option>
              <option value="3">3 cuotas</option>
              <option value="4">4 cuotas</option>
              <option value="6">6 cuotas</option>
              <option value="12">12 cuotas</option>
              <option value="18">18 cuotas</option>
              <option value="24">24 cuotas</option>
            </select>
          </div>
        )}
      </div>

      {previewTarjeta && (
        <div className="text-[11px] text-muted-foreground bg-background/60 p-2 rounded-lg border border-border/50 flex items-center justify-between">
          <span>Se liquidará en:</span>
          <strong className="text-foreground font-mono">
            Fin de {formatPeriodoLabel(previewTarjeta.periodoPago)}
          </strong>
        </div>
      )}
    </div>
  );
}
