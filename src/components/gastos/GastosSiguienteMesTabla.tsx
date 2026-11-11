'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

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
  const tieneGastos = tarjetas.some(
    (t) => t.gastosSiguientePeriodo && t.gastosSiguientePeriodo.length > 0
  );

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Consumos a pagar el próximo mes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compras posteriores al día 10 que se debitarán en la facturación siguiente.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {tarjetas.map((t) => (
            <div
              key={t.id}
              className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 flex items-center gap-2 text-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-muted-foreground font-medium">{t.nombre}:</span>
              <span className="font-mono font-bold text-foreground">
                {formatMoney(t.totalSiguientePeriodo, moneda)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border/60 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-3.5 font-semibold">Tarjeta</th>
                <th scope="col" className="py-3 px-3.5 font-semibold">Concepto</th>
                <th scope="col" className="py-3 px-3.5 font-semibold">Categoría</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold">Fecha</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold">Cuota</th>
                <th scope="col" className="py-3 px-3.5 text-right font-semibold">Monto</th>
                <th scope="col" className="py-3 px-3.5 text-center font-semibold">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tieneGastos ? (
                tarjetas.flatMap((t) =>
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
                        {g.concepto}
                      </td>
                      <td className="py-3 px-3.5 text-muted-foreground text-xs">
                        {g.categoria || 'Sin categoría'}
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
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatMoney(g.monto, moneda)}
                      </td>
                      <td
                        className="py-3 px-3.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onClickTrash(g)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Eliminar gasto"
                          aria-label={`Eliminar ${g.concepto}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No hay compras facturadas para el mes siguiente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
