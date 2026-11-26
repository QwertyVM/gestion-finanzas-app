'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Scale, PiggyBank, CreditCard, AlertTriangle } from 'lucide-react';

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
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
      case 'PRECAUCION':
      case 'MODERADO':
      case 'CUMPLIDO':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
      case 'CRITICO':
      case 'DEFICIT':
      case 'ALTO':
      default:
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ratios Financieros Clave (Estándar de Banca y Consultoría)
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium">Metas recomendadas</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. DTI */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-border transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Endeudamiento (DTI)</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(dti.estado)}`}>
              {dti.label}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {dti.porcentaje}%
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Límite: &lt; 30%</span>
            </div>
            {/* Micro barra de ratio */}
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, (dti.porcentaje / 40) * 100)}%` }} 
                className={`h-full rounded-full ${dti.porcentaje > 35 ? 'bg-rose-500' : dti.porcentaje > 25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 flex justify-between">
            <span>Deudas del mes:</span>
            <span className="font-mono font-semibold text-foreground">{formatMoney(dti.totalDeudas, moneda)}</span>
          </div>
        </div>

        {/* 2. Rigidez Financiera */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-border transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Rigidez de Flujo</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(rigidez.estado)}`}>
              {rigidez.label}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {rigidez.porcentaje}%
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Límite: &lt; 65%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, (rigidez.porcentaje / 80) * 100)}%` }} 
                className={`h-full rounded-full ${rigidez.porcentaje > 75 ? 'bg-rose-500' : rigidez.porcentaje > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 flex justify-between">
            <span>Comprometido:</span>
            <span className="font-mono font-semibold text-foreground">{formatMoney(rigidez.totalComprometido, moneda)}</span>
          </div>
        </div>

        {/* 3. Tasa de Ahorro */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-border transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tasa de Ahorro</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(ahorro.estado)}`}>
              {ahorro.estado === 'SUPERAVIT' ? 'Superávit' : ahorro.estado === 'CUMPLIDO' ? 'Cumplido' : 'Déficit'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {ahorro.tasaAhorro}%
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Meta: {formatMoney(ahorro.metaAhorro, moneda)}</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, Math.max(0, ahorro.tasaAhorro))}%` }} 
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 flex justify-between">
            <span>Disponible neto:</span>
            <span className="font-mono font-semibold text-foreground">{formatMoney(ahorro.disponibleNeto, moneda)}</span>
          </div>
        </div>

        {/* 4. Dependencia Tarjeta de Crédito */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-border transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Uso de Tarjeta (TC)</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badgeColor(dependenciaCredito.estado)}`}>
              {dependenciaCredito.label}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {dependenciaCredito.porcentaje}%
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">del egreso total</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, dependenciaCredito.porcentaje)}%` }} 
                className={`h-full rounded-full ${dependenciaCredito.porcentaje > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 flex justify-between">
            <span>Efectivo/Débito:</span>
            <span className="font-mono font-semibold text-foreground">{formatMoney(dependenciaCredito.totalDebitoEfectivo, moneda)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
