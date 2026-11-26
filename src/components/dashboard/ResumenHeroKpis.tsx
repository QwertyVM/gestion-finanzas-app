'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Plus, Minus, CalendarDays, Sparkles } from 'lucide-react';
import { HeroPeriodoNav } from './HeroPeriodoNav';
import { HeroHealthBar } from './HeroHealthBar';
import { HeroLiquidezBar } from './HeroLiquidezBar';

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
      {/* TARJETA EJECUTIVA MAESTRA CON MICRO-JERARQUÍA FINTECH */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Fila superior: Navegación Central Prominente del Fin de Mes + Acciones Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 pb-5 border-b border-border/50">
          {/* 1. Izquierda: Indicador contextual de Cierre Mensual */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground tracking-tight block">
                Cierre Mensual
              </span>
              <span className="text-[11px] text-muted-foreground">
                Finanzas del periodo
              </span>
            </div>
          </div>

          {/* 2. Centro: Fin de Mes en Grande y Centrado */}
          <div className="flex justify-center">
            <HeroPeriodoNav
              periodo={periodo}
              irMesAnterior={irMesAnterior}
              irMesSiguiente={irMesSiguiente}
              puedeIrMesAnterior={puedeIrMesAnterior}
              esMesEspecial={esMesEspecial}
              labelEspecial={labelEspecial}
            />
          </div>

          {/* 3. Derecha: Acciones rápidas para registrar */}
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <button
              onClick={() => openRecordModal('INGRESO')}
              className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/80 font-medium text-xs transition active:scale-95 shadow-2xs cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Fila central: 3 Columnas Ejecutivas con Saldo Libre Protagónico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* 1. Saldo Libre (KPI Principal Destacado) */}
          <div className="space-y-1.5 md:pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider text-[11px]">
                Saldo Libre
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  disponibleEsPositivo
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300'
                    : 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300'
                }`}
              >
                {disponibleEsPositivo ? 'Disponible Real' : 'Déficit Proyectado'}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums text-foreground">
              {formatMoney(disponibleNeto, moneda)}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dinero disponible tras compromisos del mes (sin restar adelantos)
            </p>
          </div>

          {/* 2. Total Ingresos */}
          <div className="space-y-1.5 pt-4 md:pt-0 md:px-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                Total Ingresos
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {cantidadIngresos} {cantidadIngresos === 1 ? 'fuente' : 'fuentes'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums">
              {formatMoney(totalIngresos, moneda)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Entradas netas programadas en el periodo
            </p>
          </div>

          {/* 3. Total Egresos */}
          <div className="space-y-1.5 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                Total Egresos
              </span>
              {totalAdelantado > 0 && (
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>{formatMoney(totalAdelantado, moneda)} adelantado</span>
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

        {/* Barra Proporcional Continua de Liquidez (Data Visualization) */}
        <HeroLiquidezBar
          totalIngresos={totalIngresos}
          totalEgresos={totalEgresos}
          totalAdelantado={totalAdelantado}
          disponibleNeto={disponibleNeto}
          moneda={moneda}
        />

        {/* Fila inferior: Salud financiera sutil */}
        <HeroHealthBar salud={salud} />
      </div>
    </div>
  );
}
