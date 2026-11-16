'use client';

import React from 'react';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { FijoCurrencyAmountInput } from './FijoCurrencyAmountInput';
import { FijoPaymentMethodSelector } from './FijoPaymentMethodSelector';

interface TarjetaItem {
  id: string;
  nombre: string;
  banco?: string;
}

interface FijoFormFieldsProps {
  concepto: string;
  setConcepto: (v: string) => void;
  moneda: 'PEN' | 'USD';
  setMoneda: (m: 'PEN' | 'USD') => void;
  monto: string;
  setMonto: (v: string) => void;
  montoUSD: string;
  setMontoUSD: (v: string) => void;
  tc: string;
  setTc: (v: string) => void;
  configTc: number;
  mesInicio: string;
  setMesInicio: (v: string) => void;
  mesFin: string;
  setMesFin: (v: string) => void;
  metodoPago: 'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO';
  setMetodoPago: (m: 'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO') => void;
  tarjetaId: string;
  setTarjetaId: (id: string) => void;
  tarjetas: TarjetaItem[];
}

export function FijoFormFields({
  concepto,
  setConcepto,
  moneda,
  setMoneda,
  monto,
  setMonto,
  montoUSD,
  setMontoUSD,
  tc,
  setTc,
  configTc,
  mesInicio,
  setMesInicio,
  mesFin,
  setMesFin,
  metodoPago,
  setMetodoPago,
  tarjetaId,
  setTarjetaId,
  tarjetas,
}: FijoFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="font-semibold text-foreground">
          Concepto (ej. Alquiler, Internet, Gimnasio):
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Internet Fibra Óptica"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
        />
      </div>

      <FijoCurrencyAmountInput
        moneda={moneda}
        setMoneda={setMoneda}
        monto={monto}
        setMonto={setMonto}
        montoUSD={montoUSD}
        setMontoUSD={setMontoUSD}
        tc={tc}
        setTc={setTc}
        configTc={configTc}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Mes de Inicio:
          </label>
          <MonthYearPicker
            value={mesInicio}
            onChange={setMesInicio}
            accentColor="sky"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Mes de Fin (opcional):
          </label>
          <MonthYearPicker
            value={mesFin}
            onChange={setMesFin}
            accentColor="sky"
            optional
          />
        </div>
      </div>

      <FijoPaymentMethodSelector
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        tarjetaId={tarjetaId}
        setTarjetaId={setTarjetaId}
        tarjetas={tarjetas}
      />
    </>
  );
}
