'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface DetalleFooterAccionesProps {
  tipo: 'TARJETA' | 'DIRECTO' | 'FIJO' | 'PRESTAMO';
  tieneCuotas: boolean;
  updating: boolean;
  onEliminarGasto?: () => void;
  onEliminarCompraCompleta?: () => void;
  onClose: () => void;
}

export function DetalleFooterAcciones({
  tipo,
  tieneCuotas,
  updating,
  onEliminarGasto,
  onEliminarCompraCompleta,
  onClose,
}: DetalleFooterAccionesProps) {
  const puedeEliminar = (tipo === 'TARJETA' || tipo === 'DIRECTO') && onEliminarGasto;

  return (
    <div className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2">
        {puedeEliminar && (
          <button
            type="button"
            disabled={updating}
            onClick={onEliminarGasto}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition"
            title={tieneCuotas ? 'Eliminar solo la cuota de este mes' : 'Eliminar este gasto'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{tieneCuotas ? 'Eliminar cuota' : 'Eliminar gasto'}</span>
          </button>
        )}

        {puedeEliminar && tieneCuotas && onEliminarCompraCompleta && (
          <button
            type="button"
            disabled={updating}
            onClick={onEliminarCompraCompleta}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition"
            title="Eliminar compra completa y todas sus cuotas"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar compra completa</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="h-8 px-4 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition ml-auto shadow-2xs"
      >
        Cerrar
      </button>
    </div>
  );
}
