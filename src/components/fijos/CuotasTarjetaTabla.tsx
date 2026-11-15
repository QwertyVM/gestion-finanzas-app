'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { CuotaTarjetaFila } from './CuotaTarjetaFila';
import { CuotaTarjetaCardMobile } from './CuotaTarjetaCardMobile';

interface CuotasTarjetaTablaProps {
  cuotasTarjeta: any[];
  totalCuotasTarjeta: number;
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (gastoId: string, nuevoEstado: string) => void;
}

export function CuotasTarjetaTabla({
  cuotasTarjeta,
  totalCuotasTarjeta,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
}: CuotasTarjetaTablaProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {cuotasTarjeta.map((c) => (
          <CuotaTarjetaCardMobile
            key={`m-ct-${c.id}`}
            c={c}
            moneda={moneda}
            isLoading={loadingAction === `gasto-${c.id}`}
            onSelect={onSelect}
            onToggleEstado={onToggleEstado}
          />
        ))}

        {/* Resumen Móvil al pie */}
        <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground">
            {cuotasTarjeta.length} {cuotasTarjeta.length === 1 ? 'cuota' : 'cuotas'} este mes
          </span>
          <div className="font-mono font-bold text-xs text-foreground tabular-nums">
            {formatMoney(totalCuotasTarjeta, moneda)}
          </div>
        </div>
      </div>

      {/* Vista Desktop: Tabla completa optimizada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Tarjeta</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Progreso</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Cuota Mensual</th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {cuotasTarjeta.map((c) => (
              <CuotaTarjetaFila
                key={c.id}
                c={c}
                moneda={moneda}
                isLoading={loadingAction === `gasto-${c.id}`}
                onSelect={onSelect}
                onToggleEstado={onToggleEstado}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-muted-foreground text-xs">
                Subtotal Compras en Tarjeta en Cuotas ({cuotasTarjeta.length} items)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                {formatMoney(totalCuotasTarjeta, moneda)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
