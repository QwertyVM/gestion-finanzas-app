'use client';

import React from 'react';

interface FijoCurrencyAmountInputProps {
  moneda: 'PEN' | 'USD';
  setMoneda: (m: 'PEN' | 'USD') => void;
  monto: string;
  setMonto: (v: string) => void;
  montoUSD: string;
  setMontoUSD: (v: string) => void;
  tc: string;
  setTc: (v: string) => void;
  configTc: number;
}

export function FijoCurrencyAmountInput({
  moneda,
  setMoneda,
  monto,
  setMonto,
  montoUSD,
  setMontoUSD,
  tc,
  setTc,
  configTc,
}: FijoCurrencyAmountInputProps) {
  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-foreground">
            Moneda de Facturación:
          </label>
          <span className="text-[10px] text-muted-foreground">
            Se paga en Soles de tu presupuesto
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMoneda('PEN')}
            className={`py-1.5 px-3 rounded-xl font-bold border transition cursor-pointer ${
              moneda === 'PEN'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border'
            }`}
          >
            S/ Soles (PEN)
          </button>
          <button
            type="button"
            onClick={() => setMoneda('USD')}
            className={`py-1.5 px-3 rounded-xl font-bold border transition cursor-pointer ${
              moneda === 'USD'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border'
            }`}
          >
            $ Dólares (USD)
          </button>
        </div>
      </div>

      {moneda === 'PEN' ? (
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Monto Mensual (S/):
          </label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
          />
        </div>
      ) : (
        <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 space-y-1">
              <span className="text-[10px] font-bold text-amber-500">Monto USD ($):</span>
              <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                <span className="text-xs font-bold text-muted-foreground">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3.96"
                  value={montoUSD}
                  onChange={(e) => setMontoUSD(e.target.value)}
                  className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                />
              </div>
            </div>

            <div className="col-span-1 space-y-1">
              <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
              <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                <span className="text-xs font-bold text-muted-foreground">S/</span>
                <input
                  type="number"
                  step="0.01"
                  value={tc}
                  onChange={(e) => setTc(e.target.value)}
                  className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Conversión automática:</span>
            <div className="font-extrabold text-foreground">
              ={' '}
              <span className="text-amber-500 text-sm">
                S/ {((parseFloat(montoUSD) || 0) * (parseFloat(tc) || configTc)).toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal ml-1">
                al mes en soles
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
