'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export interface MesProyeccion {
  periodo: string;
  mesNombre: string;
  anio: number;
  mesNumero: number;
  ingresos: number;
  fijos: number;
  prestamos: number;
  gastos: number;
  totalEgresos: number;
  disponible: number;
  esGrati: boolean;
  esUtilidad: boolean;
}

interface ProyeccionMesFilaProps {
  mes: MesProyeccion;
  periodoActual: string;
  moneda: string;
  onSelectMes: (periodo: string) => void;
}

export function ProyeccionMesFila({
  mes: m,
  periodoActual,
  moneda,
  onSelectMes,
}: ProyeccionMesFilaProps) {
  const positivo = m.disponible >= 0;
  const margen = m.ingresos > 0 ? (m.disponible / m.ingresos) * 100 : 0;
  const sinActividad = m.ingresos === 0 && m.totalEgresos === 0;
  const esMesActual = m.periodo === periodoActual;

  return (
    <tr
      onClick={() => onSelectMes(m.periodo)}
      className={`hover:bg-muted/30 transition cursor-pointer ${
        esMesActual ? 'bg-muted/40 font-medium' : ''
      }`}
    >
      <td className="py-3 px-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-sm">{m.mesNombre}</span>
          <span className="text-xs text-muted-foreground">{m.anio}</span>
          {esMesActual && (
            <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-foreground text-background">
              Actual
            </span>
          )}
          {m.esGrati && (
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Gratificación
            </span>
          )}
          {m.esUtilidad && (
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Utilidades
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
        {formatMoney(m.ingresos, moneda)}
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">
        {formatMoney(m.fijos, moneda)}
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
        {formatMoney(m.prestamos, moneda)}
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm whitespace-nowrap">
        {formatMoney(m.gastos, moneda)}
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-bold text-muted-foreground text-sm whitespace-nowrap">
        {formatMoney(m.totalEgresos, moneda)}
      </td>

      <td className="py-3 px-3.5 text-right font-mono font-bold text-sm sm:text-base whitespace-nowrap">
        <span className={positivo ? 'text-foreground' : 'text-rose-600'}>
          {formatMoney(m.disponible, moneda)}
        </span>
      </td>

      <td className="py-3 px-3.5 text-center whitespace-nowrap">
        {sinActividad ? (
          <span className="text-xs text-muted-foreground font-medium">-</span>
        ) : (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              margen >= 20
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : margen > 0
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {margen.toFixed(0)}%
          </span>
        )}
      </td>

      <td
        className="py-3 px-3.5 text-center whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onSelectMes(m.periodo)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
          title="Gestionar este mes"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
