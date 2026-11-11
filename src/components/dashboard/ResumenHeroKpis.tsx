'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Minus, Sparkles } from 'lucide-react';

interface ResumenHeroKpisProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  disponibleNeto: number;
  totalIngresos: number;
  totalEgresos: number;
  totalPendiente: number;
  cantidadIngresos: number;
  moneda: string;
  esMesEspecial: boolean;
  labelEspecial?: string;
  openRecordModal: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function ResumenHeroKpis({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  disponibleNeto,
  totalIngresos,
  totalEgresos,
  totalPendiente,
  cantidadIngresos,
  moneda,
  esMesEspecial,
  labelEspecial,
  openRecordModal,
}: ResumenHeroKpisProps) {
  const disponibleEsPositivo = disponibleNeto >= 0;

  return (
    <div className="space-y-4">
      {/* HERO CARD: DINERO LIBRE & METRICAS */}
      <div className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Periodo
              </span>
              <div className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md text-xs font-medium">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  className="hover:text-foreground text-muted-foreground transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="capitalize px-1 text-foreground font-semibold">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  className="hover:text-foreground text-muted-foreground transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {esMesEspecial && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  · {labelEspecial}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(disponibleNeto, moneda)}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  disponibleEsPositivo
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {disponibleEsPositivo ? 'Saldo libre' : 'Déficit'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dinero disponible tras cubrir compromisos del mes.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => openRecordModal('INGRESO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs transition active:scale-98 shadow-xs"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Métricas clave en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block font-medium">Total Ingresos</span>
            <span className="text-xl font-bold text-foreground font-mono mt-0.5 block">
              {formatMoney(totalIngresos, moneda)}
            </span>
            <span className="text-xs text-muted-foreground">
              {cantidadIngresos} {cantidadIngresos === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block font-medium">Total Egresos</span>
            <span className="text-xl font-bold text-foreground font-mono mt-0.5 block">
              {formatMoney(totalEgresos, moneda)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMoney(totalPendiente, moneda)} pendientes
            </span>
          </div>
        </div>
      </div>

      {/* BANNER DICIEMBRE */}
      {periodo.endsWith('-12') && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Mes de Gratificación de Navidad: Ingresos extraordinarios proyectados.</span>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            ¡Considerado en flujo!
          </span>
        </div>
      )}
    </div>
  );
}
