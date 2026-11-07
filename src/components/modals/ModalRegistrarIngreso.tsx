'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { PlusCircle, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';

interface ModalRegistrarIngresoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalRegistrarIngreso({ open, onClose }: ModalRegistrarIngresoProps) {
  const { periodo, refresh, resumen } = useFinanzas();
  const tipoCambio = resumen?.config?.tipoCambioUSD || 4.00;

  const [concepto, setConcepto] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [tipo, setTipo] = useState<'SUELDO' | 'GRATIFICACION' | 'UTILIDADES' | 'EXTRA'>('EXTRA');
  const [fechaEsperada, setFechaEsperada] = useState(() => `${periodo}-28`);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const montoNumero = parseFloat(montoInput) || 0;
  const montoSoles = moneda === 'USD' ? montoNumero * tipoCambio : montoNumero;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || montoNumero <= 0) {
      toast.error('Ingresa un concepto y un monto válido');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo,
          tipo,
          concepto,
          monto: montoSoles,
          monedaOriginal: moneda,
          montoOriginal: moneda === 'USD' ? montoNumero : null,
          tipoCambio,
          fechaEsperada: new Date(`${fechaEsperada}T12:00:00`),
          recibido: true,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar ingreso');
      toast.success('Ingreso registrado exitosamente');
      onClose();
      setConcepto('');
      setMontoInput('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-foreground">Registrar Nuevo Ingreso</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tipo de Ingreso Rápido */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Tipo de Ingreso:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 'EXTRA', label: 'Extra / Freelance' },
                { val: 'SUELDO', label: 'Sueldo' },
                { val: 'GRATIFICACION', label: 'Gratificación' },
                { val: 'UTILIDADES', label: 'Utilidades' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setTipo(t.val as any)}
                  className={`py-2 px-1 rounded-xl text-center font-semibold border transition ${
                    tipo === t.val
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                  }`}
                >
                  <span className="text-[10px] block leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Concepto / Origen:</label>
            <input
              type="text"
              required
              placeholder="Ej: Bono por desempeño, Trabajo freelance, Venta"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-emerald-500 text-foreground text-sm"
            />
          </div>

          {/* Monto y Selector de Moneda (Soles o Dólares) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="font-semibold text-foreground">Monto:</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-bold text-base"
              />
            </div>

            <div className="col-span-1 space-y-1.5">
              <label className="font-semibold text-foreground">Moneda:</label>
              <div className="grid grid-cols-2 gap-1 h-[42px]">
                <button
                  type="button"
                  onClick={() => setMoneda('PEN')}
                  className={`rounded-xl font-bold border transition ${
                    moneda === 'PEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-secondary/40 text-muted-foreground border-border'
                  }`}
                >
                  S/
                </button>
                <button
                  type="button"
                  onClick={() => setMoneda('USD')}
                  className={`rounded-xl font-bold border transition ${
                    moneda === 'USD'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'bg-secondary/40 text-muted-foreground border-border'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Conversión si es Dólares */}
          {moneda === 'USD' && montoNumero > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="font-bold">Conversión al Tipo de Cambio fijo: </span>
              ${montoNumero.toFixed(2)} USD × S/ {tipoCambio.toFixed(2)} ={' '}
              <strong className="text-white text-sm">S/ {montoSoles.toFixed(2)}</strong>
            </div>
          )}

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Fecha esperada / recibida:</label>
            <input
              type="date"
              required
              value={fechaEsperada}
              onChange={(e) => setFechaEsperada(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : '+ Guardar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
