'use client';

import React from 'react';

interface TarjetaItem {
  id: string;
  nombre: string;
  banco?: string;
}

interface FijoPaymentMethodSelectorProps {
  metodoPago: 'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO';
  setMetodoPago: (m: 'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO') => void;
  tarjetaId: string;
  setTarjetaId: (id: string) => void;
  tarjetas: TarjetaItem[];
}

export function FijoPaymentMethodSelector({
  metodoPago,
  setMetodoPago,
  tarjetaId,
  setTarjetaId,
  tarjetas,
}: FijoPaymentMethodSelectorProps) {
  return (
    <>
      <div className="space-y-1.5 pt-1">
        <label className="font-semibold text-foreground">
          Forma de Pago:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer text-xs ${
              metodoPago === 'EFECTIVO_DEBITO'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70'
            }`}
          >
            💵 Efectivo
          </button>
          <button
            type="button"
            onClick={() => setMetodoPago('TRANSFERENCIA')}
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer text-xs ${
              metodoPago === 'TRANSFERENCIA'
                ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70'
            }`}
          >
            🏦 Transferencia
          </button>
          <button
            type="button"
            onClick={() => {
              setMetodoPago('TARJETA_CREDITO');
              if (!tarjetaId && tarjetas.length > 0) {
                setTarjetaId(tarjetas[0].id);
              }
            }}
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer text-xs ${
              metodoPago === 'TARJETA_CREDITO'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70'
            }`}
          >
            💳 Tarjeta
          </button>
        </div>
      </div>

      {metodoPago === 'TARJETA_CREDITO' && (
        <div className="space-y-1.5">
          <label className="font-semibold text-foreground">
            Tarjeta de Crédito:
          </label>
          <select
            value={tarjetaId}
            onChange={(e) => setTarjetaId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {tarjetas && tarjetas.length > 0 ? (
              tarjetas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.banco || ''})
                </option>
              ))
            ) : (
              <option value="">No hay tarjetas registradas</option>
            )}
          </select>
        </div>
      )}
    </>
  );
}
