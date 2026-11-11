'use client';

import React from 'react';
import { formatMoney, getEstiloClasificacion } from '@/lib/utils';
import {
  ChevronDown,
  Plus,
  GripVertical,
  CheckSquare,
  Square,
} from 'lucide-react';

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
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs transition-all">
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
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {seccion.descripcion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAgregarItem();
            }}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-muted text-foreground border border-border/80 shadow-2xs hover:border-foreground/40 transition active:scale-95 text-xs font-medium cursor-pointer"
            title={`Agregar a ${seccion.titulo}`}
          >
            <Plus className="w-3.5 h-3.5 text-foreground" />
            <span className="hidden sm:inline text-[11px]">Agregar</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
              Subtotal
            </span>
            <span className="font-mono font-bold text-xs text-foreground">
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

      {/* Tabla de la Sección */}
      {!estaColapsada && (
        seccion.itemsFiltrados.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 space-y-2">
            <p>No hay compromisos en {seccion.titulo.toLowerCase()} con el filtro seleccionado.</p>
            <button
              type="button"
              onClick={onAgregarItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar primer compromiso</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-2 w-7 text-center"><span className="sr-only">Mover</span></th>
                  <th scope="col" className="py-2.5 px-2 w-9 text-center"><span className="sr-only">Seleccionar</span></th>
                  <th scope="col" className="py-2.5 px-3.5 font-semibold text-foreground">Concepto & Detalle</th>
                  <th scope="col" className="py-2.5 px-3.5 text-center font-semibold text-foreground">Estado</th>
                  <th scope="col" className="py-2.5 px-3.5 text-right font-semibold text-foreground">Monto</th>
                  <th scope="col" className="py-2.5 px-3.5 text-center font-semibold text-foreground">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {seccion.itemsFiltrados.map((item) => {
                  const isSelected = selectedGastoIds.includes(item.id);
                  const estilo = getEstiloClasificacion(item.clasificacion);

                  return (
                    <tr
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(item.id, e)}
                      onDragOver={(e) => onDragOver(item.id, e)}
                      onDragLeave={() => onDragLeave(item.id)}
                      onDragEnd={onDragEnd}
                      onDrop={(e) => onDrop(item.id, e)}
                      onClick={() => onSelectItem(item)}
                      className={`group transition-all cursor-pointer hover:bg-muted/30 border-l-[3px] ${estilo.borderColor} ${
                        isSelected ? 'bg-muted/40' : ''
                      } ${dragOverId === item.id ? 'border-t-2 border-t-primary bg-primary/10' : ''} ${
                        draggedId === item.id ? 'opacity-40' : ''
                      }`}
                    >
                      <td
                        className="py-3 px-2 text-center cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-muted-foreground transition hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                        title="Arrastrar para ordenar"
                      >
                        <GripVertical className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleSelectGasto(item.id, item.monto)}
                          className="text-muted-foreground hover:text-foreground transition p-0.5"
                          aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-foreground" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-foreground text-sm">
                          {item.concepto}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 truncate">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.categoriaColor || '#64748b' }}
                            title={item.categoria}
                          />
                          <span className="text-foreground/80 font-medium">{item.categoria}</span>
                          <span>·</span>
                          <span className="truncate">{item.subtexto}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            item.estado === 'ADELANTADO'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : item.estado === 'PAGADO'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.estado === 'ADELANTADO'
                                ? 'bg-indigo-500'
                                : item.estado === 'PAGADO'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {item.estado === 'ADELANTADO'
                            ? 'Adelantado'
                            : item.estado === 'PAGADO'
                              ? 'Pagado'
                              : 'Pendiente'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono font-bold text-foreground text-sm sm:text-base">
                        <div>{formatMoney(item.monto, moneda)}</div>
                        {item.monedaOriginal === 'USD' && item.montoOriginal && (
                          <div className="text-xs text-muted-foreground font-normal">
                            ${item.montoOriginal.toFixed(2)} USD
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              onToggleEstadoItem(
                                item,
                                item.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                              )
                            }
                            className="px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition font-medium"
                          >
                            Adelantar
                          </button>

                          <button
                            onClick={() =>
                              onToggleEstadoItem(
                                item,
                                item.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                              )
                            }
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                              item.estado === 'PAGADO'
                                ? 'text-muted-foreground hover:bg-muted'
                                : 'bg-foreground text-background hover:opacity-90'
                            }`}
                          >
                            {item.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/20 border-t border-border/60 text-xs font-medium">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3.5 text-muted-foreground text-xs">
                    Subtotal {seccion.titulo} ({seccion.filteredCount} items)
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                    {formatMoney(seccion.subtotal, moneda)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      )}
    </div>
  );
}
