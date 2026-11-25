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
  onToggleEstado: (id: string, nuevoEstado: string) => void;
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
      estado: cf.estado,
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

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-muted/40 transition-colors cursor-pointer group"
    >
      {/* 1. Concepto */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[220px] md:max-w-xs" title={cf.concepto}>
          {cf.concepto}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted/60 text-muted-foreground font-normal">
            {cf.mesFin ? `Hasta ${formatPeriodoLabel(cf.mesFin)}` : 'Indefinido'}
          </span>
        </div>
      </td>

      {/* 2. Categoría */}
      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
        <CategoriaTagBadge
          categoria={cf.categoria}
          tag={cf.tag}
          categoriaColor={cf.categoriaColor}
        />
      </td>

      {/* 3. Soles (S/) */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-xs sm:text-sm tabular-nums">
        {cf.monedaOriginal === 'USD' ? (
          <span className="text-muted-foreground/60 font-normal text-xs" title={`Equivalente al TC ${cf.tipoCambio || 4.0}`}>
            ≈ {formatMoney(cf.monto, moneda)}
          </span>
        ) : (
          <span className="font-semibold text-foreground">
            {formatMoney(cf.monto, moneda)}
          </span>
        )}
      </td>

      {/* 4. Dólares ($) */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-xs sm:text-sm tabular-nums">
        {cf.monedaOriginal === 'USD' ? (
          <span className="font-semibold text-foreground">
            ${(cf.montoOriginal != null ? cf.montoOriginal : (cf.monto / (cf.tipoCambio || 4.0))).toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground/40 font-normal">—</span>
        )}
      </td>

      {/* 4. Forma de Pago */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <FijoMetodoPagoSelector
          costoFijoId={cf.id}
          metodoPago={cf.metodoPago}
          tarjetaId={cf.tarjetaId}
          tarjetas={tarjetas}
          disabled={isLoading}
          onCambiarMetodoPago={onCambiarMetodoPago}
        />
      </td>

      {/* 5. Estado */}
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
            cf.estado === 'ADELANTADO'
              ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40'
              : cf.estado === 'PAGADO'
                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              cf.estado === 'ADELANTADO'
                ? 'bg-indigo-500'
                : cf.estado === 'PAGADO'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
            }`}
          />
          {cf.estado === 'ADELANTADO' ? 'Adelantado' : cf.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
        </span>
      </td>

      {/* 6. Acciones */}
      <td className="py-2.5 px-3 text-right">
        <FijoAcciones
          id={cf.id}
          concepto={cf.concepto}
          estado={cf.estado}
          isLoading={isLoading}
          onToggleEstado={(id, nuevo) => onToggleEstado(id, nuevo)}
          onEditar={() => onEditarBase(cf)}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}
