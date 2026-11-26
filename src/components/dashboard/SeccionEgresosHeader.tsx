'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ChevronDown, Plus } from 'lucide-react';

interface SeccionEgresosHeaderProps {
  seccion: {
    id: string;
    titulo: string;
    descripcion?: string;
    icono: React.ElementType;
    headerBg?: string;
    iconBg?: string;
    badgeBg?: string;
    badgeText?: string;
    badgeBorder?: string;
    filteredCount: number;
    subtotal: number;
    itemsFiltrados: any[];
  };
  estaColapsada: boolean;
  moneda: string;
  onToggleColapsar: () => void;
  onAgregarItem: () => void;
}

export function SeccionEgresosHeader({
  seccion,
  estaColapsada,
  moneda,
  onToggleColapsar,
  onAgregarItem,
}: SeccionEgresosHeaderProps) {
  const IconComponent = seccion?.icono;
  const items = seccion?.itemsFiltrados || [];
  const count = seccion?.filteredCount ?? items.length;
  const subtotal = seccion?.subtotal ?? 0;

  const subtotalSoles = items
    .filter((it) => it.monedaOriginal !== 'USD')
    .reduce((sum, it) => sum + (it.monto || 0), 0);

  const subtotalUSD = items
    .filter((it) => it.monedaOriginal === 'USD')
    .reduce(
      (sum, it) =>
        sum +
        (it.montoOriginal != null
          ? it.montoOriginal
          : (it.monto || 0) / (it.tipoCambio || 4.0)),
      0
    );

  return (
    <div
      className="bg-muted/15 hover:bg-muted/25 border-b border-border/70 px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none transition-colors"
      onClick={onToggleColapsar}
    >
      {/* Izquierda: Ícono pastel + Título + Badge + Subtítulo */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
            seccion?.iconBg || 'bg-primary/10 text-primary'
          }`}
        >
          {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
              {seccion?.titulo}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                seccion?.badgeBg || 'bg-muted/60'
              } ${seccion?.badgeText || 'text-muted-foreground'} ${
                seccion?.badgeBorder || 'border-border/60'
              }`}
            >
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          {seccion?.descripcion && (
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              {seccion.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Derecha: + Agregar + Desglose limpio / Total + Chevron */}
      <div
        className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onAgregarItem}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border border-border/80 hover:border-foreground/30 bg-background/80 hover:bg-muted text-foreground text-xs font-medium transition active:scale-95 cursor-pointer shadow-2xs"
          title={`Agregar a ${seccion?.titulo || 'sección'}`}
        >
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Agregar</span>
        </button>

        {/* Desglose de totales: Si hay USD o solo Soles */}
        {subtotalUSD > 0 ? (
          <div className="flex items-center divide-x divide-border/60 bg-background/90 dark:bg-card/90 border border-border/70 rounded-xl px-3 py-1.5 shadow-2xs">
            {/* Soles */}
            <div className="pr-2.5 sm:pr-3 text-right">
              <span className="text-[10px] font-semibold text-muted-foreground block tracking-tight">
                Soles
              </span>
              <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                {formatMoney(subtotalSoles, moneda)}
              </span>
            </div>

            {/* Dólares */}
            <div className="px-2.5 sm:px-3 text-right">
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 block tracking-tight">
                Dólares
              </span>
              <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                {formatMoney(subtotalUSD, '$')}
              </span>
            </div>

            {/* Total Consolidado */}
            <div className="pl-2.5 sm:pl-3 text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-foreground tabular-nums">
                {formatMoney(subtotal, moneda)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-background/90 dark:bg-card/90 border border-border/70 rounded-xl px-3 py-1.5 shadow-2xs text-right">
            <span className="text-[10px] font-semibold text-muted-foreground block tracking-tight">
              Total sección
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-foreground tabular-nums">
              {formatMoney(subtotal, moneda)}
            </span>
          </div>
        )}

        {/* Botón chevron colapsable */}
        <button
          type="button"
          onClick={onToggleColapsar}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
          title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              estaColapsada ? '-rotate-90 text-muted-foreground/60' : 'text-foreground'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
