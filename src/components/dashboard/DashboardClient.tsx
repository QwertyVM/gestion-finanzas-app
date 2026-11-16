'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { FloatingSumBar } from '@/components/common/FloatingSumBar';

import { ResumenHeroKpis } from './ResumenHeroKpis';
import { ResumenDivisasCard } from './ResumenDivisasCard';
import { IngresosMesTabla } from './IngresosMesTabla';
import { DashboardEgresosSection } from './DashboardEgresosSection';
import { DashboardModals } from './DashboardModals';
import { useDashboardEgresos } from './hooks/useDashboardEgresos';

export function DashboardClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    resumen,
    loading,
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
    handleAbrirRegistroSeccion,
  } = useDashboardEgresos();

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  if (!resumen) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No se encontraron datos para este mes.</p>
      </div>
    );
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
