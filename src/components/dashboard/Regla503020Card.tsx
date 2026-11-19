'use client';

import React, { useState } from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { Sparkles } from 'lucide-react';
import { Regla503020DesgloseSubcategorias } from './Regla503020DesgloseSubcategorias';
import { Regla503020CubetaCard } from './Regla503020CubetaCard';

interface Regla503020CardProps {
  regla?: SaludFinancieraKPIs['regla503020'];
  moneda: string;
}

export function Regla503020Card({ regla, moneda }: Regla503020CardProps) {
  const [cubetaSeleccionada, setCubetaSeleccionada] = useState<'necesidades' | 'deseos' | 'ahorroYDeuda' | null>(null);

  if (!regla) return null;

  const { necesidades, deseos, ahorroYDeuda, diagnostico } = regla;

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
        <Regla503020CubetaCard
          titulo="50% Necesidades"
          porcentaje={necesidades.porcentaje}
          monto={necesidades.monto}
          desvio={necesidades.desvio}
          moneda={moneda}
          estaSeleccionada={cubetaSeleccionada === 'necesidades'}
          onToggle={() => setCubetaSeleccionada(cubetaSeleccionada === 'necesidades' ? null : 'necesidades')}
          colorKey="sky"
        />

        <Regla503020CubetaCard
          titulo="30% Estilo de Vida"
          porcentaje={deseos.porcentaje}
          monto={deseos.monto}
          desvio={deseos.desvio}
          moneda={moneda}
          estaSeleccionada={cubetaSeleccionada === 'deseos'}
          onToggle={() => setCubetaSeleccionada(cubetaSeleccionada === 'deseos' ? null : 'deseos')}
          colorKey="teal"
        />

        <Regla503020CubetaCard
          titulo="20% Ahorro & Deuda"
          porcentaje={ahorroYDeuda.porcentaje}
          monto={ahorroYDeuda.monto}
          desvio={ahorroYDeuda.desvio}
          moneda={moneda}
          estaSeleccionada={cubetaSeleccionada === 'ahorroYDeuda'}
          onToggle={() => setCubetaSeleccionada(cubetaSeleccionada === 'ahorroYDeuda' ? null : 'ahorroYDeuda')}
          colorKey="purple"
        />
      </div>

      {/* PANEL DE DESGLOSE DE SUBCATEGORÍAS */}
      {cubetaSeleccionada && (
        <Regla503020DesgloseSubcategorias
          titulo={
            cubetaSeleccionada === 'necesidades'
              ? 'Subcategorías en Necesidades (50%)'
              : cubetaSeleccionada === 'deseos'
              ? 'Subcategorías en Estilo de Vida / Deseos (30%)'
              : 'Subcategorías en Ahorro & Deuda (20%)'
          }
          subcategorias={regla[cubetaSeleccionada].subcategorias}
          montoTotal={regla[cubetaSeleccionada].monto}
          moneda={moneda}
          colorKey={cubetaSeleccionada === 'necesidades' ? 'sky' : cubetaSeleccionada === 'deseos' ? 'teal' : 'purple'}
          onCerrar={() => setCubetaSeleccionada(null)}
        />
      )}

      {/* CONSEJO CONSULTOR */}
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
