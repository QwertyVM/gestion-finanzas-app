'use client';

import React, { useState } from 'react';
import { Landmark, X } from 'lucide-react';
import { toast } from 'sonner';
import { PrestamoModalFormFields } from './PrestamoModalFormFields';

interface ModalCrearPrestamoProps {
  open: boolean;
  onClose: () => void;
  periodo: string;
  configTc: number;
  onSuccess: () => Promise<void>;
}

export function ModalCrearPrestamo({
  open,
  onClose,
  periodo,
  configTc,
  onSuccess,
}: ModalCrearPrestamoProps) {
  const [banco, setBanco] = useState('BCP');
  const [concepto, setConcepto] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [montoTotal, setMontoTotal] = useState('');
  const [montoCuota, setMontoCuota] = useState('');
  const [cuotaUSD, setCuotaUSD] = useState('');
  const [totalUSD, setTotalUSD] = useState('');
  const [tc, setTc] = useState(configTc.toString());
  const [cuotasTotales, setCuotasTotales] = useState('24');
  const [cuotaInicial, setCuotaInicial] = useState('1');
  const [tea, setTea] = useState('14.50');
  const [diaPago, setDiaPago] = useState('25');
  const [periodoInicio, setPeriodoInicio] = useState(periodo);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let cuotaFinal = parseFloat(montoCuota) || 0;
      let totalFinal = parseFloat(montoTotal) || 0;
      let montoOriginalFinal: number | null = null;
      let totalOriginalFinal: number | null = null;
      let tcFinal: number | null = null;

      if (moneda === 'USD') {
        const cUSD = parseFloat(cuotaUSD) || 0;
        const tUSD = parseFloat(totalUSD) || 0;
        const tcVal = parseFloat(tc) || configTc;
        montoOriginalFinal = cUSD;
        totalOriginalFinal = tUSD;
        tcFinal = tcVal;
        cuotaFinal = Number((cUSD * tcVal).toFixed(2));
        totalFinal = Number((tUSD * tcVal).toFixed(2));
      }

      if (cuotaFinal <= 0) {
        toast.error('El monto de la cuota debe ser mayor a 0');
        return;
      }

      const res = await fetch('/api/prestamos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banco,
          concepto,
          montoTotal: totalFinal > 0 ? totalFinal : cuotaFinal * parseInt(cuotasTotales, 10),
          montoCuota: cuotaFinal,
          monedaOriginal: moneda,
          montoOriginal: montoOriginalFinal,
          tipoCambio: tcFinal,
          cuotasTotales: parseInt(cuotasTotales, 10) || 1,
          cuotaInicial: parseInt(cuotaInicial, 10) || 1,
          diaPago: Math.min(31, Math.max(1, parseInt(diaPago, 10) || 25)),
          tasaInteresAnual: parseFloat(tea) || 14.50,
          periodoInicio: periodoInicio || periodo,
        }),
      });

      if (!res.ok) throw new Error('Error al crear préstamo');
      toast.success('Préstamo registrado y cuotas programadas');
      onClose();
      setConcepto('');
      setMontoTotal('');
      setMontoCuota('');
      setCuotaUSD('');
      setMoneda('PEN');
      await onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear préstamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-500" />
            <span>Registrar Nuevo Préstamo Bancario</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <PrestamoModalFormFields
            banco={banco}
            setBanco={setBanco}
            concepto={concepto}
            setConcepto={setConcepto}
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
            cuotasTotales={cuotasTotales}
            setCuotasTotales={setCuotasTotales}
            cuotaInicial={cuotaInicial}
            setCuotaInicial={setCuotaInicial}
            tea={tea}
            setTea={setTea}
            diaPago={diaPago}
            setDiaPago={setDiaPago}
            periodoInicio={periodoInicio}
            setPeriodoInicio={setPeriodoInicio}
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Crear Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
