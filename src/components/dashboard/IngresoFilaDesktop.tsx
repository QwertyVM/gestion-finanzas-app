'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, Trash2 } from 'lucide-react';
import type { IngresoItem } from './IngresoCardMobile';

interface IngresoFilaDesktopProps {
  ing: IngresoItem;
  moneda: string;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
}

export function IngresoFilaDesktop({
  ing,
  moneda,
  onToggleRecibido,
  onEliminarIngreso,
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

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-2.5 px-3">
        <div className="font-medium text-foreground text-xs sm:text-sm">{ing.concepto}</div>
        {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
          </div>
        )}
      </td>

      <td className="py-2.5 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipoBadgeClass}`}>
          {tipoLabel}
        </span>
      </td>

      <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap text-xs font-mono">
        {fechaLabel}
      </td>

      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={() => onToggleRecibido(ing)}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer hover:opacity-85 border ${
            ing.recibido
              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
          title="Click para alternar estado"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span>{ing.recibido ? 'Recibido' : 'Por recibir'}</span>
        </button>
      </td>

      <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap text-xs sm:text-sm tabular-nums">
        {formatMoney(ing.monto, moneda)}
      </td>

      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onToggleRecibido(ing)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                ing.recibido ? 'text-emerald-500' : 'text-muted-foreground'
              }`}
            />
          </button>

          {ing.tipo === 'EXTRA' && (
            <button
              type="button"
              onClick={() => onEliminarIngreso(ing.id)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition"
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
