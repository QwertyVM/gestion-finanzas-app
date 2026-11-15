'use client';

import React from 'react';
import { Delete } from 'lucide-react';

interface PinNumberPadProps {
  pin: string;
  validando: boolean;
  onKeypadPress: (digit: string) => void;
  onKeypadDelete: () => void;
  onLimpiar: () => void;
}

export function PinNumberPad({
  pin,
  validando,
  onKeypadPress,
  onKeypadDelete,
  onLimpiar,
}: PinNumberPadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
      {digits.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onKeypadPress(n)}
          disabled={validando}
          className="h-12 rounded-xl bg-secondary/50 hover:bg-secondary active:scale-95 text-foreground font-mono font-bold text-lg border border-border/60 transition shadow-xs disabled:opacity-50"
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={onLimpiar}
        disabled={validando || pin.length === 0}
        className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary active:scale-95 text-muted-foreground hover:text-foreground font-semibold text-xs border border-border/40 transition disabled:opacity-40"
      >
        Limpiar
      </button>
      <button
        type="button"
        onClick={() => onKeypadPress('0')}
        disabled={validando}
        className="h-12 rounded-xl bg-secondary/50 hover:bg-secondary active:scale-95 text-foreground font-mono font-bold text-lg border border-border/60 transition shadow-xs disabled:opacity-50"
      >
        0
      </button>
      <button
        type="button"
        onClick={onKeypadDelete}
        disabled={validando || pin.length === 0}
        className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary active:scale-95 text-muted-foreground hover:text-foreground flex items-center justify-center border border-border/40 transition disabled:opacity-40"
        title="Borrar dígito"
      >
        <Delete className="w-5 h-5" />
      </button>
    </div>
  );
}
