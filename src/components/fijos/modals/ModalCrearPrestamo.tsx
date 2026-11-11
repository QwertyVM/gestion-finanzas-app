'use client';

import React, { useState } from 'react';
import { Landmark, X } from 'lucide-react';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { toast } from 'sonner';

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
  const [periodoInicio, setPeriodoInicio] = useState(periodo);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cuotaSoles = parseFloat(montoCuota);
    let totalSoles = montoTotal ? parseFloat(montoTotal) : 0;
    let conceptoFinal = concepto.trim();
    const cuotasTot = parseInt(cuotasTotales, 10) || 12;

    if (moneda === 'USD') {
      const usdCuota = parseFloat(cuotaUSD);
      const tcVal = parseFloat(tc) || configTc;
      if (isNaN(usdCuota) || usdCuota <= 0) {
        toast.error('Ingresa la cuota en dólares');
        return;
      }
      cuotaSoles = Number((usdCuota * tcVal).toFixed(2));
      const usdTotal = parseFloat(totalUSD) || (usdCuota * cuotasTot);
      totalSoles = Number((usdTotal * tcVal).toFixed(2));
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdCuota} USD)`;
      }
    } else {
      if (!totalSoles) totalSoles = cuotaSoles * cuotasTot;
    }

    if (!conceptoFinal || isNaN(cuotaSoles) || cuotaSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/prestamos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banco,
          concepto: conceptoFinal,
          montoTotal: totalSoles,
          montoCuota: cuotaSoles,
          cuotasTotales: cuotasTot,
          cuotaInicial: parseInt(cuotaInicial, 10) || 1,
          diaPago: 30,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-500" />
            <span>Registrar Nuevo Préstamo Bancario</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Banco / Entidad:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: BCP, Interbank, BBVA"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Concepto / Descripción:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Préstamo Personal"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>
          </div>

          {/* Selector de Moneda */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Moneda del Préstamo:
              </label>
              <span className="text-[10px] text-muted-foreground">
                Se liquida en Soles
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoneda('PEN')}
                className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                  moneda === 'PEN'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-xs'
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Monto Cuota Mensual (S/):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={montoCuota}
                  onChange={(e) => setMontoCuota(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Monto Total Financiado (S/):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={montoTotal}
                  onChange={(e) => setMontoTotal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-500">Cuota USD ($):</span>
                  <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                    <span className="text-xs font-bold text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="900"
                      value={cuotaUSD}
                      onChange={(e) => setCuotaUSD(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                <div className="col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-500">Total USD ($):</span>
                  <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                    <span className="text-xs font-bold text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Opcional"
                      value={totalUSD}
                      onChange={(e) => setTotalUSD(e.target.value)}
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
                <span className="text-muted-foreground">Cuota calculada en soles:</span>
                <div className="font-extrabold text-foreground">
                  ={' '}
                  <span className="text-amber-500 text-sm">
                    S/ {((parseFloat(cuotaUSD) || 0) * (parseFloat(tc) || configTc)).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">
                    por mes
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Cuotas Totales:
              </label>
              <input
                type="number"
                min="1"
                required
                value={cuotasTotales}
                onChange={(e) => setCuotasTotales(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Inicia en Cuota:
              </label>
              <input
                type="number"
                min="1"
                required
                value={cuotaInicial}
                onChange={(e) => setCuotaInicial(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Tasa TEA (% anual):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={tea}
                onChange={(e) => setTea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Mes en que empieza a pagar:
              </label>
              <MonthYearPicker
                value={periodoInicio}
                onChange={setPeriodoInicio}
                accentColor="purple"
                required
              />
            </div>
          </div>

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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
