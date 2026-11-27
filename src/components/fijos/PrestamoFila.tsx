'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { PrestamoAcciones } from './PrestamoAcciones';

interface PrestamoFilaProps {
  p: any;
  moneda: string;
  isLoading: boolean;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado?: (cuotaId: string, nuevoEstado: string) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamoFila({
  p,
  moneda,
  isLoading,
  onSelect,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: PrestamoFilaProps) {
  const progreso = Math.round(((p.cuotaActual || 1) / (p.cuotasTotales || 1)) * 100);

  const handleClick = () => {
    onSelect({
      id: `prestamo-${p.cuotaId}`,
      dbId: p.cuotaId,
      prestamoId: p.id,
      tipo: 'PRESTAMO',
      clasificacion: 'PRESTAMO_CUOTA',
      concepto: `${p.banco} - ${p.concepto}`,
      banco: p.banco,
      nombrePrestamo: p.concepto,
      categoria: 'Préstamo Bancario',
      monto: p.montoCuota,
      montoTotal: p.montoTotal,
      tasaInteresAnual: p.tasaInteresAnual,
      cuotaActual: p.cuotaActual,
      cuotasTotales: p.cuotasTotales,
      diaVencimiento: p.diaPago,
      estado: p.estado,
      fechaPagoReal: p.fechaPagoReal,
      monedaOriginal: p.monedaOriginal,
      montoOriginal: p.montoOriginal,
      tipoCambio: p.tipoCambio,
    });
  };

  const isUSD = p.monedaOriginal === 'USD';
  const cuotaUSD = p.montoOriginal != null ? p.montoOriginal : (p.montoCuota / (p.tipoCambio || 4.0));

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-muted/40 transition-colors cursor-pointer group"
    >
      {/* 1. Concepto y Banco */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
            {p.banco}
          </span>
          <span className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px]" title={p.concepto}>
            {p.concepto}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          Día de pago {p.diaPago} de cada mes
        </div>
      </td>

      {/* 2. Progreso de Amortización */}
      <td className="py-2.5 px-3">
        <div className="w-32 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              Cuota {p.cuotaActual} de {p.cuotasTotales}
            </span>
            <span className="font-medium text-foreground">{progreso}%</span>
          </div>
          <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(progreso, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* 3. TEA % */}
      <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap text-xs font-mono">
        <span className="px-1.5 py-0.5 rounded bg-muted/50 font-medium">
          {p.tasaInteresAnual}% TEA
        </span>
      </td>

      {/* 4. Cuota Base Unificada (Soles / USD) */}
      <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {isUSD ? (
          <div>
            <div className="font-semibold text-foreground flex items-center justify-end gap-1">
              <span>${cuotaUSD.toFixed(2)}</span>
              <span className="text-[10px] font-sans font-medium px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                USD
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground font-normal">
              ≈ {formatMoney(p.montoCuota, moneda)}
            </div>
          </div>
        ) : (
          <div className="font-semibold text-foreground">
            {formatMoney(p.montoCuota, moneda)}
          </div>
        )}
      </td>

      {/* 5. Total Préstamo */}
      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground text-xs tabular-nums whitespace-nowrap">
        {p.montoTotal ? formatMoney(p.montoTotal, moneda) : '—'}
      </td>

      {/* 6. Acciones */}
      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <PrestamoAcciones
          cuotaId={p.cuotaId}
          prestamoId={p.id}
          conceptoCompleto={`${p.banco} - ${p.concepto}`}
          estado={p.estado}
          aplicaEsteMes={p.aplicaEsteMes !== false}
          isLoading={isLoading}
          onToggleEstado={onToggleEstado}
          onEditarBase={() => onEditarBase(p)}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}
