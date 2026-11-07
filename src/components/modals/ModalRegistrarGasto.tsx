'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import {
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  X,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ModalRegistrarGastoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalRegistrarGasto({ open, onClose }: ModalRegistrarGastoProps) {
  const { refresh, resumen } = useFinanzas();
  const tipoCambio = resumen?.config?.tipoCambioUSD || 4.00;
  const tarjetas = resumen?.tarjetasCredito || [];

  const [concepto, setConcepto] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [fechaGasto, setFechaGasto] = useState(() => new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState<'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA'>('TARJETA_CREDITO');
  const [tarjetaId, setTarjetaId] = useState(() => tarjetas[0]?.id || '');
  const [totalCuotas, setTotalCuotas] = useState('1');
  const [estado, setEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO'>('PENDIENTE');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (tarjetas.length > 0 && !tarjetaId) {
      setTarjetaId(tarjetas[0].id);
    }
  }, [tarjetas, tarjetaId]);

  const montoNumero = parseFloat(montoInput) || 0;
  const montoSoles = moneda === 'USD' ? montoNumero * tipoCambio : montoNumero;

  // Previsualización de corte (Día 10)
  const preview = useMemo(() => {
    if (metodoPago !== 'TARJETA_CREDITO') return null;
    const tarjeta = tarjetas.find((t) => t.id === tarjetaId);
    const diaCorte = tarjeta?.diaCorte || 10;
    const diaPago = tarjeta?.diaPago || 30;
    const res = calcularPeriodoFacturacion(new Date(`${fechaGasto}T12:00:00`), diaCorte, diaPago);
    const cuotasNum = parseInt(totalCuotas, 10) || 1;
    const periodosCuotas = cuotasNum > 1 ? calcularCuotasPeriodos(res.periodoPago, cuotasNum) : [];

    return {
      ...res,
      cuotasNum,
      periodosCuotas,
    };
  }, [metodoPago, tarjetaId, fechaGasto, totalCuotas, tarjetas]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || montoNumero <= 0) {
      toast.error('Ingresa un concepto y un monto válido');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          monto: montoSoles,
          monedaOriginal: moneda,
          montoOriginal: moneda === 'USD' ? montoNumero : null,
          tipoCambio,
          fechaGasto: new Date(`${fechaGasto}T12:00:00`),
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : undefined,
          totalCuotas: parseInt(totalCuotas, 10),
          estado,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar gasto');
      toast.success('Gasto registrado exitosamente');
      onClose();
      setConcepto('');
      setMontoInput('');
      setTotalCuotas('1');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-foreground">Registrar Nuevo Gasto / Compra</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Concepto */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">¿En qué gastaste?:</label>
            <input
              type="text"
              required
              placeholder="Ej: Supermercado Wong, Cena, Zapatillas, Gasolina"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-rose-500 text-foreground text-sm"
            />
          </div>

          {/* Monto y Selector de Moneda */}
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
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-rose-500 text-foreground font-bold text-base"
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
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
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
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <span className="font-bold">Conversión al T.C. fijo: </span>
              ${montoNumero.toFixed(2)} USD × S/ {tipoCambio.toFixed(2)} ={' '}
              <strong className="text-white text-sm">S/ {montoSoles.toFixed(2)}</strong>
            </div>
          )}

          {/* Método de Pago */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">¿Cómo lo pagaste?:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA_CREDITO')}
                className={`py-2 px-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                  metodoPago === 'TARJETA_CREDITO'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Tarjeta Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                className={`py-2 px-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                  metodoPago === 'EFECTIVO_DEBITO'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[11px]">Efectivo/Débito</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('TRANSFERENCIA')}
                className={`py-2 px-2 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                  metodoPago === 'TRANSFERENCIA'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="text-[11px]">Transferencia</span>
              </button>
            </div>
          </div>

          {/* Fecha y Tarjeta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Fecha de la compra:</label>
              <input
                type="date"
                required
                value={fechaGasto}
                onChange={(e) => setFechaGasto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none text-foreground"
              />
            </div>

            {metodoPago === 'TARJETA_CREDITO' ? (
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Tarjeta:</label>
                <select
                  value={tarjetaId}
                  onChange={(e) => setTarjetaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                >
                  {tarjetas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} (Corte día {t.diaCorte})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Estado inicial:</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                >
                  <option value="PENDIENTE">⏳ Pendiente</option>
                  <option value="ADELANTADO">⚡ Adelantado</option>
                  <option value="PAGADO">✅ Pagado</option>
                </select>
              </div>
            )}
          </div>

          {/* Cuotas si es Tarjeta */}
          {metodoPago === 'TARJETA_CREDITO' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Cuotas:</label>
                  <select
                    value={totalCuotas}
                    onChange={(e) => setTotalCuotas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                  >
                    <option value="1">1 cuota (directo)</option>
                    <option value="2">2 cuotas</option>
                    <option value="3">3 cuotas</option>
                    <option value="6">6 cuotas</option>
                    <option value="12">12 cuotas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Estado:</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                  >
                    <option value="PENDIENTE">⏳ Pendiente</option>
                    <option value="ADELANTADO">⚡ Adelantado</option>
                    <option value="PAGADO">✅ Pagado</option>
                  </select>
                </div>
              </div>

              {/* AVISO CLARO DE FACTURACIÓN (DÍA 10) */}
              {preview && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Lógica de Facturación Automática (Día 10):</span>
                  </div>
                  <p>{preview.descripcionExplicativa}</p>
                </div>
              )}
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : '- Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
