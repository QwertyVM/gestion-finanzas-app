'use client';

import React from 'react';
import Link from 'next/link';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { useFinanzas } from '@/context/FinanzasContext';
import { ChevronLeft, ChevronRight, Plus, Minus, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
  periodo, irMesAnterior, irMesSiguiente, puedeIrMesAnterior = true,
  disponibleNeto, totalIngresos, totalEgresos, totalPendiente,
  totalAdelantado = 0, cantidadIngresos, moneda, esMesEspecial,
  labelEspecial, salud, openRecordModal,
}: ResumenHeroKpisProps) {
  const { prefetchMesAnterior, prefetchMesSiguiente } = useFinanzas();
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
                  onMouseEnter={prefetchMesAnterior}
                  disabled={!puedeIrMesAnterior}
                  className={`transition ${
                    puedeIrMesAnterior
                      ? 'hover:text-foreground text-muted-foreground cursor-pointer'
                      : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
                  }`}
                  title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="capitalize px-1 text-foreground font-semibold">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  onMouseEnter={prefetchMesSiguiente}
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

            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground font-mono">
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
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs transition active:scale-98 shadow-xs"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Métricas clave en fila */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-4">
          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">Total Ingresos</span>
            <span className="text-base sm:text-xl font-bold text-foreground font-mono mt-0.5 block truncate">
              {formatMoney(totalIngresos, moneda)}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {cantidadIngresos} {cantidadIngresos === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">Total Egresos</span>
            <span className="text-base sm:text-xl font-bold text-foreground font-mono mt-0.5 block truncate">
              {formatMoney(totalEgresos, moneda)}
            </span>
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 flex-wrap mt-0.5">
              <span>{formatMoney(totalPendiente, moneda)} pendientes</span>
              {totalAdelantado > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-0.5">
                  · ⚡ {formatMoney(totalAdelantado, moneda)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PILL CONSULTOR DE SALUD FINANCIERA */}
        {salud && (
          <div className="mt-4 pt-3.5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Salud:
              </span>
              <span>
                DTI: <strong className="font-mono text-foreground">{salud.dti.porcentaje}%</strong>
              </span>
              <span className="text-border">·</span>
              <span>
                Rigidez: <strong className="font-mono text-foreground">{salud.rigidez.porcentaje}%</strong>
              </span>
              <span className="text-border">·</span>
              <span>
                50/30/20: <strong className="font-mono text-foreground">{salud.regla503020.necesidades.porcentaje}% / {salud.regla503020.deseos.porcentaje}% / {salud.regla503020.ahorroYDeuda.porcentaje}%</strong>
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-[11px] shrink-0"
            >
              <span>Ver KPIs &amp; Diagnóstico</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
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
