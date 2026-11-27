'use client';

import React from 'react';
import { PrestamosTabla } from './PrestamosTabla';
import type { DetalleItemData } from '@/components/modals/ModalDetalleGasto';

interface FijosPrestamosSectionProps {
  prestamos: any[];
  moneda: string;
  loadingAction: string | null;
  onOpenModalPrestamo: () => void;
  onSelectDetalle?: (item: any) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => Promise<void>;
}

export function FijosPrestamosSection({
  prestamos,
  moneda,
  loadingAction,
  onOpenModalPrestamo,
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
            Monitoreo de cuotas mensuales, progreso de amortización y pasivos financieros.
          </p>
        </div>
      </div>

      <PrestamosTabla
        prestamos={prestamos}
        moneda={moneda}
        loadingAction={loadingAction}
        onEditarBase={onEditarBase}
        onEliminar={onEliminar}
      />
    </div>
  );
}
