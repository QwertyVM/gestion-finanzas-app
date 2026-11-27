'use client';

import React, { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';

interface GastoMesAccionesProps {
  gasto: any;
  isPagado: boolean;
  isAdelantado: boolean;
  onCambiarEstadoItem: (id: string, nuevoEstado: string) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastoMesAcciones({
  gasto,
  isPagado,
  isAdelantado,
  onCambiarEstadoItem,
  onClickTrash,
}: GastoMesAccionesProps) {
  const [confirmando, setConfirmando] = useState(false);
  const esCuota = (gasto.totalCuotas || 1) > 1;

  return (
    <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-1.5">
        {confirmando ? (
          <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-lg px-2 py-1 text-[11px] animate-in fade-in zoom-in-95 duration-150">
            <span className="font-semibold text-rose-700 dark:text-rose-300">¿Borrar?</span>
            <button
              type="button"
              onClick={() => {
                setConfirmando(false);
                onClickTrash(gasto);
              }}
              className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="p-0.5 text-muted-foreground hover:text-foreground rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                onCambiarEstadoItem(gasto.id, isAdelantado ? 'PENDIENTE' : 'ADELANTADO')
              }
              className={`h-6.5 px-2 rounded text-[11px] transition font-medium cursor-pointer ${
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
              className={`h-6.5 px-2.5 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer ${
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
              onClick={() => {
                if (esCuota) {
                  onClickTrash(gasto);
                } else {
                  setConfirmando(true);
                }
              }}
              className="p-1 rounded opacity-60 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition ml-1 cursor-pointer"
              title="Eliminar gasto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </td>
  );
}
