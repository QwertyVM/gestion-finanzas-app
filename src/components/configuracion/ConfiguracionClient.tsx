'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { Settings, CreditCard, DollarSign, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ConfiguracionClient() {
  const { resumen, refresh } = useFinanzas();
  const [sueldoBase, setSueldoBase] = useState('6000');
  const [moneda, setMoneda] = useState('S/');
  const [diaPago, setDiaPago] = useState('30');
  const [savingConfig, setSavingConfig] = useState(false);

  // Nueva tarjeta
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [banco, setBanco] = useState('BCP');
  const [ultimosCuatro, setUltimosCuatro] = useState('');
  const [diaCorte, setDiaCorte] = useState('10');
  const [diaPagoTarjeta, setDiaPagoTarjeta] = useState('30');
  const [color, setColor] = useState('#2563eb');
  const [savingTarjeta, setSavingTarjeta] = useState(false);

  useEffect(() => {
    if (resumen?.config) {
      setSueldoBase(String(resumen.config.sueldoBaseMensual));
      setMoneda(resumen.config.monedaSimbolo);
      setDiaPago(String(resumen.config.diaPagoSueldo));
    }
  }, [resumen]);

  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sueldoBaseMensual: parseFloat(sueldoBase),
          monedaSimbolo: moneda,
          diaPagoSueldo: parseInt(diaPago, 10),
        }),
      });

      if (!res.ok) throw new Error('Error al guardar configuración');
      toast.success('Configuración guardada correctamente');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCrearTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTarjeta.trim()) {
      toast.error('Ingresa el nombre de la tarjeta');
      return;
    }

    try {
      setSavingTarjeta(true);
      const res = await fetch('/api/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreTarjeta,
          banco,
          ultimosCuatro,
          diaCorte: parseInt(diaCorte, 10),
          diaPago: parseInt(diaPagoTarjeta, 10),
          color,
        }),
      });

      if (!res.ok) throw new Error('Error al crear tarjeta');
      toast.success('Tarjeta de crédito agregada');
      setNombreTarjeta('');
      setUltimosCuatro('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear tarjeta');
    } finally {
      setSavingTarjeta(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" />
          <span>Configuración de Finanzas</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ajusta tu sueldo base mensual habitual, moneda y administra tus tarjetas de crédito con su día de corte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parámetros de Sueldo y Moneda */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span>Sueldo & Moneda</span>
          </h2>

          <form onSubmit={handleGuardarConfig} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Sueldo Base Mensual Planilla:
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={sueldoBase}
                onChange={(e) => setSueldoBase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold text-sm"
              />
              <span className="text-[11px] text-muted-foreground block">
                Se usará como base para proyectar cada mes y para el cálculo de Gratificaciones (Julio y Diciembre).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Moneda:</label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                >
                  <option value="S/">Soles (S/)</option>
                  <option value="$">Dólares ($)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Día de Pago de Sueldo:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaPago}
                  onChange={(e) => setDiaPago(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow transition active:scale-98 disabled:opacity-50"
            >
              {savingConfig ? 'Guardando...' : 'Guardar Parámetros'}
            </button>
          </form>
        </div>

        {/* Tarjetas de Crédito Registradas */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <span>Tarjetas de Crédito ({resumen?.tarjetasCredito?.length || 0})</span>
          </h2>

          <div className="space-y-2">
            {resumen?.tarjetasCredito?.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <div>
                    <div className="font-bold text-foreground">{t.nombre}</div>
                    <div className="text-[11px] text-muted-foreground">{t.banco}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-sky-400 block">
                    Corte: Día {t.diaCorte}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Pago: Día {t.diaPago}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario Agregar Tarjeta */}
          <form onSubmit={handleCrearTarjeta} className="pt-3 border-t border-border space-y-3 text-xs">
            <h3 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-500" />
              <span>Agregar otra Tarjeta</span>
            </h3>

            <div className="space-y-1">
              <input
                type="text"
                required
                placeholder="Nombre (ej. Interbank Amex Black)"
                value={nombreTarjeta}
                onChange={(e) => setNombreTarjeta(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Banco (ej. BCP)"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Día Corte (10)"
                value={diaCorte}
                onChange={(e) => setDiaCorte(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Día Pago (30)"
                value={diaPagoTarjeta}
                onChange={(e) => setDiaPagoTarjeta(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={savingTarjeta}
              className="w-full py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border shadow-sm transition"
            >
              {savingTarjeta ? 'Guardando...' : '+ Registrar Tarjeta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
