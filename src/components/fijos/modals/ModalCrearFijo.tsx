'use client';

import React, { useState } from 'react';
import { Home, X } from 'lucide-react';
import { toast } from 'sonner';
import { FijoFormFields } from './FijoFormFields';

interface TarjetaItem {
  id: string;
  nombre: string;
  banco?: string;
}

interface ModalCrearFijoProps {
  open: boolean;
  onClose: () => void;
  periodo: string;
  configTc: number;
  tarjetas: TarjetaItem[];
  onSuccess: () => Promise<void>;
}

export function ModalCrearFijo({
  open,
  onClose,
  periodo,
  configTc,
  tarjetas,
  onSuccess,
}: ModalCrearFijoProps) {
  const [concepto, setConcepto] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [monto, setMonto] = useState('');
  const [montoUSD, setMontoUSD] = useState('');
  const [tc, setTc] = useState(configTc.toString());
  const [mesInicio, setMesInicio] = useState(periodo);
  const [mesFin, setMesFin] = useState('');
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO'>('EFECTIVO_DEBITO');
  const [tarjetaId, setTarjetaId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let montoFinal = parseFloat(monto) || 0;
      let montoOriginalFinal: number | null = null;
      let tcFinal: number | null = null;

      if (moneda === 'USD') {
        const usdVal = parseFloat(montoUSD) || 0;
        const tcVal = parseFloat(tc) || configTc;
        montoOriginalFinal = usdVal;
        tcFinal = tcVal;
        montoFinal = Number((usdVal * tcVal).toFixed(2));
      }

      if (montoFinal <= 0) {
        toast.error('El monto debe ser mayor a 0');
        return;
      }

      const res = await fetch('/api/fijos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          monto: montoFinal,
          monedaOriginal: moneda,
          montoOriginal: montoOriginalFinal,
          tipoCambio: tcFinal,
          diaVencimiento: 30,
          mesInicio,
          mesFin: mesFin || null,
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : null,
          periodo,
        }),
      });

      if (!res.ok) throw new Error('Error al crear costo fijo');
      toast.success('Costo fijo registrado');
      onClose();
      setConcepto('');
      setMonto('');
      setMontoUSD('');
      setMoneda('PEN');
      setMetodoPago('EFECTIVO_DEBITO');
      setTarjetaId(tarjetas[0]?.id || '');
      await onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Home className="w-5 h-5 text-sky-500" />
            <span>Nuevo Costo Fijo Recurrente</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <FijoFormFields
            concepto={concepto}
            setConcepto={setConcepto}
            moneda={moneda}
            setMoneda={setMoneda}
            monto={monto}
            setMonto={setMonto}
            montoUSD={montoUSD}
            setMontoUSD={setMontoUSD}
            tc={tc}
            setTc={setTc}
            configTc={configTc}
            mesInicio={mesInicio}
            setMesInicio={setMesInicio}
            mesFin={mesFin}
            setMesFin={setMesFin}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            tarjetaId={tarjetaId}
            setTarjetaId={setTarjetaId}
            tarjetas={tarjetas}
          />

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Guardar Costo Fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
