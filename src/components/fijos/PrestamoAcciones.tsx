'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface PrestamoAccionesProps {
  prestamoId: string;
  conceptoCompleto: string;
  isLoading: boolean;
  onEditarBase: () => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamoAcciones({
  prestamoId,
  conceptoCompleto,
  isLoading,
  onEditarBase,
  onEliminar,
}: PrestamoAccionesProps) {
  return (
    <div
      className="flex items-center justify-end gap-1 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEditarBase}
        disabled={isLoading}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
        title="Editar condiciones base del préstamo"
        aria-label="Editar préstamo"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onEliminar(prestamoId, conceptoCompleto)}
        disabled={isLoading}
        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
        title="Eliminar préstamo de la plantilla concurrente"
        aria-label="Eliminar préstamo"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
