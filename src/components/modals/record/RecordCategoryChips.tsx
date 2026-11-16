'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { ExecutiveIconHelper } from '@/components/dashboard/executive/ExecutiveIconHelper';
import type { CategoriaItem } from '../hooks/useDynamicRecordModal';

interface RecordCategoryChipsProps {
  categorias: CategoriaItem[];
  categoriaId: string;
  onSelectCategoria: (cat: CategoriaItem) => void;
}

export function RecordCategoryChips({
  categorias,
  categoriaId,
  onSelectCategoria,
}: RecordCategoryChipsProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">Categoría:</label>
        <span className="text-[10px] text-muted-foreground">Opcional</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {categorias.map((cat) => {
          const isSelected = categoriaId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategoria(cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {cat.icono ? (
                <ExecutiveIconHelper name={cat.icono} className="w-3 h-3 shrink-0" />
              ) : (
                <Tag className="w-3 h-3 shrink-0" />
              )}
              <span>{cat.nombre.split('/')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
