'use client';

import React from 'react';
import { Wallet, Check } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

export interface IngresoOption {
  id: string;
  concepto: string;
  tipo: string;
  monto: number;
  totalGastosAsignados?: number;
  disponible?: number;
}

interface RecordIngresoAsignadoSelectorProps {
  ingresos: IngresoOption[];
  ingresoId: string;
  onSelectIngreso: (id: string) => void;
  moneda?: string;
}

export function RecordIngresoAsignadoSelector({
  ingresos,
  ingresoId,
  onSelectIngreso,
  moneda = 'S/',
}: RecordIngresoAsignadoSelectorProps) {
  if (!ingresos || ingresos.length <= 1) return null;

  return (
    <div className="space-y-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>¿Con qué ingreso pagarás este gasto?</span>
        </label>
        <span className="text-[10px] font-medium text-amber-600/90 dark:text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded">
          {ingresos.length} ingresos en el mes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onSelectIngreso('')}
          className={`px-2.5 py-2 rounded-lg text-xs border text-left transition flex items-center justify-between cursor-pointer ${
            !ingresoId
              ? 'bg-foreground text-background border-foreground font-semibold shadow-2xs'
              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <div className="truncate">
            <span className="block truncate font-medium">Por defecto (General / Sueldo)</span>
          </div>
          {!ingresoId && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
        </button>

        {ingresos.map((ing) => {
          const isSelected = ingresoId === ing.id;
          const disponible = ing.disponible !== undefined ? ing.disponible : ing.monto;

          return (
            <button
              key={ing.id}
              type="button"
              onClick={() => onSelectIngreso(ing.id)}
              className={`px-2.5 py-2 rounded-lg text-xs border text-left transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-2xs dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                  : 'bg-card text-foreground border-border hover:bg-muted/40'
              }`}
            >
              <div className="min-w-0 flex-1 mr-1.5">
                <span className="block truncate font-medium">{ing.concepto}</span>
                <span className={`text-[10px] block font-mono ${isSelected ? 'text-white/90 dark:text-slate-900/90' : 'text-muted-foreground'}`}>
                  Disp: {formatMoney(disponible, moneda)}
                </span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
