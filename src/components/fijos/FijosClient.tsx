'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { formatPeriodoLabel } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useFijosManager } from './hooks/useFijosManager';
import { FijosTabla } from './FijosTabla';
import { FijosPrestamosSection } from './FijosPrestamosSection';
import { CuotasTarjetaTabla } from './CuotasTarjetaTabla';
import { FijosModals } from './FijosModals';

export function FijosClient() {
  const {
    periodo,
    resumen,
    loading,
    refresh,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
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
    cuotasTarjeta,
    totalCuotasTarjeta,
    handleToggleEstadoFijo,
    handleCambiarMetodoPagoFijo,
    handleEliminarCostoFijo,
    handleToggleEstadoCuota,
    handleEliminarPrestamo,
    handleToggleEstadoGasto,
    handleGuardarMontoModal,
    handleCambiarMetodoPagoModal,
    handleCambiarEstadoModal,
  } = useFijosManager();

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. SECCIÓN: COSTOS FIJOS DEL MES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Costos Fijos del Mes
              </h1>
              <div className="inline-flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  onMouseEnter={prefetchMesAnterior}
                  disabled={!puedeIrMesAnterior}
                  className={`p-1 rounded transition ${
                    puedeIrMesAnterior
                      ? 'hover:text-foreground text-muted-foreground cursor-pointer'
                      : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
                  }`}
                  title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold px-1 text-foreground capitalize">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  onMouseEnter={prefetchMesSiguiente}
                  className="p-1 hover:text-foreground text-muted-foreground rounded transition cursor-pointer"
                  title="Mes siguiente"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gastos recurrentes y servicios fijos programados para este mes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalFijoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Agregar Costo Fijo</span>
            </button>
          </div>
        </div>

        <FijosTabla
          costosFijos={costosFijos}
          tarjetas={tarjetas}
          moneda={moneda}
          loadingAction={loadingAction}
          onSelect={setDetalleItem}
          onToggleEstado={handleToggleEstadoFijo}
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
        onToggleEstado={handleToggleEstadoCuota}
        onEditarBase={(p) => setEditandoPrestamo(p)}
        onEliminar={handleEliminarPrestamo}
      />

      {/* 3. SECCIÓN: COMPRAS EN CUOTAS CON TARJETA */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Compras en Tarjeta en Cuotas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compras diferidas a cuotas mensuales registradas en tus tarjetas de crédito.
            </p>
          </div>
        </div>

        {cuotasTarjeta.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
            <p className="text-xs text-muted-foreground">
              No hay compras en cuotas con tarjeta registradas para este periodo.
            </p>
          </div>
        ) : (
          <CuotasTarjetaTabla
            cuotasTarjeta={cuotasTarjeta}
            totalCuotasTarjeta={totalCuotasTarjeta}
            moneda={moneda}
            loadingAction={loadingAction}
            onSelect={setDetalleItem}
            onToggleEstado={handleToggleEstadoGasto}
          />
        )}
      </div>

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
        onCambiarEstadoModal={handleCambiarEstadoModal}
        onGuardarMontoModal={handleGuardarMontoModal}
        onCambiarMetodoPagoModal={handleCambiarMetodoPagoModal}
      />
    </div>
  );
}
