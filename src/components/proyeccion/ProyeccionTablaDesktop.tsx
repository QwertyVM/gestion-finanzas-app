'use client';

import React from 'react';
import { ProyeccionMesFila, MesProyeccion } from './ProyeccionMesFila';
import { ProyeccionTotalesFooter } from './ProyeccionTotalesFooter';
import type { TotalesProyeccion } from '@/app/api/finanzas/anual/route';

interface ProyeccionTablaDesktopProps {
  datosAnio: MesProyeccion[];
  realCurrentPeriodo: string;
  moneda: string;
  onSelectMes: (periodo: string) => void;
  anio: number;
  totalesActual?: TotalesProyeccion;
  totalesProyectado: TotalesProyeccion;
  mesActualNombre: string;
}

export function ProyeccionTablaDesktop({
  datosAnio,
  realCurrentPeriodo,
  moneda,
  onSelectMes,
  anio,
  totalesActual,
  totalesProyectado,
  mesActualNombre,
}: ProyeccionTablaDesktopProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
          <tr>
            <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Mes</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Ingresos</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-sky-600 dark:text-sky-400">Fijos</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-purple-600 dark:text-purple-400">Préstamos</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-teal-600 dark:text-teal-400">Tarjetas & Var</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Egresos</th>
            <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Disponible</th>
            <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">% Ahorro</th>
            <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {datosAnio.map((m) => (
            <ProyeccionMesFila
              key={m.periodo}
              mes={m}
              mesActualPeriodo={realCurrentPeriodo}
              moneda={moneda}
              onSelectMes={onSelectMes}
            />
          ))}
        </tbody>
        <ProyeccionTotalesFooter
          anio={anio}
          totalesActual={totalesActual}
          totalesProyectado={totalesProyectado}
          mesActualNombre={mesActualNombre}
          moneda={moneda}
        />
      </table>
    </div>
  );
}
