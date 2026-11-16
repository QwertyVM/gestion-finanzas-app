'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ChevronDown, Plus } from 'lucide-react';
import { SeccionEgresoCardMobile } from './SeccionEgresoCardMobile';
import { SeccionEgresosDesktopTable } from './SeccionEgresosDesktopTable';

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
  moneda: string;
  draggedId: string | null;
  dragOverId: string | null;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeave: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string, e: React.DragEvent) => void;
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
  moneda,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: SeccionEgresosTablaProps) {
  const IconComponent = seccion.icono;

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs transition-all">
      {/* Header de Sección */}
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between border-b border-border/60 ${seccion.headerBg} cursor-pointer select-none`}
        onClick={onToggleColapsar}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${seccion.iconBg}`}>
            {IconComponent && <IconComponent className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                {seccion.titulo}
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${seccion.badgeBg} ${seccion.badgeText} ${seccion.badgeBorder}`}
              >
                {seccion.filteredCount} {seccion.filteredCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            {seccion.descripcion && (
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {seccion.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAgregarItem();
            }}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-background hover:bg-muted text-foreground border border-border/80 shadow-2xs transition active:scale-95 text-xs font-medium cursor-pointer"
            title={`Agregar a ${seccion.titulo}`}
          >
            <Plus className="w-3.5 h-3.5 text-foreground" />
            <span className="hidden sm:inline text-[11px]">Agregar</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
              Subtotal
            </span>
            <span className="font-mono font-bold text-xs text-foreground tabular-nums">
              {formatMoney(seccion.subtotal, moneda)}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleColapsar();
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                estaColapsada ? '-rotate-90' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Contenido de la Sección */}
      {!estaColapsada && (
        seccion.itemsFiltrados.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 space-y-2">
            <p>No hay compromisos en {seccion.titulo.toLowerCase()} con el filtro seleccionado.</p>
            <button
              type="button"
              onClick={onAgregarItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar primer compromiso</span>
            </button>
          </div>
        ) : (
          <>
            {/* Móvil: Lista de tarjetas ergonómicas */}
            <div className="md:hidden divide-y divide-border/40">
              {seccion.itemsFiltrados.map((item) => (
                <SeccionEgresoCardMobile
                  key={`m-${item.id}`}
                  item={item}
                  isSelected={selectedGastoIds.includes(item.id)}
                  moneda={moneda}
                  onSelectItem={onSelectItem}
                  onToggleSelectGasto={onToggleSelectGasto}
                  onToggleEstadoItem={onToggleEstadoItem}
                />
              ))}
            </div>

            {/* Desktop: Tabla estructurada */}
            <SeccionEgresosDesktopTable
              items={seccion.itemsFiltrados}
              seccionId={seccion.id}
              selectedGastoIds={selectedGastoIds}
              moneda={moneda}
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
