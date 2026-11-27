'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { FijoMetodoPagoSelector } from './FijoMetodoPagoSelector';
import { FijoAcciones } from './FijoAcciones';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface FijoFilaProps {
  cf: any;
  tarjetas: any[];
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado?: (id: string, nuevoEstado: string) => void;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
  onEditarBase: (cf: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function FijoFila({
  cf,
  tarjetas,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijoFilaProps) {
  const handleRowClick = () => {
    onSelect({
      id: `fijo-${cf.id}`,
      dbId: cf.id,
      tipo: 'FIJO',
      clasificacion: 'FIJO',
      concepto: cf.concepto,
      categoria: cf.categoria,
      categoriaId: cf.categoriaId || null,
      tag: cf.tag || null,
      monto: cf.monto,
      diaVencimiento: cf.diaVencimiento,
      estado: cf.estado || 'PENDIENTE',
      fechaPagoReal: cf.fechaPagoReal,
      mesInicio: cf.mesInicio,
      mesFin: cf.mesFin,
      notas: cf.notas,
      monedaOriginal: cf.monedaOriginal,
      montoOriginal: cf.montoOriginal,
      tipoCambio: cf.tipoCambio,
      metodoPago: cf.metodoPago,
      tarjetaId: cf.tarjetaId,
      tarjetaNombre: cf.tarjetaNombre,
      tarjetaBanco: cf.tarjetaBanco,
      tarjetaColor: cf.tarjetaColor,
      tarjetaUltimosCuatro: cf.tarjetaUltimosCuatro,
    });
  };

  const isUSD = cf.monedaOriginal === 'USD';
  const montoUSD = cf.montoOriginal != null ? cf.montoOriginal : (cf.monto / (cf.tipoCambio || 4.0));

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-muted/40 transition-colors cursor-pointer group"
    >
      {/* 1. Concepto y Vigencia */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[220px] md:max-w-xs" title={cf.concepto}>
          {cf.concepto}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
          {cf.diaVencimiento && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-medium text-[10px] bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
              Día {cf.diaVencimiento}
            </span>
          )}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted/60 text-muted-foreground font-normal">
            {cf.mesFin ? `Hasta ${formatPeriodoLabel(cf.mesFin)}` : 'Indefinido'}
          </span>
        </div>
      </td>

      {/* 2. Categoría y Tag */}
      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
        <CategoriaTagBadge
          categoria={cf.categoria}
          tag={cf.tag}
          categoriaColor={cf.categoriaColor}
        />
      </td>

      {/* 3. Monto Base Unificado (Soles / USD claros) */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums">
        {isUSD ? (
          <div>
            <div className="font-semibold text-foreground text-xs sm:text-sm flex items-center justify-end gap-1">
              <span>${montoUSD.toFixed(2)}</span>
              <span className="text-[10px] font-sans font-medium px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                USD
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground font-normal" title={`TC: ${cf.tipoCambio || 4.0}`}>
              ≈ {formatMoney(cf.monto, moneda)}
            </div>
          </div>
        ) : (
          <div className="font-semibold text-foreground text-xs sm:text-sm">
            {formatMoney(cf.monto, moneda)}
          </div>
        )}
      </td>

      {/* 4. Forma de Pago Base */}
      <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <FijoMetodoPagoSelector
          costoFijoId={cf.id}
          metodoPago={cf.metodoPago}
          tarjetaId={cf.tarjetaId}
          tarjetas={tarjetas}
          disabled={isLoading}
          onCambiarMetodoPago={onCambiarMetodoPago}
        />
      </td>

      {/* 5. Acciones */}
      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <FijoAcciones
          id={cf.id}
          concepto={cf.concepto}
          estado={cf.estado}
          isLoading={isLoading}
          onToggleEstado={onToggleEstado ? (id, nuevo) => onToggleEstado(id, nuevo) : undefined}
          onEditar={() => onEditarBase(cf)}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}
