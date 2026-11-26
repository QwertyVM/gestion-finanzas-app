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
  mostrarDistribucionCategorias = true,
}: EgresosUnifiedToolbarProps) {
  return (
      <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs space-y-3">
        {/* 1. Categorías y distribución interactiva (opcional según vista) */}
        {mostrarDistribucionCategorias && (
          <EgresosCategoriasBar
            totales={totales}
            filtroEgreso={filtroEgreso}
            onSelectFiltroEgreso={onSelectFiltroEgreso}
            moneda={moneda}
          />
        )}

        {/* 2. Controles de estado, fuente y selección */}
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
        />
      </div>
      );
}
