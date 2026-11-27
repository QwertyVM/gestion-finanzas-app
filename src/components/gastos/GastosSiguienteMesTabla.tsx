'use client';

import React, { useState } from 'react';
import { formatMoney, limpiarConceptoCuota } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { GastoSiguienteCardMobile } from './GastoSiguienteCardMobile';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface GastosSiguienteMesTablaProps {
  tarjetas: any[];
  moneda: string;
  onSelectRow: (gasto: any, tarjeta: any) => void;
  onClickTrash: (gasto: any) => void;
}

export function GastosSiguienteMesTabla({
  tarjetas,
  moneda,
  onSelectRow,
  onClickTrash,
}: GastosSiguienteMesTablaProps) {
  const [colapsado, setColapsado] = useState(false);
  const [confirmandoGastoId, setConfirmandoGastoId] = useState<string | null>(null);
  const tieneGastos = tarjetas.some(
    (t) => t.gastosSiguientePeriodo && t.gastosSiguientePeriodo.length > 0
  );

  const totalSiguienteAcumulado = tarjetas.reduce(
    (acc, t) => acc + (t.totalSiguientePeriodo || 0),
    0
  );

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Consumos a pagar el próximo mes
              </h2>
              <span className="font-mono text-xs font-bold text-foreground">
                ({formatMoney(totalSiguienteAcumulado, moneda)})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compras posteriores al día de corte que se debitarán en la facturación siguiente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setColapsado(!colapsado)}
            className="sm:hidden p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground transition"
            aria-label={colapsado ? 'Expandir' : 'Colapsar'}
          >
            {colapsado ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          <div className="flex items-center gap-2">
            {tarjetas.map((t) => (
              <div
                key={t.id}
                className="px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50 flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-muted-foreground font-medium">{t.nombre}:</span>
                <span className="font-mono font-bold text-foreground">
                  {formatMoney(t.totalSiguientePeriodo, moneda)}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setColapsado(!colapsado)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60 transition cursor-pointer shrink-0"
          >
            {colapsado ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expandir</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!colapsado && (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs animate-in fade-in duration-150">
        {tieneGastos ? (
          <>
            {/* Vista Móvil: Tarjetas táctiles */}
            <div className="md:hidden divide-y divide-border/40">
              {tarjetas.flatMap((t) =>
                (t.gastosSiguientePeriodo || []).map((g: any) => (
                  <GastoSiguienteCardMobile
                    key={`m-sig-${g.id}`}
                    gasto={g}
                    tarjeta={t}
                    moneda={moneda}
                    onSelectRow={onSelectRow}
                    onClickTrash={onClickTrash}
                  />
                ))
              )}
            </div>

            {/* Vista Desktop: Tabla completa */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border/60 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-3 px-3.5 font-semibold">Tarjeta</th>
                    <th scope="col" className="py-3 px-3.5 font-semibold">Concepto</th>
                    <th scope="col" className="py-3 px-3.5 font-semibold">Categoría</th>
                    <th scope="col" className="py-3 px-3.5 text-center font-semibold">Fecha</th>
                    <th scope="col" className="py-3 px-3.5 text-center font-semibold">Cuota</th>
                    <th scope="col" className="py-3 px-3.5 text-right font-semibold">Soles (S/)</th>
                    <th scope="col" className="py-3 px-3.5 text-right font-semibold">Dólares ($)</th>
                    <th scope="col" className="py-3 px-3.5 text-center font-semibold">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {tarjetas.flatMap((t) =>
                    (t.gastosSiguientePeriodo || []).map((g: any) => (
                      <tr
                        key={g.id}
                        onClick={() => onSelectRow(g, t)}
                        className="hover:bg-muted/30 transition cursor-pointer"
                      >
                        <td className="py-3 px-3.5 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                            <span>{t.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-foreground">
                          {limpiarConceptoCuota(g.concepto)}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <CategoriaTagBadge
                            categoria={g.categoria}
                            tag={g.tag}
                            categoriaColor={g.categoriaColor}
                          />
                        </td>
                        <td className="py-3 px-3.5 text-center text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(g.fechaGasto).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap text-muted-foreground text-xs">
                          {g.totalCuotas > 1 ? `Cuota ${g.cuotaActual}/${g.totalCuotas}` : '1 cuota'}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap text-xs sm:text-sm">
                          {g.monedaOriginal === 'USD' ? (
                            <span className="text-muted-foreground/60 font-normal text-xs" title={`Equivalente al TC ${g.tipoCambio || 4.0}`}>
                              ≈ {formatMoney(g.monto, moneda)}
                            </span>
                          ) : (
                            <span className="font-semibold text-foreground">
                              {formatMoney(g.monto, moneda)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap text-xs sm:text-sm">
                          {g.monedaOriginal === 'USD' ? (
                            <span className="font-semibold text-foreground">
                              ${(g.montoOriginal != null ? g.montoOriginal : (g.monto / (g.tipoCambio || 4.0))).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 font-normal">—</span>
                          )}
                        </td>
                        <td
                          className="py-3 px-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {confirmandoGastoId === g.id ? (
                            <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-lg px-2 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                              <span className="font-semibold text-rose-700 dark:text-rose-300 text-[11px]">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmandoGastoId(null);
                                  onClickTrash(g);
                                }}
                                className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmandoGastoId(null)}
                                className="p-0.5 text-muted-foreground hover:text-foreground rounded transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmandoGastoId(g.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Eliminar gasto"
                              aria-label={`Eliminar ${g.concepto}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No hay compras facturadas para el mes siguiente.
          </div>
        )}
      </div>
      )}
    </div>
  );
}
