'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ModalRegistrarGastoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalRegistrarGasto({ open, onClose }: ModalRegistrarGastoProps) {
  const { refresh, resumen } = useFinanzas();
  const configTc = resumen?.config?.tipoCambioUSD || 4.00;
  const tarjetas = resumen?.tarjetasCredito || [];

  const [concepto, setConcepto] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [tipoCambioInput, setTipoCambioInput] = useState(configTc.toString());
  const [fechaGasto, setFechaGasto] = useState(() => new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState<'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA'>('TARJETA_CREDITO');
  const [tarjetaId, setTarjetaId] = useState(() => tarjetas[0]?.id || '');
  const [totalCuotas, setTotalCuotas] = useState('1');
  const [estado, setEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO'>('PENDIENTE');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (resumen?.config?.tipoCambioUSD) {
      setTipoCambioInput(resumen.config.tipoCambioUSD.toString());
    }
  }, [resumen?.config?.tipoCambioUSD]);

  React.useEffect(() => {
    if (tarjetas.length > 0 && !tarjetaId) {
      setTarjetaId(tarjetas[0].id);
    }
  }, [tarjetas, tarjetaId]);

  const tcEfectivo = parseFloat(tipoCambioInput) > 0 ? parseFloat(tipoCambioInput) : configTc;
  const montoNumero = parseFloat(montoInput) || 0;
  const montoSoles = moneda === 'USD' ? Number((montoNumero * tcEfectivo).toFixed(2)) : montoNumero;

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
          tipoCambio: tcEfectivo,
          fechaGasto: new Date(`${fechaGasto}T12:00:00`),
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : undefined,
          totalCuotas: parseInt(totalCuotas, 10),
          estado,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar gasto');
      toast.success('Gasto registrado');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h2 className="text-sm font-semibold text-foreground">
            Registrar Gasto
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Concepto */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Concepto:</label>
            <input
              type="text"
              required
              placeholder="Ej: Supermercado, Almuerzo, Zapatillas"
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

          {/* Método de Pago */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Método de Pago:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA_CREDITO')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  metodoPago === 'TARJETA_CREDITO'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Tarjeta
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  metodoPago === 'EFECTIVO_DEBITO'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('TRANSFERENCIA')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  metodoPago === 'TRANSFERENCIA'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Transferencia
              </button>
            </div>
          </div>

          {metodoPago === 'TARJETA_CREDITO' && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Tarjeta:</label>
                  <select
                    value={tarjetaId}
                    onChange={(e) => setTarjetaId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
                  >
                    {tarjetas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} (Corte día {t.diaCorte})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Cuotas:</label>
                  <select
                    value={totalCuotas}
                    onChange={(e) => setTotalCuotas(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
                  >
                    <option value="1">1 cuota</option>
                    <option value="2">2 cuotas</option>
                    <option value="3">3 cuotas</option>
                    <option value="6">6 cuotas</option>
                    <option value="12">12 cuotas</option>
                  </select>
                </div>
              </div>

              {preview && (
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {preview.descripcionExplicativa}
                </p>
              )}
            </div>
          )}

          {/* Fecha */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Fecha:</label>
            <input
              type="date"
              required
              value={fechaGasto}
              onChange={(e) => setFechaGasto(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">Estado:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setEstado('PENDIENTE')}
                className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                  estado === 'PENDIENTE'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Pendiente
              </button>
              <button
                type="button"
                onClick={() => setEstado('ADELANTADO')}
                className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                  estado === 'ADELANTADO'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Adelantado
              </button>
              <button
                type="button"
                onClick={() => setEstado('PAGADO')}
                className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                  estado === 'PAGADO'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                Pagado
              </button>
            </div>
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
              {submitting ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
