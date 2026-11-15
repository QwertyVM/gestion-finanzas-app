'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';

interface IngresoItem {
  id: string;
  concepto: string;
  monto: number;
  tipo: string;
  fechaEsperada: string;
  recibido: boolean;
  monedaOriginal?: string | null;
  montoOriginal?: number | null;
  tipoCambio?: number | null;
}

interface IngresosMesTablaProps {
  ingresos: IngresoItem[];
  totalIngresos: number;
  moneda: string;
  openRecordModal: (tipo: 'INGRESO') => void;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
}

export function IngresosMesTabla({
  ingresos,
  totalIngresos,
  moneda,
  openRecordModal,
  onToggleRecibido,
  onEliminarIngreso,
}: IngresosMesTablaProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Ingresos del Mes
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              {ingresos.length} {ingresos.length === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sueldo, gratificaciones y entradas adicionales programadas.
          </p>
        </div>

        <button
          onClick={() => openRecordModal('INGRESO')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Ingreso</span>
        </button>
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
                <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Tipo / Origen</th>
                <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Fecha</th>
                <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
                <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Monto</th>
                <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ingresos.map((ing) => {
                const fechaObj = new Date(ing.fechaEsperada);
                const fechaLabel = !isNaN(fechaObj.getTime())
                  ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
                  : 'Fin de mes';

                return (
                  <tr key={ing.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground text-xs sm:text-sm">{ing.concepto}</div>
                      {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          ing.tipo === 'SUELDO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : ing.tipo === 'GRATIFICACION'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
                              : ing.tipo === 'UTILIDADES'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-muted text-muted-foreground border-border/60'
                        }`}
                      >
                        {ing.tipo === 'SUELDO'
                          ? 'Sueldo Planilla'
                          : ing.tipo === 'GRATIFICACION'
                            ? 'Gratificación'
                            : ing.tipo === 'UTILIDADES'
                              ? 'Utilidades'
                              : 'Ingreso Extra'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap text-xs font-mono">
                      {fechaLabel}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleRecibido(ing)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer hover:opacity-85 border ${
                          ing.recibido
                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                        title="Click para alternar estado"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{ing.recibido ? 'Recibido' : 'Por recibir'}</span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap text-xs sm:text-sm tabular-nums">
                      {formatMoney(ing.monto, moneda)}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleRecibido(ing)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              ing.recibido ? 'text-emerald-500' : 'text-muted-foreground'
                            }`}
                          />
                        </button>

                        {ing.tipo === 'EXTRA' && (
                          <button
                            type="button"
                            onClick={() => onEliminarIngreso(ing.id)}
                            className="text-muted-foreground hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Eliminar ingreso extra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/20 border-t border-border/60 text-xs">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-muted-foreground text-xs">
                  Total Ingresos del Mes ({ingresos.length} items)
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-xs sm:text-sm text-foreground tabular-nums whitespace-nowrap">
                  {formatMoney(totalIngresos, moneda)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
