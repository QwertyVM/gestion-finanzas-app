'use client';

import React, { useState, useMemo } from 'react';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Layers, Search, X, ArrowUpDown, TrendingDown, Calendar, CreditCard } from 'lucide-react';
import { CompraCuotaCard } from './CompraCuotaCard';
import { formatMoney } from '@/lib/utils';

interface ComprasCuotasSectionProps {
  comprasCuotas: any[];
  loadingCuotas: boolean;
  moneda: string;
  compraDesplegada: string | null;
  onToggleDesplegar: (padreId: string) => void;
  deletingCompraId: string | null;
  onEliminarCompraCompleta: (compra: any) => void;
}

type SortCuotas = 'relevancia' | 'cuota_desc' | 'monto_desc' | 'progreso_desc' | 'cuotas_restantes';

export function ComprasCuotasSection({
  comprasCuotas,
  loadingCuotas,
  moneda,
  compraDesplegada,
  onToggleDesplegar,
  deletingCompraId,
  onEliminarCompraCompleta,
}: ComprasCuotasSectionProps) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<SortCuotas>('relevancia');

  // Métricas agregadas de compras en cuotas
  const metricasGlobales = useMemo(() => {
    const totalCompras = comprasCuotas.length;
    const totalFinanciado = comprasCuotas.reduce((acc, c) => acc + (c.montoTotal || 0), 0);
    const cuotaMensualSuma = comprasCuotas.reduce((acc, c) => acc + (c.montoCuota || 0), 0);
    const totalCuotasRestantes = comprasCuotas.reduce((acc, c) => acc + (c.cuotasRestantes || 0), 0);

    return { totalCompras, totalFinanciado, cuotaMensualSuma, totalCuotasRestantes };
  }, [comprasCuotas]);

  const comprasFiltradas = useMemo(() => {
    let result = comprasCuotas;
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().trim();
      result = result.filter((c) => {
        const matchConcepto = c.conceptoBase?.toLowerCase().includes(term);
        const matchTarjeta = c.tarjetaNombre?.toLowerCase().includes(term);
        const matchCategoria = c.categoriaNombre?.toLowerCase().includes(term);
        return matchConcepto || matchTarjeta || matchCategoria;
      });
    }

    return [...result].sort((a, b) => {
      if (orden === 'cuota_desc') return (b.montoCuota || 0) - (a.montoCuota || 0);
      if (orden === 'monto_desc') return (b.montoTotal || 0) - (a.montoTotal || 0);
      if (orden === 'progreso_desc') return (b.porcentajeProgreso || 0) - (a.porcentajeProgreso || 0);
      if (orden === 'cuotas_restantes') return (a.cuotasRestantes || 0) - (b.cuotasRestantes || 0);
      return 0; // relevancia original
    });
  }, [comprasCuotas, busqueda, orden]);

  return (
    <div className="space-y-4">
      {/* Resumen Global de Cuotas Activas */}
      {comprasCuotas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-card border border-indigo-500/30 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-[11px]">
              <span className="font-semibold">Cuota Total / Mes</span>
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {formatMoney(metricasGlobales.cuotaMensualSuma, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Impacto fijo mensual en tarjeta
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-medium">Total Financiado</span>
              <Layers className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {formatMoney(metricasGlobales.totalFinanciado, moneda)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Suma original de compras diferidas
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-medium">Compras Diferidas</span>
              <Calendar className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {metricasGlobales.totalCompras} compras
            </div>
            <span className="text-[10px] text-muted-foreground block">
              En ciclo de amortización
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-medium">Cuotas por Liquidar</span>
              <TrendingDown className="w-3.5 h-3.5 opacity-60" />
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-foreground tabular-nums">
              {metricasGlobales.totalCuotasRestantes} cuotas
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Pendientes en el tiempo
            </span>
          </div>
        </div>
      )}

      {/* Banner explicativo con Buscador y Filtro de Ordenamiento */}
      <div className="bg-muted/30 border border-border/70 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-semibold text-xs sm:text-sm text-foreground">
              Compras en Cuotas (Tarjetas de Crédito)
            </h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Consolidación global de compras diferidas. Gestiona y elimina compras completas sin borrar cuota por cuota.
            </p>
          </div>
        </div>

        {/* Buscador y Ordenamiento */}
        {comprasCuotas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar compra o tarjeta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-muted/40 border border-border/70 text-xs focus:border-foreground outline-none text-foreground placeholder:text-muted-foreground transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="inline-flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/60 text-xs">
              <ArrowUpDown className="w-3 h-3 text-muted-foreground ml-1" />
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as SortCuotas)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
              >
                <option value="relevancia">Orden inicial</option>
                <option value="cuota_desc">Mayor cuota/mes</option>
                <option value="monto_desc">Mayor monto total</option>
                <option value="progreso_desc">Mayor avance %</option>
                <option value="cuotas_restantes">Próximas a terminar</option>
              </select>
            </div>
          </div>
        )}
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
      ) : comprasFiltradas.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-1.5">
          <p className="text-xs text-muted-foreground">
            No se encontraron compras en cuotas que coincidan con &quot;{busqueda}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {comprasFiltradas.map((compra) => (
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
