'use client';

import React, { useMemo, useState } from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { GastoMesFila } from './GastoMesFila';
import { GastoMesCardMobile } from './GastoMesCardMobile';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

type SortField = 'concepto' | 'categoria' | 'fecha' | 'monto' | 'estado';
type SortOrder = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedGastos = useMemo(() => {
    if (!sortField) return gastos;
    return [...gastos].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'fecha') {
        valA = new Date(a.fechaGasto).getTime();
        valB = new Date(b.fechaGasto).getTime();
      } else if (sortField === 'monto') {
        valA = a.monto || 0;
        valB = b.monto || 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [gastos, sortField, sortOrder]);

  const totalMonto = useMemo(
    () => gastos.reduce((sum, g) => sum + (g.monto || 0), 0),
    [gastos]
  );

  const totalMontoUSD = useMemo(
    () => gastos.filter((g) => g.monedaOriginal === 'USD').reduce((sum, g) => sum + (g.montoOriginal != null ? g.montoOriginal : (g.monto || 0) / (g.tipoCambio || 4.0)), 0),
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

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 ml-1 inline-block" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-foreground ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-foreground ml-1 inline-block" />
    );
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {sortedGastos.map((gasto) => (
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
              <th
                scope="col"
                onClick={() => handleSort('concepto')}
                className={`py-2.5 px-3 font-semibold cursor-pointer transition select-none ${
                  sortField === 'concepto' ? 'text-primary bg-primary/5 font-bold' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <span>Concepto</span>
                {renderSortIcon('concepto')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('categoria')}
                className={`py-2.5 px-3 font-semibold cursor-pointer transition select-none ${
                  sortField === 'categoria' ? 'text-primary bg-primary/5 font-bold' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <span>Categoría</span>
                {renderSortIcon('categoria')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Método</th>
              <th
                scope="col"
                onClick={() => handleSort('fecha')}
                className={`py-2.5 px-3 font-semibold cursor-pointer transition select-none ${
                  sortField === 'fecha' ? 'text-primary bg-primary/5 font-bold' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <span>Fecha</span>
                {renderSortIcon('fecha')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Cuota</th>
              <th
                scope="col"
                onClick={() => handleSort('monto')}
                className={`py-2.5 px-3 text-right font-semibold cursor-pointer transition select-none ${
                  sortField === 'monto' ? 'text-primary bg-primary/5 font-bold' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <span>Monto</span>
                {renderSortIcon('monto')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('estado')}
                className={`py-2.5 px-3 text-center font-semibold cursor-pointer transition select-none ${
                  sortField === 'estado' ? 'text-primary bg-primary/5 font-bold' : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <span>Estado</span>
                {renderSortIcon('estado')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedGastos.map((gasto) => (
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
                {totalMontoUSD > 0 && (
                  <span className="block text-[10px] text-muted-foreground font-normal">
                    (incluye ${totalMontoUSD.toFixed(2)} USD)
                  </span>
                )}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
