'use client';

import React, { useMemo, useState } from 'react';
import { formatMoney } from '@/lib/utils';
import { Layers, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { FijoFila } from './FijoFila';
import { FijoCardMobile } from './FijoCardMobile';

interface FijosTablaProps {
  costosFijos: any[];
  tarjetas: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect?: (item: any) => void;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
  onEditarBase: (cf: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

type SortField = 'concepto' | 'dia' | 'monto';
type SortOrder = 'asc' | 'desc';

export function FijosTabla({
  costosFijos,
  tarjetas,
  moneda,
  loadingAction,
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijosTablaProps) {
  const [sortField, setSortField] = useState<SortField>('dia');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [busqueda, setBusqueda] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedFijos = useMemo(() => {
    let list = [...costosFijos];
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      list = list.filter((cf) =>
        (cf.concepto || '').toLowerCase().includes(q) ||
        (cf.categoria || '').toLowerCase().includes(q) ||
        (cf.tag || '').toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'concepto') {
        comp = (a.concepto || '').localeCompare(b.concepto || '');
      } else if (sortField === 'dia') {
        comp = (a.diaVencimiento || 30) - (b.diaVencimiento || 30);
      } else if (sortField === 'monto') {
        comp = (a.monto || 0) - (b.monto || 0);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [costosFijos, busqueda, sortField, sortOrder]);

  const totalMonto = useMemo(
    () => costosFijos.reduce((sum, cf) => sum + (cf.monto || 0), 0),
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
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs space-y-0">
      {/* Barra de Filtro Rápido */}
      <div className="p-2.5 sm:px-3 sm:py-2 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por concepto o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border/60 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          Mostrando {sortedFijos.length} de {stats.total} fijos
        </div>
      </div>

      {/* Vista Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {sortedFijos.map((cf) => (
          <FijoCardMobile
            key={`m-fijo-${cf.id}`}
            cf={cf}
            tarjetas={tarjetas}
            moneda={moneda}
            isLoading={loadingAction === `fijo-${cf.id}`}
            onSelect={() => onEditarBase(cf)}
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
          <div className="text-right">
            <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
              {formatMoney(totalMonto, moneda)}
            </span>
            {totalMontoUSD > 0 && (
              <span className="text-[10px] text-muted-foreground font-mono block">
                (incluye ${totalMontoUSD.toFixed(2)} USD)
              </span>
            )}
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
                <span>Concepto</span>
                {renderSortIcon('concepto')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">
                Categoría
              </th>
              <th
                scope="col"
                onClick={() => handleSort('dia')}
                className="py-2.5 px-3 text-foreground font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span>Vencimiento</span>
                {renderSortIcon('dia')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('monto')}
                className="py-2.5 px-3 text-right text-foreground font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span>Monto Base</span>
                {renderSortIcon('monto')}
              </th>
              <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">
                Forma de Pago Base
              </th>
              <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedFijos.map((cf) => (
              <FijoFila
                key={cf.id}
                cf={cf}
                tarjetas={tarjetas}
                moneda={moneda}
                isLoading={loadingAction === `fijo-${cf.id}`}
                onEditarBase={onEditarBase}
                onCambiarMetodoPago={onCambiarMetodoPago}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-muted-foreground text-xs font-medium">
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
