'use client';

import React from 'react';
import { Info } from 'lucide-react';
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
    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Tarjeta:</span>
          <select
            value={tarjetaId}
            onChange={(e) => setTarjetaId(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
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
              className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground font-medium"
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
        <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>
              {previewTarjeta.esMesSiguiente
                ? `Compra posterior al corte (Día ${previewTarjeta.diaCorte}). Se liquida en:`
                : `Compra antes del corte (Día ${previewTarjeta.diaCorte}). Se liquida en:`}
            </span>
          </div>

          <div className="inline-block px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold capitalize text-[11px]">
            📅 {formatPeriodoLabel(previewTarjeta.periodoPago)}
          </div>

          {previewTarjeta.cuotasNum > 1 && (
            <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between font-medium text-foreground">
                <span>Monto por cuota:</span>
                <span className="font-mono">
                  {formatMoney(previewTarjeta.montoCuota, 'S/')} / mes
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {previewTarjeta.periodosCuotas.slice(0, 6).map((p, idx) => (
                  <span
                    key={p}
                    className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-foreground"
                  >
                    C{idx + 1}: {p}
                  </span>
                ))}
                {previewTarjeta.cuotasNum > 6 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{previewTarjeta.cuotasNum - 6} más...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
