'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Minus, Equal, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface BridgeCashFlowCardProps {
  nombreMesOrigen: string;
  nombreMesDestino: string;
  ingresosCierre: number;
  compromisosCierre: {
    total: number;
    fijos: number;
    prestamos: number;
    cuotas: number;
    variables: number;
  };
  capitalOperativo: number;
  estadoSalud: 'OPTIMO' | 'ADECUADO' | 'AJUSTADO' | 'DEFICIT';
  moneda: string;
}

export function BridgeCashFlowCard({
  nombreMesOrigen,
  nombreMesDestino,
  ingresosCierre,
  compromisosCierre,
  capitalOperativo,
  estadoSalud,
  moneda,
}: BridgeCashFlowCardProps) {
  const saludConfig = {
    OPTIMO: {
      label: 'Holgado / Saludable',
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: ShieldCheck,
    },
    ADECUADO: {
      label: 'Flujo Adecuado',
      class: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300',
      icon: ShieldCheck,
    },
    AJUSTADO: {
      label: 'Margen Ajustado',
      class: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300',
      icon: AlertTriangle,
    },
    DEFICIT: {
      label: 'Déficit / Sobregiro',
      class: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300',
      icon: AlertTriangle,
    },
  }[estadoSalud];

  const SaludIcon = saludConfig.icon;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span>Puente Financiero de Cierre a Subsistencia</span>
        </span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${saludConfig.class}`}>
          <SaludIcon className="w-3 h-3" />
          <span>{saludConfig.label}</span>
        </span>
      </div>

      {/* Grid del Puente Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        {/* 1. Ingresos al cierre de mes */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            1. Ingresos Cierre ({nombreMesOrigen})
          </span>
          <div className="font-mono text-lg sm:text-xl font-bold text-foreground tabular-nums">
            {formatMoney(ingresosCierre, moneda)}
          </div>
          <span className="text-[11px] text-muted-foreground block truncate">
            Sueldo + entradas recibidas
          </span>
        </div>

        {/* Operador Menos */}
        <div className="hidden md:flex justify-center text-muted-foreground">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <Minus className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 2. Compromisos liquidados */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              2. Compromisos Extinguidos
            </span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {formatMoney(compromisosCierre.total, moneda)}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 flex-wrap">
            <span>Fijos/Colegio: {formatMoney(compromisosCierre.fijos, moneda)}</span>
            <span>·</span>
            <span>Tarjetas/Deuda: {formatMoney(compromisosCierre.prestamos + compromisosCierre.cuotas, moneda)}</span>
          </div>
        </div>

        {/* Operador Igual */}
        <div className="hidden md:flex justify-center text-muted-foreground">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <Equal className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 3. Resto para vivir */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 via-emerald-100/30 to-background dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-background border border-emerald-300 dark:border-emerald-700/60 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
            3. Dinero para Vivir ({nombreMesDestino})
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatMoney(capitalOperativo, moneda)}
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Saldo de bolsillo para comidas, combustible y día a día
          </span>
        </div>
      </div>
    </div>
  );
}
