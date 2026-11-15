'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

interface SimuladorConfigPanelProps {
  prestamos: any[];
  prestamoSeleccionadoId: string;
  prestamo: any;
  resultado: any;
  moneda: string;
  montoPrepago: string;
  tasaTEA: string;
  onSelectPrestamo: (id: string) => void;
  onMontoPrepagoChange: (val: string) => void;
  onTasaTEAChange: (val: string) => void;
}

export function SimuladorConfigPanel({
  prestamos,
  prestamoSeleccionadoId,
  prestamo,
  resultado,
  moneda,
  montoPrepago,
  tasaTEA,
  onSelectPrestamo,
  onMontoPrepagoChange,
  onTasaTEAChange,
}: SimuladorConfigPanelProps) {
  return (
    <div className="lg:col-span-1 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Datos del Préstamo
      </h2>

      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Préstamo:</label>
          <select
            value={prestamoSeleccionadoId}
            onChange={(e) => onSelectPrestamo(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
          >
            {prestamos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.banco} - {p.concepto}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cuota mensual:</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(prestamo.montoCuota, moneda)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Progreso:</span>
            <span className="font-medium text-foreground">
              Cuota {prestamo.cuotaActual}/{prestamo.cuotasTotales}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cuotas restantes:</span>
            <span className="text-foreground">
              {resultado?.cuotasRestantes} cuotas
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Saldo capital aprox.:</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(resultado?.saldoActualAproximado, moneda)}
            </span>
          </div>
        </div>

        {/* Monto a Prepagar */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <label className="font-medium text-muted-foreground">
            Monto a Prepagar ({moneda}):
          </label>
          <input
            type="number"
            step="100"
            value={montoPrepago}
            onChange={(e) => onMontoPrepagoChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-sm"
          />

          <div className="grid grid-cols-3 gap-1 pt-1">
            {['1000', '2000', '3500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onMontoPrepagoChange(val)}
                className="py-1 px-1 text-[11px] font-medium bg-muted/60 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition text-center"
              >
                {moneda} {val}
              </button>
            ))}
          </div>
        </div>

        {/* Tasa TEA */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">
            Tasa Anual Estimada (TEA %):
          </label>
          <input
            type="number"
            step="0.1"
            value={tasaTEA}
            onChange={(e) => onTasaTEAChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground text-xs"
          />
        </div>
      </div>
    </div>
  );
}
