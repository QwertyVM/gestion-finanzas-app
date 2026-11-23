'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Wand2, Plus } from 'lucide-react';

interface BarraCuadreSobresProps {
  sumaPorcentajes: number;
  sumaMontos: number;
  capitalTotal: number;
  moneda: string;
  descuadrePorcentaje: number;
  onAutoCuadrar: () => void;
  onAgregarSobre: () => void;
}

export function BarraCuadreSobres({
  sumaPorcentajes,
  sumaMontos,
  capitalTotal,
  moneda,
  descuadrePorcentaje,
  onAutoCuadrar,
  onAgregarSobre,
}: BarraCuadreSobresProps) {
  const estaCuadrado = sumaPorcentajes === 100;

  return (
    <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {estaCuadrado ? (
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {estaCuadrado ? 'Distribución 100% Cuadrada' : 'Ajuste de Sobres Pendiente'}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  estaCuadrado
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                }`}
              >
                {sumaPorcentajes}% / 100%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {estaCuadrado
                ? `Todo el capital disponible (${formatMoney(capitalTotal, moneda)}) está asignado a sobres.`
                : descuadrePorcentaje > 0
                  ? `Falta asignar ${descuadrePorcentaje}% (${formatMoney((capitalTotal * descuadrePorcentaje) / 100, moneda)}) para completar el 100%.`
                  : `Has sobreasignado ${Math.abs(descuadrePorcentaje)}% (${formatMoney((capitalTotal * Math.abs(descuadrePorcentaje)) / 100, moneda)}) por encima del saldo.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {!estaCuadrado && (
            <button
              type="button"
              onClick={onAutoCuadrar}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer transition border border-amber-500/20"
              title="Ajusta automáticamente los porcentajes para sumar exactamente 100%"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-cuadrar 100%</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAgregarSobre}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Sobre</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso de cuadre */}
      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            estaCuadrado ? 'bg-emerald-500' : sumaPorcentajes > 100 ? 'bg-rose-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, sumaPorcentajes))}%` }}
        />
      </div>
    </div>
  );
}
