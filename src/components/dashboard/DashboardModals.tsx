'use client';

import React from 'react';
import { ModalDetalleGasto, DetalleItemData, MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import { ModalEditarSueldo } from '@/components/modals/ModalEditarSueldo';
import { ModalEditarIngreso } from '@/components/modals/ModalEditarIngreso';
import type { IngresoItem } from './IngresoCardMobile';

interface DashboardModalsProps {
  detalleItem: DetalleItemData | null;
  onCloseDetalle: () => void;
  onCambiarEstado: (item: DetalleItemData, nuevoEstado: string) => Promise<void>;
  onGuardarMonto: (item: DetalleItemData, nuevoMonto: number, monedaInfo?: MonedaDetalleInfo) => Promise<void>;
  onEliminarGasto: (item: DetalleItemData) => Promise<void>;
  onCambiarMetodoPago: (item: DetalleItemData, nuevoMetodo: string, tarjetaId?: string | null, aplicarFuturos?: boolean) => Promise<void>;
  onCambiarClasificacion: (item: DetalleItemData, nuevaClasificacion: 'FIJO' | 'VARIABLE') => Promise<void>;
  onCambiarCategoria: (item: DetalleItemData, nuevaCategoriaId: string, aplicarSerie?: boolean) => Promise<void>;
  onGuardarConcepto: (item: DetalleItemData, nuevoConcepto: string) => Promise<void>;
  onGuardarNotas: (item: DetalleItemData, nuevasNotas: string) => Promise<void>;
  tarjetas?: any[];
  moneda: string;
  modalSueldoOpen: boolean;
  onCloseSueldo: () => void;
  sueldoParaEditar: number;
  periodo: string;
  ingresoParaEditar: IngresoItem | null;
  onCloseIngreso: () => void;
  onEliminarIngreso: (id: string) => Promise<void>;
}

export function DashboardModals({
  detalleItem,
  onCloseDetalle,
  onCambiarEstado,
  onGuardarMonto,
  onEliminarGasto,
  onCambiarMetodoPago,
  onCambiarClasificacion,
  onCambiarCategoria,
  onGuardarConcepto,
  onGuardarNotas,
  tarjetas,
  moneda,
  modalSueldoOpen,
  onCloseSueldo,
  sueldoParaEditar,
  periodo,
  ingresoParaEditar,
  onCloseIngreso,
  onEliminarIngreso,
}: DashboardModalsProps) {
  return (
    <>
      <ModalDetalleGasto
        item={detalleItem}
        onClose={onCloseDetalle}
        onCambiarEstado={onCambiarEstado}
        onGuardarMonto={onGuardarMonto}
        onEliminarGasto={onEliminarGasto}
        onCambiarMetodoPago={onCambiarMetodoPago}
        onCambiarClasificacion={onCambiarClasificacion}
        onCambiarCategoria={onCambiarCategoria}
        onGuardarConcepto={onGuardarConcepto}
        onGuardarNotas={onGuardarNotas}
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />

      <ModalEditarSueldo
        isOpen={modalSueldoOpen}
        onClose={onCloseSueldo}
        sueldoActual={sueldoParaEditar}
        periodoActual={periodo}
        monedaSimbolo={moneda}
      />

      <ModalEditarIngreso
        isOpen={Boolean(ingresoParaEditar)}
        ingreso={ingresoParaEditar}
        onClose={onCloseIngreso}
        moneda={moneda}
        periodoActual={periodo}
        onEliminarIngreso={onEliminarIngreso}
      />
    </>
  );
}
