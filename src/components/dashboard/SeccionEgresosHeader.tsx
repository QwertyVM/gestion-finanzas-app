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
      className="bg-secondary/40 border-b border-border/80 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none transition-colors"
      onClick={onToggleColapsar}
    >
      {/* Izquierda: Ícono en caja suave + Título + Badge + Subtítulo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              {seccion?.titulo}
            </h3>
            <span className="bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          {seccion?.descripcion && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {seccion.descripcion}
            </p>
          )}
        </div>
      </div>

        {/* Derecha: + Agregar + Bloque compacto de resumen + Chevron */}
        <div
          className="flex items-center gap-3 self-end lg:self-auto flex-wrap sm:flex-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onAgregarItem}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border border-primary/25 bg-background hover:bg-primary/10 text-primary transition-all active:scale-95 text-xs font-semibold cursor-pointer shadow-2xs"
            title={`Agregar a ${seccion?.titulo || 'sección'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>

            {/* Bloque compacto de resumen numérico */}
            <div className="flex items-center gap-3 bg-background/80 dark:bg-card/90 border border-border/80 px-3.5 py-1.5 rounded-xl shadow-2xs backdrop-blur-xs">
              {subtotalUSD > 0 && (
                <>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/75 block font-semibold">
                      Soles
                    </span>
                    <span className="font-mono font-semibold text-xs text-foreground tabular-nums">
                      {formatMoney(subtotalSoles, moneda)}
                    </span>
                  </div>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/75 block font-semibold">
                      Dólares
                    </span>
                    <span className="font-mono font-semibold text-xs text-foreground tabular-nums">
                      ${subtotalUSD.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-muted-foreground/30">•</span>
                </>
              )}

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block font-semibold">
                {subtotalUSD > 0 ? 'Total Consolidado' : 'Total Soles'}
              </span>
              <span className="font-mono text-sm font-extrabold text-foreground tabular-nums block">
                {formatMoney(subtotal, moneda)}
              </span>
            </div>
          </div>

        {/* Botón chevron colapsable */}
        <button
          type="button"
          onClick={onToggleColapsar}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
          title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${estaColapsada ? '-rotate-90' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
