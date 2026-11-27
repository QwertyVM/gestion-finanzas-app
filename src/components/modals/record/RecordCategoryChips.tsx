'use client';

import React, { useState } from 'react';
import { Tag, ShieldCheck, Sparkles, PiggyBank, ChevronDown } from 'lucide-react';
import type { CategoriaItem } from '../hooks/useDynamicRecordModal';
import { MINITAGS_POR_CATEGORIA, TODOS_LOS_MINITAGS_SUGERIDOS } from '@/lib/categoria-service';

interface RecordCategoryChipsProps {
  categorias: CategoriaItem[];
  categoriaId: string;
  onSelectCategoria: (cat: CategoriaItem) => void;
  tag?: string;
  onSelectTag?: (tag: string) => void;
}

export function RecordCategoryChips({
  categorias,
  categoriaId,
  onSelectCategoria,
  tag = '',
  onSelectTag,
}: RecordCategoryChipsProps) {
  const [mostrarTags, setMostrarTags] = useState(Boolean(tag));

  const selectedCat = categorias.find((c) => c.id === categoriaId);
  const sugerencias =
    (selectedCat && MINITAGS_POR_CATEGORIA[selectedCat.nombre]) ||
    TODOS_LOS_MINITAGS_SUGERIDOS.slice(0, 8);

  const renderIcon = (catNombre: string) => {
    const n = catNombre.toLowerCase();
    if (n.includes('necesidad') || n.includes('50')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    if (n.includes('deseo') || n.includes('30')) {
      return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    if (n.includes('ahorro') || n.includes('invers') || n.includes('20')) {
      return <PiggyBank className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    return <Tag className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div className="space-y-2">
      {/* 1. Selector de las 3 Categorías Fundamentales 50/30/20 */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground flex items-center justify-between">
          <span>Categoría de Presupuesto:</span>
          {onSelectTag && (
            <button
              type="button"
              onClick={() => setMostrarTags(!mostrarTags)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition cursor-pointer"
            >
              <Tag className="w-3 h-3 text-muted-foreground/80" />
              <span>{mostrarTags ? 'Ocultar etiqueta' : tag ? `#${tag}` : '+ Etiqueta'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${mostrarTags ? 'rotate-180' : ''}`} />
            </button>
          )}
        </label>

        <div className="grid grid-cols-3 gap-2">
          {categorias.map((cat) => {
            const isSelected = categoriaId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategoria(cat)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground shadow-xs'
                    : 'bg-background text-muted-foreground border-border/80 hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {renderIcon(cat.nombre)}
                  <span className="truncate">{cat.nombre}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Minitag opcional y desplegable */}
      {mostrarTags && onSelectTag && (
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {sugerencias.map((sug) => {
              const isSelected = tag.toLowerCase() === sug.toLowerCase();
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => onSelectTag(isSelected ? '' : sug)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground font-semibold shadow-2xs'
                      : 'bg-background text-muted-foreground border-border/70 hover:text-foreground'
                  }`}
                >
                  #{sug}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={tag}
            onChange={(e) => onSelectTag(e.target.value)}
            placeholder="O escribe una etiqueta (ej: Supermercado, Almuerzo...)"
            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/70 text-foreground text-xs outline-none focus:border-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      )}
    </div>
  );
}
