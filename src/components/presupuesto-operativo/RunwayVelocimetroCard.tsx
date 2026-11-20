'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Gauge, CalendarDays, Clock, Zap } from 'lucide-react';
import type { SemanaRunwayItem } from '@/lib/finanzas-service';

interface RunwayVelocimetroCardProps {
  nombreMesDestino: string;
  diasTotales: number;
  semanasTotales: number;
  limiteDiario: number;
  limiteSemanal: number;
  desgloseSemanas: SemanaRunwayItem[];
  moneda: string;
}

export function RunwayVelocimetroCard({
  nombreMesDestino,
  diasTotales,
  semanasTotales,
  limiteDiario,
  limiteSemanal,
  desgloseSemanas,
  moneda,
}: RunwayVelocimetroCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Ritmo de Vida &amp; Runway ({nombreMesDestino})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Límite de velocidad de gasto para llegar al siguiente cobro con saldo positivo.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
          {diasTotales} días · {semanasTotales} sem.
        </span>
      </div>

      {/* Métricas Destacadas: Diario vs Semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-500" />
              <span>Tope Diario Recomendado</span>
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
              {formatMoney(limiteDiario, moneda)}
              <span className="text-xs font-normal text-muted-foreground"> / día</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Comidas diarias, pasajes y café del día.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-teal-500" />
              <span>Tope Semanal Recomendado</span>
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
              {formatMoney(limiteSemanal, moneda)}
              <span className="text-xs font-normal text-muted-foreground"> / sem</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Para despensa semanal, tanque de gasolina y salidas.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Desglose de las 4 o 5 semanas */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Presupuesto distribuido por semanas
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {desgloseSemanas.map((s) => (
            <div
              key={s.semana}
              className="p-2.5 rounded-lg border border-border/50 bg-card hover:border-border transition space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">{s.etiqueta}</span>
                <span className="text-[10px] font-mono text-muted-foreground">Sem {s.semana}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-mono text-foreground tabular-nums">
                {formatMoney(s.montoSugerido, moneda)}
              </div>
              <span className="text-[10px] text-muted-foreground block truncate">
                {s.rangoFechas}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
