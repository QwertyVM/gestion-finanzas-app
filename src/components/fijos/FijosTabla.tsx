'use client';

import React, { useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Layers } from 'lucide-react';
import { FijoFila } from './FijoFila';
import { FijoCardMobile } from './FijoCardMobile';

interface FijosTablaProps {
  costosFijos: any[];
  tarjetas: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado?: (id: string, nuevoEstado: string) => void;
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

  const totalMontoSoles = useMemo(
    () => costosFijos.filter((cf) => cf.monedaOriginal !== 'USD').reduce((sum, cf) => sum + (cf.monto || 0), 0),
    [costosFijos]
  );

  const totalMontoUSD = useMemo(
    () => costosFijos.filter((cf) => cf.monedaOriginal === 'USD').reduce((sum, cf) => sum + (cf.montoOriginal != null ? cf.montoOriginal : (cf.monto || 0) / (cf.tipoCambio || 4.0)), 0),
    [costosFijos]
  );

  const stats = useMemo(() => {
    const total = costosFijos.length;
    return { total };
  }, [costosFijos]);

  if (costosFijos.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-card/60 border border-border/80 rounded-2xl space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-foreground">Sin costos fijos en la plantilla</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Registra los gastos recurrentes (alquiler, streaming, servicios) que se proyectarán automáticamente cada mes.
          </p>
        </div>
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
            <span>{stats.total} costos fijos base</span>
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
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Monto Base</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Forma de Pago Base</th>
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
              <td colSpan={2} className="py-2.5 px-3 text-muted-foreground text-xs font-medium">
                <span>{stats.total} costos fijos base recurrentes</span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                <div className="flex flex-col items-end">
                  <span>{formatMoney(totalMonto, moneda)}</span>
                  {totalMontoUSD > 0 && (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      (incluye ${totalMontoUSD.toFixed(2)} USD)
                    </span>
                  )}
                </div>
              </td>
              <td colSpan={2} className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                Total mensual consolidado
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
