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
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
              {ingresos.length} {ingresos.length === 1 ? 'fuente' : 'fuentes'} · {formatMoney(totalIngresos, moneda)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sueldo, gratificaciones y entradas adicionales programadas.
          </p>
        </div>

        <button
          onClick={() => openRecordModal('INGRESO')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Ingreso</span>
        </button>
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
              <tr>
                <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Concepto</th>
                <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Tipo / Origen</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Fecha Esperada</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Estado</th>
                <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Monto</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ingresos.map((ing) => {
                const fechaObj = new Date(ing.fechaEsperada);
                const fechaLabel = !isNaN(fechaObj.getTime())
                  ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
                  : 'Fin de mes';

                return (
                  <tr key={ing.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-foreground text-sm">{ing.concepto}</div>
                      {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
                        <div className="text-xs text-muted-foreground font-normal">
                          ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ing.tipo === 'SUELDO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : ing.tipo === 'GRATIFICACION'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : ing.tipo === 'UTILIDADES'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-muted text-muted-foreground'
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

                    <td className="py-3 px-3.5 text-center text-muted-foreground whitespace-nowrap text-xs font-medium">
                      {fechaLabel}
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleRecibido(ing)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer hover:opacity-80 ${
                          ing.recibido
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                        title="Hacer clic para alternar estado"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{ing.recibido ? 'Recibido' : 'Por recibir'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap text-sm sm:text-base">
                      {formatMoney(ing.monto, moneda)}
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleRecibido(ing)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                          title={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              ing.recibido ? 'text-emerald-500' : 'text-muted-foreground'
                            }`}
                          />
                        </button>

                        {ing.tipo === 'EXTRA' && (
                          <button
                            type="button"
                            onClick={() => onEliminarIngreso(ing.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-500/10 transition"
                            title="Eliminar ingreso extra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/20 border-t border-border/60 text-xs font-medium">
              <tr>
                <td colSpan={4} className="py-3 px-3.5 text-muted-foreground text-xs">
                  Total Ingresos del Mes
                </td>
                <td className="py-3 px-3.5 text-right font-mono font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                  {formatMoney(totalIngresos, moneda)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
