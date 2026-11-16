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
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
              metodoPago === 'EFECTIVO_DEBITO'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border'
            }`}
          >
            💵 Efectivo
          </button>
          <button
            type="button"
            onClick={() => setMetodoPago('TRANSFERENCIA')}
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
              metodoPago === 'TRANSFERENCIA'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border'
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
            className={`py-1.5 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
              metodoPago === 'TARJETA_CREDITO'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500 shadow-xs'
                : 'bg-secondary/40 text-muted-foreground border-border'
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
