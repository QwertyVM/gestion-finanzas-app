'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

interface ProyeccionTotalesFooterProps {
  anio: number;
  totalIngresos: number;
  totalFijos: number;
  totalPrestamos: number;
  totalGastos: number;
  totalEgresos: number;
  totalDisponible: number;
  tasaAhorroPromedio: number;
  moneda: string;
}

export function ProyeccionTotalesFooter({
  anio,
  totalIngresos,
  totalFijos,
  totalPrestamos,
  totalGastos,
  totalEgresos,
  totalDisponible,
  tasaAhorroPromedio,
  moneda,
}: ProyeccionTotalesFooterProps) {
  return (
    <tfoot className="bg-muted/40 border-t border-border/80 font-medium text-xs">
      <tr>
        <td className="py-3 px-3.5 text-foreground font-bold text-xs uppercase tracking-wider">
          Total {anio}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
          {formatMoney(totalIngresos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">
          {formatMoney(totalFijos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
          {formatMoney(totalPrestamos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm whitespace-nowrap">
          {formatMoney(totalGastos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-muted-foreground text-sm whitespace-nowrap">
          {formatMoney(totalEgresos, moneda)}
        </td>
        <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
          {formatMoney(totalDisponible, moneda)}
        </td>
        <td className="py-3 px-3.5 text-center text-foreground font-bold whitespace-nowrap text-xs">
          {tasaAhorroPromedio.toFixed(0)}%
        </td>
        <td className="py-3 px-3.5" />
      </tr>
    </tfoot>
  );
}
