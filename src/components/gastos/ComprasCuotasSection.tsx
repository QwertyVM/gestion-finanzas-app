'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Layers, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

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
      {/* Banner explicativo */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm sm:text-base text-foreground">
              Sección de Compras en Cuotas (Tarjetas de Crédito)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl pl-9">
            Aquí ves cada compra financiada consolidada en una sola ficha con su progreso global. Puedes{' '}
            <strong className="text-foreground">
              eliminar la compra completa y todas sus cuotas de todos los meses de un solo golpe
            </strong>
            , sin tener que ir borrando cuota por cuota mes tras mes.
          </p>
        </div>
      </div>

      {loadingCuotas ? (
        <TableSkeleton rows={4} />
      ) : comprasCuotas.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-2">
          <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No tienes compras en cuotas registradas</p>
          <p className="text-xs text-muted-foreground">
            Cuando registres una compra con tarjeta en 2 o más cuotas, aparecerá consolidada aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comprasCuotas.map((compra) => {
            const tieneDuplicados = compra.totalRegistrosEnDB > compra.totalCuotas;
            const estaDesplegado = compraDesplegada === compra.padreId;
            const isDeleting = deletingCompraId === compra.padreId;

            return (
              <div
                key={compra.padreId || compra.conceptoBase}
                className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-border transition"
              >
                <div className="space-y-3">
                  {/* Cabecera de la compra */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md border text-white shadow-2xs"
                          style={{ backgroundColor: compra.tarjetaColor || '#4f46e5' }}
                        >
                          {compra.tarjetaNombre}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {compra.categoriaNombre}
                        </span>
                        {tieneDuplicados && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{compra.totalRegistrosEnDB} registros (duplicados detectados)</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {compra.conceptoBase}
                      </h3>
                    </div>

                    <span className="font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 text-xs shrink-0">
                      Cuota {compra.cuotaActual} de {compra.totalCuotas}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso de pago</span>
                      <span className="font-semibold text-foreground">
                        {compra.porcentajeProgreso}% ({compra.cuotasRestantes} restantes)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${compra.porcentajeProgreso}%` }}
                      />
                    </div>
                  </div>

                  {/* Grid de Métricas */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Cuota mensual</span>
                      <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                        {formatMoney(compra.montoCuota, moneda)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Total financiado</span>
                      <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                        {formatMoney(compra.montoTotal, moneda)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Plazo</span>
                      <span className="font-semibold text-foreground text-xs block mt-0.5">
                        {compra.primerPeriodo} → {compra.ultimoPeriodo}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Registros en BD</span>
                      <span
                        className={`font-semibold text-xs block mt-0.5 ${
                          tieneDuplicados ? 'text-amber-400 font-bold' : 'text-foreground'
                        }`}
                      >
                        {compra.totalRegistrosEnDB} cuotas {tieneDuplicados ? '(clonadas)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Acordeón de desglose de cuotas */}
                  {estaDesplegado && (
                    <div className="pt-2 border-t border-border space-y-2">
                      <span className="text-xs font-semibold text-foreground block">
                        Detalle de todas las cuotas generadas:
                      </span>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border/60 rounded-xl bg-background/50 border border-border p-2 text-xs">
                        {compra.cuotas.map((cu: any, idx: number) => (
                          <div key={cu.id || idx} className="py-1 px-1.5 flex items-center justify-between">
                            <span className="font-medium text-foreground">
                              {cu.periodoPago} — Cuota {cu.cuotaActual}/{cu.totalCuotas}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-muted-foreground">
                                {formatMoney(cu.monto, moneda)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  cu.estado === 'PAGADO'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : cu.estado === 'ADELANTADO'
                                      ? 'bg-indigo-500/20 text-indigo-400'
                                      : 'bg-amber-500/20 text-amber-400'
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
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleDesplegar(compra.padreId)}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-secondary transition"
                  >
                    {estaDesplegado ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Ocultar cuotas</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Ver todas las cuotas ({compra.totalRegistrosEnDB})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onEliminarCompraCompleta(compra)}
                    className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 py-2 px-3.5 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                    title="Eliminar toda la compra y todas sus cuotas de todos los meses de un solo golpe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Eliminando...' : 'Eliminar compra completa'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
