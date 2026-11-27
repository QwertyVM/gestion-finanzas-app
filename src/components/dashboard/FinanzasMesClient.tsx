'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { FloatingSumBar } from '@/components/common/FloatingSumBar';
import { IngresosMesTabla } from './IngresosMesTabla';
import { DashboardEgresosSection } from './DashboardEgresosSection';
import { DashboardModals } from './DashboardModals';
import { DashboardStateFallbacks } from './DashboardStateFallbacks';
import { FinanzasMesHeader } from './FinanzasMesHeader';
import { GraficoLiquidezMes } from './GraficoLiquidezMes';
import { useDashboardEgresos } from './hooks/useDashboardEgresos';

export function FinanzasMesClient() {
  const d = useDashboardEgresos();

  if (d.loading && !d.resumen) {
    return <TableSkeleton rows={8} />;
  }

  if (!d.usuarioActual) {
    return <DashboardStateFallbacks tipo="NO_AUTH" />;
  }

  if (d.fetchError && !d.resumen) {
    return (
      <DashboardStateFallbacks
        tipo="ERROR"
        mensajeError={d.fetchError}
        onReintentar={d.refresh}
      />
    );
  }

  if (!d.resumen) {
    return <DashboardStateFallbacks tipo="VACIO" />;
  }

  const conteoEgresosFiltrados = d.egresosFiltrados.length;
  const totalEgresosFiltrados = d.egresosFiltrados.reduce((sum, item) => sum + (item.monto || 0), 0);
  const todosEgresos = d.resumen.egresosConsolidados || [];
  const isAllSelected = d.selectedGastoIds.length === conteoEgresosFiltrados && conteoEgresosFiltrados > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <FloatingSumBar />

      {/* 1. CABECERA LIMPIA: NAVEGACIÓN DE MES Y ACCIONES DE REGISTRO (SIN KPIS NI INDICADORES) */}
      <FinanzasMesHeader
        periodo={d.periodo}
        irMesAnterior={d.irMesAnterior}
        irMesSiguiente={d.irMesSiguiente}
        puedeIrMesAnterior={d.puedeIrMesAnterior}
        esMesEspecial={d.esMesEspecial}
        labelEspecial={d.labelEspecial}
        openRecordModal={d.openRecordModal}
      />

      {/* 2. GRÁFICO VISUAL: CUÁNTO QUEDA (INGRESOS - EGRESOS SIN ADELANTADO) */}
      <GraficoLiquidezMes
        totalIngresos={d.resumen.totalIngresos}
        totalEgresos={d.resumen.totalEgresos}
        totalAdelantado={d.resumen.totalAdelantado}
        disponibleNeto={d.disponibleNeto}
        moneda={d.moneda}
        onFiltrarCompromisos={() => d.setFiltroEstado('PENDIENTE')}
      />

      {/* 3. INGRESOS DEL MES (REGISTRO Y GESTIÓN DE ENTRADAS) */}
      <IngresosMesTabla
        ingresos={d.resumen.ingresos}
        totalIngresos={d.resumen.totalIngresos}
        moneda={d.moneda}
        openRecordModal={d.openRecordModal}
        onToggleRecibido={d.handleToggleRecibidoIngreso}
        onEliminarIngreso={d.handleEliminarIngreso}
        onEditarSueldo={(monto) => {
          d.setSueldoParaEditar(monto);
          d.setModalSueldoOpen(true);
        }}
        onEditarIngreso={(ing) => d.setIngresoParaEditar(ing)}
      />

      {/* 3. EGRESOS & COMPROMISOS (REGISTRO Y GESTIÓN POR CATEGORÍAS) */}
      <DashboardEgresosSection
        todosEgresos={todosEgresos}
        totalEgresos={d.resumen.totalEgresos}
        moneda={d.moneda}
        totalesPorClasificacion={d.resumen?.totalesPorClasificacion}
        filtroEgreso={d.filtroEgreso}
        onSelectFiltroEgreso={d.setFiltroEgreso}
        filtroEstado={d.filtroEstado}
        onSelectFiltroEstado={d.setFiltroEstado}
        filtroFuenteIngreso={d.filtroFuenteIngreso}
        onSelectFiltroFuenteIngreso={d.setFiltroFuenteIngreso}
        ingresosMes={d.resumen.ingresos}
        onAsignarIngresoItem={d.handleAsignarIngresoItem}
        isAllSelected={isAllSelected}
        onToggleSelectAll={d.handleSelectAll}
        conteoEgresosFiltrados={conteoEgresosFiltrados}
        totalEgresosFiltrados={totalEgresosFiltrados}
        seccionesCompromisos={d.seccionesCompromisos}
        toggleColapsarSeccion={d.toggleColapsarSeccion}
        onAbrirRegistroSeccion={d.handleAbrirRegistroSeccion}
        onAbrirModalRegistroGasto={() => d.openRecordModal('GASTO')}
        selectedGastoIds={d.selectedGastoIds}
        toggleSelectGasto={d.toggleSelectGasto}
        onSelectItem={d.setDetalleItem}
        onToggleEstadoItem={d.handleToggleEstadoItem}
        draggedId={d.draggedId}
        dragOverId={d.dragOverId}
        setDraggedId={d.setDraggedId}
        setDragOverId={d.setDragOverId}
        handleDrop={d.handleDrop}
        mostrarDistribucionCategorias={false}
        busquedaTexto={d.busquedaTexto}
        onBuscarTexto={d.setBusquedaTexto}
        onToggleColapsarTodas={d.toggleColapsarTodas}
        estanTodasColapsadas={d.estanTodasColapsadas}
      />

      {/* 4. MODALES DEL DASHBOARD */}
      <DashboardModals
        detalleItem={d.detalleItem}
        onCloseDetalle={() => d.setDetalleItem(null)}
        onCambiarEstado={d.handleCambiarEstadoModal}
        onGuardarMonto={d.handleGuardarMontoModal}
        onEliminarGasto={d.handleEliminarGastoModal}
        onCambiarMetodoPago={d.handleCambiarMetodoPagoModal}
        onCambiarClasificacion={d.handleCambiarClasificacionModal}
        onCambiarCategoria={d.handleCambiarCategoriaModal}
        onGuardarConcepto={d.handleGuardarConceptoModal}
        onGuardarNotas={d.handleGuardarNotasModal}
        onCambiarIngresoAsignado={d.handleCambiarIngresoAsignadoModal}
        ingresosMes={d.resumen.ingresos}
        tarjetas={d.resumen.tarjetasCredito}
        moneda={d.moneda}
        modalSueldoOpen={d.modalSueldoOpen}
        onCloseSueldo={() => d.setModalSueldoOpen(false)}
        sueldoParaEditar={d.sueldoParaEditar || d.resumen.config?.sueldoBaseMensual || 0}
        periodo={d.periodo}
        ingresoParaEditar={d.ingresoParaEditar}
        onCloseIngreso={() => d.setIngresoParaEditar(null)}
        onEliminarIngreso={d.handleEliminarIngreso}
      />
    </div>
  );
}
