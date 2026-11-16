'use client';

import React from 'react';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { PrestamoCurrencyAmountInput } from './PrestamoCurrencyAmountInput';

interface PrestamoModalFormFieldsProps {
  banco: string;
  setBanco: (v: string) => void;
  concepto: string;
  setConcepto: (v: string) => void;
  moneda: 'PEN' | 'USD';
  setMoneda: (m: 'PEN' | 'USD') => void;
  montoCuota: string;
  setMontoCuota: (v: string) => void;
  montoTotal: string;
  setMontoTotal: (v: string) => void;
  cuotaUSD: string;
  setCuotaUSD: (v: string) => void;
  totalUSD: string;
  setTotalUSD: (v: string) => void;
  tc: string;
  setTc: (v: string) => void;
  configTc: number;
  cuotasTotales: string;
  setCuotasTotales: (v: string) => void;
  cuotaInicial: string;
  setCuotaInicial: (v: string) => void;
  tea: string;
  setTea: (v: string) => void;
  periodoInicio: string;
  setPeriodoInicio: (v: string) => void;
}

export function PrestamoModalFormFields({
  banco,
  setBanco,
  concepto,
  setConcepto,
  moneda,
  setMoneda,
  montoCuota,
  setMontoCuota,
  montoTotal,
  setMontoTotal,
  cuotaUSD,
  setCuotaUSD,
  totalUSD,
  setTotalUSD,
  tc,
  setTc,
  configTc,
  cuotasTotales,
  setCuotasTotales,
  cuotaInicial,
  setCuotaInicial,
  tea,
  setTea,
  periodoInicio,
  setPeriodoInicio,
}: PrestamoModalFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Banco / Entidad:
          </label>
          <input
            type="text"
            required
            placeholder="Ej: BCP, Interbank, BBVA"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Concepto / Descripción:
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Préstamo Personal"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />
        </div>
      </div>

      <PrestamoCurrencyAmountInput
        moneda={moneda}
        setMoneda={setMoneda}
        montoCuota={montoCuota}
        setMontoCuota={setMontoCuota}
        montoTotal={montoTotal}
        setMontoTotal={setMontoTotal}
        cuotaUSD={cuotaUSD}
        setCuotaUSD={setCuotaUSD}
        totalUSD={totalUSD}
        setTotalUSD={setTotalUSD}
        tc={tc}
        setTc={setTc}
        configTc={configTc}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Cuotas Totales:
          </label>
          <input
            type="number"
            min="1"
            required
            value={cuotasTotales}
            onChange={(e) => setCuotasTotales(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Inicia en Cuota:
          </label>
          <input
            type="number"
            min="1"
            required
            value={cuotaInicial}
            onChange={(e) => setCuotaInicial(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Tasa TEA (% anual):
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={tea}
            onChange={(e) => setTea(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Mes en que empieza a pagar:
          </label>
          <MonthYearPicker
            value={periodoInicio}
            onChange={setPeriodoInicio}
            accentColor="purple"
            required
          />
        </div>
      </div>
    </>
  );
}
