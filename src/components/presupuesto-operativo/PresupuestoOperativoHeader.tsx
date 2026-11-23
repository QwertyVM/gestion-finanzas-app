'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, ArrowRight } from 'lucide-react';

interface PresupuestoOperativoHeaderProps {
  nombreMesOrigen: string;
  nombreMesDestino: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior: boolean;
  onRecargar: () => void;
}

export function PresupuestoOperativoHeader({
  nombreMesOrigen,
  nombreMesDestino,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior,
  onRecargar,
}: PresupuestoOperativoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Dinero para Vivir
          </h1>
          <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Distribución de Gastos
          </span>
          <span className="text-[11px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border/60">
            Flujo Puente Mes a Mes
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>Cierre de compromisos de <strong>{nombreMesOrigen}</strong></span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <span>Presupuesto operativo para subsistir en <strong>{nombreMesDestino}</strong></span>
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        {/* Navegador de Mes */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
          <button
            type="button"
            onClick={irMesAnterior}
            disabled={!puedeIrMesAnterior}
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition disabled:opacity-30 cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{nombreMesOrigen}</span>
          </div>
          <button
            type="button"
            onClick={irMesSiguiente}
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onRecargar}
          className="p-2 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 transition cursor-pointer"
          title="Actualizar datos"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
