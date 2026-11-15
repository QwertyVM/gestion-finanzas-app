'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface CompraCuotaCardProps {
  compra: any;
  moneda: string;
  estaDesplegado: boolean;
  isDeleting: boolean;
  onToggleDesplegar: (padreId: string) => void;
  onEliminarCompraCompleta: (compra: any) => void;
}

export function CompraCuotaCard({
  compra,
  moneda,
  estaDesplegado,
  isDeleting,
  onToggleDesplegar,
  onEliminarCompraCompleta,
}: CompraCuotaCardProps) {
  const tieneDuplicados = compra.totalRegistrosEnDB > compra.totalCuotas;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-border transition">
      <div className="space-y-3">
        {/* Cabecera de la compra */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded text-white shadow-2xs"
                style={{ backgroundColor: compra.tarjetaColor || '#4f46e5' }}
              >
                {compra.tarjetaNombre}
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {compra.categoriaNombre}
              </span>
              {tieneDuplicados && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Duplicados detectados</span>
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {compra.conceptoBase}
            </h3>
          </div>

          <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200/50 text-[11px] shrink-0 font-mono">
            Cuota {compra.cuotaActual} de {compra.totalCuotas}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progreso de amortización</span>
            <span className="font-medium text-foreground">
              {compra.porcentajeProgreso}% ({compra.cuotasRestantes} restantes)
            </span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${compra.porcentajeProgreso}%` }}
            />
          </div>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Cuota mensual</span>
            <span className="font-semibold text-foreground font-mono text-xs sm:text-sm block mt-0.5 tabular-nums">
              {formatMoney(compra.montoCuota, moneda)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Total financiado</span>
            <span className="font-semibold text-foreground font-mono text-xs sm:text-sm block mt-0.5 tabular-nums">
              {formatMoney(compra.montoTotal, moneda)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Plazo</span>
            <span className="font-medium text-foreground text-xs block mt-0.5">
              {compra.primerPeriodo} → {compra.ultimoPeriodo}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Registros en BD</span>
            <span className="font-medium text-xs block mt-0.5 text-foreground">
              {compra.totalRegistrosEnDB} cuotas
            </span>
          </div>
        </div>

        {/* Desglose de cuotas */}
        {estaDesplegado && (
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Detalle de cuotas generadas:
            </span>
            <div className="max-h-44 overflow-y-auto divide-y divide-border/50 rounded-lg bg-muted/20 border border-border/60 p-2 text-xs">
              {compra.cuotas.map((cu: any, idx: number) => (
                <div key={cu.id || idx} className="py-1 px-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {cu.periodoPago} — Cuota {cu.cuotaActual}/{cu.totalCuotas}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {formatMoney(cu.monto, moneda)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        cu.estado === 'PAGADO'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50'
                          : cu.estado === 'ADELANTADO'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50'
                      }`}
                    >
                      {cu.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleDesplegar(compra.padreId)}
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 py-1 px-1.5 rounded transition"
        >
          {estaDesplegado ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Ocultar</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Ver cuotas ({compra.totalRegistrosEnDB})</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onEliminarCompraCompleta(compra)}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1.5 px-2.5 rounded-md transition flex items-center gap-1 disabled:opacity-50"
          title="Eliminar compra completa y sus cuotas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isDeleting ? 'Eliminando...' : 'Eliminar compra'}</span>
        </button>
      </div>
    </div>
  );
}
