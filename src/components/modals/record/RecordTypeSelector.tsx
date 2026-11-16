'use client';

import React from 'react';
import { Minus, Plus, Repeat, Landmark, X } from 'lucide-react';
import type { TipoRecordModal } from '@/context/FinanzasContext';

interface RecordTypeSelectorProps {
  tipoActivo: TipoRecordModal;
  onTipoChange: (tipo: TipoRecordModal) => void;
  onClose: () => void;
}

export function RecordTypeSelector({
  tipoActivo,
  onTipoChange,
  onClose,
}: RecordTypeSelectorProps) {
  return (
    <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-border/70 flex items-center justify-between gap-3 shrink-0">
      <div className="flex-1 max-w-md">
        <div className="grid grid-cols-4 p-1 bg-muted/60 rounded-xl border border-border/60 gap-0.5">
          <button
            type="button"
            onClick={() => onTipoChange('GASTO')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tipoActivo === 'GASTO'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Minus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Gasto</span>
          </button>

          <button
            type="button"
            onClick={() => onTipoChange('INGRESO')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tipoActivo === 'INGRESO'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Ingreso</span>
          </button>

          <button
            type="button"
            onClick={() => onTipoChange('FIJO')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tipoActivo === 'FIJO'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Fijo</span>
          </button>

          <button
            type="button"
            onClick={() => onTipoChange('PRESTAMO')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tipoActivo === 'PRESTAMO'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span>Préstamo</span>
          </button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
        title="Cerrar (Esc)"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
