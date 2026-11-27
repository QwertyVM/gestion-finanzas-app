'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { SeccionEgresoCardMobile } from './SeccionEgresoCardMobile';
import { SeccionEgresosDesktopTable } from './SeccionEgresosDesktopTable';
import { SeccionEgresosHeader } from './SeccionEgresosHeader';

interface SeccionEgresosTablaProps {
  seccion: {
    id: string;
    titulo: string;
    descripcion?: string;
    icono: React.ElementType;
    headerBg: string;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    filteredCount: number;
    subtotal: number;
    itemsFiltrados: any[];
  };
  estaColapsada: boolean;
  onToggleColapsar: () => void;
  onAgregarItem: () => void;
  selectedGastoIds: string[];
  onToggleSelectGasto: (id: string, monto: number) => void;
  onSelectItem: (item: any) => void;
  onToggleEstadoItem: (item: any, nuevoEstado: string) => void;
  ingresosMes?: any[];
  onAsignarIngreso?: (item: any, ingresoId: string | null) => Promise<void> | void;
  moneda: string;
  draggedId: string | null;
  dragOverId: string | null;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeave: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, e: React.DragEvent) => void;
  busquedaTexto?: string;
}

export function SeccionEgresosTabla({
  seccion,
  estaColapsada,
  onToggleColapsar,
  onAgregarItem,
  selectedGastoIds,
  onToggleSelectGasto,
  onSelectItem,
  onToggleEstadoItem,
  ingresosMes,
  onAsignarIngreso,
  moneda,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  busquedaTexto = '',
}: SeccionEgresosTablaProps) {
  const items = seccion?.itemsFiltrados || [];
  const esBusqueda = Boolean(busquedaTexto.trim());

  return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs transition-all">
        {/* Header de Sección */}
        <SeccionEgresosHeader
          seccion={seccion}
          estaColapsada={estaColapsada}
          moneda={moneda}
          onToggleColapsar={onToggleColapsar}
          onAgregarItem={onAgregarItem}
        />

        {/* Contenido de la Sección */}
        {!estaColapsada && (
          items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 space-y-2">
              {esBusqueda ? (
                <p>No se encontraron compromisos en {seccion?.titulo?.toLowerCase() || 'esta sección'} que coincidan con &ldquo;{busquedaTexto}&rdquo;.</p>
              ) : (
                <>
                  <p>No hay compromisos en {seccion?.titulo?.toLowerCase() || 'esta sección'} con el filtro seleccionado.</p>
                  <button
                    type="button"
                    onClick={onAgregarItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar primer compromiso</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Móvil: Lista de tarjetas ergonómicas */}
              <div className="md:hidden divide-y divide-border/40">
                {items.map((item) => (
                  <SeccionEgresoCardMobile
                    key={`m-${item.id}`}
                    item={item}
                    isSelected={selectedGastoIds.includes(item.id)}
                    moneda={moneda}
                    ingresosMes={ingresosMes}
                    onAsignarIngreso={onAsignarIngreso}
                    onSelectItem={onSelectItem}
                    onToggleSelectGasto={onToggleSelectGasto}
                    onToggleEstadoItem={onToggleEstadoItem}
                  />
                ))}
              </div>

              {/* Desktop: Tabla estructurada */}
              <SeccionEgresosDesktopTable
                items={items}
                seccionId={seccion.id}
                selectedGastoIds={selectedGastoIds}
                moneda={moneda}
                ingresosMes={ingresosMes}
                onAsignarIngreso={onAsignarIngreso}
                draggedId={draggedId}
                dragOverId={dragOverId}
                onSelectItem={onSelectItem}
                onToggleSelectGasto={onToggleSelectGasto}
                onToggleEstadoItem={onToggleEstadoItem}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
              />
            </>
          )
        )}
      </div>
      );
}
