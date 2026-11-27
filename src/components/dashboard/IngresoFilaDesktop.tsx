'use client';

import React, { useState } from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, Trash2, Edit2, Loader2, Pencil } from 'lucide-react';
import type { IngresoItem } from './IngresoCardMobile';

interface IngresoFilaDesktopProps {
  ing: IngresoItem;
  moneda: string;
  mostrarDesgloseAsignado?: boolean;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
  onEditarSueldo?: (montoActual: number) => void;
  onEditarIngreso?: (ingreso: IngresoItem) => void;
}

export function IngresoFilaDesktop({
  ing,
  moneda,
  mostrarDesgloseAsignado = false,
  onToggleRecibido,
  onEliminarIngreso,
  onEditarSueldo,
  onEditarIngreso,
}: IngresoFilaDesktopProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggleRecibido(ing);
    } finally {
      setIsToggling(false);
    }
  };
  const fechaObj = new Date(ing.fechaEsperada);
  const fechaLabel = !isNaN(fechaObj.getTime())
    ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    : 'Fin de mes';

  const tipoLabel =
    ing.tipo === 'SUELDO'
      ? 'Sueldo'
      : ing.tipo === 'GRATIFICACION'
        ? 'Gratificación'
        : ing.tipo === 'UTILIDADES'
          ? 'Utilidades'
          : 'Extra';

  const tipoBadgeClass =
    ing.tipo === 'SUELDO'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
      : ing.tipo === 'GRATIFICACION'
        ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
        : ing.tipo === 'UTILIDADES'
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300'
          : 'bg-muted text-muted-foreground border-border/60';

  const gastos = ing.totalGastosAsignados || 0;
  const resto = ing.disponible != null ? ing.disponible : Number((ing.monto - gastos).toFixed(2));
  const pctGastado = ing.monto > 0 ? Math.min(100, Math.round((Math.max(0, ing.monto - resto) / ing.monto) * 100)) : 0;
  const pctLibre = ing.monto > 0 ? Math.max(0, 100 - pctGastado) : 0;
  const esDeficit = resto < 0;

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      {/* 1. Concepto */}
      <td className="py-2.5 px-3">
        <div
          onClick={() => onEditarIngreso?.(ing)}
          className={`group/edit inline-flex items-center gap-1.5 font-medium text-foreground text-xs sm:text-sm ${onEditarIngreso ? 'cursor-pointer hover:text-indigo-600 transition' : ''}`}
          title="Click para editar"
        >
          <span>{ing.concepto}</span>
          {onEditarIngreso && (
            <Pencil className="w-3 h-3 text-muted-foreground/40 group-hover/edit:text-indigo-500 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
          )}
        </div>
        {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
          </div>
        )}
      </td>

      {/* 2. Tipo / Origen */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipoBadgeClass}`}>
          {tipoLabel}
        </span>
      </td>

      {/* 3. Fecha */}
      <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap text-xs font-mono">
        {fechaLabel}
      </td>

      {/* 4. Estado */}
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer hover:opacity-85 border disabled:opacity-50 ${ing.recibido
            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          title="Click para alternar estado"
        >
          {isToggling ? (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
          )}
          <span>{ing.recibido ? 'Recibido' : 'Por recibir'}</span>
        </button>
      </td>

      {/* 5. Monto Total */}
      <td
        onClick={() => onEditarIngreso?.(ing)}
        className={`py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap text-xs sm:text-sm tabular-nums ${onEditarIngreso ? 'cursor-pointer hover:text-indigo-600 transition' : ''}`}
        title="Click para editar monto"
      >
        {formatMoney(ing.monto, moneda)}
      </td>

      {/* 6. Asignación y Liquidez Compacta (Unificada para evitar scroll horizontal) */}
      {mostrarDesgloseAsignado && (
        <td className="py-2 px-3 min-w-[190px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] tabular-nums font-mono">
              <span className="text-muted-foreground">
                Usado: <strong className="text-foreground">{formatMoney(gastos, moneda)}</strong>
              </span>
              <span className={`font-bold ${esDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {esDeficit ? 'Sobregiro' : 'Libre'}: {formatMoney(resto, moneda)}
              </span>
            </div>
            {/* Micro barra visual de progreso */}
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex border border-border/40">
              <div
                style={{ width: `${pctGastado}%` }}
                className={`h-full ${pctGastado > 90 ? 'bg-rose-500' : pctGastado > 75 ? 'bg-amber-500' : 'bg-sky-500'}`}
                title={`Gastos asignados: ${formatMoney(gastos, moneda)} (${pctGastado}%)`}
              />
              {!esDeficit && pctLibre > 0 && (
                <div
                  style={{ width: `${pctLibre}%` }}
                  className="h-full bg-emerald-500/80"
                  title={`Disponible libre: ${formatMoney(resto, moneda)} (${pctLibre}%)`}
                />
              )}
            </div>
          </div>
        </td>
      )}

      {/* 7. Acción */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onToggleRecibido(ing)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            title={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${ing.recibido ? 'text-emerald-500' : 'text-muted-foreground'}`}
            />
          </button>

          {(onEditarIngreso || (ing.tipo === 'SUELDO' && onEditarSueldo)) && (
            <button
              type="button"
              onClick={() => onEditarIngreso ? onEditarIngreso(ing) : onEditarSueldo?.(ing.monto)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-indigo-500 transition cursor-pointer"
              title="Modificar ingreso"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {ing.tipo !== 'SUELDO' && (
            confirmDelete ? (
              <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 px-1.5 py-0.5 rounded text-[10px] animate-in fade-in">
                <span className="text-rose-600 dark:text-rose-400 font-medium">¿Borrar?</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    onEliminarIngreso(ing.id);
                  }}
                  className="px-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition cursor-pointer"
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                title="Eliminar ingreso"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </td>
    </tr>
  );
}
