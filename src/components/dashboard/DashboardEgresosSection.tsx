'use client';

import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { EgresosUnifiedToolbar } from './EgresosUnifiedToolbar';
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
      {/* Encabezado de Egresos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Egresos & Compromisos
              </h2>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  {todosEgresos.length} compromisos · {formatMoney(totalEgresos, moneda)}
                </span>
              </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Costos fijos, préstamos, tarjetas y gastos variables
                </p>
              </div>

              <button
                onClick={onAbrirModalRegistroGasto}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/70 text-foreground hover:bg-muted/60 text-xs font-medium transition active:scale-95 self-start sm:self-auto shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Registrar Gasto</span>
              </button>
          </div>

          {/* Toolbar Unificada de Egresos */}
          <EgresosUnifiedToolbar
            totales={totalesPorClasificacion}
            filtroEgreso={filtroEgreso}
            onSelectFiltroEgreso={onSelectFiltroEgreso}
            filtroEstado={filtroEstado}
            onSelectFiltroEstado={onSelectFiltroEstado}
            filtroFuenteIngreso={filtroFuenteIngreso}
            onSelectFiltroFuenteIngreso={onSelectFiltroFuenteIngreso}
            ingresosMes={ingresosMes}
            conteoPendiente={todosEgresos.filter((g) => g.estado === 'PENDIENTE').length}
            conteoAdelantado={todosEgresos.filter((g) => g.estado === 'ADELANTADO').length}
            conteoPagado={todosEgresos.filter((g) => g.estado === 'PAGADO').length}
            conteoTotal={todosEgresos.length}
            isAllSelected={isAllSelected}
            onToggleSelectAll={onToggleSelectAll}
            hasItems={conteoEgresosFiltrados > 0}
            moneda={moneda}
          />

          {/* Listado de Tablas por Sección o Empty State */}
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

              {/* Barra de Totales Filtrados */}
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
