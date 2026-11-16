'use client';

import React from 'react';
import { SeccionEgresoFila } from './SeccionEgresoFila';

interface SeccionEgresosDesktopTableProps {
  items: any[];
  selectedGastoIds: string[];
  moneda: string;
  seccionId?: string;
  draggedId: string | null;
  dragOverId: string | null;
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
              Monto
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
      </table>
    </div>
  );
}
