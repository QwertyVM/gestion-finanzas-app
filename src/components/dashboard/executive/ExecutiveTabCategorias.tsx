'use client';

import React from 'react';
import type { ResumenFinanciero, CategoriaAnalisisItem, MetricasMacroCategorias } from '@/lib/finanzas-service';
import { AlertasConsultorCategorias } from '../AlertasConsultorCategorias';
import { ExecutiveCategoriasKpis } from './ExecutiveCategoriasKpis';
import { ExecutiveCategoriasCharts } from './ExecutiveCategoriasCharts';
import { ExecutiveCategoriasExplorer } from './ExecutiveCategoriasExplorer';
import { ExecutiveCategoriaDetail } from './ExecutiveCategoriaDetail';
import { ExecutiveCategoriasMatrix } from './ExecutiveCategoriasMatrix';

interface ExecutiveTabCategoriasProps {
  resumen: ResumenFinanciero;
  metricasMacro: MetricasMacroCategorias | null | undefined;
  todasCategorias: CategoriaAnalisisItem[];
  categoriasFiltradas: CategoriaAnalisisItem[];
  categoriaSeleccionada: CategoriaAnalisisItem | null;
  categoriaSeleccionadaId: string | null;
  onSelectCategoria: (id: string | null) => void;
  busquedaCat: string;
  onSearchChange: (val: string) => void;
  moneda: string;
}

export function ExecutiveTabCategorias({
  resumen,
  metricasMacro,
  todasCategorias,
  categoriasFiltradas,
  categoriaSeleccionada,
  categoriaSeleccionadaId,
  onSelectCategoria,
  busquedaCat,
  onSearchChange,
  moneda,
}: ExecutiveTabCategoriasProps) {
  return (
    <div className="space-y-6">
      <ExecutiveCategoriasKpis metricasMacro={metricasMacro} moneda={moneda} />

      <AlertasConsultorCategorias
        alertas={resumen.saludFinanciera?.alertasCategorias}
        moneda={moneda}
      />

      <ExecutiveCategoriasCharts
        todasCategorias={todasCategorias}
        categoriaSeleccionadaId={categoriaSeleccionadaId}
        onSelectCategoria={onSelectCategoria}
        moneda={moneda}
      />

      <ExecutiveCategoriasExplorer
        categorias={categoriasFiltradas}
        busqueda={busquedaCat}
        onSearchChange={onSearchChange}
        selectedCategoriaId={categoriaSeleccionadaId}
        onSelectCategoria={onSelectCategoria}
        moneda={moneda}
      />

      {categoriaSeleccionada && (
        <ExecutiveCategoriaDetail
          categoria={categoriaSeleccionada}
          onClose={() => onSelectCategoria(null)}
          moneda={moneda}
        />
      )}

      <ExecutiveCategoriasMatrix
        categorias={todasCategorias}
        selectedCategoriaId={categoriaSeleccionadaId}
        onSelectCategoria={onSelectCategoria}
        moneda={moneda}
      />
    </div>
  );
}
