'use client';

import React from 'react';
import { formatPeriodoLabel } from '@/lib/utils';

interface ConfigParametrosSectionProps {
  sueldoBase: string;
  setSueldoBase: (v: string) => void;
  modoSueldoVigencia: 'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO';
  setModoSueldoVigencia: (m: 'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO') => void;
  periodoPersonalizado: string;
  setPeriodoPersonalizado: (p: string) => void;
  tipoCambio: string;
  setTipoCambio: (tc: string) => void;
  metaAhorro: string;
  setMetaAhorro: (m: string) => void;
  diaPago: string;
  setDiaPago: (d: string) => void;
  savingConfig: boolean;
  onSubmit: (e: React.FormEvent) => void;
  periodo: string;
}

export function ConfigParametrosSection({
  sueldoBase,
  setSueldoBase,
  modoSueldoVigencia,
  setModoSueldoVigencia,
  periodoPersonalizado,
  setPeriodoPersonalizado,
  tipoCambio,
  setTipoCambio,
  metaAhorro,
  setMetaAhorro,
  diaPago,
  setDiaPago,
  savingConfig,
  onSubmit,
  periodo,
}: ConfigParametrosSectionProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Parámetros Base
      </h2>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Sueldo Base Mensual (S/):
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={sueldoBase}
              onChange={(e) => setSueldoBase(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
            />
            <div className="pt-1 space-y-1">
              <label className="text-[10px] text-muted-foreground block">
                Aplica a partir de:
              </label>
              <select
                value={modoSueldoVigencia}
                onChange={(e) => setModoSueldoVigencia(e.target.value as any)}
                className="w-full px-2 py-1 rounded bg-background border border-border text-[11px] text-foreground focus:outline-none"
              >
                <option value="ACTUAL">Mes actual ({formatPeriodoLabel(periodo)})</option>
                <option value="PROXIMO">Próximo mes</option>
                <option value="PERSONALIZADO">Personalizado...</option>
              </select>
              {modoSueldoVigencia === 'PERSONALIZADO' && (
                <input
                  type="month"
                  value={periodoPersonalizado}
                  onChange={(e) => setPeriodoPersonalizado(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-background border border-border text-[11px] text-foreground focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Tipo de Cambio USD:
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Meta de Ahorro (S/):
            </label>
            <input
              type="number"
              step="50"
              required
              value={metaAhorro}
              onChange={(e) => setMetaAhorro(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Día Pago Sueldo:
            </label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={diaPago}
              onChange={(e) => setDiaPago(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={savingConfig}
            className="py-1.5 px-4 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {savingConfig ? 'Guardando...' : 'Guardar Parámetros'}
          </button>
        </div>
      </form>
    </div>
  );
}
