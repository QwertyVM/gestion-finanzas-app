'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Sparkles, Shield, PiggyBank, Smile, ArrowRight } from 'lucide-react';

interface DistribucionRecomendada {
  deuda: number;
  ahorroEmergencia: number;
  estiloVida: number;
}

interface CapitalLibreData {
  monto: number;
  porcentaje: number;
  sugerencia: string;
  distribucionRecomendada: DistribucionRecomendada;
}

interface Regla503020CapitalLibreCardProps {
  capitalLibre: CapitalLibreData;
  moneda: string;
  esModeloAdaptativoDeuda?: boolean;
  onAsignarMeta?: (tipo: 'DEUDA' | 'EMERGENCIA' | 'ESTILO_VIDA' | 'LIBRE', monto: number) => void;
}

export function Regla503020CapitalLibreCard({
  capitalLibre,
  moneda,
  esModeloAdaptativoDeuda = false,
  onAsignarMeta,
}: Regla503020CapitalLibreCardProps) {
  if (!capitalLibre || capitalLibre.monto <= 0) return null;

  const { monto, porcentaje, sugerencia, distribucionRecomendada } = capitalLibre;

  return (
    <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-900/20 shadow-xs space-y-3">
      {/* Cabecera del Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                Capital Libre Disponible
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                Por Asignar
              </span>
              {esModeloAdaptativoDeuda && (
                <span className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-semibold border border-purple-500/20">
                  Prioridad: Desendeudamiento
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Liquidez libre calculada sin inflar la cubeta de ahorro. Tú decides a qué rubro destinarla.
            </p>
          </div>
        </div>

        <div className="text-right self-end sm:self-auto">
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
            {formatMoney(monto, moneda)}
          </div>
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            {porcentaje}% del ingreso neto
          </span>
        </div>
      </div>

      {/* Sugerencia Consultora */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground font-semibold">Consejo Consultor: </strong>
        {sugerencia}
      </p>

      {/* Botones de Redistribución Rápida */}
      {onAsignarMeta && (
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-foreground mr-1">
            Redistribuir con 1 clic:
          </span>

          {distribucionRecomendada.deuda > 0 && (
            <button
              type="button"
              onClick={() => onAsignarMeta('DEUDA', distribucionRecomendada.deuda)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Amortizar Deuda ({formatMoney(distribucionRecomendada.deuda, moneda)})</span>
            </button>
          )}

          {distribucionRecomendada.ahorroEmergencia > 0 && (
            <button
              type="button"
              onClick={() => onAsignarMeta('EMERGENCIA', distribucionRecomendada.ahorroEmergencia)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fondo Tranquilidad ({formatMoney(distribucionRecomendada.ahorroEmergencia, moneda)})</span>
            </button>
          )}

          {distribucionRecomendada.estiloVida > 0 && (
            <button
              type="button"
              onClick={() => onAsignarMeta('ESTILO_VIDA', distribucionRecomendada.estiloVida)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Smile className="w-3.5 h-3.5 text-teal-600" />
              <span>Estilo de Vida ({formatMoney(distribucionRecomendada.estiloVida, moneda)})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAsignarMeta('LIBRE', monto)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer ml-auto"
          >
            <span>Personalizar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
