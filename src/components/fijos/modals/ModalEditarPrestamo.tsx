'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X, Lock } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { PrestamoModalFormFields } from './PrestamoModalFormFields';

interface ModalEditarPrestamoProps {
  prestamo: any | null;
  onClose: () => void;
  periodo: string;
  configTc: number;
  onSuccess: () => Promise<void>;
}

export function ModalEditarPrestamo({
  prestamo,
  onClose,
  periodo,
  configTc,
  onSuccess,
}: ModalEditarPrestamoProps) {
  const [banco, setBanco] = useState('');
  const [concepto, setConcepto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [cuotasTotales, setCuotasTotales] = useState('24');
  const [cuotaActual, setCuotaActual] = useState('1');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [montoCuota, setMontoCuota] = useState('');
  const [cuotaUSD, setCuotaUSD] = useState('');
  const [totalUSD, setTotalUSD] = useState('');
  const [tc, setTc] = useState(configTc.toString());
  const [tea, setTea] = useState('14.50');
  const [mesDesde, setMesDesde] = useState(periodo);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prestamo) {
      setBanco(prestamo.banco || '');
      setConcepto(prestamo.concepto || '');
      setMontoTotal(prestamo.montoTotal ? prestamo.montoTotal.toString() : '');
      setCuotasTotales(prestamo.cuotasTotales ? prestamo.cuotasTotales.toString() : '24');
      setCuotaActual(prestamo.cuotaActual ? prestamo.cuotaActual.toString() : '1');
      setMontoCuota(prestamo.montoCuota ? prestamo.montoCuota.toString() : '');
      setTea(prestamo.tasaInteresAnual ? prestamo.tasaInteresAnual.toString() : '14.50');
      setMesDesde(periodo);

      const isUsd = prestamo.monedaOriginal === 'USD' || (prestamo.concepto && prestamo.concepto.includes('$'));
      setMoneda(isUsd ? 'USD' : 'PEN');
      if (prestamo.montoOriginal) {
        setCuotaUSD(prestamo.montoOriginal.toString());
      } else if (prestamo.concepto) {
        const match = prestamo.concepto.match(/\$([0-9.]+)/);
        setCuotaUSD(match ? match[1] : '');
      } else {
        setCuotaUSD('');
      }
      setTc(prestamo.tipoCambio ? prestamo.tipoCambio.toString() : configTc.toString());
    }
  }, [prestamo, periodo, configTc]);

  if (!prestamo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cuotaSoles = parseFloat(montoCuota);
    let conceptoFinal = concepto.trim();

    if (moneda === 'USD') {
      const usdCuota = parseFloat(cuotaUSD);
      const tcVal = parseFloat(tc) || configTc;
      if (isNaN(usdCuota) || usdCuota <= 0) {
        toast.error('Ingresa la cuota en dólares');
        return;
      }
      cuotaSoles = Number((usdCuota * tcVal).toFixed(2));
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdCuota} USD)`;
      }
    }

    if (!conceptoFinal || isNaN(cuotaSoles) || cuotaSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/prestamos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prestamo.id,
          concepto: conceptoFinal,
          banco: banco.trim(),
          montoTotal: montoTotal ? parseFloat(montoTotal) : undefined,
          cuotasTotales: parseInt(cuotasTotales, 10) || undefined,
          cuotaActual: parseInt(cuotaActual, 10) || undefined,
          montoCuota: cuotaSoles,
          diaPago: 30,
          tasaInteresAnual: parseFloat(tea),
          mesDesde,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      toast.success('Préstamo actualizado sin alterar pagos pasados');
      onClose();
      await onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Pencil className="w-5 h-5 text-purple-500" />
            <span>Editar Condiciones del Préstamo</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-purple-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Edición No Retroactiva Garantizada</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Este ajuste solo afectará las cuotas pendientes a partir de {formatPeriodoLabel(mesDesde)}. Los pagos de meses anteriores permanecen intactos.
          </p>
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
            cuotaInicial={cuotaActual}
            setCuotaInicial={setCuotaActual}
            tea={tea}
            setTea={setTea}
            periodoInicio={mesDesde}
            setPeriodoInicio={setMesDesde}
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
