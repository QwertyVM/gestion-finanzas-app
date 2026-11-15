'use client';

import React from 'react';
import { ClasificacionEgreso } from '@/lib/utils';
import { DetalleItemData } from './types';
import { DetallePropiedadesFijo } from './DetallePropiedadesFijo';
import { DetallePropiedadesVariable } from './DetallePropiedadesVariable';
import { DetallePropiedadesTarjeta } from './DetallePropiedadesTarjeta';

interface DetallePropiedadesSeccionProps {
  clasificacionLocal: ClasificacionEgreso;
  item: DetalleItemData;
  notasLocal: string;
  tarjetas: Array<{
    id: string;
    nombre: string;
    banco: string;
    color: string;
    ultimosCuatro?: string | null;
    diaCorte?: number;
    diaPago?: number;
  }>;
  onCambiarMetodoPago?: (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => Promise<void>;
  onGuardarNotas: (nuevasNotas: string) => Promise<void>;
}

export function DetallePropiedadesSeccion({
  clasificacionLocal,
  item,
  notasLocal,
  tarjetas,
  onCambiarMetodoPago,
  onGuardarNotas,
}: DetallePropiedadesSeccionProps) {
  if (clasificacionLocal === 'FIJO') {
    return (
      <DetallePropiedadesFijo
        metodoPago={item.metodoPago}
        tarjetaId={item.tarjetaId}
        tarjetaNombre={item.tarjetaNombre}
        tarjetaBanco={item.tarjetaBanco}
        categoria={item.categoria}
        categoriaColor={item.categoriaColor}
        mesInicio={item.mesInicio}
        mesFin={item.mesFin}
        notas={notasLocal}
        tarjetas={tarjetas}
        onCambiarMetodoPago={
          onCambiarMetodoPago ? (m, t, f) => onCambiarMetodoPago(item, m, t, f) : undefined
        }
        onGuardarNotas={onGuardarNotas}
      />
    );
  }

  if (clasificacionLocal === 'VARIABLE') {
    return (
      <DetallePropiedadesVariable
        metodoPago={item.metodoPago}
        tarjetaId={item.tarjetaId}
        tarjetaNombre={item.tarjetaNombre}
        tarjetaBanco={item.tarjetaBanco}
        tarjetaDiaCorte={item.tarjetaDiaCorte}
        fechaGasto={item.fechaGasto}
        periodoPago={item.periodoPago}
        categoria={item.categoria}
        categoriaColor={item.categoriaColor}
        notas={notasLocal}
        tarjetas={tarjetas}
        onCambiarMetodoPago={
          onCambiarMetodoPago ? (m, t) => onCambiarMetodoPago(item, m, t, false) : undefined
        }
        onGuardarNotas={onGuardarNotas}
      />
    );
  }

  if (clasificacionLocal === 'CUOTA') {
    return (
      <DetallePropiedadesTarjeta
        tarjetaNombre={item.tarjetaNombre}
        tarjetaBanco={item.tarjetaBanco}
        tarjetaDiaCorte={item.tarjetaDiaCorte}
        fechaGasto={item.fechaGasto}
        periodoPago={item.periodoPago}
        categoria={item.categoria}
        categoriaColor={item.categoriaColor}
      />
    );
  }

  return null;
}
