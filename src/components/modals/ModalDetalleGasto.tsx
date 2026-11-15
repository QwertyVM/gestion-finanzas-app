'use client';

import React from 'react';
import type { DetalleItemData, ModalDetalleGastoProps } from './detalle/types';
import { useDetalleGasto } from './detalle/useDetalleGasto';
import { DetalleHeader } from './detalle/DetalleHeader';
import { DetalleMontoHero } from './detalle/DetalleMontoHero';
import { DetalleEstadoSelector } from './detalle/DetalleEstadoSelector';
import { DetalleClasificacionSelector } from './detalle/DetalleClasificacionSelector';
import { DetallePropiedadesFijo } from './detalle/DetallePropiedadesFijo';
import { DetallePropiedadesTarjeta } from './detalle/DetallePropiedadesTarjeta';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
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

          {item.tipo === 'FIJO' && (
            <DetallePropiedadesFijo
              metodoPago={item.metodoPago}
              tarjetaId={item.tarjetaId}
              tarjetaNombre={item.tarjetaNombre}
              tarjetaBanco={item.tarjetaBanco}
              categoria={item.categoria}
              categoriaColor={item.categoriaColor}
              mesInicio={item.mesInicio}
              mesFin={item.mesFin}
              notas={d.notasLocal}
              tarjetas={tarjetas}
              onCambiarMetodoPago={onCambiarMetodoPago ? (m, t, f) => onCambiarMetodoPago(item, m, t, f) : undefined}
              onGuardarNotas={d.handleGuardarNotas}
            />
          )}

          {item.tipo === 'TARJETA' && (
            <DetallePropiedadesTarjeta
              tarjetaNombre={item.tarjetaNombre}
              tarjetaBanco={item.tarjetaBanco}
              tarjetaDiaCorte={item.tarjetaDiaCorte}
              fechaGasto={item.fechaGasto}
              periodoPago={item.periodoPago}
              categoria={item.categoria}
              categoriaColor={item.categoriaColor}
            />
          )}

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
