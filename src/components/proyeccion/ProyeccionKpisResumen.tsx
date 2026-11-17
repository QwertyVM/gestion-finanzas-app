'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { TrendingUp, CalendarCheck, ShieldCheck } from 'lucide-react';
import type { TotalesProyeccion } from '@/app/api/finanzas/anual/route';

interface ProyeccionKpisResumenProps {
  anio: number;
  totalesActual?: TotalesProyeccion;
  totalesProyectado: TotalesProyeccion;
  mesActualNombre: string;
  moneda: string;
}

export function ProyeccionKpisResumen({
  anio,
  totalesActual,
  totalesProyectado,
  mesActualNombre,
  moneda,
}: ProyeccionKpisResumenProps) {
  const mostrarActual =
    totalesActual &&
    totalesActual.cantidadMeses > 0 &&
    totalesActual.cantidadMeses < totalesProyectado.cantidadMeses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* Tarjeta 1: Lo Actual Ejecutado a la fecha */}
      {mostrarActual && (
        <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Ejecutado a la Fecha
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Meses transcurridos hasta {mesActualNombre} {anio}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              {totalesActual.tasaAhorroPromedio.toFixed(0)}% Ahorro Real
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Ingresos</span>
              <span className="font-mono font-bold text-foreground">
                {formatMoney(totalesActual.totalIngresos, moneda)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Egresos</span>
              <span className="font-mono font-bold text-muted-foreground">
                {formatMoney(totalesActual.totalEgresos, moneda)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Dinero Libre</span>
              <span className={`font-mono font-bold ${totalesActual.totalDisponible >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatMoney(totalesActual.totalDisponible, moneda)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta 2: Lo Esperado según la Proyección Anual */}
      <div className={`p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-2.5 ${!mostrarActual ? 'md:col-span-2' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Proyección Esperada {anio}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Total anual (histórico + compromisos y flujo previsto)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40">
            {totalesProyectado.tasaAhorroPromedio.toFixed(0)}% Ahorro Esperado
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground block">Ingresos Anuales</span>
            <span className="font-mono font-bold text-foreground">
              {formatMoney(totalesProyectado.totalIngresos, moneda)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Egresos Previstos</span>
            <span className="font-mono font-bold text-muted-foreground">
              {formatMoney(totalesProyectado.totalEgresos, moneda)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Disponible Anual</span>
            <span className={`font-mono font-bold ${totalesProyectado.totalDisponible >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
              {formatMoney(totalesProyectado.totalDisponible, moneda)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
