'use client';

import React from 'react';

interface RecordPrestamoFieldsProps {
  bancoPrestamo: string;
  setBancoPrestamo: (b: string) => void;
  cuotasTotalesPrestamo: string;
  setCuotasTotalesPrestamo: (c: string) => void;
  cuotaInicialPrestamo: string;
  setCuotaInicialPrestamo: (c: string) => void;
  teaPrestamo: string;
  setTeaPrestamo: (t: string) => void;
  montoSoles: number;
}

export function RecordPrestamoFields({
  bancoPrestamo,
  setBancoPrestamo,
  cuotasTotalesPrestamo,
  setCuotasTotalesPrestamo,
  cuotaInicialPrestamo,
  setCuotaInicialPrestamo,
  teaPrestamo,
  setTeaPrestamo,
  montoSoles,
}: RecordPrestamoFieldsProps) {
  const cuotasTotNum = parseInt(cuotasTotalesPrestamo, 10) || 1;

  return (
    <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">Banco / Entidad Financiera:</label>
          <span className="text-[10px] text-muted-foreground">Emisor</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 pb-1">
          {['BCP', 'Interbank', 'BBVA', 'Scotiabank'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBancoPrestamo(b)}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                bancoPrestamo === b
                  ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <input
          type="text"
          required
          value={bancoPrestamo}
          onChange={(e) => setBancoPrestamo(e.target.value)}
          placeholder="Otro banco / entidad (ej: BanBif, Pichincha, Caja Piura)"
          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Cuotas Totales:</span>
          <input
            type="number"
            min="1"
            max="120"
            required
            value={cuotasTotalesPrestamo}
            onChange={(e) => setCuotasTotalesPrestamo(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs font-semibold outline-none focus:border-foreground"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Cuota Inicial:</span>
          <input
            type="number"
            min="1"
            required
            value={cuotaInicialPrestamo}
            onChange={(e) => setCuotaInicialPrestamo(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">TEA %:</span>
          <input
            type="number"
            step="0.01"
            value={teaPrestamo}
            onChange={(e) => setTeaPrestamo(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs flex items-center justify-between">
        <div>
          <span className="text-muted-foreground block text-[11px]">Total acumulado estimado:</span>
          <span className="font-semibold text-foreground">
            {cuotasTotNum} cuotas × S/ {montoSoles.toFixed(2)}
          </span>
        </div>
        <span className="font-mono font-bold text-sm text-foreground">
          S/ {(montoSoles * cuotasTotNum).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
