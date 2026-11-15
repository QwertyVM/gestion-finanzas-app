'use client';

import React, { useMemo } from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { PrestamoFila } from './PrestamoFila';

interface PrestamosTablaProps {
  prestamos: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (cuotaId: string, nuevoEstado: string) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamosTabla({
  prestamos,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: PrestamosTablaProps) {
  const totalCuotasMes = useMemo(
    () => prestamos.reduce((sum, p) => (p.aplicaEsteMes !== false ? sum + (p.montoCuota || 0) : sum), 0),
    [prestamos]
  );

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Progreso</th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">TEA %</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Cuota Mensual</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Total</th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {prestamos.map((p) => (
              <PrestamoFila
                key={p.id}
                p={p}
                moneda={moneda}
                isLoading={loadingAction === `cuota-${p.cuotaId}` || loadingAction === `del-prestamo-${p.id}`}
                onSelect={onSelect}
                onToggleEstado={onToggleEstado}
                onEditarBase={onEditarBase}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-muted-foreground text-xs">
                Total Cuotas Préstamos del Mes ({prestamos.length} activos)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                {formatMoney(totalCuotasMes, moneda)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
