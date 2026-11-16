'use client';

import React from 'react';
import type { MetricasMacroCategorias } from '@/lib/finanzas-service';
import { ExecutiveTagsHeroCards, type ClasificacionStats } from './ExecutiveTagsHeroCards';
import { ExecutiveTagsFlexibility } from './ExecutiveTagsFlexibility';
import { ExecutiveTagsPaymentMethods, type MetodoPagoStats, type TarjetaStats } from './ExecutiveTagsPaymentMethods';
import { ExecutiveTagsExplorer, type EgresoItemTag } from './ExecutiveTagsExplorer';

interface ExecutiveTabTagsProps {
  clasificaciones: ClasificacionStats[];
  filtroTagActivo: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  onFiltroTagChange: (tag: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE') => void;
  metricasMacro: MetricasMacroCategorias | null | undefined;
  metodosPago: MetodoPagoStats[];
  tarjetas: TarjetaStats[];
  egresosFiltradosPorTag: EgresoItemTag[];
  totalEgresosCount: number;
  moneda: string;
}

export function ExecutiveTabTags({
  clasificaciones,
  filtroTagActivo,
  onFiltroTagChange,
  metricasMacro,
  metodosPago,
  tarjetas,
  egresosFiltradosPorTag,
  totalEgresosCount,
  moneda,
}: ExecutiveTabTagsProps) {
  return (
    <div className="space-y-6">
      <ExecutiveTagsHeroCards
        clasificaciones={clasificaciones}
        filtroTagActivo={filtroTagActivo}
        onFiltroTagChange={onFiltroTagChange}
        moneda={moneda}
      />

      <ExecutiveTagsFlexibility
        metricasMacro={metricasMacro}
        moneda={moneda}
      />

      <ExecutiveTagsPaymentMethods
        metodosPago={metodosPago}
        tarjetas={tarjetas}
        moneda={moneda}
      />

      <ExecutiveTagsExplorer
        egresos={egresosFiltradosPorTag}
        filtroTagActivo={filtroTagActivo}
        onFiltroTagChange={onFiltroTagChange}
        totalEgresosCount={totalEgresosCount}
        moneda={moneda}
      />
    </div>
  );
}
