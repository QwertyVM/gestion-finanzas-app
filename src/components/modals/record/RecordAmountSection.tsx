'use client';

import React from 'react';

interface RecordAmountSectionProps {
  moneda: 'PEN' | 'USD';
  setMoneda: (m: 'PEN' | 'USD') => void;
  montoInput: string;
  setMontoInput: (val: string) => void;
  tipoCambioInput: string;
  setTipoCambioInput: (val: string) => void;
  montoSoles: number;
  amountInputRef: React.RefObject<HTMLInputElement | null>;
  handleAddAmount?: (amt: number) => void;
  handleClearAmount?: () => void;
}

export function RecordAmountSection({
  moneda,
  setMoneda,
  montoInput,
  setMontoInput,
  tipoCambioInput,
  setTipoCambioInput,
  montoSoles,
  amountInputRef,
}: RecordAmountSectionProps) {
  return (
    <div className="py-4 px-4 sm:px-6 rounded-2xl bg-secondary/25 border border-border/70 text-center space-y-2.5">
      {/* Toggle de Moneda Minimalista */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-0.5 rounded-lg bg-background border border-border/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setMoneda('PEN')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              moneda === 'PEN'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            S/ Soles
          </button>
          <button
            type="button"
            onClick={() => setMoneda('USD')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              moneda === 'USD'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            $ USD
          </button>
        </div>
      </div>

      {/* Input de Monto Hero Limpio */}
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-3xl sm:text-4xl font-mono font-medium text-muted-foreground/70 select-none">
          {moneda === 'PEN' ? 'S/' : '$'}
        </span>
        <input
          ref={amountInputRef}
          type="number"
          step="0.01"
          inputMode="decimal"
          required
          placeholder="0.00"
          value={montoInput}
          onChange={(e) => setMontoInput(e.target.value)}
          className="w-48 sm:w-64 text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-center bg-transparent outline-none text-foreground placeholder:text-muted-foreground/20"
        />
      </div>

      {/* Tipo de cambio compacto sólo si es USD */}
      {moneda === 'USD' && (
        <div className="pt-2 border-t border-border/40 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>TC:</span>
            <input
              type="number"
              step="0.01"
              value={tipoCambioInput}
              onChange={(e) => setTipoCambioInput(e.target.value)}
              className="w-14 px-1 py-0.5 font-mono text-center rounded bg-background border border-border text-foreground font-semibold"
            />
          </div>
          <span className="text-border">·</span>
          <div className="font-mono">
            <span>Equivale a: </span>
            <strong className="text-foreground">S/ {montoSoles.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
