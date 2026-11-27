'use client';

import React from 'react';
import { EgresosCategoriasBar, type TotalesPorClasificacion } from './EgresosCategoriasBar';
import { EgresosControlesBar } from './EgresosControlesBar';

interface EgresosUnifiedToolbarProps {
  totales?: TotalesPorClasificacion | null;
  filtroEgreso: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';
  onSelectFiltroEgreso: (f: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES') => void;
  filtroEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS';
  onSelectFiltroEstado: (f: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS') => void;
  filtroFuenteIngreso?: string;
  onSelectFiltroFuenteIngreso?: (f: string) => void;
  ingresosMes?: any[];
  conteoPendiente: number;
  conteoAdelantado: number;
  conteoPagado: number;
  conteoTotal: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  hasItems: boolean;
  moneda: string;
  mostrarDistribucionCategorias?: boolean;
  busquedaTexto?: string;
  onBuscarTexto?: (t: string) => void;
  onToggleColapsarTodas?: (colapsar: boolean) => void;
  estanTodasColapsadas?: boolean;
}

export function EgresosUnifiedToolbar({
  totales,
  filtroEgreso,
  onSelectFiltroEgreso,
  filtroEstado,
  onSelectFiltroEstado,
  filtroFuenteIngreso = 'TODOS',
  onSelectFiltroFuenteIngreso,
  ingresosMes = [],
  conteoPendiente,
  conteoAdelantado,
  conteoPagado,
  conteoTotal,
  isAllSelected,
  onToggleSelectAll,
  hasItems,
  moneda,
  mostrarDistribucionCategorias = false,
  busquedaTexto,
  onBuscarTexto,
  onToggleColapsarTodas,
  estanTodasColapsadas,
}: EgresosUnifiedToolbarProps) {
  return (
    <div className="bg-card border border-border/70 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
      {/* 1. Categorías y distribución interactiva (si está habilitado) */}
      {mostrarDistribucionCategorias && (
        <EgresosCategoriasBar
          totales={totales}
          filtroEgreso={filtroEgreso}
          onSelectFiltroEgreso={onSelectFiltroEgreso}
          moneda={moneda}
        />
      )}

      {/* 2. Controles de estado, búsqueda, fuente y selección */}
      <EgresosControlesBar
        filtroEstado={filtroEstado}
        onSelectFiltroEstado={onSelectFiltroEstado}
        filtroFuenteIngreso={filtroFuenteIngreso}
        onSelectFiltroFuenteIngreso={onSelectFiltroFuenteIngreso}
        ingresosMes={ingresosMes}
        conteoPendiente={conteoPendiente}
        conteoAdelantado={conteoAdelantado}
        conteoPagado={conteoPagado}
        conteoTotal={conteoTotal}
        isAllSelected={isAllSelected}
        onToggleSelectAll={onToggleSelectAll}
        hasItems={hasItems}
        busquedaTexto={busquedaTexto}
        onBuscarTexto={onBuscarTexto}
        onToggleColapsarTodas={onToggleColapsarTodas}
        estanTodasColapsadas={estanTodasColapsadas}
      />
    </div>
  );
}
