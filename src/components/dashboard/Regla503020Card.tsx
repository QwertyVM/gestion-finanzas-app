'use client';

import React, { useState } from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { formatMoney } from '@/lib/utils';
import { Sparkles, ArrowUpRight, ArrowDownRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Regla503020DesgloseSubcategorias } from './Regla503020DesgloseSubcategorias';

interface Regla503020CardProps {
  regla?: SaludFinancieraKPIs['regla503020'];
  moneda: string;
}

export function Regla503020Card({ regla, moneda }: Regla503020CardProps) {
  const [cubetaSeleccionada, setCubetaSeleccionada] = useState<'necesidades' | 'deseos' | 'ahorroYDeuda' | null>(null);

  if (!regla) return null;

  const { necesidades, deseos, ahorroYDeuda, diagnostico } = regla;

  const renderDesvio = (desvio: number) => {
    if (Math.abs(desvio) <= 2) {
      return (
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
          <Check className="w-3 h-3" /> En objetivo
        </span>
      );
    }
    const positivo = desvio > 0;
    return (
      <span
        className={`text-[10px] font-semibold inline-flex items-center gap-0.5 ${
          positivo
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {positivo ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {positivo ? `+${desvio}%` : `${desvio}%`}
      </span>
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribución Consultora 50 / 30 / 20
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              Benchmark
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            50% Necesidades Básicas · 30% Estilo de Vida · 20% Ahorro &amp; Amortización
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Toca cualquier tarjeta para ver sus subcategorías (#tags)
        </span>
      </div>

      {/* BARRA SEGMENTADA */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5">
          <div
            style={{ width: `${Math.min(100, Math.max(5, necesidades.porcentaje))}%` }}
            className="h-full bg-sky-500 rounded-l-full transition-all duration-500 cursor-pointer"
            onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'necesidades' ? null : 'necesidades')}
            title={`Necesidades: ${necesidades.porcentaje}% (Toca para ver subcategorías)`}
          />
          <div
            style={{ width: `${Math.min(100, Math.max(5, deseos.porcentaje))}%` }}
            className="h-full bg-teal-500 transition-all duration-500 cursor-pointer"
            onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'deseos' ? null : 'deseos')}
            title={`Deseos: ${deseos.porcentaje}% (Toca para ver subcategorías)`}
          />
          <div
            style={{ width: `${Math.min(100, Math.max(5, ahorroYDeuda.porcentaje))}%` }}
            className="h-full bg-purple-500 rounded-r-full transition-all duration-500 cursor-pointer"
            onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'ahorroYDeuda' ? null : 'ahorroYDeuda')}
            title={`Ahorro y Deuda: ${ahorroYDeuda.porcentaje}% (Toca para ver subcategorías)`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-1 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* CUBETAS INTERACTIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Necesidades */}
        <div
          onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'necesidades' ? null : 'necesidades')}
          className={`p-3 rounded-lg border transition cursor-pointer select-none space-y-1 ${
            cubetaSeleccionada === 'necesidades'
              ? 'bg-sky-100/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 ring-2 ring-sky-400/30'
              : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-sky-800 dark:text-sky-300">50% Necesidades</span>
            {renderDesvio(necesidades.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {necesidades.porcentaje}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>{formatMoney(necesidades.monto, moneda)}</span>
            <span className="text-[10px] text-sky-700 dark:text-sky-400 font-sans inline-flex items-center gap-0.5">
              {cubetaSeleccionada === 'necesidades' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{cubetaSeleccionada === 'necesidades' ? 'Ocultar' : 'Subcategorías'}</span>
            </span>
          </div>
        </div>

        {/* Deseos */}
        <div
          onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'deseos' ? null : 'deseos')}
          className={`p-3 rounded-lg border transition cursor-pointer select-none space-y-1 ${
            cubetaSeleccionada === 'deseos'
              ? 'bg-teal-100/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 ring-2 ring-teal-400/30'
              : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-teal-800 dark:text-teal-300">30% Estilo de Vida</span>
            {renderDesvio(deseos.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {deseos.porcentaje}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>{formatMoney(deseos.monto, moneda)}</span>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-sans inline-flex items-center gap-0.5">
              {cubetaSeleccionada === 'deseos' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{cubetaSeleccionada === 'deseos' ? 'Ocultar' : 'Subcategorías'}</span>
            </span>
          </div>
        </div>

        {/* Ahorro & Deuda */}
        <div
          onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'ahorroYDeuda' ? null : 'ahorroYDeuda')}
          className={`p-3 rounded-lg border transition cursor-pointer select-none space-y-1 ${
            cubetaSeleccionada === 'ahorroYDeuda'
              ? 'bg-purple-100/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 ring-2 ring-purple-400/30'
              : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-purple-800 dark:text-purple-300">20% Ahorro &amp; Deuda</span>
            {renderDesvio(ahorroYDeuda.desvio)}
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {ahorroYDeuda.porcentaje}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>{formatMoney(ahorroYDeuda.monto, moneda)}</span>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-sans inline-flex items-center gap-0.5">
              {cubetaSeleccionada === 'ahorroYDeuda' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{cubetaSeleccionada === 'ahorroYDeuda' ? 'Ocultar' : 'Subcategorías'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* PANEL DE DESGLOSE DE SUBCATEGORÍAS */}
      {cubetaSeleccionada === 'necesidades' && (
        <Regla503020DesgloseSubcategorias
          titulo="Subcategorías en Necesidades (50%)"
          subcategorias={necesidades.subcategorias}
          montoTotal={necesidades.monto}
          moneda={moneda}
          colorKey="sky"
          onCerrar={() => setCubetaSeleccionada(null)}
        />
      )}
      {cubetaSeleccionada === 'deseos' && (
        <Regla503020DesgloseSubcategorias
          titulo="Subcategorías en Estilo de Vida / Deseos (30%)"
          subcategorias={deseos.subcategorias}
          montoTotal={deseos.monto}
          moneda={moneda}
          colorKey="teal"
          onCerrar={() => setCubetaSeleccionada(null)}
        />
      )}
      {cubetaSeleccionada === 'ahorroYDeuda' && (
        <Regla503020DesgloseSubcategorias
          titulo="Subcategorías en Ahorro & Deuda (20%)"
          subcategorias={ahorroYDeuda.subcategorias}
          montoTotal={ahorroYDeuda.monto}
          moneda={moneda}
          colorKey="purple"
          onCerrar={() => setCubetaSeleccionada(null)}
        />
      )}

      {/* DIAGNÓSTICO */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border/40 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground font-semibold">Consejo Consultor: </strong>
          {diagnostico}
        </p>
      </div>
    </div>
  );
}
