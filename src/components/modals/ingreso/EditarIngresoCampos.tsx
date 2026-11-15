'use client';

import React from 'react';
import { formatPeriodoLabel } from '@/lib/utils';

interface EditarIngresoCamposProps {
  esSueldo: boolean;
  concepto: string;
  monto: string;
  fecha: string;
  recibido: boolean;
  moneda: string;
  periodoActual: string;
  modoSueldo: 'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO';
  periodoPersonalizado: string;
  onConceptoChange: (val: string) => void;
  onMontoChange: (val: string) => void;
  onFechaChange: (val: string) => void;
  onRecibidoChange: (val: boolean) => void;
  onModoSueldoChange: (val: 'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO') => void;
  onPeriodoPersonalizadoChange: (val: string) => void;
}

export function EditarIngresoCampos({
  esSueldo,
  concepto,
  monto,
  fecha,
  recibido,
  moneda,
  periodoActual,
  modoSueldo,
  periodoPersonalizado,
  onConceptoChange,
  onMontoChange,
  onFechaChange,
  onRecibidoChange,
  onModoSueldoChange,
  onPeriodoPersonalizadoChange,
}: EditarIngresoCamposProps) {
  const [y, m] = (periodoActual || '2026-11').split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  const proximoPeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-3.5 text-xs">
      <div>
        <label className="font-semibold text-foreground block mb-1">Concepto / Descripción</label>
        <input
          type="text"
          required
          disabled={esSueldo}
          value={concepto}
          onChange={(e) => onConceptoChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-foreground block mb-1">Monto ({moneda})</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={monto}
            onChange={(e) => onMontoChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Fecha Esperada</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground block mb-1.5">Estado del Ingreso</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRecibidoChange(false)}
            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
              !recibido
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            Por recibir
          </button>
          <button
            type="button"
            onClick={() => onRecibidoChange(true)}
            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
              recibido
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            Recibido
          </button>
        </div>
      </div>

      {esSueldo && (
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
          <label className="text-[11px] font-semibold text-foreground block">
            ¿A partir de qué mes aplicar el nuevo sueldo?
          </label>
          <select
            value={modoSueldo}
            onChange={(e) => onModoSueldoChange(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ACTUAL">A partir del mes actual ({formatPeriodoLabel(periodoActual)})</option>
            <option value="PROXIMO">A partir del próximo mes ({formatPeriodoLabel(proximoPeriodo)})</option>
            <option value="PERSONALIZADO">Personalizado...</option>
          </select>

          {modoSueldo === 'PERSONALIZADO' && (
            <input
              type="month"
              value={periodoPersonalizado}
              onChange={(e) => onPeriodoPersonalizadoChange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium"
            />
          )}
        </div>
      )}
    </div>
  );
}
