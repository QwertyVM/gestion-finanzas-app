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
      className={`px-3.5 py-2.5 flex items-center justify-between border-b border-border/60 ${seccion?.headerBg || 'bg-muted/10'} cursor-pointer select-none`}
      onClick={onToggleColapsar}
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${seccion?.iconBg || 'bg-muted text-muted-foreground'}`}>
          {IconComponent && <IconComponent className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              {seccion?.titulo}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${seccion?.badgeBg || 'bg-muted'} ${seccion?.badgeText || 'text-muted-foreground'} ${seccion?.badgeBorder || 'border-border'}`}
            >
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          {seccion?.descripcion && (
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
          title={`Agregar a ${seccion?.titulo || 'sección'}`}
        >
          <Plus className="w-3.5 h-3.5 text-foreground" />
          <span className="hidden sm:inline text-[11px]">Agregar</span>
        </button>

        {subtotalUSD > 0 ? (
          <div className="flex items-center gap-2 sm:gap-3 text-right">
            {/* 1. Sumatoria independiente en Soles */}
            <div className="hidden sm:block text-right">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-medium">
                Soles (S/)
              </span>
              <span className="font-mono font-semibold text-xs text-foreground tabular-nums">
                {formatMoney(subtotalSoles, moneda)}
              </span>
            </div>

            {/* 2. Sumatoria independiente en Dólares */}
            <div className="hidden sm:block text-right">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-medium">
                Dólares ($)
              </span>
              <span className="font-mono font-semibold text-xs text-foreground tabular-nums">
                ${subtotalUSD.toFixed(2)}
              </span>
            </div>

            {/* 3. Total en Soles */}
            <div className="text-right sm:border-l sm:border-border/60 sm:pl-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-bold">
                Total Soles
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums block">
                {formatMoney(subtotal, moneda)}
              </span>
              <span className="text-[9.5px] text-muted-foreground font-mono block sm:hidden">
                S/ {subtotalSoles.toFixed(2)} + ${subtotalUSD.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Soles
            </span>
            <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
              {formatMoney(subtotal, moneda)}
            </span>
          </div>
        )}

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
  );
}
