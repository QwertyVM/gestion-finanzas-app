'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { HeroPeriodoNav } from './HeroPeriodoNav';
import { HeroHealthBar } from './HeroHealthBar';

interface ResumenHeroKpisProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior?: boolean;
  disponibleNeto: number;
  totalIngresos: number;
  totalEgresos: number;
  totalPendiente: number;
  totalAdelantado?: number;
  cantidadIngresos: number;
  moneda: string;
  esMesEspecial: boolean;
  labelEspecial?: string;
  salud?: SaludFinancieraKPIs;
  openRecordModal: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function ResumenHeroKpis({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior = true,
  disponibleNeto,
  totalIngresos,
  totalEgresos,
  totalPendiente,
  totalAdelantado = 0,
  cantidadIngresos,
  moneda,
  esMesEspecial,
  labelEspecial,
  salud,
  openRecordModal,
}: ResumenHeroKpisProps) {
  const disponibleEsPositivo = disponibleNeto >= 0;

  return (
    <div className="space-y-4">
      {/* HERO CARD: DINERO LIBRE & METRICAS */}
      <div className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div>
            <HeroPeriodoNav
              periodo={periodo}
              irMesAnterior={irMesAnterior}
              irMesSiguiente={irMesSiguiente}
              puedeIrMesAnterior={puedeIrMesAnterior}
              esMesEspecial={esMesEspecial}
              labelEspecial={labelEspecial}
            />

            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(disponibleNeto, moneda)}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  disponibleEsPositivo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                    : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                }`}
              >
                {disponibleEsPositivo ? 'Saldo libre' : 'Déficit'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dinero disponible tras cubrir compromisos del mes.
            </p>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => openRecordModal('INGRESO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs transition active:scale-98 shadow-xs cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Métricas clave en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Ingresos</span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  {cantidadIngresos} {cantidadIngresos === 1 ? 'fuente' : 'fuentes'}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-mono mt-1 block truncate">
                {formatMoney(totalIngresos, moneda)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Total programado para el periodo
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">Total Egresos</span>
                {totalAdelantado > 0 && (
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    ⚡ {formatMoney(totalAdelantado, moneda)} adelantado
                  </span>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground font-mono mt-1 block truncate">
                {formatMoney(totalEgresos, moneda)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap pt-1 border-t border-border/30">
              <span className="font-medium text-foreground/80">
                Por pagar: <strong className="font-mono">{formatMoney(totalPendiente, moneda)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* BARRA DE SALUD FINANCIERA */}
        <HeroHealthBar salud={salud} />
      </div>

      {/* BANNER ESPECIAL DICIEMBRE */}
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
