'use client';

import React, { useState, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import { toast } from 'sonner';
import { FijoFormFields } from './FijoFormFields';
import { getCurrentPeriodo, formatPeriodoLabel } from '@/lib/utils';

interface TarjetaItem {
  id: string;
  nombre: string;
  banco?: string;
  diaCorte?: number;
}

interface ModalEditarFijoProps {
  costoFijo: any | null;
  onClose: () => void;
  periodo: string;
  configTc: number;
  moneda: string;
  tarjetas: TarjetaItem[];
  onSuccess: () => Promise<void>;
}

export function ModalEditarFijo({
  costoFijo,
  onClose,
  periodo,
  configTc,
  tarjetas,
  onSuccess,
}: ModalEditarFijoProps) {
  const [concepto, setConcepto] = useState('');
  const [monedaItem, setMonedaItem] = useState<'PEN' | 'USD'>('PEN');
  const [monto, setMonto] = useState('');
  const [montoUSD, setMontoUSD] = useState('');
  const [tc, setTc] = useState(configTc.toString());
  const [mesDesde, setMesDesde] = useState(periodo);
  const [mesFin, setMesFin] = useState('');
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO_DEBITO' | 'TRANSFERENCIA' | 'TARJETA_CREDITO'>('EFECTIVO_DEBITO');
  const [tarjetaId, setTarjetaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tag, setTag] = useState('');
  const [categorias, setCategorias] = useState<Array<{ id: string; nombre: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategorias(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (costoFijo) {
      setConcepto(costoFijo.concepto || '');
      setMonedaItem(costoFijo.monedaOriginal === 'USD' ? 'USD' : 'PEN');
      if (costoFijo.monedaOriginal === 'USD') {
        setMontoUSD(costoFijo.montoOriginal?.toString() || '');
        setTc(costoFijo.tipoCambio?.toString() || configTc.toString());
        setMonto(costoFijo.monto?.toString() || '');
      } else {
        setMonto(costoFijo.monto?.toString() || '');
        setMontoUSD('');
        setTc(configTc.toString());
      }
      const targetMetodo = costoFijo.metodoPago || 'EFECTIVO_DEBITO';
      const targetTarjetaId = costoFijo.tarjetaId || (tarjetas[0]?.id || '');
      const tarjetaSeleccionada = tarjetas.find((t) => t.id === targetTarjetaId);

      let mesInicioDefault = periodo;
      const hoy = new Date();
      const currentPeriod = getCurrentPeriodo();

      // Si el gasto se paga con tarjeta de crédito y hoy ya pasó el día de corte (ej. día 10),
      // la facturación del periodo actual ya cerró, por lo que el cambio no puede ser retroactivo
      // y debe entrar en vigencia a partir del siguiente mes.
      if (targetMetodo === 'TARJETA_CREDITO') {
        const diaCorte = tarjetaSeleccionada?.diaCorte || 10;
        if (periodo <= currentPeriod && hoy.getDate() > diaCorte) {
          const prox = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
          mesInicioDefault = `${prox.getFullYear()}-${String(prox.getMonth() + 1).padStart(2, '0')}`;
        }
      }

      setMesDesde(mesInicioDefault);
      setMesFin(costoFijo.mesFin || '');
      setMetodoPago(targetMetodo);
      setTarjetaId(targetTarjetaId);
      setCategoriaId(costoFijo.categoriaId || '');
      setTag(costoFijo.tag || '');
    }
  }, [costoFijo, periodo, configTc, tarjetas]);

  if (!costoFijo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let montoFinal = parseFloat(monto) || 0;
      let montoOriginalFinal: number | null = null;
      let tcFinal: number | null = null;

      if (monedaItem === 'USD') {
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

      const res = await fetch('/api/fijos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: costoFijo.id,
          concepto,
          monto: montoFinal,
          monedaOriginal: monedaItem,
          montoOriginal: montoOriginalFinal,
          tipoCambio: tcFinal,
          diaVencimiento: 30,
          mesDesde,
          mesFin: mesFin || null,
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : null,
          categoriaId: categoriaId || null,
          tag: tag ? tag.trim() : null,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar costo fijo');
      toast.success('Costo fijo actualizado');
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
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Home className="w-5 h-5 text-sky-500" />
            <span>Editar Costo Fijo</span>
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
            moneda={monedaItem}
            setMoneda={setMonedaItem}
            monto={monto}
            setMonto={setMonto}
            montoUSD={montoUSD}
            setMontoUSD={setMontoUSD}
            tc={tc}
            setTc={setTc}
            configTc={configTc}
            mesInicio={mesDesde}
            setMesInicio={setMesDesde}
            mesFin={mesFin}
            setMesFin={setMesFin}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            tarjetaId={tarjetaId}
            setTarjetaId={setTarjetaId}
            tarjetas={tarjetas}
            categoriaId={categoriaId}
            setCategoriaId={setCategoriaId}
            tag={tag}
            setTag={setTag}
            categorias={categorias}
          />

          {metodoPago === 'TARJETA_CREDITO' && mesDesde > periodo && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
              💡 <strong>Corte de facturación cerrado:</strong> El corte de tarjeta de {formatPeriodoLabel(periodo)} ya cerró (día {tarjetas.find((t) => t.id === tarjetaId)?.diaCorte || 10}). Por tanto, el cambio no es retroactivo y comenzará a regir en <strong>{formatPeriodoLabel(mesDesde)}</strong>.
            </div>
          )}

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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
