'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { TotalesProyeccion } from '@/app/api/finanzas/anual/route';

interface ProyeccionTotalesFooterProps {
  anio: number;
  totalesActual?: TotalesProyeccion;
  totalesProyectado: TotalesProyeccion;
  mesActualNombre?: string;
  moneda: string;
}

export function ProyeccionTotalesFooter({
  anio,
  totalesActual,
  totalesProyectado,
  mesActualNombre = 'Noviembre',
  moneda,
}: ProyeccionTotalesFooterProps) {
  const tieneHistoricoYFuturo =
    totalesActual &&
    totalesActual.cantidadMeses > 0 &&
    totalesActual.cantidadMeses < totalesProyectado.cantidadMeses;

  return (
    <tfoot className="bg-muted/40 border-t-2 border-border/80 font-medium text-xs">
      {/* Fila 1: Lo Actual / Ejecutado a la fecha (solo si hay meses ejecutados y además proyección futura) */}
      {tieneHistoricoYFuturo && (
        <tr className="border-b border-border/40 text-muted-foreground bg-muted/20">
          <td className="py-2.5 px-3.5 font-semibold text-xs tracking-wide">
            <span className="flex items-center gap-1.5">
              <span>Ejecutado a la fecha</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted border border-border/60 font-normal">
                a {mesActualNombre}
              </span>
            </span>
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-xs whitespace-nowrap">
            {formatMoney(totalesActual.totalIngresos, moneda)}
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-sky-600 dark:text-sky-400 text-xs whitespace-nowrap">
            {formatMoney(totalesActual.totalFijos, moneda)}
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-purple-600 dark:text-purple-400 text-xs whitespace-nowrap">
            {formatMoney(totalesActual.totalPrestamos, moneda)}
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-teal-600 dark:text-teal-400 text-xs whitespace-nowrap">
            {formatMoney(totalesActual.totalGastos, moneda)}
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-muted-foreground text-xs whitespace-nowrap">
            {formatMoney(totalesActual.totalEgresos, moneda)}
          </td>
          <td className="py-2.5 px-3.5 text-right font-mono font-medium text-xs whitespace-nowrap">
            <span className={totalesActual.totalDisponible >= 0 ? 'text-foreground font-semibold' : 'text-rose-600'}>
              {formatMoney(totalesActual.totalDisponible, moneda)}
            </span>
          </td>
          <td className="py-2.5 px-3.5 text-center whitespace-nowrap text-xs font-medium">
            {totalesActual.tasaAhorroPromedio.toFixed(0)}%
          </td>
          <td className="py-2.5 px-3.5" />
        </tr>
      )}

      {/* Fila 2: Proyección Esperada del Año Completo (sumando real + compromisos esperados) */}
      <tr className="font-semibold text-foreground bg-muted/30">
        <td className="py-3 px-3.5 font-bold text-xs uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span>Proyección Esperada {anio}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-normal bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">
              Total Año
            </span>
          </div>
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm whitespace-nowrap">
          {formatMoney(totalesProyectado.totalIngresos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">
          {formatMoney(totalesProyectado.totalFijos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
          {formatMoney(totalesProyectado.totalPrestamos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm whitespace-nowrap">
          {formatMoney(totalesProyectado.totalGastos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-muted-foreground text-sm whitespace-nowrap">
          {formatMoney(totalesProyectado.totalEgresos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-sm whitespace-nowrap">
          <span className={totalesProyectado.totalDisponible >= 0 ? 'text-foreground' : 'text-rose-600'}>
            {formatMoney(totalesProyectado.totalDisponible, moneda)}
          </span>
        </td>
        <td className="py-3 px-3.5 text-center text-foreground font-bold whitespace-nowrap text-xs">
          {totalesProyectado.tasaAhorroPromedio.toFixed(0)}%
        </td>
        <td className="py-3 px-3.5" />
      </tr>
    </tfoot>
  );
}
