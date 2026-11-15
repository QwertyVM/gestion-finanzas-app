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
  categoriaNombre?: string;
  categoriaColor?: string;
  categoriaId?: string | null;
  onCambiarMetodoPago?: (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => Promise<void>;
  onCambiarCategoria?: (categoriaId: string, aplicarSerie?: boolean) => Promise<void>;
  onGuardarNotas: (nuevasNotas: string) => Promise<void>;
}

export function DetallePropiedadesSeccion({
  clasificacionLocal,
  item,
  notasLocal,
  tarjetas,
  categoriaNombre,
  categoriaColor,
  categoriaId,
  onCambiarMetodoPago,
  onCambiarCategoria,
  onGuardarNotas,
}: DetallePropiedadesSeccionProps) {
  const tieneCuotas = Boolean((item.totalCuotas || 1) > 1);
  const catNombreFinal = categoriaNombre || item.categoria;
  const catColorFinal = categoriaColor || item.categoriaColor;
  const catIdFinal = categoriaId !== undefined ? categoriaId : item.categoriaId;

  if (clasificacionLocal === 'FIJO') {
    return (
      <DetallePropiedadesFijo
        metodoPago={item.metodoPago}
        tarjetaId={item.tarjetaId}
        tarjetaNombre={item.tarjetaNombre}
        tarjetaBanco={item.tarjetaBanco}
        categoria={catNombreFinal}
        categoriaId={catIdFinal}
        categoriaColor={catColorFinal}
        mesInicio={item.mesInicio}
        mesFin={item.mesFin}
        notas={notasLocal}
        tarjetas={tarjetas}
        onCambiarMetodoPago={
          onCambiarMetodoPago ? (m, t, f) => onCambiarMetodoPago(item, m, t, f) : undefined
        }
        onCambiarCategoria={onCambiarCategoria ? (cId) => onCambiarCategoria(cId, false) : undefined}
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
        categoria={catNombreFinal}
        categoriaId={catIdFinal}
        categoriaColor={catColorFinal}
        tieneCuotas={tieneCuotas}
        notas={notasLocal}
        tarjetas={tarjetas}
        onCambiarMetodoPago={
          onCambiarMetodoPago ? (m, t) => onCambiarMetodoPago(item, m, t, false) : undefined
        }
        onCambiarCategoria={onCambiarCategoria}
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
        categoria={catNombreFinal}
        categoriaId={catIdFinal}
        categoriaColor={catColorFinal}
        tieneCuotas={tieneCuotas}
        onCambiarCategoria={onCambiarCategoria}
      />
    );
  }

  return null;
}
