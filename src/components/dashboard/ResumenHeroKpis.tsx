'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
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
      {/* TARJETA EJECUTIVA MAESTRA */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Fila superior: Navegación de periodo + Acciones rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/50">
          <HeroPeriodoNav
            periodo={periodo}
            irMesAnterior={irMesAnterior}
            irMesSiguiente={irMesSiguiente}
            puedeIrMesAnterior={puedeIrMesAnterior}
            esMesEspecial={esMesEspecial}
            labelEspecial={labelEspecial}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => openRecordModal('INGRESO')}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/80 font-medium text-xs transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Fila central: 3 Columnas Ejecutivas fluidas sin cajas anidadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* 1. Saldo Libre (KPI Principal) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                Saldo Libre
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${disponibleEsPositivo
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                  : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                  }`}
              >
                {disponibleEsPositivo ? 'Disponible' : 'Déficit'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums">
              {formatMoney(disponibleNeto, moneda)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dinero disponible tras compromisos del mes
            </p>
          </div>

          {/* 2. Total Ingresos */}
          <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                Total Ingresos
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {cantidadIngresos} {cantidadIngresos === 1 ? 'fuente' : 'fuentes'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums">
              {formatMoney(totalIngresos, moneda)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Entradas programadas en el periodo
            </p>
          </div>

          {/* 3. Total Egresos */}
          <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                Total Egresos
              </span>
              {totalAdelantado > 0 && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  ⚡ {formatMoney(totalAdelantado, moneda)} adelantado
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums">
              {formatMoney(totalEgresos, moneda)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Por liquidar: <strong className="text-foreground font-semibold font-mono">{formatMoney(totalPendiente, moneda)}</strong>
            </p>
          </div>
        </div>

  {/* Fila inferior: Salud financiera sutil */ }
  <HeroHealthBar salud={salud} />
      </div >
    </div >
  );
}
