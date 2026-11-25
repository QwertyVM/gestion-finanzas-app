'use client';

import React, { useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import { SeccionEgresoFila } from './SeccionEgresoFila';

interface SeccionEgresosDesktopTableProps {
  items: any[];
  selectedGastoIds: string[];
  moneda: string;
  seccionId?: string;
  draggedId: string | null;
  dragOverId: string | null;
  ingresosMes?: any[];
  onAsignarIngreso?: (item: any, ingresoId: string | null) => Promise<void> | void;
  onSelectItem: (item: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onToggleEstadoItem: (item: any, nuevoEstado: string) => void;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeave: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, e: React.DragEvent) => void;
}

export function SeccionEgresosDesktopTable({
  items,
  selectedGastoIds,
  moneda,
  seccionId,
  draggedId,
  dragOverId,
  ingresosMes,
  onAsignarIngreso,
  onSelectItem,
  onToggleSelectGasto,
  onToggleEstadoItem,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: SeccionEgresosDesktopTableProps) {
  const showCuotaColumn =
    seccionId === 'CUOTAS' ||
    seccionId === 'PRESTAMOS' ||
    items.some(
      (it) =>
        Boolean(it.cuotaActual) &&
        ((it.totalCuotas && it.totalCuotas > 1) || (it.cuotasTotales && it.cuotasTotales > 1))
    );

  const subtotalSoles = useMemo(
    () => items.filter((it) => it.monedaOriginal !== 'USD').reduce((sum, it) => sum + (it.monto || 0), 0),
    [items]
  );

  const subtotalUSD = useMemo(
    () => items.filter((it) => it.monedaOriginal === 'USD').reduce(
      (sum, it) => sum + (it.montoOriginal != null ? it.montoOriginal : (it.monto || 0) / (it.tipoCambio || 4.0)),
      0
    ),
    [items]
  );

  const totalConsolidado = useMemo(
    () => items.reduce((sum, it) => sum + (it.monto || 0), 0),
    [items]
  );

  const leftColSpan = showCuotaColumn ? 5 : 4;

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
          <tr>
            <th scope="col" className="py-2.5 px-2 w-7 text-center">
              <span className="sr-only">Mover</span>
            </th>
            <th scope="col" className="py-2.5 px-2 w-8 text-center">
              <span className="sr-only">Seleccionar</span>
            </th>
            <th scope="col" className="py-2.5 px-3 font-semibold text-foreground">
              Concepto & Detalle
            </th>
            {showCuotaColumn && (
              <th scope="col" className="py-2.5 px-3 text-center font-semibold text-foreground">
                Cuota
              </th>
            )}
            <th scope="col" className="py-2.5 px-3 text-center font-semibold text-foreground">
              Estado
            </th>
            <th scope="col" className="py-2.5 px-3 text-right font-semibold text-foreground">
              Soles (S/)
            </th>
            <th scope="col" className="py-2.5 px-3 text-right font-semibold text-foreground">
              Dólares ($)
            </th>
            <th scope="col" className="py-2.5 px-3 text-right font-semibold text-foreground">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {items.map((item) => (
            <SeccionEgresoFila
              key={item.id}
              item={item}
              showCuotaColumn={showCuotaColumn}
              isSelected={selectedGastoIds.includes(item.id)}
              dragOverId={dragOverId}
              draggedId={draggedId}
              moneda={moneda}
              ingresosMes={ingresosMes}
              onAsignarIngreso={onAsignarIngreso}
              onSelectItem={onSelectItem}
              onToggleSelectGasto={onToggleSelectGasto}
              onToggleEstadoItem={onToggleEstadoItem}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
            />
          ))}
        </tbody>
        <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
          <tr>
            <td colSpan={leftColSpan} className="py-2.5 px-3 text-muted-foreground text-xs font-medium">
              <span>Sumatoria independiente ({items.length} {items.length === 1 ? 'compromiso' : 'compromisos'})</span>
            </td>
            <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
              {formatMoney(subtotalSoles, moneda)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
              {subtotalUSD > 0 ? `$${subtotalUSD.toFixed(2)}` : '—'}
            </td>
            <td />
          </tr>
          {subtotalUSD > 0 && (
            <tr className="border-t border-border/40 bg-muted/30">
              <td colSpan={leftColSpan} className="py-2 px-3 text-muted-foreground text-[11px] font-medium">
                <span className="text-foreground font-semibold">Total en Soles</span> (consolidado al tipo de cambio)
              </td>
              <td colSpan={2} className="py-2 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                {formatMoney(totalConsolidado, moneda)}
              </td>
              <td />
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
}
