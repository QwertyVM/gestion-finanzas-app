'use client';

import React from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Layers } from 'lucide-react';
import { CompraCuotaCard } from './CompraCuotaCard';

interface ComprasCuotasSectionProps {
  comprasCuotas: any[];
  loadingCuotas: boolean;
  moneda: string;
  compraDesplegada: string | null;
  onToggleDesplegar: (padreId: string) => void;
  deletingCompraId: string | null;
  onEliminarCompraCompleta: (compra: any) => void;
}

export function ComprasCuotasSection({
  comprasCuotas,
  loadingCuotas,
  moneda,
  compraDesplegada,
  onToggleDesplegar,
  deletingCompraId,
  onEliminarCompraCompleta,
}: ComprasCuotasSectionProps) {
  return (
    <div className="space-y-4">
      {/* Banner explicativo sutil */}
      <div className="bg-muted/30 border border-border/70 rounded-xl p-3.5 sm:p-4 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h2 className="font-semibold text-xs sm:text-sm text-foreground">
            Compras en Cuotas (Tarjetas de Crédito)
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Consolidación global de compras diferidas. Puedes gestionar y eliminar compras completas de todos los periodos sin borrar cuota por cuota.
          </p>
        </div>
      </div>

      {loadingCuotas ? (
        <TableSkeleton rows={4} />
      ) : comprasCuotas.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-1.5">
          <Layers className="w-6 h-6 text-muted-foreground mx-auto mb-1 opacity-50" />
          <p className="text-xs font-semibold text-foreground">No tienes compras en cuotas registradas</p>
          <p className="text-[11px] text-muted-foreground">
            Cuando registres una compra con tarjeta en 2 o más cuotas, aparecerá consolidada aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {comprasCuotas.map((compra) => (
            <CompraCuotaCard
              key={compra.padreId || compra.conceptoBase}
              compra={compra}
              moneda={moneda}
              estaDesplegado={compraDesplegada === compra.padreId}
              isDeleting={deletingCompraId === compra.padreId}
              onToggleDesplegar={onToggleDesplegar}
              onEliminarCompraCompleta={onEliminarCompraCompleta}
            />
          ))}
        </div>
      )}
    </div>
  );
}
