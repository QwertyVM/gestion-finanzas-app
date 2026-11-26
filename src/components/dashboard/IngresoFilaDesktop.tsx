'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, Trash2, Edit2 } from 'lucide-react';
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
  const fechaObj = new Date(ing.fechaEsperada);
  const fechaLabel = !isNaN(fechaObj.getTime())
    ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    : 'Fin de mes';

  const tipoLabel =
    ing.tipo === 'SUELDO'
      ? 'Sueldo Planilla'
      : ing.tipo === 'GRATIFICACION'
        ? 'Gratificación'
        : ing.tipo === 'UTILIDADES'
          ? 'Utilidades'
          : 'Ingreso Extra';

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
          className={`font-medium text-foreground text-xs sm:text-sm ${onEditarIngreso ? 'cursor-pointer hover:text-indigo-600 transition' : ''}`}
          title="Click para editar"
        >
          {ing.concepto}
        </div>
        {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
          </div>
        )}
      </td>

      {/* 2. Tipo / Origen */}
      <td className="py-2.5 px-3">
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
          onClick={() => onToggleRecibido(ing)}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer hover:opacity-85 border ${ing.recibido
            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          title="Click para alternar estado"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
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

            {/* 6. Gastos Asignados (solo si múltiple ingreso) */}
            {mostrarDesgloseAsignado && (
              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                <div className="font-mono text-xs sm:text-sm font-semibold text-foreground tabular-nums">
                  {formatMoney(gastos, moneda)}
                </div>
                {ing.monto > 0 && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {pctGastado}% asignado
            </span>
                )}
              </td>
            )}

            {/* 7. Resto Libre (solo si múltiple ingreso) */}
            {mostrarDesgloseAsignado && (
        <td className="py-2.5 px-3 text-right whitespace-nowrap">
          <div
            className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
              esDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatMoney(resto, moneda)}
          </div>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full inline-block ${
              esDeficit
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {esDeficit ? 'Sobregiro' : `${pctLibre}% libre`}
          </span>
        </td>
        )}

        {/* 8. Acción */}
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
              <button
                type="button"
                onClick={() => onEliminarIngreso(ing.id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                title="Eliminar ingreso"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>
    </tr>
  );
}
