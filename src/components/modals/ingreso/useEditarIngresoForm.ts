'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFinanzas } from '@/context/FinanzasContext';
import type { IngresoItem } from '@/components/dashboard/IngresoCardMobile';

export function useEditarIngresoForm(
  ingreso: IngresoItem | null,
  periodoActual: string,
  onClose: () => void
) {
  const { refresh } = useFinanzas();
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const [recibido, setRecibido] = useState(false);
  const [modoSueldo, setModoSueldo] = useState<'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO'>('ACTUAL');
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState(periodoActual);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ingreso) {
      setConcepto(ingreso.concepto || '');
      setMonto(String(ingreso.monto || ''));
      setRecibido(!!ingreso.recibido);
      setModoSueldo('ACTUAL');
      setPeriodoPersonalizado(periodoActual);

      if (ingreso.fechaEsperada) {
        const d = new Date(ingreso.fechaEsperada);
        if (!isNaN(d.getTime())) {
          setFecha(d.toISOString().slice(0, 10));
        } else {
          setFecha(`${periodoActual}-28`);
        }
      } else {
        setFecha(`${periodoActual}-28`);
      }
    }
  }, [ingreso, periodoActual]);

  const esSueldo = ingreso?.tipo === 'SUELDO';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingreso) return;

    const montoNum = parseFloat(monto);
    if (!concepto.trim() || isNaN(montoNum) || montoNum <= 0) {
      toast.error('Ingresa un concepto y un monto válido');
      return;
    }

    try {
      setSaving(true);
      if (esSueldo) {
        const res = await fetch('/api/usuarios/sueldo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nuevoSueldo: montoNum,
            modo: modoSueldo,
            periodoActual,
            periodoPersonalizado,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al actualizar sueldo');
        }

        if (recibido !== ingreso.recibido) {
          await fetch('/api/ingresos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ingreso.id, recibido }),
          });
        }
        toast.success('Sueldo actualizado exitosamente');
      } else {
        const res = await fetch('/api/ingresos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ingreso.id,
            concepto: concepto.trim(),
            monto: montoNum,
            fechaEsperada: fecha ? `${fecha}T12:00:00Z` : undefined,
            recibido,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al actualizar ingreso');
        }
        toast.success('Ingreso actualizado exitosamente');
      }

      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  return {
    concepto,
    setConcepto,
    monto,
    setMonto,
    fecha,
    setFecha,
    recibido,
    setRecibido,
    modoSueldo,
    setModoSueldo,
    periodoPersonalizado,
    setPeriodoPersonalizado,
    saving,
    esSueldo,
    handleSubmit,
  };
}
