'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { SimuladorComparativaMobile } from './SimuladorComparativaMobile';

interface SimuladorResultadosPanelProps {
  resultado: any;
  moneda: string;
}

export function SimuladorResultadosPanel({ resultado, moneda }: SimuladorResultadosPanelProps) {
  if (!resultado) return null;

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPCIÓN 1: REDUCIR PLAZO */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground">
              Menor tiempo
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm">Opción A: Reducir Plazo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mantienes tu cuota pero terminas de pagar antes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Ahorro en Intereses:</span>
            <div className="text-xl font-semibold font-mono text-foreground mt-0.5">
              ~ {formatMoney(resultado.opcionPlazo.interesAhorradoAproximado, moneda)}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
            <div className="flex items-center justify-between">
              <span>Meses ahorrados:</span>
              <span className="font-medium text-foreground">
                {resultado.opcionPlazo.mesesAhorrados} meses antes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nuevas cuotas:</span>
              <span className="font-medium text-foreground">
                {resultado.opcionPlazo.nuevasCuotasRestantes} cuotas
              </span>
            </div>
          </div>
        </div>

        {/* OPCIÓN 2: REDUCIR CUOTA */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground">
              Mayor liquidez
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm">Opción B: Reducir Cuota</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mantienes el plazo pero la cuota mensual disminuye.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-[10px] text-muted-foreground block">Nueva Cuota Mensual:</span>
            <div className="text-xl font-semibold font-mono text-foreground mt-0.5">
              {formatMoney(resultado.opcionCuota.nuevaCuotaMensual, moneda)}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
            <div className="flex items-center justify-between">
              <span>Alivio mensual:</span>
              <span className="font-mono font-medium text-foreground">
                + {formatMoney(resultado.opcionCuota.ahorroMensual, moneda)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Intereses ahorrados:</span>
              <span className="font-mono text-foreground">
                ~ {formatMoney(resultado.opcionCuota.interesAhorradoAproximado, moneda)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVA DE ESCENARIOS */}
      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-border/60">
          <h3 className="font-semibold text-foreground text-xs">Comparativa de Escenarios</h3>
        </div>

        {/* Vista Móvil: Métricas comparativas limpias */}
        <SimuladorComparativaMobile resultado={resultado} moneda={moneda} />

        {/* Vista Desktop: Tabla comparativa */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
              <tr>
                <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                <th scope="col" className="py-2.5 px-3 text-center font-medium">Actual</th>
                <th scope="col" className="py-2.5 px-3 text-center font-medium">Opción A (Plazo)</th>
                <th scope="col" className="py-2.5 px-3 text-center font-medium">Opción B (Cuota)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr className="hover:bg-muted/30 transition">
                <td className="py-2.5 px-3 font-sans font-medium text-foreground">Cuota Mensual</td>
                <td className="py-2.5 px-3 text-center text-foreground">{formatMoney(resultado.cuotaActual, moneda)}</td>
                <td className="py-2.5 px-3 text-center text-foreground">{formatMoney(resultado.cuotaActual, moneda)}</td>
                <td className="py-2.5 px-3 text-center text-foreground">{formatMoney(resultado.opcionCuota.nuevaCuotaMensual, moneda)}</td>
              </tr>
              <tr className="hover:bg-muted/30 transition">
                <td className="py-2.5 px-3 font-sans font-medium text-foreground">Cuotas Restantes</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">{resultado.cuotasRestantes}</td>
                <td className="py-2.5 px-3 text-center text-foreground font-sans">{resultado.opcionPlazo.nuevasCuotasRestantes}</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">{resultado.cuotasRestantes}</td>
              </tr>
              <tr className="hover:bg-muted/30 transition">
                <td className="py-2.5 px-3 font-sans font-medium text-foreground">Tiempo Ahorrado</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
                <td className="py-2.5 px-3 text-center text-foreground font-sans">{resultado.opcionPlazo.mesesAhorrados} meses</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
              </tr>
              <tr className="hover:bg-muted/30 transition">
                <td className="py-2.5 px-3 font-sans font-medium text-foreground">Intereses Ahorrados</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
                <td className="py-2.5 px-3 text-center text-foreground">~ {formatMoney(resultado.opcionPlazo.interesAhorradoAproximado, moneda)}</td>
                <td className="py-2.5 px-3 text-center text-foreground">~ {formatMoney(resultado.opcionCuota.interesAhorradoAproximado, moneda)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
