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
  handleAddAmount: (amt: number) => void;
  handleClearAmount: () => void;
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
  handleAddAmount,
  handleClearAmount,
}: RecordAmountSectionProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-secondary/35 border border-border/80 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex p-0.5 rounded-lg bg-background border border-border shadow-xs">
          <button
            type="button"
            onClick={() => setMoneda('PEN')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              moneda === 'PEN'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            S/ Soles
          </button>
          <button
            type="button"
            onClick={() => setMoneda('USD')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              moneda === 'USD'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            $ USD
          </button>
        </div>

        {montoInput && (
          <button
            type="button"
            onClick={handleClearAmount}
            className="px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-md transition cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <span className="text-2xl sm:text-3xl font-mono font-semibold text-muted-foreground">
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
          className="w-48 sm:w-60 text-3xl sm:text-4xl font-mono font-bold tracking-tight text-center bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 focus:border-b-2 focus:border-foreground"
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
        {[10, 20, 50, 100, 200].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleAddAmount(amt)}
            className="px-2.5 py-1 text-xs font-semibold font-mono rounded-lg bg-background border border-border/80 hover:border-foreground/40 text-foreground transition active:scale-95 shadow-xs cursor-pointer"
          >
            +{amt}
          </button>
        ))}
      </div>

      {moneda === 'USD' && (
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground px-2">
          <div className="flex items-center gap-1.5">
            <span>Tipo de Cambio:</span>
            <input
              type="number"
              step="0.01"
              value={tipoCambioInput}
              onChange={(e) => setTipoCambioInput(e.target.value)}
              className="w-16 px-1.5 py-0.5 font-mono text-center rounded bg-background border border-border text-foreground font-semibold"
            />
          </div>
          <div className="font-mono">
            <span>Equivale a: </span>
            <span className="font-bold text-foreground">S/ {montoSoles.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
