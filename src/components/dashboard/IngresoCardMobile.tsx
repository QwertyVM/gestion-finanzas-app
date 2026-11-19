'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, Trash2, Edit2 } from 'lucide-react';

export interface IngresoItem {
  id: string;
  concepto: string;
  monto: number;
  tipo: string;
  fechaEsperada: string;
  recibido: boolean;
  monedaOriginal?: string | null;
  montoOriginal?: number | null;
  tipoCambio?: number | null;
  totalGastosAsignados?: number;
  disponible?: number;
  gastosAsignadosCount?: number;
}

interface IngresoCardMobileProps {
  ingreso: IngresoItem;
  moneda: string;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
  onEditarSueldo?: (montoActual: number) => void;
  onEditarIngreso?: (ingreso: IngresoItem) => void;
}

export function IngresoCardMobile({
  ingreso,
  moneda,
  onToggleRecibido,
  onEliminarIngreso,
  onEditarSueldo,
  onEditarIngreso,
}: IngresoCardMobileProps) {
  const fechaObj = new Date(ingreso.fechaEsperada);
  const fechaLabel = !isNaN(fechaObj.getTime())
    ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    : 'Fin de mes';

  const tipoLabel =
    ingreso.tipo === 'SUELDO'
      ? 'Sueldo Planilla'
      : ingreso.tipo === 'GRATIFICACION'
        ? 'Gratificación'
        : ingreso.tipo === 'UTILIDADES'
          ? 'Utilidades'
          : 'Ingreso Extra';

  const tipoBadgeClass =
    ingreso.tipo === 'SUELDO'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
      : ingreso.tipo === 'GRATIFICACION'
        ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
        : ingreso.tipo === 'UTILIDADES'
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300'
          : 'bg-muted text-muted-foreground border-border/60';

  return (
    <div className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => onEditarIngreso?.(ingreso)}
          className={`min-w-0 flex-1 ${onEditarIngreso ? 'cursor-pointer' : ''}`}
        >
          <h4 className="font-semibold text-xs text-foreground truncate">{ingreso.concepto}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipoBadgeClass}`}>
              {tipoLabel}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">{fechaLabel}</span>
          </div>
          {ingreso.monedaOriginal === 'USD' && ingreso.montoOriginal && (
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              ${ingreso.montoOriginal} USD (TC: {ingreso.tipoCambio})
            </div>
          )}
        </div>

        <div
          onClick={() => onEditarIngreso?.(ingreso)}
          className={`text-right shrink-0 ${onEditarIngreso ? 'cursor-pointer' : ''}`}
        >
          <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
            {formatMoney(ingreso.monto, moneda)}
          </span>
          {Boolean(ingreso.totalGastosAsignados && ingreso.totalGastosAsignados > 0) && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium font-mono mt-0.5">
              Gastos: {formatMoney(ingreso.totalGastosAsignados!, moneda)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <button
          type="button"
          onClick={() => onToggleRecibido(ingreso)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
            ingreso.recibido
              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${ingreso.recibido ? 'text-emerald-500' : 'text-amber-500'}`}
          />
          <span>{ingreso.recibido ? 'Recibido' : 'Por recibir'}</span>
        </button>

        <div className="flex items-center gap-1">
          {(onEditarIngreso || (ingreso.tipo === 'SUELDO' && onEditarSueldo)) && (
            <button
              type="button"
              onClick={() => onEditarIngreso ? onEditarIngreso(ingreso) : onEditarSueldo?.(ingreso.monto)}
              className="p-1 rounded-md text-muted-foreground hover:text-indigo-500 transition"
              title="Modificar ingreso"
              aria-label="Modificar ingreso"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {ingreso.tipo !== 'SUELDO' && (
            <button
              type="button"
              onClick={() => onEliminarIngreso(ingreso.id)}
              className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition"
              title="Eliminar ingreso"
              aria-label="Eliminar ingreso"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
