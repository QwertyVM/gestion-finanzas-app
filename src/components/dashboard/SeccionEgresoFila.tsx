'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { GripVertical, CheckSquare, Square, Check } from 'lucide-react';

interface SeccionEgresoFilaProps {
  item: any;
  showCuotaColumn?: boolean;
  isSelected: boolean;
  dragOverId: string | null;
  draggedId: string | null;
  moneda: string;
  onSelectItem: (item: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onToggleEstadoItem: (item: any, nuevoEstado: string) => void;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeave: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, e: React.DragEvent) => void;
}

export function SeccionEgresoFila({
  item,
  showCuotaColumn = false,
  isSelected,
  dragOverId,
  draggedId,
  moneda,
  onSelectItem,
  onToggleSelectGasto,
  onToggleEstadoItem,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: SeccionEgresoFilaProps) {
  const isPagado = item.estado === 'PAGADO';
  const isAdelantado = item.estado === 'ADELANTADO';
  const esPrestamo = item.tipo === 'PRESTAMO' || item.clasificacion === 'PRESTAMO';
  const cuotaTotal = item.totalCuotas || item.cuotasTotales || 1;

  const subtextoLimpio = showCuotaColumn
    ? esPrestamo
      ? (item.banco || item.subtexto?.replace(/Cuota\s+\d+\/\d+\s*·?\s*/i, '').replace(/\s*\([^)]*\)/, '') || '')
      : (item.tarjetaNombre || item.subtexto?.replace(/·?\s*Cuota\s+\d+\/\d+/i, '') || '')
    : item.subtexto;

  return (
    <tr
      draggable
      onDragStart={(e) => onDragStart(item.id, e)}
      onDragOver={(e) => onDragOver(item.id, e)}
      onDragLeave={() => onDragLeave(item.id)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(item.id, e)}
      onClick={() => onSelectItem(item)}
      className={`group transition-colors cursor-pointer hover:bg-muted/40 ${isSelected ? 'bg-muted/50' : ''} ${dragOverId === item.id ? 'border-t-2 border-t-primary bg-primary/10' : ''} ${draggedId === item.id ? 'opacity-40' : ''}`}
    >
      {/* 1. Drag Handle */}
      <td
        className="py-2.5 px-2 text-center cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-muted-foreground transition w-7"
        onClick={(e) => e.stopPropagation()}
        title="Arrastrar para ordenar"
      >
        <GripVertical className="w-3.5 h-3.5 mx-auto" />
      </td>

      {/* 2. Checkbox */}
      <td className="py-2.5 px-2 text-center w-8" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onToggleSelectGasto(item.id, item.monto)}
          className="text-muted-foreground hover:text-foreground transition p-0.5 inline-flex"
          aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
        >
          {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-foreground" /> : <Square className="w-3.5 h-3.5" />}
        </button>
      </td>

      {/* 3. Concepto & Detalle */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px] md:max-w-xs" title={item.concepto}>
          {limpiarConceptoCuota(item.concepto)}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: item.categoriaColor || '#64748b' }}
          />
          <span className="text-foreground/80 font-medium">{item.categoria}</span>
          {item.tag && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted/70 text-muted-foreground border border-border/40 shrink-0">
              #{item.tag}
            </span>
          )}
          {subtextoLimpio && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate">{subtextoLimpio}</span>
            </>
          )}
          {item.ingresoConcepto && (
            <>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                💰 {item.ingresoConcepto}
              </span>
            </>
          )}
        </div>
      </td>

      {/* 4. Cuota */}
      {showCuotaColumn && (
        <td className="py-2.5 px-3 text-center whitespace-nowrap">
          {item.cuotaActual ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold font-mono border ${
                esPrestamo
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
              }`}
            >
              Cuota {item.cuotaActual} de {cuotaTotal}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>
      )}

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

      {/* 5. Monto */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-semibold text-foreground text-xs sm:text-sm tabular-nums">
        <div>{formatMoney(item.monto, moneda)}</div>
        {item.monedaOriginal === 'USD' && item.montoOriginal && (
          <div className="text-[10px] text-muted-foreground font-mono font-normal mt-0.5">
            ${item.montoOriginal.toFixed(2)} USD
          </div>
        )}
      </td>

      {/* 6. Acción */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')}
            className={`h-6.5 px-2 rounded text-[11px] transition font-medium ${
              isAdelantado
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
            title="Alternar Adelantado"
          >
            {isAdelantado ? 'Adelantado' : 'Adelantar'}
          </button>

          <button
            type="button"
            onClick={() => onToggleEstadoItem(item, isPagado ? 'PENDIENTE' : 'PAGADO')}
            className={`h-6.5 px-2.5 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 ${
              isPagado
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 hover:bg-emerald-100/70'
                : 'bg-foreground text-background hover:opacity-85 shadow-2xs'
            }`}
            title="Alternar Pagado"
          >
            {isPagado && <Check className="w-3 h-3 stroke-[2.5]" />}
            <span>{isPagado ? 'Pagado' : 'Pagar'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
