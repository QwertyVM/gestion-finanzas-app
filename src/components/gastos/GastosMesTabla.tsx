'use client';

import React from 'react';
import { formatMoney, formatPeriodoLabel, esItemRecurrente, getEstiloClasificacion } from '@/lib/utils';
import { CheckSquare, Square, FastForward, CheckCircle2, Trash2 } from 'lucide-react';

interface GastosMesTablaProps {
  gastos: any[];
  selectedGastoIds: string[];
  moneda: string;
  periodo: string;
  busqueda: string;
  onSelectRow: (gasto: any) => void;
  onToggleSelectGasto: (id: string, monto: number) => void;
  onCambiarEstadoItem: (id: string, nuevoEstado: string) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastosMesTabla({
  gastos,
  selectedGastoIds,
  moneda,
  periodo,
  busqueda,
  onSelectRow,
  onToggleSelectGasto,
  onCambiarEstadoItem,
  onClickTrash,
}: GastosMesTablaProps) {
  if (gastos.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-xl p-10 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {busqueda.trim()
            ? `No se encontraron gastos que coincidan con "${busqueda}".`
            : `No hay gastos registrados para ${formatPeriodoLabel(periodo)}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-3 w-10 text-center">
                <span className="sr-only">Seleccionar</span>
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold">Concepto</th>
              <th scope="col" className="py-3 px-3.5 font-semibold">Método</th>
              <th scope="col" className="py-3 px-3.5 font-semibold">Fecha</th>
              <th scope="col" className="py-3 px-3.5 font-semibold">Cuota</th>
              <th scope="col" className="py-3 px-3.5 text-right font-semibold">Monto</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold">Estado</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {gastos.map((gasto) => {
              const isSelected = selectedGastoIds.includes(gasto.id);
              const fechaObj = new Date(gasto.fechaGasto);
              const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
              });
              const esCuota = gasto.totalCuotas > 1;
              const esRecur = esItemRecurrente(gasto.concepto, gasto.categoria);
              const clasif = gasto.clasificacion || (esRecur ? 'FIJO' : esCuota ? 'CUOTA' : 'VARIABLE');
              const estilo = getEstiloClasificacion(clasif);

              return (
                <tr
                  key={gasto.id}
                  onClick={() => onSelectRow(gasto)}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer border-l-4 ${estilo.borderColor} ${
                    isSelected ? 'bg-muted/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleSelectGasto(gasto.id, gasto.monto)}
                      className="text-muted-foreground hover:text-foreground transition p-0.5 inline-flex"
                      aria-label={isSelected ? `Deseleccionar ${gasto.concepto}` : `Seleccionar ${gasto.concepto}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-foreground" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-foreground text-sm flex items-center gap-2 flex-wrap">
                      <span>{gasto.concepto}</span>
                      {esRecur ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Fijo
                        </span>
                      ) : esCuota ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Cuota
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          Variable
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: gasto.categoriaColor || '#64748b' }}
                      />
                      <span>{gasto.categoria || 'Sin categoría'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-sm">
                    {gasto.metodoPago === 'TARJETA_CREDITO' ? (
                      <span className="font-medium text-foreground">
                        {gasto.tarjetaNombre || 'Tarjeta'}
                      </span>
                    ) : gasto.metodoPago === 'EFECTIVO_DEBITO' ? (
                      <span className="text-muted-foreground">Efectivo / Débito</span>
                    ) : (
                      <span className="text-muted-foreground">Transferencia</span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-muted-foreground whitespace-nowrap text-xs">
                    {fechaFormateada}
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap text-muted-foreground text-xs">
                    {gasto.totalCuotas > 1 ? `Cuota ${gasto.cuotaActual}/${gasto.totalCuotas}` : '1 cuota'}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm whitespace-nowrap">
                    {formatMoney(gasto.monto, moneda)}
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gasto.estado === 'ADELANTADO'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60'
                          : gasto.estado === 'PAGADO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          gasto.estado === 'ADELANTADO'
                            ? 'bg-indigo-500'
                            : gasto.estado === 'PAGADO'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      {gasto.estado === 'ADELANTADO'
                        ? 'Adelantado'
                        : gasto.estado === 'PAGADO'
                          ? 'Pagado'
                          : 'Pendiente'}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onCambiarEstadoItem(
                            gasto.id,
                            gasto.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Alternar Adelantado"
                        aria-label={`Alternar estado adelantado para ${gasto.concepto}`}
                      >
                        <FastForward className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCambiarEstadoItem(
                            gasto.id,
                            gasto.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Alternar Pagado"
                        aria-label={`Alternar estado pagado para ${gasto.concepto}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onClickTrash(gasto)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                        title="Eliminar gasto"
                        aria-label={`Eliminar gasto ${gasto.concepto}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
