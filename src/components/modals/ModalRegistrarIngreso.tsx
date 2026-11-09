'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ModalRegistrarIngresoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalRegistrarIngreso({ open, onClose }: ModalRegistrarIngresoProps) {
  const { periodo, refresh, resumen } = useFinanzas();
  const configTc = resumen?.config?.tipoCambioUSD || 4.00;

  const [concepto, setConcepto] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [tipoCambioInput, setTipoCambioInput] = useState(configTc.toString());
  const [tipo, setTipo] = useState<'SUELDO' | 'GRATIFICACION' | 'UTILIDADES' | 'EXTRA'>('EXTRA');
  const [fechaEsperada, setFechaEsperada] = useState(() => `${periodo}-28`);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (resumen?.config?.tipoCambioUSD) {
      setTipoCambioInput(resumen.config.tipoCambioUSD.toString());
    }
  }, [resumen?.config?.tipoCambioUSD]);

  if (!open) return null;

  const tcEfectivo = parseFloat(tipoCambioInput) > 0 ? parseFloat(tipoCambioInput) : configTc;
  const montoNumero = parseFloat(montoInput) || 0;
  const montoSoles = moneda === 'USD' ? Number((montoNumero * tcEfectivo).toFixed(2)) : montoNumero;

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
          tipoCambio: tcEfectivo,
          fechaEsperada: new Date(`${fechaEsperada}T12:00:00`),
          recibido: true,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar ingreso');
      toast.success('Ingreso registrado');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h2 className="text-sm font-semibold text-foreground">
            Registrar Ingreso
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Tipo de Ingreso */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Tipo:</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { val: 'EXTRA', label: 'Extra' },
                { val: 'SUELDO', label: 'Sueldo' },
                { val: 'GRATIFICACION', label: 'Grati' },
                { val: 'UTILIDADES', label: 'Utilidades' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setTipo(t.val as any)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-medium border transition text-center ${
                    tipo === t.val
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Concepto:</label>
            <input
              type="text"
              required
              placeholder="Ej: Freelance, Bono, Venta"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          {/* Monto y Selector de Moneda */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="font-medium text-muted-foreground">Monto:</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
              />
            </div>

            <div className="col-span-1 space-y-1">
              <label className="font-medium text-muted-foreground">Moneda:</label>
              <div className="grid grid-cols-2 gap-1 h-[30px]">
                <button
                  type="button"
                  onClick={() => setMoneda('PEN')}
                  className={`rounded-lg font-medium border text-xs transition ${
                    moneda === 'PEN'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  S/
                </button>
                <button
                  type="button"
                  onClick={() => setMoneda('USD')}
                  className={`rounded-lg font-medium border text-xs transition ${
                    moneda === 'USD'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          {moneda === 'USD' && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Tipo de Cambio (T.C.):</span>
                <input
                  type="number"
                  step="0.01"
                  value={tipoCambioInput}
                  onChange={(e) => setTipoCambioInput(e.target.value)}
                  className="w-16 px-2 py-0.5 text-right font-mono text-foreground text-xs bg-background border border-border rounded outline-none"
                />
              </div>
              {montoNumero > 0 && (
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex justify-between">
                  <span>Equivalente:</span>
                  <span className="font-mono font-medium text-foreground">S/ {montoSoles.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Fecha */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Fecha:</label>
            <input
              type="date"
              required
              value={fechaEsperada}
              onChange={(e) => setFechaEsperada(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
