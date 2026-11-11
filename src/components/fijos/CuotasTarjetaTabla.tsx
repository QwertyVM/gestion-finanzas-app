'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';

interface CuotasTarjetaTablaProps {
  cuotasTarjeta: any[];
  totalCuotasTarjeta: number;
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (gastoId: string, nuevoEstado: string) => void;
}

export function CuotasTarjetaTabla({
  cuotasTarjeta,
  totalCuotasTarjeta,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
}: CuotasTarjetaTablaProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
            <tr>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Concepto</th>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Tarjeta</th>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Progreso</th>
              <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Cuota Mensual</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Estado</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {cuotasTarjeta.map((c) => {
              const progreso = Math.round(((c.cuotaActual || 1) / (c.totalCuotas || 1)) * 100);
              const isLoading = loadingAction === `gasto-${c.id}`;

              return (
                <tr
                  key={c.id}
                  onClick={() =>
                    onSelect({
                      id: c.id,
                      dbId: c.id,
                      tipo: 'TARJETA',
                      clasificacion: 'CUOTA',
                      concepto: c.concepto,
                      categoria: c.categoria || 'Tarjeta',
                      monto: c.monto,
                      cuotaActual: c.cuotaActual,
                      totalCuotas: c.totalCuotas,
                      diaVencimiento: c.tarjetaDiaPago,
                      estado: c.estado,
                      fechaPagoReal: c.fechaPagoReal,
                      monedaOriginal: c.monedaOriginal,
                      montoOriginal: c.montoOriginal,
                      tipoCambio: c.tipoCambio,
                      tarjetaNombre: c.tarjetaNombre,
                      tarjetaColor: c.tarjetaColor,
                      tarjetaBanco: c.tarjetaBanco,
                    })
                  }
                  className="hover:bg-muted/30 transition cursor-pointer border-l-[3px] border-l-indigo-500"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-foreground text-sm">{c.concepto}</div>
                    {c.monedaOriginal === 'USD' && c.montoOriginal && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-normal">
                        ${c.montoOriginal.toFixed(2)} USD
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-semibold">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.tarjetaColor || '#6366f1' }}
                      />
                      {c.tarjetaNombre}
                    </span>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="w-32 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Cuota {c.cuotaActual}/{c.totalCuotas}</span>
                        <span className="font-medium text-foreground">{progreso}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(c.monto, moneda)}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        c.estado === 'ADELANTADO'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : c.estado === 'PAGADO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          c.estado === 'ADELANTADO'
                            ? 'bg-indigo-500'
                            : c.estado === 'PAGADO'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      {c.estado === 'ADELANTADO' ? 'Adelantado' : c.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          onToggleEstado(
                            c.id,
                            c.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition font-medium"
                        title="Marcar Adelantado"
                      >
                        Adelantar
                      </button>
                      <button
                        onClick={() =>
                          onToggleEstado(
                            c.id,
                            c.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                          )
                        }
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                          c.estado === 'PAGADO'
                            ? 'text-muted-foreground hover:bg-muted'
                            : 'bg-foreground text-background hover:opacity-90'
                        }`}
                        title="Marcar Pagado"
                      >
                        {c.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/20 border-t border-border/60 text-xs font-medium">
            <tr>
              <td colSpan={3} className="py-2.5 px-3.5 text-muted-foreground text-xs">
                Subtotal Compras en Tarjeta en Cuotas ({cuotasTarjeta.length} items)
              </td>
              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                {formatMoney(totalCuotasTarjeta, moneda)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
