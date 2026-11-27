'use client';

import React, { useMemo, useState } from 'react';
import { formatMoney } from '@/lib/utils';
import { Landmark, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PrestamoFila } from './PrestamoFila';
import { PrestamoCardMobile } from './PrestamoCardMobile';

interface PrestamosTablaProps {
  prestamos: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect?: (item: any) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

type SortField = 'concepto' | 'dia' | 'cuota' | 'total';
type SortOrder = 'asc' | 'desc';

export function PrestamosTabla({
  prestamos,
  moneda,
  loadingAction,
  onEditarBase,
  onEliminar,
}: PrestamosTablaProps) {
  const [sortField, setSortField] = useState<SortField>('dia');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPrestamos = useMemo(() => {
    return [...prestamos].sort((a, b) => {
      let comp = 0;
      if (sortField === 'concepto') {
        comp = (a.concepto || '').localeCompare(b.concepto || '');
      } else if (sortField === 'dia') {
        comp = (a.diaPago || 25) - (b.diaPago || 25);
      } else if (sortField === 'cuota') {
        comp = (a.montoCuota || 0) - (b.montoCuota || 0);
      } else if (sortField === 'total') {
        comp = (a.montoTotal || 0) - (b.montoTotal || 0);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [prestamos, sortField, sortOrder]);

  const totalCuotasMes = useMemo(
    () => prestamos.reduce((sum, p) => (p.aplicaEsteMes !== false ? sum + (p.montoCuota || 0) : sum), 0),
    [prestamos]
  );

  const totalCuotasUSD = useMemo(
    () => prestamos.reduce((sum, p) => (p.aplicaEsteMes !== false && p.monedaOriginal === 'USD' ? sum + (p.montoOriginal != null ? p.montoOriginal : (p.montoCuota || 0) / (p.tipoCambio || 4.0)) : sum), 0),
    [prestamos]
  );

  if (prestamos.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-card/60 border border-border/80 rounded-2xl space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 flex items-center justify-center">
          <Landmark className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-foreground">Sin préstamos o créditos activos</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Registra préstamos bancarios, créditos vehiculares o personales para monitorear el progreso de amortización y las cuotas de cada mes.
          </p>
        </div>
      </div>
    );
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary ml-1 inline" />
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {sortedPrestamos.map((p) => (
          <PrestamoCardMobile
            key={`m-p-${p.id}`}
            p={p}
            moneda={moneda}
            isLoading={loadingAction === `cuota-${p.cuotaId}` || loadingAction === `del-prestamo-${p.id}`}
            onSelect={() => onEditarBase(p)}
            onEditarBase={onEditarBase}
            onEliminar={onEliminar}
          />
        ))}

        {/* Resumen Móvil al pie */}
        <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground">
            {prestamos.length} {prestamos.length === 1 ? 'crédito activo' : 'créditos activos'}
          </span>
          <div className="font-mono font-bold text-xs text-foreground tabular-nums">
            {formatMoney(totalCuotasMes, moneda)}
          </div>
        </div>
      </div>

      {/* Vista Desktop: Tabla completa optimizada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider select-none">
            <tr>
              <th
                scope="col"
                onClick={() => handleSort('concepto')}
                className="py-2.5 px-3 text-foreground font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span>Concepto & Banco</span>
                {renderSortIcon('concepto')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">
                Progreso Amortización
              </th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">
                Tasa
              </th>
              <th
                scope="col"
                onClick={() => handleSort('cuota')}
                className="py-2.5 px-3 text-right text-foreground font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span>Cuota Mensual</span>
                {renderSortIcon('cuota')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('total')}
                className="py-2.5 px-3 text-right text-foreground font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span>Monto Total</span>
                {renderSortIcon('total')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedPrestamos.map((p) => (
              <PrestamoFila
                key={p.id}
                p={p}
                moneda={moneda}
                isLoading={loadingAction === `cuota-${p.cuotaId}` || loadingAction === `del-prestamo-${p.id}`}
                onEditarBase={onEditarBase}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-muted-foreground text-xs">
                Total Cuotas Préstamos ({prestamos.length} vigentes)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                <div className="flex flex-col items-end">
                  <span>{formatMoney(totalCuotasMes, moneda)}</span>
                  {totalCuotasUSD > 0 && (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      (incluye ${totalCuotasUSD.toFixed(2)} USD)
                    </span>
                  )}
                </div>
              </td>
              <td colSpan={2} className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                Cuota mensual base consolidada
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
