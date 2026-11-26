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
      <table className="table-fixed w-full text-left text-sm border-collapse">
        <thead className="bg-muted/30 dark:bg-muted/15 border-b border-border/70 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            <th
              scope="col"
              className={`py-3 text-center ${showCuotaColumn ? 'w-[2%] pl-4' : 'w-[2.5%] pl-4'}`}
            >
              <span className="sr-only">Mover</span>
            </th>
            <th
              scope="col"
              className={`py-3 text-center ${showCuotaColumn ? 'w-[3%]' : 'w-[3.5%]'}`}
            >
              <span className="sr-only">Seleccionar</span>
            </th>
            <th
              scope="col"
              className={`py-3 px-3 font-semibold text-muted-foreground ${showCuotaColumn ? 'w-[35%]' : 'w-[42%]'}`}
            >
              Concepto & Detalle
            </th>
            {showCuotaColumn && (
              <th scope="col" className="py-3 px-2 text-center font-semibold text-muted-foreground w-[12%]">
                Cuota
              </th>
            )}
            <th
              scope="col"
              className={`py-3 px-2 text-center font-semibold text-muted-foreground ${showCuotaColumn ? 'w-[11%]' : 'w-[13%]'}`}
            >
              Estado
            </th>
            <th
              scope="col"
              className={`py-3 px-3 text-right font-semibold text-muted-foreground ${showCuotaColumn ? 'w-[12%]' : 'w-[13%]'}`}
            >
              Soles (S/)
            </th>
            <th scope="col" className="py-3 px-3 text-right font-semibold text-muted-foreground w-[10%]">
              Dólares ($)
            </th>
            <th
              scope="col"
              className={`py-3 text-right font-semibold text-muted-foreground pr-5 ${showCuotaColumn ? 'w-[15%]' : 'w-[16%]'}`}
            >
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
        <tfoot className="bg-secondary/20 border-t border-border/80 text-xs">
          <tr>
            <td colSpan={leftColSpan} className="py-2.5 pl-4 pr-3 text-muted-foreground text-xs font-medium">
              <span>Sumatoria independiente ({items.length} {items.length === 1 ? 'compromiso' : 'compromisos'})</span>
            </td>
            <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
              {formatMoney(subtotalSoles, moneda)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
              {subtotalUSD > 0 ? `$${subtotalUSD.toFixed(2)}` : '—'}
            </td>
            <td className="pr-5" />
          </tr>
          {subtotalUSD > 0 && (
            <tr className="border-t border-border/40 bg-secondary/35">
              <td colSpan={leftColSpan} className="py-2.5 pl-4 pr-3 text-muted-foreground text-xs font-medium">
                <span className="text-foreground font-semibold">Total Consolidado en Soles</span>{' '}
                <span className="text-muted-foreground/70 text-[11px] font-normal">(al tipo de cambio)</span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-extrabold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                {formatMoney(totalConsolidado, moneda)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-[11px] text-muted-foreground/70">
                USD incl.
              </td>
              <td className="pr-5" />
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
}
