'use client';

import React from 'react';
import { Home, Banknote } from 'lucide-react';
import type { ClasificacionEgreso } from '@/lib/utils';

interface DetalleClasificacionSelectorProps {
  clasificacionActual: ClasificacionEgreso;
  isUpdating: boolean;
  onCambiarClasificacion: (nuevaClasificacion: 'FIJO' | 'VARIABLE') => Promise<void>;
  deshabilitado?: boolean;
}

export function DetalleClasificacionSelector({
  clasificacionActual,
  isUpdating,
  onCambiarClasificacion,
  deshabilitado = false,
}: DetalleClasificacionSelectorProps) {
  const esFijo = clasificacionActual === 'FIJO';

  return (
    <div className="flex items-center justify-between py-2 border-t border-b border-border/50 text-xs">
      <div>
        <span className="font-medium text-foreground block">Clasificación</span>
        <span className="text-[11px] text-muted-foreground block">
          {esFijo ? 'Suscripción o costo fijo mensual' : 'Gasto variable del día a día'}
        </span>
      </div>

      <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60">
        <button
          type="button"
          disabled={isUpdating || deshabilitado}
          onClick={() => !esFijo && onCambiarClasificacion('FIJO')}
          className={`h-7 px-2.5 rounded-md text-xs font-semibold transition inline-flex items-center gap-1.5 ${
            esFijo
              ? 'bg-background text-sky-700 dark:text-sky-300 shadow-2xs border border-sky-200/50 dark:border-sky-800/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Fijo</span>
        </button>

        <button
          type="button"
          disabled={isUpdating || deshabilitado}
          onClick={() => esFijo && onCambiarClasificacion('VARIABLE')}
          className={`h-7 px-2.5 rounded-md text-xs font-semibold transition inline-flex items-center gap-1.5 ${
            !esFijo
              ? 'bg-background text-teal-700 dark:text-teal-300 shadow-2xs border border-teal-200/50 dark:border-teal-800/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Variable</span>
        </button>
      </div>
    </div>
  );
}
