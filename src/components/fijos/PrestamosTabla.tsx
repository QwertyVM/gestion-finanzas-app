'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Pencil, Trash2 } from 'lucide-react';

interface PrestamosTablaProps {
  prestamos: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (cuotaId: string, nuevoEstado: string) => void;
  onEditarBase: (prestamo: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function PrestamosTabla({
  prestamos,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
  onEditarBase,
  onEliminar,
}: PrestamosTablaProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
            <tr>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Concepto</th>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Progreso</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">TEA %</th>
              <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Cuota Mensual</th>
              <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Total</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Estado</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {prestamos.map((p) => {
              const progreso = Math.round((p.cuotaActual / p.cuotasTotales) * 100);
              const isLoading = loadingAction === `cuota-${p.cuotaId}` || loadingAction === `del-prestamo-${p.id}`;

              return (
                <tr
                  key={p.id}
                  onClick={() =>
                    onSelect({
                      id: `prestamo-${p.cuotaId}`,
                      dbId: p.cuotaId,
                      prestamoId: p.id,
                      tipo: 'PRESTAMO',
                      clasificacion: 'PRESTAMO_CUOTA',
                      concepto: `${p.banco} - ${p.concepto}`,
                      banco: p.banco,
                      nombrePrestamo: p.concepto,
                      categoria: 'Préstamo Bancario',
                      monto: p.montoCuota,
                      montoTotal: p.montoTotal,
                      tasaInteresAnual: p.tasaInteresAnual,
                      cuotaActual: p.cuotaActual,
                      cuotasTotales: p.cuotasTotales,
                      diaVencimiento: p.diaPago,
                      estado: p.estado,
                      fechaPagoReal: p.fechaPagoReal,
                      monedaOriginal: p.monedaOriginal,
                      montoOriginal: p.montoOriginal,
                      tipoCambio: p.tipoCambio,
                    })
                  }
                  className="hover:bg-muted/30 transition cursor-pointer border-l-[3px] border-l-purple-500"
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold border bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {p.banco}
                      </span>
                      <span className="font-semibold text-foreground text-sm">{p.concepto}</span>
                    </div>
                    {(p.monedaOriginal === 'USD' || p.concepto.includes('$')) && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-normal">
                        ${p.montoOriginal ? p.montoOriginal.toFixed(2) : (p.concepto.match(/\$([0-9.]+)/)?.[1] || '')} USD
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="w-32 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {p.aplicaEsteMes === false
                            ? 'Fuera de rango'
                            : `Cta ${p.cuotaActual}/${p.cuotasTotales}`}
                        </span>
                        <span className="font-medium text-foreground">{progreso}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-center text-muted-foreground whitespace-nowrap text-xs font-medium">
                    {p.tasaInteresAnual}%
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(p.montoCuota, moneda)}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                    {p.montoTotal ? formatMoney(p.montoTotal, moneda) : '—'}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {p.aplicaEsteMes === false ? (
                      <span className="text-xs text-muted-foreground">
                        Fuera de periodo
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          p.estado === 'ADELANTADO'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : p.estado === 'PAGADO'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.estado === 'ADELANTADO'
                              ? 'bg-indigo-500'
                              : p.estado === 'PAGADO'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                          }`}
                        />
                        {p.estado === 'ADELANTADO' ? 'Adelantado' : p.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {p.aplicaEsteMes !== false && (
                        <>
                          <button
                            onClick={() =>
                              onToggleEstado(
                                p.cuotaId,
                                p.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
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
                                p.cuotaId,
                                p.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                              )
                            }
                            disabled={isLoading}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                              p.estado === 'PAGADO'
                                ? 'text-muted-foreground hover:bg-muted'
                                : 'bg-foreground text-background hover:opacity-90'
                            }`}
                            title="Marcar Pagado"
                          >
                            {p.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onEditarBase(p)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition ml-1"
                        title="Editar condiciones base"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEliminar(p.id, `${p.banco} - ${p.concepto}`)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Eliminar préstamo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
