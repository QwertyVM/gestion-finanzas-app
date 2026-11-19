'use client';

import React from 'react';
import { Tag, ShieldCheck, Sparkles, PiggyBank } from 'lucide-react';
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
    <div className="space-y-2.5">
      {/* 1. Las 3 grandes categorías 50/30/20 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-foreground">
            Categoría 50/30/20:
          </label>
          <span className="text-[10px] text-muted-foreground">Recomendado</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {categorias.map((cat) => {
            const isSelected = categoriaId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategoria(cat)}
                      ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                      : 'bg-background text-foreground/80 border-border hover:border-foreground/40 hover:bg-muted/30'
                    }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  {renderIcon(cat.nombre)}
                  <span className="truncate">{cat.nombre}</span>
                </div>
      </button>
      );
          })}
    </div>
      </div >

    {/* 2. Minitag específico */ }
  {
    onSelectTag && (
      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Minitag específico:</span>
          </span>
          {tag && (
            <button
              type="button"
              onClick={() => onSelectTag('')}
              className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sugerencias.map((sug) => {
            const isSelected = tag.toLowerCase() === sug.toLowerCase();
            return (
              <button
                key={sug}
                type="button"
                onClick={() => onSelectTag(isSelected ? '' : sug)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border shrink-0 transition cursor-pointer ${isSelected
                    ? 'bg-foreground text-background border-foreground font-semibold shadow-2xs'
                    : 'bg-background text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/50'
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
          placeholder="O escribe un minitag personalizado (ej: Supermercado, Alquiler...)"
          className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/70 text-foreground text-xs outline-none focus:border-foreground"
        />
      </div>
    )
  }
    </div >
  );
}
