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
      className="bg-card hover:bg-muted/20 border-b border-border/70 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none transition-colors"
      onClick={onToggleColapsar}
    >
      {/* Izquierda: Identidad de Sección (Icono + Título + Conteo + Descripción) */}
      <div className="flex items-center gap-3 min-w-0">
        <div
              }`}
        >
          {IconComponent && <IconComponent className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
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
          {
    seccion?.descripcion && (
      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
        {seccion.descripcion}
      </p>
    )
  }
        </div >
      </div >

  {/* Derecha: Resumen Financiero Ejecutivo + Separador + Acciones */ }
  <div
    className="flex items-center gap-3.5 sm:gap-4 self-end sm:self-auto"
    onClick={(e) => e.stopPropagation()}
  >
            {/* Bloque Financiero: Monto total destacado + desglose de divisas */}
            <div className="text-right">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums tracking-tight">
                {formatMoney(subtotal, moneda)}
              </div>
              {subtotalUSD > 0 ? (
                <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 whitespace-nowrap">
                  <span>{formatMoney(subtotalSoles, moneda)}</span>
                  <span className="text-muted-foreground/50 mx-1">+</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    {formatMoney(subtotalUSD, '$')}
                  </span>
                </div>
                ) : (
                <span className="text-[10px] text-muted-foreground/75 block">
                  Total sección
                </span>
          )}
        </div>

        {/* Separador vertical sutil */}
        <div className="h-6 w-px bg-border/60 hidden sm:block" />

        {/* Acciones directas */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAgregarItem}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border border-border/80 hover:border-foreground/30 hover:bg-muted/80 bg-background text-foreground text-xs font-medium transition active:scale-95 cursor-pointer shadow-2xs"
            title={`Agregar compromiso a ${seccion?.titulo || 'esta sección'}`}
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Agregar</span>
          </button>

          <button
            type="button"
            onClick={onToggleColapsar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
            title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${estaColapsada ? '-rotate-90 text-muted-foreground/60' : 'text-foreground'
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
