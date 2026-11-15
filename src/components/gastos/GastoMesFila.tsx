'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckSquare, Square, FastForward, CheckCircle2, Trash2, Check } from 'lucide-react';

interface GastoMesFilaProps {
  gasto: any;
  isSelected: boolean;
  moneda: string;
  onSelectRow: (gasto: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onCambiarEstadoItem: (id: string, nuevoEstado: string) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastoMesFila({
  gasto,
  isSelected,
  moneda,
  onSelectRow,
  onToggleSelectGasto,
  onCambiarEstadoItem,
  onClickTrash,
}: GastoMesFilaProps) {
  const fechaObj = new Date(gasto.fechaGasto);
  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
  const esCuota = (gasto.totalCuotas || 1) > 1;
  const isPagado = gasto.estado === 'PAGADO';
  const isAdelantado = gasto.estado === 'ADELANTADO';

  return (
    <tr
      onClick={() => onSelectRow(gasto)}
      className={`hover:bg-muted/40 transition-colors cursor-pointer group ${
        isSelected ? 'bg-muted/50' : ''
      }`}
    >
      {/* 1. Seleccionar Checkbox */}
      <td className="py-2.5 px-2.5 text-center w-9" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onToggleSelectGasto(gasto.id, gasto.monto)}
          className="text-muted-foreground hover:text-foreground transition p-0.5 inline-flex"
          aria-label={isSelected ? `Deseleccionar ${gasto.concepto}` : `Seleccionar ${gasto.concepto}`}
        >
          {isSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-foreground" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
        </button>
      </td>

      {/* 2. Concepto & Categoría */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px] md:max-w-xs" title={gasto.concepto}>
          {gasto.concepto}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: gasto.categoriaColor || '#64748b' }}
          />
          <span className="truncate">{gasto.categoria || 'Sin categoría'}</span>
        </div>
      </td>

      {/* 3. Método de Pago */}
      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
        {gasto.metodoPago === 'TARJETA_CREDITO' ? (
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: gasto.tarjetaColor || '#6366f1' }}
            />
            <span className="truncate max-w-[120px]">{gasto.tarjetaNombre || 'Tarjeta'}</span>
          </span>
        ) : gasto.metodoPago === 'TRANSFERENCIA' ? (
          <span className="text-muted-foreground">Transferencia</span>
        ) : (
          <span className="text-muted-foreground">Efectivo / Débito</span>
        )}
      </td>

      {/* 4. Fecha */}
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap text-xs">
        {fechaFormateada}
      </td>

      {/* 5. Cuota */}
      <td className="py-2.5 px-3 whitespace-nowrap text-xs">
        {esCuota ? (
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded text-[10px] border border-indigo-200/50">
            {gasto.cuotaActual}/{gasto.totalCuotas}
          </span>
        ) : (
          <span className="text-muted-foreground text-[11px]">Única</span>
        )}
      </td>

      {/* 6. Monto */}
      <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {formatMoney(gasto.monto, moneda)}
      </td>

      {/* 7. Estado */}
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

      {/* 8. Acciones */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() =>
              onCambiarEstadoItem(gasto.id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')
            }
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
            onClick={() =>
              onCambiarEstadoItem(gasto.id, isPagado ? 'PENDIENTE' : 'PAGADO')
            }
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

          <button
            type="button"
            onClick={() => onClickTrash(gasto)}
            className="p-1 rounded opacity-60 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition ml-1"
            title="Eliminar gasto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
