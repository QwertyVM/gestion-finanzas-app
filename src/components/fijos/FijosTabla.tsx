'use client';

import React, { useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { FijoFila } from './FijoFila';
import { FijoCardMobile } from './FijoCardMobile';

interface FijosTablaProps {
  costosFijos: any[];
  tarjetas: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (id: string, nuevoEstado: string) => void;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
  onEditarBase: (cf: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function FijosTabla({
  costosFijos,
  tarjetas,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijosTablaProps) {
  const totalMonto = useMemo(
    () => costosFijos.reduce((sum, cf) => sum + (cf.monto || 0), 0),
    [costosFijos]
  );

  const stats = useMemo(() => {
    const total = costosFijos.length;
    const pagados = costosFijos.filter((cf) => cf.estado === 'PAGADO').length;
    const adelantados = costosFijos.filter((cf) => cf.estado === 'ADELANTADO').length;
    const pendientes = total - pagados - adelantados;
    return { total, pagados, adelantados, pendientes };
  }, [costosFijos]);

  if (costosFijos.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
        <p className="text-xs text-muted-foreground">
          No hay costos fijos registrados para este mes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {costosFijos.map((cf) => (
          <FijoCardMobile
            key={`m-fijo-${cf.id}`}
            cf={cf}
            tarjetas={tarjetas}
            moneda={moneda}
            isLoading={loadingAction === `fijo-${cf.id}`}
            onSelect={onSelect}
            onToggleEstado={onToggleEstado}
            onCambiarMetodoPago={onCambiarMetodoPago}
            onEditarBase={onEditarBase}
            onEliminar={onEliminar}
          />
        ))}

        {/* Resumen Móvil al pie */}
        <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs">
          <div className="text-[11px] text-muted-foreground">
            <span>{stats.total} fijos</span>
            <span className="mx-1 opacity-40">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.pagados} pag.</span>
            <span className="mx-1 opacity-40">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">{stats.pendientes} pend.</span>
          </div>
          <div className="font-mono font-bold text-xs text-foreground tabular-nums">
            {formatMoney(totalMonto, moneda)}
          </div>
        </div>
      </div>

      {/* Vista Desktop: Tabla completa optimizada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Categoría</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Monto</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Forma de Pago</th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {costosFijos.map((cf) => (
              <FijoFila
                key={cf.id}
                cf={cf}
                tarjetas={tarjetas}
                moneda={moneda}
                isLoading={loadingAction === `fijo-${cf.id}`}
                onSelect={onSelect}
                onToggleEstado={onToggleEstado}
                onCambiarMetodoPago={onCambiarMetodoPago}
                onEditarBase={onEditarBase}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={2} className="py-2.5 px-3 text-muted-foreground text-xs">
                <span>{stats.total} costos fijos</span>
                <span className="mx-1.5 opacity-40">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.pagados} pagados</span>
                {stats.adelantados > 0 && (
                  <>
                    <span className="mx-1.5 opacity-40">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{stats.adelantados} adelantados</span>
                  </>
                )}
                <span className="mx-1.5 opacity-40">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">{stats.pendientes} pendientes</span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                {formatMoney(totalMonto, moneda)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
