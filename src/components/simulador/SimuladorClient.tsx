'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { simularPrepago } from '@/lib/prepayment-calculator';
import { SimuladorEmptyState } from './SimuladorEmptyState';
import { SimuladorConfigPanel } from './SimuladorConfigPanel';
import { SimuladorResultadosPanel } from './SimuladorResultadosPanel';

export function SimuladorClient() {
  const { resumen } = useFinanzas();
  const prestamos = resumen?.prestamos || [];
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const [prestamoSeleccionadoId, setPrestamoSeleccionadoId] = useState(
    () => prestamos[0]?.id || ''
  );
  const [montoPrepago, setMontoPrepago] = useState('2000');
  const [tasaTEA, setTasaTEA] = useState('14.5');

  useEffect(() => {
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
        <SimuladorEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <SimuladorConfigPanel
            prestamos={prestamos}
            prestamoSeleccionadoId={prestamoSeleccionadoId}
            prestamo={prestamo}
            resultado={resultado}
            moneda={moneda}
            montoPrepago={montoPrepago}
            tasaTEA={tasaTEA}
            onSelectPrestamo={setPrestamoSeleccionadoId}
            onMontoPrepagoChange={setMontoPrepago}
            onTasaTEAChange={setTasaTEA}
          />

          <SimuladorResultadosPanel resultado={resultado} moneda={moneda} />
        </div>
      )}
    </div>
  );
}
