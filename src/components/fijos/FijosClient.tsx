'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Plus } from 'lucide-react';
import { useFijosManager } from './hooks/useFijosManager';
import { FijosTabla } from './FijosTabla';
import { FijosPrestamosSection } from './FijosPrestamosSection';
import { FijosModals } from './FijosModals';
import { FijosHeroMetrics } from './FijosHeroMetrics';

export function FijosClient() {
  const {
    periodo,
    resumen,
    loading,
    refresh,
    detalleItem,
    setDetalleItem,
    loadingAction,
    modalFijoOpen,
    setModalFijoOpen,
    modalPrestamoOpen,
    setModalPrestamoOpen,
    editandoCostoFijo,
    setEditandoCostoFijo,
    editandoPrestamo,
    setEditandoPrestamo,
    configTc,
    moneda,
    costosFijos,
    prestamos,
    tarjetas,
    handleCambiarMetodoPagoFijo,
    handleEliminarCostoFijo,
    handleEliminarPrestamo,
    handleGuardarMontoModal,
    handleCambiarMetodoPagoModal,
  } = useFijosManager();

  if (loading && costosFijos.length === 0 && prestamos.length === 0) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-10">
      {/* 0. CABECERA & HERO METRICS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Fijos y Préstamos
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Plantilla Concurrente
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              Configuración de compromisos financieros base que se replican automáticamente en cada mes. Los ajustes de montos o pagos puntuales en un mes específico no modifican esta plantilla.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalFijoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Nuevo Costo Fijo</span>
            </button>
          </div>
        </div>

        {/* 3 KPI Cards Resumen */}
        <FijosHeroMetrics
          costosFijos={costosFijos}
          prestamos={prestamos}
          moneda={moneda}
        />
      </div>

      {/* 1. SECCIÓN: COSTOS FIJOS (PLANTILLA CONCURRENTE) */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Costos Fijos Mensuales
            </h2>
            <p className="text-xs text-muted-foreground">
              Suscripciones, servicios, vivienda y gastos fijos recurrentes.
            </p>
          </div>
        </div>

        <FijosTabla
          costosFijos={costosFijos}
          tarjetas={tarjetas}
          moneda={moneda}
          loadingAction={loadingAction}
          onSelect={setDetalleItem}
          onCambiarMetodoPago={handleCambiarMetodoPagoFijo}
          onEditarBase={(cf) => setEditandoCostoFijo(cf)}
          onEliminar={handleEliminarCostoFijo}
        />
      </div>

      {/* 2. SECCIÓN: PRÉSTAMOS BANCARIOS */}
      <FijosPrestamosSection
        prestamos={prestamos}
        moneda={moneda}
        loadingAction={loadingAction}
        onOpenModalPrestamo={() => setModalPrestamoOpen(true)}
        onSelectDetalle={setDetalleItem}
        onEditarBase={(p) => setEditandoPrestamo(p)}
        onEliminar={handleEliminarPrestamo}
      />

      <FijosModals
        modalFijoOpen={modalFijoOpen}
        onCloseModalFijo={() => setModalFijoOpen(false)}
        modalPrestamoOpen={modalPrestamoOpen}
        onCloseModalPrestamo={() => setModalPrestamoOpen(false)}
        editandoCostoFijo={editandoCostoFijo}
        onCloseEditandoFijo={() => setEditandoCostoFijo(null)}
        editandoPrestamo={editandoPrestamo}
        onCloseEditandoPrestamo={() => setEditandoPrestamo(null)}
        detalleItem={detalleItem}
        onCloseDetalle={() => setDetalleItem(null)}
        periodo={periodo}
        configTc={configTc}
        moneda={moneda}
        tarjetas={tarjetas}
        onSuccess={refresh}
        onGuardarMontoModal={handleGuardarMontoModal}
        onCambiarMetodoPagoModal={handleCambiarMetodoPagoModal}
      />
    </div>
  );
}
