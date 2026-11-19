'use client';

import React, { useState, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import { toast } from 'sonner';
import { FijoFormFields } from './FijoFormFields';

interface TarjetaItem {
  id: string;
  nombre: string;
  banco?: string;
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
      setMesDesde(periodo);
      setMesFin(costoFijo.mesFin || '');
      setMetodoPago(costoFijo.metodoPago || 'EFECTIVO_DEBITO');
      setTarjetaId(costoFijo.tarjetaId || (tarjetas[0]?.id || ''));
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
