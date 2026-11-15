'use client';

import React from 'react';
import { Home, Banknote, Check, Loader2 } from 'lucide-react';
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
  const esVariable = clasificacionActual === 'VARIABLE';

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <span>Clasificación del egreso</span>
        </span>
        <span className="text-[10px] text-muted-foreground">
          {esFijo ? 'Sección: Compras fijas' : 'Sección: Compras variables'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Opción 1: Compra Fija */}
        <button
          type="button"
          disabled={isUpdating || deshabilitado}
          onClick={() => {
            if (!esFijo) {
              onCambiarClasificacion('FIJO');
            }
          }}
          className={`relative p-2.5 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 ${
            esFijo
              ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 shadow-2xs'
              : 'bg-muted/40 border-border/70 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <div
                className={`p-1 rounded-md ${
                  esFijo
                    ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">Compra fija</span>
            </div>
            {esFijo && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </span>
            )}
          </div>
          <p className="text-[10px] leading-tight opacity-80">
            Suscripción o servicio recurrente mensual
          </p>
        </button>

        {/* Opción 2: Compra Variable */}
        <button
          type="button"
          disabled={isUpdating || deshabilitado}
          onClick={() => {
            if (!esVariable) {
              onCambiarClasificacion('VARIABLE');
            }
          }}
          className={`relative p-2.5 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 ${
            esVariable
              ? 'bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 shadow-2xs'
              : 'bg-muted/40 border-border/70 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <div
                className={`p-1 rounded-md ${
                  esVariable
                    ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">Compra variable</span>
            </div>
            {esVariable && (
              <span className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </span>
            )}
          </div>
          <p className="text-[10px] leading-tight opacity-80">
            Gasto puntual o consumo del día a día
          </p>
        </button>
      </div>

      {isUpdating && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span>Actualizando clasificación...</span>
        </div>
      )}
    </div>
  );
}

