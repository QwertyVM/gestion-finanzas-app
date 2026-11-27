'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { PrestamosTabla } from './PrestamosTabla';
import type { DetalleItemData } from '@/components/modals/ModalDetalleGasto';

interface FijosPrestamosSectionProps {
  prestamos: any[];
  moneda: string;
  loadingAction: string | null;
  onOpenModalPrestamo: () => void;
  onSelectDetalle: (item: DetalleItemData) => void;
  onToggleEstado?: (cuotaId: string, nuevoEstado: string) => Promise<void> | void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => Promise<void>;
}

export function FijosPrestamosSection({
  prestamos,
  moneda,
  loadingAction,
  onOpenModalPrestamo,
  onSelectDetalle,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: FijosPrestamosSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Préstamos Bancarios & Cuotas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoreo de cuotas mensuales, progreso y amortización.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModalPrestamo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Agregar Préstamo</span>
          </button>
        </div>
      </div>

      {prestamos.length === 0 ? (
        <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
          <p className="text-xs text-muted-foreground">No hay préstamos activos registrados.</p>
        </div>
      ) : (
        <PrestamosTabla
          prestamos={prestamos}
          moneda={moneda}
          loadingAction={loadingAction}
          onSelect={onSelectDetalle}
          onToggleEstado={onToggleEstado}
          onEditarBase={onEditarBase}
          onEliminar={onEliminar}
        />
      )}
    </div>
  );
}
