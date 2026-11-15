'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { ShieldCheck, Scale, PiggyBank, CreditCard, AlertTriangle } from 'lucide-react';

interface SaludFinancieraScorecardProps {
  salud?: SaludFinancieraKPIs;
  moneda: string;
}

export function SaludFinancieraScorecard({ salud, moneda }: SaludFinancieraScorecardProps) {
  if (!salud) return null;

  const { dti, rigidez, ahorro, dependenciaCredito } = salud;

  const badgeColor = (estado: string) => {
    switch (estado) {
      case 'OPTIMO':
      case 'FLEXIBLE':
      case 'SALUDABLE':
      case 'SUPERAVIT':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'PRECAUCION':
      case 'MODERADO':
      case 'CUMPLIDO':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'CRITICO':
      case 'DEFICIT':
      case 'ALTO':
      default:
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Diagnóstico de Salud Financiera (Ratios Consultores)
          </h2>
        </div>
        <span className="text-[11px] text-muted-foreground">Estándar internacional</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. DTI */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Endeudamiento (DTI)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(dti.estado)}`}>
              {dti.label}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {dti.porcentaje}%
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Ideal: &lt; 30%</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Deudas: <span className="font-mono font-semibold text-foreground">{formatMoney(dti.totalDeudas, moneda)}</span>
          </div>
        </div>

        {/* 2. Rigidez Financiera */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Rigidez de Flujo
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(rigidez.estado)}`}>
              {rigidez.label}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {rigidez.porcentaje}%
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Ideal: &lt; 65%</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Comprometido: <span className="font-mono font-semibold text-foreground">{formatMoney(rigidez.totalComprometido, moneda)}</span>
          </div>
        </div>

        {/* 3. Tasa de Ahorro */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5" />
              Tasa de Ahorro
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(ahorro.estado)}`}>
              {ahorro.estado === 'SUPERAVIT' ? 'Superávit' : ahorro.estado === 'CUMPLIDO' ? 'Cumplido' : 'Déficit'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {ahorro.tasaAhorro}%
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Meta: {formatMoney(ahorro.metaAhorro, moneda)}</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Disponible: <span className="font-mono font-semibold text-foreground">{formatMoney(ahorro.disponibleNeto, moneda)}</span>
          </div>
        </div>

        {/* 4. Dependencia Tarjeta */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Uso de Tarjeta (TC)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(dependenciaCredito.estado)}`}>
              {dependenciaCredito.label}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {dependenciaCredito.porcentaje}%
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">del egreso total</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Débito/Efec: <span className="font-mono font-semibold text-foreground">{formatMoney(dependenciaCredito.totalDebitoEfectivo, moneda)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
