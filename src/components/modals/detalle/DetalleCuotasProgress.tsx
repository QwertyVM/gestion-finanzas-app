'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { DetalleMetricCard } from './DetalleMetricCard';

interface DetalleCuotasProgressProps {
  cuotaActual: number;
  cuotasTotales: number;
  montoCuota: number;
  montoTotal?: number;
  monedaSimbolo?: string;
  esPrestamo?: boolean;
  onGuardarCuotaActual: (val: number) => Promise<void>;
  onGuardarCuotasTotales: (val: number) => Promise<void>;
  onGuardarCuotasRestantes: (numRestantes: number) => Promise<void>;
  onGuardarMontoTotal?: (montoTotal: number) => Promise<void>;
}

export function DetalleCuotasProgress({
  cuotaActual,
  cuotasTotales,
  montoCuota,
  montoTotal,
  monedaSimbolo = 'S/',
  esPrestamo = false,
  onGuardarCuotaActual,
  onGuardarCuotasTotales,
  onGuardarCuotasRestantes,
  onGuardarMontoTotal,
}: DetalleCuotasProgressProps) {
  const progreso = Math.round((cuotaActual / Math.max(cuotasTotales, 1)) * 100);
  const cuotasRestantes = Math.max(0, cuotasTotales - cuotaActual);

  return (
    <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Amortización de Cuotas</span>
        </span>
        <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/50">
          Cuota {cuotaActual} de {cuotasTotales} ({progreso}%)
        </span>
      </div>

      {/* Barra de Progreso */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progreso, 100)}%` }}
        />
      </div>

      {/* Grid de 4 Métricas */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <DetalleMetricCard
          label="Cuota actual"
          valueDisplay={`Cuota ${cuotaActual}`}
          initialInputValue={cuotaActual.toString()}
          min="1"
          onSave={async (v) => {
            const n = parseInt(v, 10);
            if (n >= 1) await onGuardarCuotaActual(n);
          }}
        />

        <DetalleMetricCard
          label="Total cuotas"
          valueDisplay={`${cuotasTotales} cuotas`}
          initialInputValue={cuotasTotales.toString()}
          min="1"
          onSave={async (v) => {
            const n = parseInt(v, 10);
            if (n >= 1) await onGuardarCuotasTotales(n);
          }}
        />

        <DetalleMetricCard
          label="Por pagar"
          valueDisplay={`${cuotasRestantes} cuotas`}
          initialInputValue={cuotasRestantes.toString()}
          min="0"
          onSave={async (v) => {
            const n = parseInt(v, 10);
            if (n >= 0) await onGuardarCuotasRestantes(n);
          }}
        />

        <DetalleMetricCard
          label="Monto total pactado"
          valueDisplay={formatMoney(montoTotal || montoCuota * cuotasTotales, monedaSimbolo)}
          initialInputValue={(montoTotal || montoCuota * cuotasTotales).toString()}
          step="0.01"
          min="0.01"
          canEdit={esPrestamo && Boolean(onGuardarMontoTotal)}
          onSave={async (v) => {
            const n = parseFloat(v);
            if (n > 0 && onGuardarMontoTotal) await onGuardarMontoTotal(n);
          }}
        />
      </div>
    </div>
  );
}
