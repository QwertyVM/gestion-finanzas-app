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
      {/* 1. KPIs Superiores */}
      <ExecutiveCategoriasKpis metricasMacro={metricasMacro} moneda={moneda} />

      {/* 2. Alertas del Consultor */}
      <AlertasConsultorCategorias
        alertas={resumen.saludFinanciera?.alertasCategorias}
        moneda={moneda}
      />

      {/* 3. Gráficos de Categorías */}
      <ExecutiveCategoriasCharts
        todasCategorias={todasCategorias}
        categoriaSeleccionadaId={categoriaSeleccionadaId}
        onSelectCategoria={onSelectCategoria}
        moneda={moneda}
      />

      {/* 4. Layout en 2 Columnas para Explorador & Detalle (Reduce Scroll Vertical) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={categoriaSeleccionada ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12'}>
          <ExecutiveCategoriasExplorer
            categorias={categoriasFiltradas}
            busqueda={busquedaCat}
            onSearchChange={onSearchChange}
            selectedCategoriaId={categoriaSeleccionadaId}
            onSelectCategoria={onSelectCategoria}
            moneda={moneda}
          />
        </div>

        {categoriaSeleccionada && (
          <div className="lg:col-span-5 sticky top-20">
            <ExecutiveCategoriaDetail
              categoria={categoriaSeleccionada}
              onClose={() => onSelectCategoria(null)}
              moneda={moneda}
            />
          </div>
        )}
      </div>

      {/* 5. Matriz Estratégica Completa */}
      <ExecutiveCategoriasMatrix
        categorias={todasCategorias}
        selectedCategoriaId={categoriaSeleccionadaId}
        onSelectCategoria={onSelectCategoria}
        moneda={moneda}
      />
    </div>
  );
}
