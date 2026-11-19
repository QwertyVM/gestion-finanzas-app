'use client';

import React, { useState } from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { Sparkles } from 'lucide-react';
import { Regla503020DesgloseSubcategorias } from './Regla503020DesgloseSubcategorias';
import { Regla503020CubetaCard } from './Regla503020CubetaCard';
import { Regla503020CapitalLibreCard } from './Regla503020CapitalLibreCard';

interface Regla503020CardProps {
  regla?: SaludFinancieraKPIs['regla503020'];
  moneda: string;
  onAsignarMeta?: (tipo: 'DEUDA' | 'EMERGENCIA' | 'ESTILO_VIDA' | 'LIBRE', monto: number) => void;
}

export function Regla503020Card({ regla, moneda, onAsignarMeta }: Regla503020CardProps) {
  const [cubetaSeleccionada, setCubetaSeleccionada] = useState<'necesidades' | 'deseos' | 'ahorroYDeuda' | null>(null);

  if (!regla) return null;

  const {
    necesidades,
    deseos,
    ahorroYDeuda,
    capitalLibre,
    esModeloAdaptativoDeuda = false,
    diagnostico,
  } = regla;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribución 50 / 30 / 20 &amp; Capital Libre
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              Benchmark Real
            </span>
            {esModeloAdaptativoDeuda && (
              <span className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-semibold border border-purple-500/20">
                Modelo Adaptativo a Deuda Activa
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {esModeloAdaptativoDeuda
              ? `${necesidades.objetivo}% Necesidades · ${deseos.objetivo}% Deseos (comprimido) · ${ahorroYDeuda.objetivo}% Servicio de Deuda & Ahorro`
              : '50% Necesidades Básicas · 30% Estilo de Vida · 20% Ahorro & Deuda'}
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Toca cualquier tarjeta para ver sus subcategorías (#tags)
        </span>
      </div>

      {/* BARRA SEGMENTADA CUÁDRUPLE */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5">
          {necesidades.porcentaje > 0 && (
            <div
              style={{ width: `${Math.min(100, Math.max(4, necesidades.porcentaje))}%` }}
              className="h-full bg-sky-500 rounded-l-full transition-all duration-500 cursor-pointer"
              onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'necesidades' ? null : 'necesidades')}
              title={`Necesidades: ${necesidades.porcentaje}%`}
            />
          )}
          {deseos.porcentaje > 0 && (
            <div
              style={{ width: `${Math.min(100, Math.max(4, deseos.porcentaje))}%` }}
              className="h-full bg-teal-500 transition-all duration-500 cursor-pointer"
              onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'deseos' ? null : 'deseos')}
              title={`Deseos: ${deseos.porcentaje}%`}
            />
          )}
          {ahorroYDeuda.porcentaje > 0 && (
            <div
              style={{ width: `${Math.min(100, Math.max(4, ahorroYDeuda.porcentaje))}%` }}
              className={`h-full bg-purple-500 transition-all duration-500 cursor-pointer ${capitalLibre?.porcentaje <= 0 ? 'rounded-r-full' : ''
                }`}
              onClick={() => setCubetaSeleccionada(cubetaSeleccionada === 'ahorroYDeuda' ? null : 'ahorroYDeuda')}
              title={`Deuda & Ahorro Real: ${ahorroYDeuda.porcentaje}%`}
            />
          )}
          {capitalLibre && capitalLibre.porcentaje > 0 && (
            <div
              style={{ width: `${Math.min(100, Math.max(4, capitalLibre.porcentaje))}%` }}
              className="h-full bg-amber-500 rounded-r-full transition-all duration-500 cursor-pointer"
              title={`Capital Libre: ${capitalLibre.porcentaje}% (S/ ${capitalLibre.monto.toFixed(2)})`}
            />
          )}
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
          titulo={`${necesidades.objetivo}% Necesidades`}
          porcentaje={necesidades.porcentaje}
          monto={necesidades.monto}
          desvio={necesidades.desvio}
          moneda={moneda}
          estaSeleccionada={cubetaSeleccionada === 'necesidades'}
          onToggle={() => setCubetaSeleccionada(cubetaSeleccionada === 'necesidades' ? null : 'necesidades')}
          colorKey="sky"
        />

        <Regla503020CubetaCard
          titulo={`${deseos.objetivo}% Estilo de Vida`}
          porcentaje={deseos.porcentaje}
          monto={deseos.monto}
          desvio={deseos.desvio}
          moneda={moneda}
          estaSeleccionada={cubetaSeleccionada === 'deseos'}
          onToggle={() => setCubetaSeleccionada(cubetaSeleccionada === 'deseos' ? null : 'deseos')}
          colorKey="teal"
        />

        <Regla503020CubetaCard
          titulo={`${ahorroYDeuda.objetivo}% Deuda & Ahorro Real`}
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
              ? `Subcategorías en Necesidades (${necesidades.objetivo}%)`
              : cubetaSeleccionada === 'deseos'
                ? `Subcategorías en Estilo de Vida (${deseos.objetivo}%)`
                : `Subcategorías en Deuda & Ahorro Real (${ahorroYDeuda.objetivo}%)`
          }
          subcategorias={regla[cubetaSeleccionada].subcategorias}
          montoTotal={regla[cubetaSeleccionada].monto}
          moneda={moneda}
          colorKey={cubetaSeleccionada === 'necesidades' ? 'sky' : cubetaSeleccionada === 'deseos' ? 'teal' : 'purple'}
          onCerrar={() => setCubetaSeleccionada(null)}
        />
      )}

      {/* TARJETA DESTACADA DE CAPITAL LIBRE POR ASIGNAR */}
      {capitalLibre && capitalLibre.monto > 0 && (
        <Regla503020CapitalLibreCard
          capitalLibre={capitalLibre}
          moneda={moneda}
          esModeloAdaptativoDeuda={esModeloAdaptativoDeuda}
          onAsignarMeta={onAsignarMeta}
        />
      )}

      {/* CONSEJO CONSULTOR */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border/40 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-semibold">Diagnóstico Consultor: </strong>
          {diagnostico}
        </p>
      </div>
    </div>
  );
}
