'use client';

import React from 'react';
import { CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import type { TipoRecordModal } from '@/context/FinanzasContext';
import { RecordPrestamoFields } from './RecordPrestamoFields';
import { RecordCardFields, type TarjetaOption, type PreviewTarjetaInfo } from './RecordCardFields';

export type { TarjetaOption, PreviewTarjetaInfo };

interface RecordPaymentDetailsProps {
  tipoActivo: TipoRecordModal;
  // Ingreso
  tipoIngreso: 'SUELDO' | 'GRATIFICACION' | 'UTILIDADES' | 'EXTRA';
  setTipoIngreso: (t: 'SUELDO' | 'GRATIFICACION' | 'UTILIDADES' | 'EXTRA') => void;
  // Prestamo
  bancoPrestamo: string;
  setBancoPrestamo: (b: string) => void;
  cuotasTotalesPrestamo: string;
  setCuotasTotalesPrestamo: (c: string) => void;
  cuotaInicialPrestamo: string;
  setCuotaInicialPrestamo: (c: string) => void;
  teaPrestamo: string;
  setTeaPrestamo: (t: string) => void;
  montoSoles: number;
  // Gasto / Fijo
  metodoPago: 'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA';
  setMetodoPago: (m: 'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA') => void;
  tarjetas: TarjetaOption[];
  tarjetaId: string;
  setTarjetaId: (id: string) => void;
  totalCuotas: string;
  setTotalCuotas: (c: string) => void;
  previewTarjeta: PreviewTarjetaInfo | null;
}

export function RecordPaymentDetails({
  tipoActivo,
  tipoIngreso,
  setTipoIngreso,
  bancoPrestamo,
  setBancoPrestamo,
  cuotasTotalesPrestamo,
  setCuotasTotalesPrestamo,
  cuotaInicialPrestamo,
  setCuotaInicialPrestamo,
  teaPrestamo,
  setTeaPrestamo,
  montoSoles,
  metodoPago,
  setMetodoPago,
  tarjetas,
  tarjetaId,
  setTarjetaId,
  totalCuotas,
  setTotalCuotas,
  previewTarjeta,
}: RecordPaymentDetailsProps) {
  if (tipoActivo === 'INGRESO') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Tipo de Ingreso:</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'EXTRA', label: 'Extra / Freelance' },
            { id: 'SUELDO', label: 'Sueldo Base' },
            { id: 'GRATIFICACION', label: 'Grati' },
            { id: 'UTILIDADES', label: 'Utilidades' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTipoIngreso(t.id as any)}
              className={`py-2 px-1 rounded-xl text-xs font-medium border transition text-center truncate cursor-pointer ${
                tipoIngreso === t.id
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tipoActivo === 'PRESTAMO') {
    return (
      <RecordPrestamoFields
        bancoPrestamo={bancoPrestamo}
        setBancoPrestamo={setBancoPrestamo}
        cuotasTotalesPrestamo={cuotasTotalesPrestamo}
        setCuotasTotalesPrestamo={setCuotasTotalesPrestamo}
        cuotaInicialPrestamo={cuotaInicialPrestamo}
        setCuotaInicialPrestamo={setCuotaInicialPrestamo}
        teaPrestamo={teaPrestamo}
        setTeaPrestamo={setTeaPrestamo}
        montoSoles={montoSoles}
      />
    );
  }

  const paymentButtons = [
    { id: 'TARJETA_CREDITO', label: 'Tarjeta', icon: CreditCard },
    { id: 'EFECTIVO_DEBITO', label: 'Efectivo', icon: Banknote },
    { id: 'TRANSFERENCIA', label: 'Transf.', icon: ArrowRightLeft },
  ] as const;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">Método de Pago:</label>
      <div className="grid grid-cols-3 gap-2">
        {paymentButtons.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMetodoPago(id)}
            className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
              metodoPago === id
                ? 'bg-foreground text-background border-foreground font-semibold'
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {metodoPago === 'TARJETA_CREDITO' && (
        <RecordCardFields
          tarjetas={tarjetas}
          tarjetaId={tarjetaId}
          setTarjetaId={setTarjetaId}
          tipoActivo={tipoActivo}
          totalCuotas={totalCuotas}
          setTotalCuotas={setTotalCuotas}
          previewTarjeta={previewTarjeta}
        />
      )}
    </div>
  );
}
