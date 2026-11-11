'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X, Lock } from 'lucide-react';
import { MonthYearPicker } from '@/components/common/MonthYearPicker';
import { formatPeriodoLabel } from '@/lib/utils';
import { toast } from 'sonner';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Pencil className="w-5 h-5 text-purple-500" />
            <span>Editar Condiciones del Préstamo</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso No Retroactivo */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-purple-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Edición No Retroactiva Garantizada</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Este ajuste solo afectará las cuotas pendientes a partir de {formatPeriodoLabel(mesDesde)}. Los pagos de meses anteriores y los pagos ya confirmados permanecen intactos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Banco:
              </label>
              <input
                type="text"
                required
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Concepto:
              </label>
              <input
                type="text"
                required
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Monto Total del Préstamo (S/):
              </label>
              <input
                type="number"
                step="0.01"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                placeholder="ej. 55000"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-mono font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">
                  Cuotas Totales:
                </label>
                <span className="text-[10px] text-purple-400 font-medium">
                  {Math.max(0, (parseInt(cuotasTotales, 10) || 0) - (parseInt(cuotaActual, 10) || 1))} restantes
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="360"
                required
                value={cuotasTotales}
                onChange={(e) => setCuotasTotales(e.target.value)}
                placeholder="ej. 24"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-mono font-bold"
              />
            </div>
          </div>

          {/* Cuota actual (cuántas voy pagando este mes) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Cuota Actual (la que vas pagando este mes):
              </label>
              <span className="text-[10px] text-muted-foreground">
                Mes: {mesDesde}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={cuotasTotales || "360"}
              required
              value={cuotaActual}
              onChange={(e) => setCuotaActual(e.target.value)}
              placeholder="ej. 23"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-mono font-bold"
            />
          </div>

          {/* Selector de Moneda en Edición */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">
                Moneda de la Cuota:
              </label>
              <span className="text-[10px] text-muted-foreground">
                Se liquida en Soles
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMoneda('PEN')}
                className={`py-1.5 px-3 rounded-xl font-bold border transition ${moneda === 'PEN'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground border-border'
                  }`}
              >
                S/ Soles (PEN)
              </button>
              <button
                type="button"
                onClick={() => setMoneda('USD')}
                className={`py-1.5 px-3 rounded-xl font-bold border transition ${moneda === 'USD'
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
                Nueva Cuota Mensual (S/):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={montoCuota}
                onChange={(e) => setMontoCuota(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-bold"
              />
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
              <div className="grid grid-cols-2 gap-2">
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
                <span className="text-muted-foreground">Nueva cuota en soles:</span>
                <div className="font-extrabold text-foreground">
                  ={' '}
                  <span className="text-amber-500 text-sm">
                    S/ {((parseFloat(cuotaUSD) || 0) * (parseFloat(tc) || configTc)).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">
                    en cuotas futuras
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Tasa TEA (%):
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
                Aplica desde este mes:
              </label>
              <MonthYearPicker
                value={mesDesde}
                onChange={setMesDesde}
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
              {loading ? 'Guardando...' : 'Aplicar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
