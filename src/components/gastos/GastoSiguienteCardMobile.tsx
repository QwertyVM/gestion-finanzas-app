'use client';

import React from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface GastoSiguienteCardMobileProps {
  gasto: any;
  tarjeta: any;
  moneda: string;
  onSelectRow: (gasto: any, tarjeta: any) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastoSiguienteCardMobile({
  gasto,
  tarjeta,
  moneda,
  onSelectRow,
  onClickTrash,
}: GastoSiguienteCardMobileProps) {
  const fechaObj = new Date(gasto.fechaGasto);
  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
  const esCuota = (gasto.totalCuotas || 1) > 1;

  return (
    <div
      onClick={() => onSelectRow(gasto, tarjeta)}
      className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2 hover:bg-muted/20 transition cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: tarjeta.color || '#6366f1' }}
            />
            <span className="text-[11px] font-semibold text-foreground truncate">
              {tarjeta.nombre}
            </span>
          </div>

          <h4 className="font-semibold text-xs text-foreground truncate">{limpiarConceptoCuota(gasto.concepto)}</h4>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
            <span className="truncate">{gasto.categoria || 'Sin categoría'}</span>
            <span className="opacity-40">·</span>
            <span className="font-mono">{fechaFormateada}</span>
            {esCuota && (
              <>
                <span className="opacity-40">·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono text-[10px]">
                  Cuota {gasto.cuotaActual}/{gasto.totalCuotas}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
            {formatMoney(gasto.monto, moneda)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClickTrash(gasto);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition mt-1.5 inline-flex"
            title="Eliminar gasto"
            aria-label={`Eliminar ${gasto.concepto}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
