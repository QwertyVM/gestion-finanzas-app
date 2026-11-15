'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Pencil, Check, X, DollarSign } from 'lucide-react';

interface DetalleMontoHeroProps {
  monto: number;
  monedaSimbolo?: string;
  monedaOriginal?: string;
  montoOriginal?: number | null;
  tipoCambio?: number;
  editandoMonto: boolean;
  montoEditInput: string;
  savingMonto: boolean;
  modoEdicion: 'SOLES' | 'DOLARES';
  montoUsdEdit: string;
  tcEdit: string;
  permitirEditar?: boolean;
  onStartEditMonto: () => void;
  onCancelEditMonto: () => void;
  onChangeMontoInput: (val: string) => void;
  onChangeModoEdicion: (modo: 'SOLES' | 'DOLARES') => void;
  onChangeMontoUsd: (val: string) => void;
  onChangeTc: (val: string) => void;
  onGuardarMonto: () => void;
}

export function DetalleMontoHero({
  monto,
  monedaSimbolo = 'S/',
  monedaOriginal,
  montoOriginal,
  tipoCambio = 4.0,
  editandoMonto,
  montoEditInput,
  savingMonto,
  modoEdicion,
  montoUsdEdit,
  tcEdit,
  permitirEditar = true,
  onStartEditMonto,
  onCancelEditMonto,
  onChangeMontoInput,
  onChangeModoEdicion,
  onChangeMontoUsd,
  onChangeTc,
  onGuardarMonto,
}: DetalleMontoHeroProps) {
  const isUsd = monedaOriginal === 'USD' || (montoOriginal !== undefined && montoOriginal !== null);

  return (
    <div className="bg-muted/30 border border-border/70 rounded-xl p-4 transition-all">
      {!editandoMonto ? (
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums">
                {formatMoney(monto, monedaSimbolo)}
              </span>
              {isUsd && montoOriginal && (
                <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                  ${montoOriginal.toFixed(2)} USD (TC S/ {tipoCambio.toFixed(2)})
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Monto programado para este mes
            </span>
          </div>

          {permitirEditar && (
            <button
              type="button"
              onClick={onStartEditMonto}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 transition"
              title="Modificar monto de este mes"
            >
              <Pencil className="w-3 h-3" />
              <span>Modificar</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Selector de modo */}
          <div className="inline-flex items-center p-0.5 bg-background rounded-lg border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => onChangeModoEdicion('SOLES')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                modoEdicion === 'SOLES'
                  ? 'bg-foreground text-background shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              En Soles ({monedaSimbolo})
            </button>
            <button
              type="button"
              onClick={() => onChangeModoEdicion('DOLARES')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                modoEdicion === 'DOLARES'
                  ? 'bg-foreground text-background shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              En Dólares ($ USD)
            </button>
          </div>

          {modoEdicion === 'SOLES' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground font-mono">{monedaSimbolo}</span>
              <input
                type="number"
                step="0.01"
                autoFocus
                value={montoEditInput}
                onChange={(e) => onChangeMontoInput(e.target.value)}
                className="w-32 px-2.5 py-1 rounded-md bg-background border border-border font-mono font-bold text-foreground text-base outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                disabled={savingMonto}
                onClick={onGuardarMonto}
                className="h-8 px-3 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savingMonto ? '...' : 'Guardar'}</span>
              </button>
              <button
                type="button"
                onClick={onCancelEditMonto}
                className="h-8 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Monto en $ USD</label>
                  <input
                    type="number"
                    step="0.01"
                    value={montoUsdEdit}
                    onChange={(e) => onChangeMontoUsd(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2 py-1 rounded-md bg-background border border-border font-mono text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Tipo de Cambio (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tcEdit}
                    onChange={(e) => onChangeTc(e.target.value)}
                    placeholder="4.00"
                    className="w-full px-2 py-1 rounded-md bg-background border border-border font-mono text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  Total: <strong className="text-foreground font-mono">S/ {((parseFloat(montoUsdEdit) || 0) * (parseFloat(tcEdit) || 4.0)).toFixed(2)}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={savingMonto}
                    onClick={onGuardarMonto}
                    className="h-7 px-3 rounded-md bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Aplicar</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEditMonto}
                    className="h-7 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
