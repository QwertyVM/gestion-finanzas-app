'use client';

import React, { useState } from 'react';
import { Home, X } from 'lucide-react';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { toast } from 'sonner';

interface ModalCrearFijoProps {
  open: boolean;
  onClose: () => void;
  periodo: string;
  configTc: number;
  tarjetas: any[];
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
    let montoFinalSoles = parseFloat(monto);
    let conceptoFinal = concepto.trim();
    let notasFinal: string | null = null;

    if (moneda === 'USD') {
      const usdVal = parseFloat(montoUSD);
      const tcVal = parseFloat(tc) || configTc;
      if (isNaN(usdVal) || usdVal <= 0) {
        toast.error('Ingresa un monto en dólares válido');
        return;
      }
      montoFinalSoles = Number((usdVal * tcVal).toFixed(2));
      notasFinal = `USD: $${usdVal} | TC: S/ ${tcVal}`;
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdVal} USD)`;
      }
    }

    if (!conceptoFinal || isNaN(montoFinalSoles) || montoFinalSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/fijos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: conceptoFinal,
          monto: montoFinalSoles,
          diaVencimiento: 30,
          periodo,
          mesInicio: mesInicio || periodo,
          mesFin: mesFin.trim() || null,
          notas: notasFinal,
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Home className="w-5 h-5 text-sky-500" />
            <span>Nuevo Costo Fijo Recurrente</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Concepto (ej. Alquiler, Internet, Gimnasio):
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Internet Fibra Óptica"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
            />
          </div>

          {/* Selector de Moneda */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Moneda de Facturación:
              </label>
              <span className="text-[10px] text-muted-foreground">
                Se paga en Soles de tu presupuesto
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoneda('PEN')}
                className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                  moneda === 'PEN'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-xs'
                    : 'bg-secondary/40 text-muted-foreground border-border'
                }`}
              >
                S/ Soles (PEN)
              </button>
              <button
                type="button"
                onClick={() => setMoneda('USD')}
                className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                  moneda === 'USD'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                    : 'bg-secondary/40 text-muted-foreground border-border'
                }`}
              >
                $ Dólares (USD)
              </button>
            </div>
          </div>

          {moneda === 'PEN' ? (
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Monto Mensual (S/):
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
              />
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-500">Monto USD ($):</span>
                  <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                    <span className="text-xs font-bold text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="3.96"
                      value={montoUSD}
                      onChange={(e) => setMontoUSD(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                <div className="col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
                  <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                    <span className="text-xs font-bold text-muted-foreground">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      value={tc}
                      onChange={(e) => setTc(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Conversión automática:</span>
                <div className="font-extrabold text-foreground">
                  ={' '}
                  <span className="text-amber-500 text-sm">
                    S/ {((parseFloat(montoUSD) || 0) * (parseFloat(tc) || configTc)).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">
                    al mes en soles
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Mes de Inicio:
              </label>
              <MonthYearPicker
                value={mesInicio}
                onChange={setMesInicio}
                accentColor="sky"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Mes de Fin (opcional):
              </label>
              <MonthYearPicker
                value={mesFin}
                onChange={setMesFin}
                accentColor="sky"
                optional
              />
            </div>
          </div>

          {/* Selector de Forma de Pago */}
          <div className="space-y-1.5 pt-1">
            <label className="font-semibold text-foreground">
              Forma de Pago:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                className={`py-1.5 px-2 rounded-xl font-bold border transition text-center ${
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
                className={`py-1.5 px-2 rounded-xl font-bold border transition text-center ${
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
                className={`py-1.5 px-2 rounded-xl font-bold border transition text-center ${
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
                      {t.nombre} ({t.banco})
                    </option>
                  ))
                ) : (
                  <option value="">No hay tarjetas registradas</option>
                )}
              </select>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Costo Fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
