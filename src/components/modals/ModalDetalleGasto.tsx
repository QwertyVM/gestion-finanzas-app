'use client';

import React from 'react';
import type { DetalleItemData, ModalDetalleGastoProps } from './detalle/types';
import { useDetalleGasto } from './detalle/useDetalleGasto';
import { DetalleHeader } from './detalle/DetalleHeader';
import { DetalleMontoHero } from './detalle/DetalleMontoHero';
import { DetalleEstadoSelector } from './detalle/DetalleEstadoSelector';
import { DetalleClasificacionSelector } from './detalle/DetalleClasificacionSelector';
import { DetallePropiedadesSeccion } from './detalle/DetallePropiedadesSeccion';
import { DetalleCuotasProgress } from './detalle/DetalleCuotasProgress';
import { DetallePropiedadesPrestamo } from './detalle/DetallePropiedadesPrestamo';
import { DetalleFooterAcciones } from './detalle/DetalleFooterAcciones';

export type { DetalleItemData, ModalDetalleGastoProps };

export function ModalDetalleGasto({
  item,
  onClose,
  onCambiarEstado,
  onGuardarMonto,
  onEliminarGasto,
  onCambiarMetodoPago,
  onCambiarClasificacion,
  onGuardarConcepto,
  onGuardarNotas,
  monedaSimbolo = 'S/',
  tarjetas = [],
}: ModalDetalleGastoProps) {
  const d = useDetalleGasto(
    item,
    onClose,
    onCambiarEstado,
    onGuardarMonto,
    onEliminarGasto,
    onCambiarClasificacion,
    onGuardarConcepto,
    onGuardarNotas,
    monedaSimbolo
  );

  if (!item) return null;

  const tieneCuotas = Boolean(
    (item.totalCuotas && item.totalCuotas > 1) ||
    (item.cuotasTotales && item.cuotasTotales > 1) ||
    item.tipo === 'PRESTAMO'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card border-t sm:border border-border w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 text-card-foreground max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Arrastre visual táctil para Móvil */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
        <DetalleHeader
          concepto={d.conceptoLocal}
          tipo={item.tipo}
          clasificacion={d.clasificacionLocal}
          editandoConcepto={d.editandoConcepto}
          conceptoEditInput={d.conceptoEditInput}
          savingConcepto={d.savingConcepto}
          onStartEditConcepto={() => d.setEditandoConcepto(true)}
          onCancelEditConcepto={() => d.setEditandoConcepto(false)}
          onChangeConceptoInput={d.setConceptoEditInput}
          onGuardarConcepto={d.handleGuardarConcepto}
          onClose={onClose}
        />

        <div className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          <DetalleMontoHero
            monto={item.monto}
            monedaSimbolo={monedaSimbolo}
            monedaOriginal={item.monedaOriginal}
            montoOriginal={item.montoOriginal}
            tipoCambio={item.tipoCambio}
            editandoMonto={d.editandoMonto}
            montoEditInput={d.montoEditInput}
            savingMonto={d.savingMonto}
            modoEdicion={d.modoEdicion}
            montoUsdEdit={d.montoUsdEdit}
            tcEdit={d.tcEdit}
            permitirEditar={Boolean(onGuardarMonto)}
            onStartEditMonto={() => d.setEditandoMonto(true)}
            onCancelEditMonto={() => d.setEditandoMonto(false)}
            onChangeMontoInput={d.setMontoEditInput}
            onChangeModoEdicion={d.setModoEdicion}
            onChangeMontoUsd={d.setMontoUsdEdit}
            onChangeTc={d.setTcEdit}
            onGuardarMonto={d.handleGuardarMonto}
          />

          <DetalleEstadoSelector
            estado={item.estado}
            fechaPagoReal={item.fechaPagoReal}
            updating={d.updating}
            onCambiarEstado={d.handleEstado}
          />

          {item.tipo !== 'PRESTAMO' && (
            <DetalleClasificacionSelector
              clasificacionActual={d.clasificacionLocal}
              isUpdating={d.updatingClasificacion}
              onCambiarClasificacion={d.handleClasificacionChange}
            />
          )}

          <DetallePropiedadesSeccion
            clasificacionLocal={d.clasificacionLocal}
            item={item}
            notasLocal={d.notasLocal}
            tarjetas={tarjetas}
            onCambiarMetodoPago={onCambiarMetodoPago}
            onGuardarNotas={d.handleGuardarNotas}
          />

          {tieneCuotas && (
            <DetalleCuotasProgress
              cuotaActual={item.cuotaActual || 1}
              cuotasTotales={item.totalCuotas || item.cuotasTotales || 1}
              montoCuota={item.monto}
              montoTotal={item.montoTotal}
              monedaSimbolo={monedaSimbolo}
              esPrestamo={item.tipo === 'PRESTAMO'}
              onGuardarCuotaActual={d.handleGuardarCuotaActual}
              onGuardarCuotasTotales={d.handleGuardarCuotasTotales}
              onGuardarCuotasRestantes={d.handleGuardarCuotasRestantes}
              onGuardarMontoTotal={d.handleGuardarMontoTotal}
            />
          )}

          {item.tipo === 'PRESTAMO' && (
            <DetallePropiedadesPrestamo
              banco={item.banco}
              tasaInteresAnual={item.tasaInteresAnual}
              categoria={item.categoria}
            />
          )}
        </div>

        <DetalleFooterAcciones
          tipo={item.tipo}
          tieneCuotas={tieneCuotas}
          updating={d.updating}
          onEliminarGasto={d.handleEliminar}
          onEliminarCompraCompleta={d.handleEliminarCompraCompleta}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
