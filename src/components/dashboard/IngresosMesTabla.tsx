'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { IngresoCardMobile, type IngresoItem } from './IngresoCardMobile';
import { IngresoFilaDesktop } from './IngresoFilaDesktop';

interface IngresosMesTablaProps {
  ingresos: IngresoItem[];
  totalIngresos: number;
  moneda: string;
  openRecordModal: (tipo: 'INGRESO') => void;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
  onEditarSueldo?: (montoActual: number) => void;
  onEditarIngreso?: (ingreso: IngresoItem) => void;
}

export function IngresosMesTabla({
  ingresos,
  totalIngresos,
  moneda,
  openRecordModal,
  onToggleRecibido,
  onEliminarIngreso,
  onEditarSueldo,
  onEditarIngreso,
}: IngresosMesTablaProps) {
  const esMultiple = ingresos.length > 1;

  const totalGastosAsignados = ingresos.reduce((s, i) => s + (i.totalGastosAsignados || 0), 0);
  const totalRestoLibre = ingresos.reduce(
    (s, i) => s + (i.disponible != null ? i.disponible : (i.monto - (i.totalGastosAsignados || 0))),
    0
  );

  return (
    <div className="space-y-3">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Ingresos del Mes
          </h2>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-mono">
            {ingresos.length} {ingresos.length === 1 ? 'fuente' : 'fuentes'}
          </span>
          {esMultiple && (
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Asignación activa
            </span>
          )}
        </div>

        {esMultiple && (
          <div className="self-start sm:self-auto">
            <Link
              href="/presupuesto-operativo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-2xs transition active:scale-95"
            >
              <span>Planificar para vivir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Contenedor de la tabla */}
      <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
        {ingresos.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No tienes ingresos registrados para este periodo.
          </div>
        ) : (
          <>
            {/* Vista Móvil: Tarjetas táctiles */}
            <div className="md:hidden divide-y divide-border/40">
              {ingresos.map((ing) => (
                <IngresoCardMobile
                  key={`m-${ing.id}`}
                  ingreso={ing}
                  moneda={moneda}
                  onToggleRecibido={onToggleRecibido}
                  onEliminarIngreso={onEliminarIngreso}
                  onEditarSueldo={onEditarSueldo}
                  onEditarIngreso={onEditarIngreso}
                />
              ))}
            </div>

            {/* Vista Desktop: Tabla ejecutiva completa */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/30 dark:bg-muted/15 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-muted-foreground">Concepto</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-muted-foreground">Tipo / Origen</th>
                    <th scope="col" className="py-2.5 px-3 text-center font-semibold text-muted-foreground">Fecha</th>
                    <th scope="col" className="py-2.5 px-3 text-center font-semibold text-muted-foreground">Estado</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-semibold text-muted-foreground">
                      Monto
                    </th>
                    {esMultiple && (
                      <th scope="col" className="py-2.5 px-3 font-semibold text-muted-foreground min-w-[190px]">
                        Asignación & Liquidez
                      </th>
                    )}
                    <th scope="col" className="py-2.5 px-3 text-right font-semibold text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ingresos.map((ing) => (
                    <IngresoFilaDesktop
                      key={ing.id}
                      ing={ing}
                      moneda={moneda}
                      mostrarDesgloseAsignado={esMultiple}
                      onToggleRecibido={onToggleRecibido}
                      onEliminarIngreso={onEliminarIngreso}
                      onEditarSueldo={onEditarSueldo}
                      onEditarIngreso={onEditarIngreso}
                    />
                  ))}
                </tbody>
                {esMultiple && (
                  <tfoot className="bg-muted/20 dark:bg-muted/10 border-t border-border/60 text-xs font-semibold">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-muted-foreground text-xs font-medium">
                        Total Consolidado ({ingresos.length} fuentes)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                        {formatMoney(totalIngresos, moneda)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground tabular-nums">
                        {formatMoney(totalGastosAsignados, moneda)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatMoney(totalRestoLibre, moneda)}
                      </td>
                      <td className="py-2.5 px-3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
      )}
    </div>
    </div >
  );
}
