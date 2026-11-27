'use client';

import React from 'react';
import { ModalCrearFijo } from './modals/ModalCrearFijo';
import { ModalEditarFijo } from './modals/ModalEditarFijo';
import { ModalCrearPrestamo } from './modals/ModalCrearPrestamo';
import { ModalEditarPrestamo } from './modals/ModalEditarPrestamo';
import { ModalDetalleGasto, type DetalleItemData, type MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import { ModalConfirmarEliminar } from './modals/ModalConfirmarEliminar';

interface FijosModalsProps {
  modalFijoOpen: boolean;
  onCloseModalFijo: () => void;
  modalPrestamoOpen: boolean;
  onCloseModalPrestamo: () => void;
  editandoCostoFijo: any | null;
  onCloseEditandoFijo: () => void;
  editandoPrestamo: any | null;
  onCloseEditandoPrestamo: () => void;
  detalleItem: DetalleItemData | null;
  onCloseDetalle: () => void;
  periodo: string;
  configTc: number;
  moneda: string;
  tarjetas: any[];
  confirmarEliminar?: {
    open: boolean;
    tipo: 'FIJO' | 'PRESTAMO';
    id: string;
    concepto: string;
  };
  onCloseConfirmarEliminar?: () => void;
  onEjecutarEliminar?: () => void;
  loadingEliminar?: boolean;
  onSuccess: () => Promise<void>;
  onCambiarEstadoModal?: (item: DetalleItemData, nuevoEstado: string) => Promise<void>;
  onGuardarMontoModal: (item: DetalleItemData, nuevoMonto: number, monedaInfo?: MonedaDetalleInfo) => Promise<void>;
  onCambiarMetodoPagoModal: (item: DetalleItemData, nuevoMetodo: string, tarjetaId?: string | null, aplicarFuturos?: boolean) => Promise<void>;
}

export function FijosModals({
  modalFijoOpen,
  onCloseModalFijo,
  modalPrestamoOpen,
  onCloseModalPrestamo,
  editandoCostoFijo,
  onCloseEditandoFijo,
  editandoPrestamo,
  onCloseEditandoPrestamo,
  detalleItem,
  onCloseDetalle,
  periodo,
  configTc,
  moneda,
  tarjetas,
  confirmarEliminar,
  onCloseConfirmarEliminar,
  onEjecutarEliminar,
  loadingEliminar,
  onSuccess,
  onCambiarEstadoModal,
  onGuardarMontoModal,
  onCambiarMetodoPagoModal,
}: FijosModalsProps) {
  return (
    <>
      <ModalCrearFijo
        open={modalFijoOpen}
        onClose={onCloseModalFijo}
        periodo={periodo}
        configTc={configTc}
        tarjetas={tarjetas}
        onSuccess={onSuccess}
      />

      <ModalEditarFijo
        costoFijo={editandoCostoFijo}
        onClose={onCloseEditandoFijo}
        periodo={periodo}
        configTc={configTc}
        moneda={moneda}
        tarjetas={tarjetas}
        onSuccess={onSuccess}
      />

      <ModalCrearPrestamo
        open={modalPrestamoOpen}
        onClose={onCloseModalPrestamo}
        periodo={periodo}
        configTc={configTc}
        onSuccess={onSuccess}
      />

      <ModalEditarPrestamo
        prestamo={editandoPrestamo}
        onClose={onCloseEditandoPrestamo}
        periodo={periodo}
        configTc={configTc}
        onSuccess={onSuccess}
      />

      <ModalDetalleGasto
        item={detalleItem}
        onClose={onCloseDetalle}
        onCambiarEstado={onCambiarEstadoModal}
        onGuardarMonto={onGuardarMontoModal}
        onCambiarMetodoPago={onCambiarMetodoPagoModal}
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />

      {confirmarEliminar && onCloseConfirmarEliminar && onEjecutarEliminar && (
        <ModalConfirmarEliminar
          open={confirmarEliminar.open}
          onClose={onCloseConfirmarEliminar}
          onConfirm={onEjecutarEliminar}
          titulo={
            confirmarEliminar.tipo === 'FIJO'
              ? '¿Eliminar Costo Fijo de la plantilla?'
              : '¿Eliminar Préstamo de la plantilla?'
          }
          descripcion={
            confirmarEliminar.tipo === 'FIJO'
              ? 'Se removerá de la plantilla concurrente y dejará de proyectarse en los próximos meses. Los meses históricos anteriores permanecerán intactos.'
              : 'Se removerá el crédito y sus cuotas asociadas de la plantilla concurrente.'
          }
          nombreItem={confirmarEliminar.concepto}
          loading={loadingEliminar}
        />
      )}
    </>
  );
}
