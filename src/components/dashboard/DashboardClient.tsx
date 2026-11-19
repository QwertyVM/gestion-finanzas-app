'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { FloatingSumBar } from '@/components/common/FloatingSumBar';

import { ResumenHeroKpis } from './ResumenHeroKpis';
import { ResumenDivisasCard } from './ResumenDivisasCard';
import { IngresosMesTabla } from './IngresosMesTabla';
import { DashboardEgresosSection } from './DashboardEgresosSection';
import { DashboardModals } from './DashboardModals';
import { DashboardSaludSection } from './DashboardSaludSection';
import { InstructivoGuia503020 } from './instructivo/InstructivoGuia503020';
import { DashboardStateFallbacks } from './DashboardStateFallbacks';
import { useDashboardEgresos } from './hooks/useDashboardEgresos';

export function DashboardClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    resumen,
    loading,
    fetchError,
    refresh,
    usuarioActual,
    openRecordModal,
    selectedGastoIds,
    toggleSelectGasto,
    moneda,
    esMesEspecial,
    labelEspecial,
    disponibleNeto,
    filtroEstado,
    setFiltroEstado,
    filtroEgreso,
    setFiltroEgreso,
    draggedId,
    setDraggedId,
    dragOverId,
    setDragOverId,
    handleDrop,
    egresosFiltrados,
    seccionesCompromisos,
    toggleColapsarSeccion,
    handleSelectAll,
    detalleItem,
    setDetalleItem,
    modalSueldoOpen,
    setModalSueldoOpen,
    sueldoParaEditar,
    setSueldoParaEditar,
    ingresoParaEditar,
    setIngresoParaEditar,
    handleToggleEstadoItem,
    handleToggleRecibidoIngreso,
    handleEliminarIngreso,
    handleGuardarMontoModal,
    handleEliminarGastoModal,
    handleCambiarMetodoPagoModal,
    handleCambiarClasificacionModal,
    handleCambiarCategoriaModal,
    handleGuardarConceptoModal,
    handleGuardarNotasModal,
    handleCambiarEstadoModal,
    handleCambiarIngresoAsignadoModal,
    handleAbrirRegistroSeccion,
  } = useDashboardEgresos();

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  if (!usuarioActual) {
    return <DashboardStateFallbacks tipo="NO_AUTH" />;
  }

  if (fetchError && !resumen) {
    return (
      <DashboardStateFallbacks
        tipo="ERROR"
        mensajeError={fetchError}
        onReintentar={refresh}
      />
    );
  }

  if (!resumen) {
    return <DashboardStateFallbacks tipo="VACIO" />;
  }

  const conteoEgresosFiltrados = egresosFiltrados.length;
  const totalEgresosFiltrados = egresosFiltrados.reduce((sum, item) => sum + (item.monto || 0), 0);
  const todosEgresos = resumen.egresosConsolidados || [];
  const isAllSelected = selectedGastoIds.length === conteoEgresosFiltrados && conteoEgresosFiltrados > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <FloatingSumBar />

      <ResumenHeroKpis
        periodo={periodo}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        puedeIrMesAnterior={puedeIrMesAnterior}
        disponibleNeto={disponibleNeto}
        totalIngresos={resumen.totalIngresos}
        totalEgresos={resumen.totalEgresos}
        totalPendiente={resumen.totalPendiente}
        totalAdelantado={resumen.totalAdelantado}
        cantidadIngresos={resumen.ingresos.length}
        moneda={moneda}
        esMesEspecial={esMesEspecial}
        labelEspecial={labelEspecial}
        salud={resumen.saludFinanciera}
        openRecordModal={openRecordModal}
      />

      {resumen.resumenDivisas?.tieneMultiplesMonedas && (
        <ResumenDivisasCard divisas={resumen.resumenDivisas} moneda={moneda} />
      )}

      {/* CARD DE SALUD FINANCIERA DEL MES (50/30/20, RATIOS DTI Y ALERTAS) */}
      <DashboardSaludSection salud={resumen.saludFinanciera} moneda={moneda} />

      {/* GUIA PRÁCTICA & MODELO 50/30/20 */}
      <InstructivoGuia503020 onOpenRecordModal={openRecordModal} />

      <IngresosMesTabla
        ingresos={resumen.ingresos}
        totalIngresos={resumen.totalIngresos}
        moneda={moneda}
        openRecordModal={openRecordModal}
        onToggleRecibido={handleToggleRecibidoIngreso}
        onEliminarIngreso={handleEliminarIngreso}
        onEditarSueldo={(monto) => {
          setSueldoParaEditar(monto);
          setModalSueldoOpen(true);
        }}
        onEditarIngreso={(ing) => setIngresoParaEditar(ing)}
      />

      <DashboardEgresosSection
        todosEgresos={todosEgresos}
        totalEgresos={resumen.totalEgresos}
        moneda={moneda}
        totalesPorClasificacion={resumen?.totalesPorClasificacion}
        filtroEgreso={filtroEgreso}
        onSelectFiltroEgreso={setFiltroEgreso}
        filtroEstado={filtroEstado}
        onSelectFiltroEstado={setFiltroEstado}
        isAllSelected={isAllSelected}
        onToggleSelectAll={handleSelectAll}
        conteoEgresosFiltrados={conteoEgresosFiltrados}
        totalEgresosFiltrados={totalEgresosFiltrados}
        seccionesCompromisos={seccionesCompromisos}
        toggleColapsarSeccion={toggleColapsarSeccion}
        onAbrirRegistroSeccion={handleAbrirRegistroSeccion}
        onAbrirModalRegistroGasto={() => openRecordModal('GASTO')}
        selectedGastoIds={selectedGastoIds}
        toggleSelectGasto={toggleSelectGasto}
        onSelectItem={setDetalleItem}
        onToggleEstadoItem={handleToggleEstadoItem}
        draggedId={draggedId}
        dragOverId={dragOverId}
        setDraggedId={setDraggedId}
        setDragOverId={setDragOverId}
        handleDrop={handleDrop}
      />

      <DashboardModals
        detalleItem={detalleItem}
        onCloseDetalle={() => setDetalleItem(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        onEliminarGasto={handleEliminarGastoModal}
        onCambiarMetodoPago={handleCambiarMetodoPagoModal}
        onCambiarClasificacion={handleCambiarClasificacionModal}
        onCambiarCategoria={handleCambiarCategoriaModal}
        onGuardarConcepto={handleGuardarConceptoModal}
        onGuardarNotas={handleGuardarNotasModal}
        onCambiarIngresoAsignado={handleCambiarIngresoAsignadoModal}
        ingresosMes={resumen.ingresos}
        tarjetas={resumen.tarjetasCredito}
        moneda={moneda}
        modalSueldoOpen={modalSueldoOpen}
        onCloseSueldo={() => setModalSueldoOpen(false)}
        sueldoParaEditar={sueldoParaEditar || resumen.config?.sueldoBaseMensual || 0}
        periodo={periodo}
        ingresoParaEditar={ingresoParaEditar}
        onCloseIngreso={() => setIngresoParaEditar(null)}
        onEliminarIngreso={handleEliminarIngreso}
      />
    </div>
  );
}
