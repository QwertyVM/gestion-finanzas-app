'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { CuotaTarjetaAcciones } from './CuotaTarjetaAcciones';

interface CuotaTarjetaFilaProps {
  c: any;
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (gastoId: string, nuevoEstado: string) => void;
}

export function CuotaTarjetaFila({
  c,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
}: CuotaTarjetaFilaProps) {
  const progreso = Math.round(((c.cuotaActual || 1) / (c.totalCuotas || 1)) * 100);
  const isPagado = c.estado === 'PAGADO';
  const isAdelantado = c.estado === 'ADELANTADO';

  const handleClick = () => {
    onSelect({
      id: c.id,
      dbId: c.id,
      tipo: 'TARJETA',
      clasificacion: 'CUOTA',
      concepto: c.concepto,
      categoria: c.categoria || 'Tarjeta',
      monto: c.monto,
      cuotaActual: c.cuotaActual,
      totalCuotas: c.totalCuotas,
      diaVencimiento: c.tarjetaDiaPago,
      estado: c.estado,
      fechaPagoReal: c.fechaPagoReal,
      monedaOriginal: c.monedaOriginal,
      montoOriginal: c.montoOriginal,
      tipoCambio: c.tipoCambio,
      tarjetaNombre: c.tarjetaNombre,
      tarjetaColor: c.tarjetaColor,
      tarjetaBanco: c.tarjetaBanco,
    });
  };

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-muted/40 transition-colors cursor-pointer group"
    >
      {/* 1. Concepto */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px]" title={c.concepto}>
          {limpiarConceptoCuota(c.concepto)}
        </div>
      </td>

      {/* 2. Tarjeta */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: c.tarjetaColor || '#6366f1' }}
          />
          {c.tarjetaNombre}
        </span>
      </td>

      {/* 3. Cuota */}
      <td className="py-2.5 px-3">
        <div className="w-32 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Cuota {c.cuotaActual} de {c.totalCuotas}</span>
            <span className="font-medium text-foreground">{progreso}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(progreso, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* 4. Soles (S/) */}
      <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {c.monedaOriginal === 'USD' ? (
          <span className="text-muted-foreground/60 font-normal text-xs" title={`Equivalente al TC ${c.tipoCambio || 4.0}`}>
            ≈ {formatMoney(c.monto, moneda)}
          </span>
        ) : (
          <span className="font-semibold text-foreground">
            {formatMoney(c.monto, moneda)}
          </span>
        )}
      </td>

      {/* 5. Dólares ($) */}
      <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {c.monedaOriginal === 'USD' ? (
          <span className="font-semibold text-foreground">
            ${(c.montoOriginal != null ? c.montoOriginal : (c.monto / (c.tipoCambio || 4.0))).toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground/40 font-normal">—</span>
        )}
      </td>

      {/* 5. Estado */}
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
            isAdelantado
              ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40'
              : isPagado
                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAdelantado ? 'bg-indigo-500' : isPagado ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {isAdelantado ? 'Adelantado' : isPagado ? 'Pagado' : 'Pendiente'}
        </span>
      </td>

      {/* 6. Acciones */}
      <td className="py-2.5 px-3 text-right">
        <CuotaTarjetaAcciones
          id={c.id}
          estado={c.estado}
          isLoading={isLoading}
          onToggleEstado={onToggleEstado}
        />
      </td>
    </tr>
  );
}
