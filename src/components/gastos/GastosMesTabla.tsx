'use client';

import React, { useMemo } from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { GastoMesFila } from './GastoMesFila';
import { GastoMesCardMobile } from './GastoMesCardMobile';

interface GastosMesTablaProps {
  gastos: any[];
  selectedGastoIds: string[];
  moneda: string;
  periodo: string;
  busqueda: string;
  onSelectRow: (gasto: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onCambiarEstadoItem: (id: string, nuevoEstado: string) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastosMesTabla({
  gastos,
  selectedGastoIds,
  moneda,
  periodo,
  busqueda,
  onSelectRow,
  onToggleSelectGasto,
  onCambiarEstadoItem,
  onClickTrash,
}: GastosMesTablaProps) {
  const totalMonto = useMemo(
    () => gastos.reduce((sum, g) => sum + (g.monto || 0), 0),
    [gastos]
  );

  const stats = useMemo(() => {
    const total = gastos.length;
    const pagados = gastos.filter((g) => g.estado === 'PAGADO').length;
    const adelantados = gastos.filter((g) => g.estado === 'ADELANTADO').length;
    const pendientes = total - pagados - adelantados;
    return { total, pagados, adelantados, pendientes };
  }, [gastos]);

  if (gastos.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {busqueda.trim()
            ? `No se encontraron gastos que coincidan con "${busqueda}".`
            : `No hay gastos registrados para ${formatPeriodoLabel(periodo)}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {gastos.map((gasto) => (
          <GastoMesCardMobile
            key={`m-${gasto.id}`}
            gasto={gasto}
            isSelected={selectedGastoIds.includes(gasto.id)}
            moneda={moneda}
            onSelectRow={onSelectRow}
            onToggleSelectGasto={onToggleSelectGasto}
            onCambiarEstadoItem={onCambiarEstadoItem}
            onClickTrash={onClickTrash}
          />
        ))}

        {/* Resumen Móvil al pie */}
        <div className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs">
          <div className="text-[11px] text-muted-foreground">
            <span>{stats.total} gastos</span>
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
              <th scope="col" className="py-2.5 px-2.5 w-9 text-center">
                <span className="sr-only">Seleccionar</span>
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Categoría (50/30/20)</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Método</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Fecha</th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Cuota</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Monto</th>
              <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {gastos.map((gasto) => (
              <GastoMesFila
                key={gasto.id}
                gasto={gasto}
                isSelected={selectedGastoIds.includes(gasto.id)}
                moneda={moneda}
                onSelectRow={onSelectRow}
                onToggleSelectGasto={onToggleSelectGasto}
                onCambiarEstadoItem={onCambiarEstadoItem}
                onClickTrash={onClickTrash}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={6} className="py-2.5 px-3 text-muted-foreground text-xs">
                <span>{stats.total} gastos</span>
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
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
