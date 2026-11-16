'use client';

import React from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { ExecutiveDashboardSkeleton } from '@/components/common/Skeleton';
import { useExecutiveData } from './executive/hooks/useExecutiveData';
import { ExecutiveDashboardHeader } from './executive/ExecutiveDashboardHeader';
import { ExecutiveTabGeneral } from './executive/ExecutiveTabGeneral';
import { ExecutiveTabCategorias } from './executive/ExecutiveTabCategorias';
import { ExecutiveTabTags } from './executive/ExecutiveTabTags';

export function ExecutiveDashboardClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
    resumen,
  } = useFinanzas();

  const data = useExecutiveData(resumen, periodo);

  if (!resumen) {
    return <ExecutiveDashboardSkeleton />;
  }

  const {
    moneda,
    tabActiva,
    setTabActiva,
    categoriaSeleccionadaId,
    setCategoriaSeleccionadaId,
    busquedaCat,
    setBusquedaCat,
    filtroTagActivo,
    setFiltroTagActivo,
    esMesEspecial,
    labelEspecial,
    distribucionEgresos,
    datosFlujoAnual,
    prestamosActivos,
    deudaTotalConsolidada,
    todasCategorias,
    categoriasFiltradas,
    categoriaSeleccionada,
    metricasMacro,
    clasificaciones,
    metodosPago,
    tarjetas,
    egresosFiltradosPorTag,
    sueldoBase,
    totalIngresos,
    totalEgresos,
    disponibleNeto,
    disponibleEsPositivo,
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ExecutiveDashboardHeader
        periodo={periodo}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        puedeIrMesAnterior={puedeIrMesAnterior}
        prefetchMesAnterior={prefetchMesAnterior}
        prefetchMesSiguiente={prefetchMesSiguiente}
        esMesEspecial={esMesEspecial}
        labelEspecial={labelEspecial}
        tabActiva={tabActiva}
        onTabChange={setTabActiva}
        totalCategorias={todasCategorias.length}
        nivelCompromiso={metricasMacro?.nivelCompromiso}
        porcentajeComprometido={metricasMacro?.porcentajeComprometido}
      />

      {tabActiva === 'general' && (
        <ExecutiveTabGeneral
          resumen={resumen}
          sueldoBase={sueldoBase}
          totalIngresos={totalIngresos}
          totalEgresos={totalEgresos}
          disponibleNeto={disponibleNeto}
          disponibleEsPositivo={disponibleEsPositivo}
          distribucionEgresos={distribucionEgresos}
          datosFlujoAnual={datosFlujoAnual}
          prestamosActivos={prestamosActivos}
          deudaTotalConsolidada={deudaTotalConsolidada}
          moneda={moneda}
        />
      )}

      {tabActiva === 'categorias' && (
        <ExecutiveTabCategorias
          resumen={resumen}
          metricasMacro={metricasMacro}
          todasCategorias={todasCategorias}
          categoriasFiltradas={categoriasFiltradas}
          categoriaSeleccionada={categoriaSeleccionada}
          categoriaSeleccionadaId={categoriaSeleccionadaId}
          onSelectCategoria={setCategoriaSeleccionadaId}
          busquedaCat={busquedaCat}
          onSearchChange={setBusquedaCat}
          moneda={moneda}
        />
      )}

      {tabActiva === 'tags' && (
        <ExecutiveTabTags
          clasificaciones={clasificaciones}
          filtroTagActivo={filtroTagActivo}
          onFiltroTagChange={setFiltroTagActivo}
          metricasMacro={metricasMacro}
          metodosPago={metodosPago}
          tarjetas={tarjetas}
          egresosFiltradosPorTag={egresosFiltradosPorTag}
          totalEgresosCount={resumen.egresosConsolidados?.length || 0}
          moneda={moneda}
        />
      )}
    </div>
  );
}
