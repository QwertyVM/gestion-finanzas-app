'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FijoMetodoPagoSelectorProps {
  costoFijoId: string;
  metodoPago: string;
  tarjetaId?: string | null;
  tarjetas: any[];
  disabled?: boolean;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
}

export function FijoMetodoPagoSelector({
  costoFijoId,
  metodoPago,
  tarjetaId,
  tarjetas,
  disabled,
  onCambiarMetodoPago,
}: FijoMetodoPagoSelectorProps) {
  const selectValue =
    metodoPago === 'TARJETA_CREDITO'
      ? `TARJETA:${tarjetaId || ''}`
      : metodoPago || 'EFECTIVO_DEBITO';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith('TARJETA:')) {
      const tId = val.replace('TARJETA:', '');
      onCambiarMetodoPago(costoFijoId, 'TARJETA_CREDITO', tId || null);
    } else {
      onCambiarMetodoPago(costoFijoId, val, null);
    }
  };

  return (
    <div
      className="relative inline-flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Forma de pago"
        title="Cambiar forma de pago"
        className="text-[11px] font-medium h-6.5 pl-2 pr-5 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground/80 hover:text-foreground appearance-none cursor-pointer outline-none transition focus:ring-1 focus:ring-ring focus:border-ring max-w-[150px] truncate"
      >
        <option value="EFECTIVO_DEBITO">💵 Efectivo / Débito</option>
        <option value="TRANSFERENCIA">🏦 Transferencia</option>
        {tarjetas.map((t) => (
          <option key={t.id} value={`TARJETA:${t.id}`}>
            💳 {t.nombre}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none text-muted-foreground/60" />
    </div>
  );
}
