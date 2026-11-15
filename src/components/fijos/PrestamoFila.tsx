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
  onToggleEstado: (cuotaId: string, nuevoEstado: string) => void;
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
  const isPagado = p.estado === 'PAGADO';
  const isAdelantado = p.estado === 'ADELANTADO';

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
      </td>

      {/* 2. Progreso */}
      <td className="py-2.5 px-3">
        <div className="w-28 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {p.aplicaEsteMes === false ? 'Fuera de rango' : `Cta ${p.cuotaActual}/${p.cuotasTotales}`}
            </span>
            <span className="font-medium text-foreground">{progreso}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(progreso, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* 3. TEA % */}
      <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap text-xs font-mono">
        {p.tasaInteresAnual}%
      </td>

      {/* 4. Cuota Mensual */}
      <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {formatMoney(p.montoCuota, moneda)}
      </td>

      {/* 5. Total */}
      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground text-xs tabular-nums whitespace-nowrap">
        {p.montoTotal ? formatMoney(p.montoTotal, moneda) : '—'}
      </td>

      {/* 6. Estado */}
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        {p.aplicaEsteMes === false ? (
          <span className="text-[11px] text-muted-foreground">Fuera de periodo</span>
        ) : (
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
        )}
      </td>

      {/* 7. Acciones */}
      <td className="py-2.5 px-3 text-right">
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
