'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

interface SimuladorComparativaMobileProps {
  resultado: any;
  moneda: string;
}

export function SimuladorComparativaMobile({
  resultado,
  moneda,
}: SimuladorComparativaMobileProps) {
  const metricas = [
    {
      titulo: 'Cuota Mensual',
      actual: formatMoney(resultado.cuotaActual, moneda),
      opcionA: formatMoney(resultado.cuotaActual, moneda),
      opcionB: formatMoney(resultado.opcionCuota.nuevaCuotaMensual, moneda),
    },
    {
      titulo: 'Cuotas Restantes',
      actual: `${resultado.cuotasRestantes}`,
      opcionA: `${resultado.opcionPlazo.nuevasCuotasRestantes}`,
      opcionB: `${resultado.cuotasRestantes}`,
    },
    {
      titulo: 'Tiempo Ahorrado',
      actual: '—',
      opcionA: `${resultado.opcionPlazo.mesesAhorrados} meses`,
      opcionB: '—',
    },
    {
      titulo: 'Intereses Ahorrados',
      actual: '—',
      opcionA: `~ ${formatMoney(resultado.opcionPlazo.interesAhorradoAproximado, moneda)}`,
      opcionB: `~ ${formatMoney(resultado.opcionCuota.interesAhorradoAproximado, moneda)}`,
    },
  ];

  return (
    <div className="md:hidden divide-y divide-border/40 text-xs">
      {metricas.map((m) => (
        <div key={m.titulo} className="p-3 space-y-1.5">
          <span className="font-semibold text-foreground text-xs block">{m.titulo}</span>
          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="p-1.5 rounded-lg bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground block">Actual</span>
              <span className="font-mono font-medium text-foreground text-[11px] truncate block">
                {m.actual}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40">
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium block">Plazo</span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-[11px] truncate block">
                {m.opcionA}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">Cuota</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[11px] truncate block">
                {m.opcionB}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
