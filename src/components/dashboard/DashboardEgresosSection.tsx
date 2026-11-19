'use client';

import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { DiferenciacionEgresosBar } from './DiferenciacionEgresosBar';
import { FiltrosEstadoBar } from './FiltrosEstadoBar';
import { FiltroFuenteIngresoBar } from './FiltroFuenteIngresoBar';
import { SeccionEgresosTabla } from './SeccionEgresosTabla';
import type { DetalleItemData } from '@/components/modals/ModalDetalleGasto';

interface DashboardEgresosSectionProps {
  todosEgresos: any[];
  totalEgresos: number;
  moneda: string;
  totalesPorClasificacion?: any;
  filtroEgreso: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';
  onSelectFiltroEgreso: (f: 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES') => void;
  filtroEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS';
  onSelectFiltroEstado: (f: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS') => void;
  filtroFuenteIngreso?: string;
  onSelectFiltroFuenteIngreso?: (f: string) => void;
  ingresosMes?: any[];
  onAsignarIngresoItem?: (item: any, ingresoId: string | null) => Promise<void> | void;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  conteoEgresosFiltrados: number;
  totalEgresosFiltrados: number;
  seccionesCompromisos: any[];
  toggleColapsarSeccion: (id: string) => void;
  onAbrirRegistroSeccion: (id: string) => void;
  onAbrirModalRegistroGasto: () => void;
  selectedGastoIds: string[];
  toggleSelectGasto: (id: string, monto: number) => void;
  onSelectItem: (item: DetalleItemData) => void;
  onToggleEstadoItem: (item: DetalleItemData, estado: string) => Promise<void>;
  draggedId: string | null;
  dragOverId: string | null;
  setDraggedId: (id: string | null) => void;
  setDragOverId: (id: string | null) => void;
  handleDrop: (targetId: string, e: React.DragEvent) => Promise<void>;
}

export function DashboardEgresosSection({
  todosEgresos,
  totalEgresos,
  moneda,
  totalesPorClasificacion,
  filtroEgreso,
  onSelectFiltroEgreso,
  filtroEstado,
  onSelectFiltroEstado,
  filtroFuenteIngreso = 'TODOS',
  onSelectFiltroFuenteIngreso,
  ingresosMes = [],
  onAsignarIngresoItem,
  isAllSelected,
  onToggleSelectAll,
  conteoEgresosFiltrados,
  totalEgresosFiltrados,
  seccionesCompromisos,
  toggleColapsarSeccion,
  onAbrirRegistroSeccion,
  onAbrirModalRegistroGasto,
  selectedGastoIds,
  toggleSelectGasto,
  onSelectItem,
  onToggleEstadoItem,
  draggedId,
  dragOverId,
  setDraggedId,
  setDragOverId,
  handleDrop,
}: DashboardEgresosSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Egresos & Compromisos del Mes
            </h2>
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
              {todosEgresos.length} compromisos · {formatMoney(totalEgresos, moneda)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Costos fijos, cuotas de préstamos, consumos de tarjeta y gastos directos.
          </p>
        </div>

        <button
          onClick={onAbrirModalRegistroGasto}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      <DiferenciacionEgresosBar
        totales={totalesPorClasificacion}
        filtroEgreso={filtroEgreso}
        onSelectFiltro={onSelectFiltroEgreso}
        moneda={moneda}
      />

      {ingresosMes && ingresosMes.length > 1 && onSelectFiltroFuenteIngreso && (
        <FiltroFuenteIngresoBar
          ingresos={ingresosMes}
          filtroFuenteIngreso={filtroFuenteIngreso}
          onSelectFiltroFuente={onSelectFiltroFuenteIngreso}
          moneda={moneda}
          totalCompromisos={todosEgresos.length}
          totalMontoEgresos={totalEgresos}
        />
      )}

      <FiltrosEstadoBar
        filtroEstado={filtroEstado}
        onSelectEstado={onSelectFiltroEstado}
        conteoPendiente={todosEgresos.filter((g) => g.estado === 'PENDIENTE').length}
        conteoAdelantado={todosEgresos.filter((g) => g.estado === 'ADELANTADO').length}
        conteoPagado={todosEgresos.filter((g) => g.estado === 'PAGADO').length}
        conteoTotal={todosEgresos.length}
        isAllSelected={isAllSelected}
        onToggleSelectAll={onToggleSelectAll}
        hasItems={conteoEgresosFiltrados > 0}
      />

      {conteoEgresosFiltrados === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
          <p className="text-xs text-muted-foreground">
            {filtroEstado === 'PENDIENTE'
              ? 'No hay compromisos pendientes para este mes.'
              : 'No se encontraron registros con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {seccionesCompromisos.map((sec) => (
            <SeccionEgresosTabla
              key={sec.id}
              seccion={sec}
              estaColapsada={sec.colapsada}
              onToggleColapsar={() => toggleColapsarSeccion(sec.id)}
              onAgregarItem={() => onAbrirRegistroSeccion(sec.id)}
              selectedGastoIds={selectedGastoIds}
              onToggleSelectGasto={toggleSelectGasto}
              onSelectItem={onSelectItem}
              onToggleEstadoItem={onToggleEstadoItem}
              ingresosMes={ingresosMes}
              onAsignarIngreso={onAsignarIngresoItem}
              moneda={moneda}
              draggedId={draggedId}
              dragOverId={dragOverId}
              onDragStart={(id, e) => {
                e.dataTransfer.setData('text/plain', id);
                e.dataTransfer.effectAllowed = 'move';
                setDraggedId(id);
              }}
              onDragOver={(id, e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverId !== id) setDragOverId(id);
              }}
              onDragLeave={(id) => {
                if (dragOverId === id) setDragOverId(null);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              onDrop={handleDrop}
            />
          ))}

          <div className="bg-card border border-border/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-medium shadow-xs">
            <div className="text-muted-foreground">
              Total Compromisos Filtrados ({conteoEgresosFiltrados} items en {seccionesCompromisos.length} secciones)
            </div>
            <div className="font-mono font-bold text-sm text-foreground">
              {formatMoney(totalEgresosFiltrados, moneda)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
