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
import { DashboardStateFallbacks } from './DashboardStateFallbacks';
import { useDashboardEgresos } from './hooks/useDashboardEgresos';

export function DashboardClient() {
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
    <div className="space-y-8 animate-in fade-in duration-200">
      <FloatingSumBar />

      {/* 1. HERO EJECUTIVO DEL MES */}
      <ResumenHeroKpis
        periodo={d.periodo}
        irMesAnterior={d.irMesAnterior}
        irMesSiguiente={d.irMesSiguiente}
        puedeIrMesAnterior={d.puedeIrMesAnterior}
        disponibleNeto={d.disponibleNeto}
        totalIngresos={d.resumen.totalIngresos}
        totalEgresos={d.resumen.totalEgresos}
        totalPendiente={d.resumen.totalPendiente}
        totalAdelantado={d.resumen.totalAdelantado}
        cantidadIngresos={d.resumen.ingresos.length}
        moneda={d.moneda}
        esMesEspecial={d.esMesEspecial}
        labelEspecial={d.labelEspecial}
        salud={d.resumen.saludFinanciera}
        openRecordModal={d.openRecordModal}
      />

      {/* 2. RESUMEN DE DIVISAS (SI TIENE MÚLTIPLES MONEDAS) */}
      {d.resumen.resumenDivisas?.tieneMultiplesMonedas && (
        <ResumenDivisasCard divisas={d.resumen.resumenDivisas} moneda={d.moneda} />
      )}

      {/* 3. INGRESOS DEL MES (FUENTES DE ENTRADA) */}
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

      {/* 4. EGRESOS & COMPROMISOS (CENTRO OPERACIONAL CON TOOLBAR UNIFICADA) */}
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
      />

      {/* 5. DIAGNÓSTICO & SALUD FINANCIERA (50/30/20, RATIOS, ALERTAS Y GUÍA) */}
      <DashboardSaludSection
        salud={d.resumen.saludFinanciera}
        moneda={d.moneda}
        onOpenRecordModal={d.openRecordModal}
        onAsignarSuperavit={(monto) => {
          d.openRecordModal('GASTO', {
            concepto: 'Fondo de Emergencia / Ahorro',
            monto,
            tag: 'Fondo de Emergencia',
            metodoPago: 'TRANSFERENCIA',
          });
        }}
      />

      {/* 6. MODALES DEL DASHBOARD */}
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
