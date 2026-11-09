'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { simularPrepago } from '@/lib/prepayment-calculator';

export function SimuladorClient() {
  const { resumen } = useFinanzas();
  const prestamos = resumen?.prestamos || [];
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const [prestamoSeleccionadoId, setPrestamoSeleccionadoId] = useState(
    () => prestamos[0]?.id || ''
  );
  const [montoPrepago, setMontoPrepago] = useState('2000');
  const [tasaTEA, setTasaTEA] = useState('14.5');

  React.useEffect(() => {
    if (prestamos.length > 0 && !prestamoSeleccionadoId) {
      setPrestamoSeleccionadoId(prestamos[0].id);
    }
  }, [prestamos, prestamoSeleccionadoId]);

  const prestamo = prestamos.find((p) => p.id === prestamoSeleccionadoId) || prestamos[0];

  const resultado = prestamo
    ? simularPrepago({
        montoTotal: prestamo.montoTotal,
        montoCuota: prestamo.montoCuota,
        cuotaActualNumero: prestamo.cuotaActual,
        cuotasTotales: prestamo.cuotasTotales,
        montoPrepagar: parseFloat(montoPrepago) || 0,
        tasaAnualTEA: parseFloat(tasaTEA) || 14.5,
      })
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Simulador de Prepagos
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Calcula el ahorro en intereses y tiempo al amortizar capital en tus créditos.
        </p>
      </div>

      {!prestamo ? (
        <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
          <p className="text-xs text-muted-foreground">
            No tienes préstamos bancarios activos registrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Panel Izquierdo: Configurar Prepago */}
          <div className="lg:col-span-1 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del Préstamo
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Préstamo:</label>
                <select
                  value={prestamoSeleccionadoId}
                  onChange={(e) => setPrestamoSeleccionadoId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
                >
                  {prestamos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.banco} - {p.concepto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuota mensual:</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatMoney(prestamo.montoCuota, moneda)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progreso:</span>
                  <span className="font-medium text-foreground">
                    Cuota {prestamo.cuotaActual}/{prestamo.cuotasTotales}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuotas restantes:</span>
                  <span className="text-foreground">
                    {resultado?.cuotasRestantes} cuotas
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Saldo capital aprox.:</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatMoney(resultado?.saldoActualAproximado, moneda)}
                  </span>
                </div>
              </div>

              {/* Monto a Prepagar */}
              <div className="space-y-1 pt-2 border-t border-border/60">
                <label className="font-medium text-muted-foreground">
                  Monto a Prepagar ({moneda}):
                </label>
                <input
                  type="number"
                  step="100"
                  value={montoPrepago}
                  onChange={(e) => setMontoPrepago(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-sm"
                />

                <div className="grid grid-cols-3 gap-1 pt-1">
                  {['1000', '2000', '3500'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMontoPrepago(val)}
                      className="py-1 px-1 text-[11px] font-medium bg-muted/60 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition text-center"
                    >
                      {moneda} {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasa TEA */}
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">
                  Tasa Anual Estimada (TEA %):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tasaTEA}
                  onChange={(e) => setTasaTEA(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground text-xs"
                />
              </div>
            </div>
          </div>

          {/* Panel Derecho: Comparativa de Opciones */}
          {resultado && (
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
                    <h3 className="font-semibold text-foreground text-sm">
                      Opción A: Reducir Plazo
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mantienes tu cuota pero terminas de pagar antes.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">
                      Ahorro en Intereses:
                    </span>
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
                    <h3 className="font-semibold text-foreground text-sm">
                      Opción B: Reducir Cuota
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mantienes el plazo pero la cuota mensual disminuye.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">
                      Nueva Cuota Mensual:
                    </span>
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

              {/* TABLA COMPARATIVA */}
              <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-border/60">
                  <h3 className="font-semibold text-foreground text-xs">
                    Comparativa de Escenarios
                  </h3>
                </div>

                <div className="overflow-x-auto">
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
                        <td className="py-2.5 px-3 text-center text-foreground">
                          {formatMoney(resultado.cuotaActual, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-foreground">
                          {formatMoney(resultado.cuotaActual, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-foreground">
                          {formatMoney(resultado.opcionCuota.nuevaCuotaMensual, moneda)}
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3 font-sans font-medium text-foreground">Cuotas Restantes</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">
                          {resultado.cuotasRestantes}
                        </td>
                        <td className="py-2.5 px-3 text-center text-foreground font-sans">
                          {resultado.opcionPlazo.nuevasCuotasRestantes}
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">
                          {resultado.cuotasRestantes}
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3 font-sans font-medium text-foreground">Tiempo Ahorrado</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
                        <td className="py-2.5 px-3 text-center text-foreground font-sans">
                          {resultado.opcionPlazo.mesesAhorrados} meses
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3 font-sans font-medium text-foreground">Intereses Ahorrados</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground font-sans">—</td>
                        <td className="py-2.5 px-3 text-center text-foreground">
                          ~ {formatMoney(resultado.opcionPlazo.interesAhorradoAproximado, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-foreground">
                          ~ {formatMoney(resultado.opcionCuota.interesAhorradoAproximado, moneda)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
