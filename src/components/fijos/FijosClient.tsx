'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Plus, Landmark, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
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
      {/* 0. SWITCHER CONTEXTUAL & CABECERA */}
      <div className="space-y-4">
        {/* Switcher contextual entre Vista Mensual Operativa y Plantilla Base */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/60 text-xs">
            <Link
              href="/finanzas-mes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Finanzas del Mes</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background text-foreground shadow-2xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Plantilla Concurrente (Base)</span>
            </div>
          </div>
        </div>

        {/* Título y Acciones Primarias */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Fijos y Préstamos
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Plantilla Concurrente Maestra
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              Compromisos fijos recurrentes que se replican automáticamente en cada mes. Los cambios o pagos que realices en un mes específico no afectarán estos valores base.
            </p>
          </div>

          {/* Acciones principales dobles */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setModalPrestamoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted/60 text-foreground font-medium text-xs transition active:scale-98 cursor-pointer shadow-2xs"
            >
              <Landmark className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Nuevo Préstamo</span>
            </button>

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
              Suscripciones, servicios básicos, vivienda y egresos fijos periódicos.
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
