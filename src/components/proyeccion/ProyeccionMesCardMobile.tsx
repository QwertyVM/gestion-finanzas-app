'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export interface MesProyeccion {
  periodo: string;
  mesNombre: string;
  anio: number;
  mesNumero: number;
  ingresos: number;
  fijos: number;
  prestamos: number;
  gastos: number;
  totalEgresos: number;
  disponible: number;
  esGrati: boolean;
  esUtilidad: boolean;
}

interface ProyeccionMesCardMobileProps {
  mes: MesProyeccion;
  moneda: string;
  esMesActual: boolean;
  onSelectMes: (periodo: string) => void;
}

export function ProyeccionMesCardMobile({
  mes,
  moneda,
  esMesActual,
  onSelectMes,
}: ProyeccionMesCardMobileProps) {
  const positivo = mes.disponible >= 0;
  const margen = mes.ingresos > 0 ? (mes.disponible / mes.ingresos) * 100 : 0;
  const sinActividad = mes.ingresos === 0 && mes.totalEgresos === 0;

  return (
    <div
      onClick={() => onSelectMes(mes.periodo)}
      className={`p-4 border-b border-border/40 last:border-b-0 space-y-3 cursor-pointer transition hover:bg-muted/20 ${
        esMesActual ? 'bg-muted/30' : ''
      }`}
    >
      {/* Cabecera del mes */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground">{mes.mesNombre}</h3>
            <span className="text-xs text-muted-foreground">{mes.anio}</span>
            {esMesActual && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-foreground text-background">
                Actual
              </span>
            )}
            {mes.esGrati && (
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Gratificación
              </span>
            )}
            {mes.esUtilidad && (
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Utilidades
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium">Ver mes</span>
          <ArrowRight className="w-3.5 h-3.5 text-foreground" />
        </div>
      </div>

      {/* Saldo Disponible y Ahorro */}
      <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
            Dinero Libre
          </span>
          <span
            className={`font-mono font-bold text-base tabular-nums ${
              positivo ? 'text-foreground' : 'text-rose-600'
            }`}
          >
            {formatMoney(mes.disponible, moneda)}
          </span>
        </div>

        {sinActividad ? (
          <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">
            Sin actividad
          </span>
        ) : (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              margen >= 20
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : margen > 0
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {margen.toFixed(0)}% Ahorro
          </span>
        )}
      </div>

      {/* Desglose de flujo */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
          <span className="text-[10px] text-muted-foreground block">Ingresos</span>
          <span className="font-mono font-bold text-xs text-foreground tabular-nums">
            {formatMoney(mes.ingresos, moneda)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
          <span className="text-[10px] text-muted-foreground block">Egresos Totales</span>
          <span className="font-mono font-bold text-xs text-foreground tabular-nums">
            {formatMoney(mes.totalEgresos, moneda)}
          </span>
        </div>
      </div>

      {/* Subtotales en chip */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span>
          Fijos: <strong className="text-sky-600 dark:text-sky-400 font-mono font-normal">{formatMoney(mes.fijos, moneda)}</strong>
        </span>
        <span>
          Créditos: <strong className="text-purple-600 dark:text-purple-400 font-mono font-normal">{formatMoney(mes.prestamos, moneda)}</strong>
        </span>
        <span>
          Tarj/Var: <strong className="text-teal-600 dark:text-teal-400 font-mono font-normal">{formatMoney(mes.gastos, moneda)}</strong>
        </span>
      </div>
    </div>
  );
}
