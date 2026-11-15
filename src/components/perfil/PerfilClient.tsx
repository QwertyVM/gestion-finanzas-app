'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { PerfilHeaderCard } from './PerfilHeaderCard';
import { PerfilParametrosForm } from './PerfilParametrosForm';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function PerfilClient() {
  const { usuarioActual, refresh, periodo } = useFinanzas();

  const [nombre, setNombre] = useState('');
  const [sueldoBase, setSueldoBase] = useState('0');
  const [diaPago, setDiaPago] = useState('30');
  const [metaAhorro, setMetaAhorro] = useState('0');
  const [tipoCambio, setTipoCambio] = useState('3.40');
  const [moneda, setMoneda] = useState('S/');
  const [color, setColor] = useState('#2563eb');
  const [modoVigencia, setModoVigencia] = useState<'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO'>('ACTUAL');
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState(periodo || '2026-11');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (periodo) setPeriodoPersonalizado(periodo);
  }, [periodo]);

  useEffect(() => {
    if (usuarioActual) {
      setNombre(usuarioActual.nombre || '');
      setSueldoBase(String(usuarioActual.sueldoBaseMensual ?? 0));
      setDiaPago(String(usuarioActual.diaPagoSueldo || 30));
      setMetaAhorro(String(usuarioActual.metaAhorroMensual ?? 0));
      setTipoCambio(String(usuarioActual.tipoCambioUSD || 3.4));
      setMoneda(usuarioActual.monedaSimbolo || 'S/');
      setColor(usuarioActual.color || '#2563eb');
    }
  }, [usuarioActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioActual?.id) return;

    try {
      setGuardando(true);
      const parsedSueldo = parseFloat(sueldoBase);
      const parsedMeta = parseFloat(metaAhorro);

      let periodoDesde = periodo || '2026-11';
      if (modoVigencia === 'PROXIMO') {
        const [y, m] = periodoDesde.split('-').map(Number);
        const nextDate = new Date(y, m, 1);
        periodoDesde = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (modoVigencia === 'PERSONALIZADO') {
        periodoDesde = periodoPersonalizado || periodoDesde;
      }

      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuarioActual.id,
          nombre: nombre.trim(),
          sueldoBaseMensual: isNaN(parsedSueldo) ? 0 : parsedSueldo,
          diaPagoSueldo: parseInt(diaPago, 10) || 30,
          metaAhorroMensual: isNaN(parsedMeta) ? 0 : parsedMeta,
          tipoCambioUSD: parseFloat(tipoCambio) || 3.4,
          monedaSimbolo: moneda,
          color,
          periodoDesde,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      toast.success('¡Parámetros del perfil actualizados correctamente!');
      await refresh();
      // Recargar datos en ventana
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (!usuarioActual) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Mi Perfil
        </h1>
        <p className="text-xs text-muted-foreground">
          Información de tu cuenta, identidad y parámetros de cálculo financiero.
        </p>
      </div>

      <PerfilHeaderCard usuario={usuarioActual} />

      <PerfilParametrosForm
        nombre={nombre}
        sueldoBase={sueldoBase}
        diaPago={diaPago}
        metaAhorro={metaAhorro}
        tipoCambio={tipoCambio}
        moneda={moneda}
        color={color}
        guardando={guardando}
        modoVigencia={modoVigencia}
        periodoPersonalizado={periodoPersonalizado}
        periodoActual={periodo}
        onNombreChange={setNombre}
        onSueldoBaseChange={setSueldoBase}
        onDiaPagoChange={setDiaPago}
        onMetaAhorroChange={setMetaAhorro}
        onTipoCambioChange={setTipoCambio}
        onMonedaChange={setMoneda}
        onColorChange={setColor}
        onModoVigenciaChange={setModoVigencia}
        onPeriodoPersonalizadoChange={setPeriodoPersonalizado}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
