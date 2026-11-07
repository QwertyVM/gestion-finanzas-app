'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { simularPrepago } from '@/lib/prepayment-calculator';
import {
  Calculator,
  Landmark,
  Sparkles,
  Calendar,
  Clock,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calculator className="w-6 h-6 text-purple-500" />
          <span>Simulador de Prepagos de Préstamos</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Calcula cuánto te ahorras en intereses y tiempo si decides amortizar capital (ej. con tu gratificación o ahorros).
        </p>
      </div>

      {!prestamo ? (
        <div className="p-8 text-center bg-card border border-border rounded-2xl">
          <Landmark className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground mt-2">
            No tienes préstamos bancarios activos registrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Configurar Prepago */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-500" />
              <span>Datos del Préstamo</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Préstamo:</label>
                <select
                  value={prestamoSeleccionadoId}
                  onChange={(e) => setPrestamoSeleccionadoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold outline-none"
                >
                  {prestamos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.banco} - {p.concepto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuota mensual:</span>
                  <span className="font-bold text-foreground">
                    {formatMoney(prestamo.montoCuota, moneda)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progreso:</span>
                  <span className="font-bold text-purple-500">
                    Cuota {prestamo.cuotaActual} de {prestamo.cuotasTotales}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuotas restantes:</span>
                  <span className="font-bold text-foreground">
                    {resultado?.cuotasRestantes} cuotas
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Saldo aprox. capital:</span>
                  <span className="font-bold text-foreground">
                    {formatMoney(resultado?.saldoActualAproximado, moneda)}
                  </span>
                </div>
              </div>

              {/* Monto a Prepagar */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="font-bold text-foreground">
                  Monto a Prepagar ({moneda}):
                </label>
                <input
                  type="number"
                  step="100"
                  value={montoPrepago}
                  onChange={(e) => setMontoPrepago(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-extrabold text-base"
                />

                {/* Presets Rápidos */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {['1000', '2000', '3500'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMontoPrepago(val)}
                      className="py-1 px-1 text-[11px] font-semibold bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground transition border border-border text-center"
                    >
                      {moneda} {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasa TEA */}
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">
                  Tasa Anual Estimada (TEA %):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tasaTEA}
                  onChange={(e) => setTasaTEA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Panel Derecho: Comparativa de Opciones */}
          {resultado && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  Al abonar <strong>{formatMoney(resultado.montoPrepagar, moneda)}</strong> a capital, el banco te da a elegir entre 2 opciones:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPCIÓN 1: REDUCIR PLAZO */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      Recomendada
                    </span>
                    <Clock className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Opción A: Reducir Plazo
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mantienes tu cuota de {formatMoney(resultado.cuotaActual, moneda)}, pero terminas de pagar meses antes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                      Ahorro en Intereses:
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-500">
                      ~ {formatMoney(resultado.opcionPlazo.interesAhorradoAproximado, moneda)}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Meses que te ahorras:</span>
                      <span className="font-bold text-foreground">
                        {resultado.opcionPlazo.mesesAhorrados} meses antes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cuotas restantes ahora:</span>
                      <span className="font-bold text-foreground">
                        {resultado.opcionPlazo.nuevasCuotasRestantes} cuotas (en vez de {resultado.cuotasRestantes})
                      </span>
                    </div>
                  </div>
                </div>

                {/* OPCIÓN 2: REDUCIR CUOTA */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-sky-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-500 border border-sky-500/30">
                      Mayor Liquidez Mensual
                    </span>
                    <TrendingDown className="w-5 h-5 text-sky-500" />
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Opción B: Reducir Cuota
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mantienes el plazo original, pero tu cuota mensual baja de inmediato.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">
                      Nueva Cuota Mensual:
                    </span>
                    <div className="text-2xl font-extrabold text-sky-500">
                      {formatMoney(resultado.opcionCuota.nuevaCuotaMensual, moneda)}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Alivio mensual libre:</span>
                      <span className="font-bold text-emerald-500">
                        + {formatMoney(resultado.opcionCuota.ahorroMensual, moneda)} / mes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Intereses ahorrados:</span>
                      <span className="font-bold text-foreground">
                        ~ {formatMoney(resultado.opcionCuota.interesAhorradoAproximado, moneda)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
