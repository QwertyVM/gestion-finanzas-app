'use client';

import React from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Home, ShoppingCart, PieChart, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertasConsultorCategoriasProps {
  alertas?: SaludFinancieraKPIs['alertasCategorias'];
  moneda: string;
}

export function AlertasConsultorCategorias({ alertas, moneda }: AlertasConsultorCategoriasProps) {
  if (!alertas) return null;

  const { ratioVivienda, ratioAlimentacion, concentracionTop3, fugasHormiga } = alertas;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Diagnóstico de Categorías &amp; Fugas de Capital
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Auditoría de umbrales esenciales, concentración Pareto y detección de microgastos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ratio Vivienda */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-500" /> Vivienda
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                ratioVivienda.estado === 'OPTIMO'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {ratioVivienda.porcentaje}% del ingreso
            </span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">
            {formatMoney(ratioVivienda.monto, moneda)}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {ratioVivienda.aviso}
          </p>
        </div>

        {/* Ratio Alimentación */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-amber-500" /> Alimentación
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                ratioAlimentacion.estado === 'OPTIMO'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {ratioAlimentacion.porcentaje}% del ingreso
            </span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">
            {formatMoney(ratioAlimentacion.monto, moneda)}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {ratioAlimentacion.aviso}
          </p>
        </div>

        {/* Concentración Pareto */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-500" /> Pareto Top 3
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {concentracionTop3.porcentaje}%
            </span>
          </div>
          <div className="text-xs font-semibold text-foreground truncate">
            {concentracionTop3.nombres.join(', ') || 'Sin datos'}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {concentracionTop3.aviso}
          </p>
        </div>

        {/* Fugas Hormiga */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-purple-500" /> Fugas Hormiga
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {fugasHormiga.length > 0 ? `${fugasHormiga.length} detectadas` : 'Controlado'}
            </span>
          </div>
          {fugasHormiga.length === 0 ? (
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sin fugas recurrentes
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-bold text-foreground font-mono">
                {formatMoney(fugasHormiga[0].total, moneda)} ({fugasHormiga[0].categoria})
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {fugasHormiga[0].aviso}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
