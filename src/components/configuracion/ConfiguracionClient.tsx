'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { Settings, CreditCard, DollarSign, Plus, PiggyBank, ArrowRightLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ConfiguracionClient() {
  const { resumen, refresh } = useFinanzas();
  const [sueldoBase, setSueldoBase] = useState('6000');
  const [tipoCambio, setTipoCambio] = useState('4.00');
  const [metaAhorro, setMetaAhorro] = useState('1000');
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
      setTipoCambio(String(resumen.config.tipoCambioUSD || '4.00'));
      setMetaAhorro(String(resumen.config.metaAhorroMensual || '1000'));
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
          tipoCambioUSD: parseFloat(tipoCambio),
          metaAhorroMensual: parseFloat(metaAhorro),
          diaPagoSueldo: parseInt(diaPago, 10),
        }),
      });

      if (!res.ok) throw new Error('Error al guardar configuración');
      toast.success('Ajustes guardados correctamente');
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

  const [deletingTarjetaId, setDeletingTarjetaId] = useState<string | null>(null);

  const handleEliminarTarjeta = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la tarjeta "${nombre}"?`)) return;
    try {
      setDeletingTarjetaId(id);
      const res = await fetch(`/api/tarjetas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la tarjeta');
      toast.success(`Tarjeta "${nombre}" eliminada exitosamente`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la tarjeta');
    } finally {
      setDeletingTarjetaId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" />
          <span>Ajustes Generales</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configuración de tu sueldo base, tipo de cambio fijo para compras en dólares, meta de ahorro y tarjetas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parámetros Financieros */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Sueldo, Tipo de Cambio & Ahorro</span>
          </h2>

          <form onSubmit={handleGuardarConfig} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Sueldo Base Mensual (S/):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={sueldoBase}
                onChange={(e) => setSueldoBase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" />
                  <span>Tipo de Cambio USD:</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tipoCambio}
                  onChange={(e) => setTipoCambio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
                />
                <span className="text-[10px] text-muted-foreground">Fijo en S/ 4.00</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Meta de Ahorro (S/):</span>
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={metaAhorro}
                  onChange={(e) => setMetaAhorro(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
                />
                <span className="text-[10px] text-muted-foreground">Reservado del disponible</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100/90 text-sky-900 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800/60 font-bold text-sm shadow-xs transition active:scale-98 disabled:opacity-50"
            >
              {savingConfig ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
          </form>
        </div>

        {/* Tarjetas de Crédito */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span>Tarjetas de Crédito & Corte</span>
          </h2>

          <div className="space-y-2">
            {resumen?.tarjetasCredito?.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <div>
                    <div className="font-bold text-foreground">{t.nombre}</div>
                    <div className="text-[11px] text-muted-foreground">{t.banco}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-sky-400 block">
                      Corte: Día {t.diaCorte}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Pago: Día {t.diaPago}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEliminarTarjeta(t.id, t.nombre)}
                    disabled={deletingTarjetaId === t.id}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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

            <input
              type="text"
              required
              placeholder="Nombre (ej. Interbank Amex Black)"
              value={nombreTarjeta}
              onChange={(e) => setNombreTarjeta(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
            />

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
                placeholder="Corte (10)"
                value={diaCorte}
                onChange={(e) => setDiaCorte(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none text-foreground"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Pago (30)"
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
