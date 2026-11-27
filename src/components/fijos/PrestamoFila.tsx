'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { PrestamoAcciones } from './PrestamoAcciones';

interface PrestamoFilaProps {
  p: any;
  moneda: string;
  isLoading: boolean;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamoFila({
  p,
  moneda,
  isLoading,
  onEditarBase,
  onEliminar,
}: PrestamoFilaProps) {
  const progreso = Math.round(((p.cuotaActual || 1) / (p.cuotasTotales || 1)) * 100);
  const isUSD = p.monedaOriginal === 'USD';
  const cuotaUSD = p.montoOriginal != null ? p.montoOriginal : (p.montoCuota / (p.tipoCambio || 4.0));

  return (
    <tr
      onClick={() => onEditarBase(p)}
      className="hover:bg-muted/40 transition-colors cursor-pointer group"
      title="Clic para editar condiciones base del préstamo"
    >
      {/* 1. Concepto y Banco */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
            {p.banco}
          </span>
          <span className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px] group-hover:text-primary transition-colors" title={p.concepto}>
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
          prestamoId={p.id}
          conceptoCompleto={`${p.banco} - ${p.concepto}`}
          isLoading={isLoading}
          onEditarBase={() => onEditarBase(p)}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}
