'use client';

import React from 'react';
import { Pencil, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { TarjetaTableItem } from './TarjetasTable';

interface TarjetaCardMobileProps {
  t: TarjetaTableItem;
  moneda: string;
  onEdit: (t: TarjetaTableItem) => void;
  onDelete: (id: string, nombre: string) => void;
  deletingId?: string | null;
}

export function TarjetaCardMobile({
  t,
  moneda,
  onEdit,
  onDelete,
  deletingId,
}: TarjetaCardMobileProps) {
  const totalRegistros = t.totalRegistros ?? 0;
  const tieneRegistros = totalRegistros > 0;
  const compras = t.cantidadGastos ?? 0;
  const fijos = t.cantidadCostosFijos ?? 0;

  return (
    <div className="p-3.5 border-b border-border/40 last:border-b-0 space-y-2.5">
      {/* Fila 1: Color dot + Nombre + Banco + Últimos 4 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10 shadow-xs"
            style={{ backgroundColor: t.color || '#2563eb' }}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-foreground truncate">{t.nombre}</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span>{t.banco}</span>
              {t.ultimosCuatro && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="font-mono">•••• {t.ultimosCuatro}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
            {formatMoney(t.totalPeriodo || 0, moneda)}
          </span>
          {(t.totalSiguientePeriodo || 0) > 0 && (
            <span className="text-[10px] text-muted-foreground block">
              Próx: {formatMoney(t.totalSiguientePeriodo || 0, moneda)}
            </span>
          )}
        </div>
      </div>

      {/* Fila 2: Registros asociados + Días corte/pago */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div>
          {tieneRegistros ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Layers className="w-3 h-3" />
              <span>{compras} compras · {fijos} fijos</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-muted-foreground bg-muted/60 border border-border/40">
              Sin registros
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono">
          Corte: {t.diaCorte || '—'} · Pago: {t.diaPago || '—'}
        </div>
      </div>

      {/* Fila 3: Estado Activa + Botones Editar / Eliminar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Activa
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(t)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Editar tarjeta"
            aria-label={`Editar ${t.nombre}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={deletingId === t.id}
            onClick={() => onDelete(t.id, t.nombre)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition disabled:opacity-50"
            title={tieneRegistros ? 'Eliminar tarjeta y registros asociados' : 'Eliminar tarjeta'}
            aria-label={`Eliminar ${t.nombre}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
