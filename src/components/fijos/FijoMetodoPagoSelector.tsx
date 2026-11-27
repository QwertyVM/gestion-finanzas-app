'use client';

import React from 'react';
import { ChevronDown, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';

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

  // Encontrar tarjeta activa si aplica
  const tarjetaActual = tarjetas.find((t) => t.id === tarjetaId);

  // Icono representativo
  const renderIcon = () => {
    if (metodoPago === 'TARJETA_CREDITO') {
      return <CreditCard className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />;
    }
    if (metodoPago === 'TRANSFERENCIA') {
      return <ArrowRightLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    return <Banknote className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />;
  };

  return (
    <div
      className="relative inline-flex items-center group/selector"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Visual Badge Pill overlay interactivo */}
      <div className={`inline-flex items-center gap-1.5 h-6.5 px-2.5 rounded-lg border text-xs font-medium transition-all pointer-events-none ${
        disabled
          ? 'opacity-50 border-border/40 bg-muted/20 text-muted-foreground'
          : 'border-border/60 bg-muted/30 group-hover/selector:bg-muted/60 group-hover/selector:border-border text-foreground/90'
      }`}>
        {renderIcon()}
        <span className="truncate max-w-[120px] text-[11px]">
          {metodoPago === 'TARJETA_CREDITO'
            ? (tarjetaActual ? tarjetaActual.nombre : 'Tarjeta Crédito')
            : metodoPago === 'TRANSFERENCIA'
              ? 'Transferencia'
              : 'Efectivo / Débito'}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 ml-0.5 opacity-60 group-hover/selector:opacity-100" />
      </div>

      {/* Select nativo invisible por encima para accesibilidad y soporte móvil */}
      <select
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Forma de pago base"
        title="Cambiar forma de pago base"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      >
        <optgroup label="Directo">
          <option value="EFECTIVO_DEBITO">💵 Efectivo / Débito</option>
          <option value="TRANSFERENCIA">⚡ Transferencia Bancaria</option>
        </optgroup>
        {tarjetas.length > 0 && (
          <optgroup label="Tarjetas de Crédito">
            {tarjetas.map((t) => (
              <option key={t.id} value={`TARJETA:${t.id}`}>
                💳 {t.nombre} ({t.banco})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
