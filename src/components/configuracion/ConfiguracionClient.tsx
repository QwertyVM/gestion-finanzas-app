'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  Settings,
  CreditCard,
  DollarSign,
  Plus,
  PiggyBank,
  ArrowRightLeft,
  Trash2,
  Pencil,
  Tag,
  Calendar,
  Layers,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoriaItem {
  id: string;
  nombre: string;
  icono: string | null;
  color: string | null;
  esFijo: boolean;
}

export function ConfiguracionClient() {
  const { resumen, refresh } = useFinanzas();
  const [sueldoBase, setSueldoBase] = useState('6000');
  const [tipoCambio, setTipoCambio] = useState('4.00');
  const [metaAhorro, setMetaAhorro] = useState('1000');
  const [diaPago, setDiaPago] = useState('30');
  const [savingConfig, setSavingConfig] = useState(false);

  // Tarjetas
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [banco, setBanco] = useState('BCP');
  const [ultimosCuatro, setUltimosCuatro] = useState('');
  const [diaCorte, setDiaCorte] = useState('10');
  const [diaPagoTarjeta, setDiaPagoTarjeta] = useState('30');
  const [colorTarjeta, setColorTarjeta] = useState('#2563eb');
  const [savingTarjeta, setSavingTarjeta] = useState(false);
  const [deletingTarjetaId, setDeletingTarjetaId] = useState<string | null>(null);
  const [editandoTarjeta, setEditandoTarjeta] = useState<any | null>(null);

  // Categorías
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [nombreCat, setNombreCat] = useState('');
  const [colorCat, setColorCat] = useState('#2563eb');
  const [esFijoCat, setEsFijoCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  useEffect(() => {
    if (resumen?.config) {
      setSueldoBase(String(resumen.config.sueldoBaseMensual));
      setTipoCambio(String(resumen.config.tipoCambioUSD || '4.00'));
      setMetaAhorro(String(resumen.config.metaAhorroMensual || '1000'));
      setDiaPago(String(resumen.config.diaPagoSueldo));
    }
  }, [resumen]);

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const res = await fetch('/api/categorias');
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategorias(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

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

  const handleGuardarTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTarjeta.trim()) {
      toast.error('Ingresa el nombre de la tarjeta');
      return;
    }

    try {
      setSavingTarjeta(true);
      if (editandoTarjeta) {
        const res = await fetch('/api/tarjetas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editandoTarjeta.id,
            nombre: nombreTarjeta.trim(),
            banco: banco.trim(),
            ultimosCuatro: ultimosCuatro.trim() || null,
            diaCorte: parseInt(diaCorte, 10),
            diaPago: parseInt(diaPagoTarjeta, 10),
            color: colorTarjeta,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar tarjeta');
        toast.success('Tarjeta actualizada');
        setEditandoTarjeta(null);
      } else {
        const res = await fetch('/api/tarjetas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombreTarjeta.trim(),
            banco: banco.trim(),
            ultimosCuatro: ultimosCuatro.trim() || null,
            diaCorte: parseInt(diaCorte, 10),
            diaPago: parseInt(diaPagoTarjeta, 10),
            color: colorTarjeta,
          }),
        });
        if (!res.ok) throw new Error('Error al crear tarjeta');
        toast.success('Tarjeta de crédito agregada');
      }

      setNombreTarjeta('');
      setUltimosCuatro('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar tarjeta');
    } finally {
      setSavingTarjeta(false);
    }
  };

  const handleEditarTarjeta = (t: any) => {
    setEditandoTarjeta(t);
    setNombreTarjeta(t.nombre);
    setBanco(t.banco);
    setUltimosCuatro(t.ultimosCuatro || '');
    setDiaCorte(String(t.diaCorte));
    setDiaPagoTarjeta(String(t.diaPago));
    setColorTarjeta(t.color || '#2563eb');
  };

  const handleCancelarEdicionTarjeta = () => {
    setEditandoTarjeta(null);
    setNombreTarjeta('');
    setUltimosCuatro('');
    setColorTarjeta('#2563eb');
  };

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

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCat.trim()) {
      toast.error('Ingresa el nombre de la categoría');
      return;
    }

    try {
      setSavingCat(true);
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreCat.trim(),
          color: colorCat,
          esFijo: esFijoCat,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar categoría');
      toast.success(`Categoría "${nombreCat}" agregada`);
      setNombreCat('');
      setEsFijoCat(false);
      await cargarCategorias();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar categoría');
    } finally {
      setSavingCat(false);
    }
  };

  const handleEliminarCategoria = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    try {
      setDeletingCatId(id);
      const res = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la categoría');
      toast.success(`Categoría "${nombre}" eliminada`);
      await cargarCategorias();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar categoría');
    } finally {
      setDeletingCatId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" />
          <span>Configuración Integral del Sistema</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ajustes de sueldo base, tipo de cambio USD, meta de ahorro, tarjetas de crédito y catálogo de categorías.
        </p>
      </div>

      {/* 1. SECCIÓN: PARÁMETROS FINANCIEROS */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>Sueldo Base, Tipo de Cambio & Meta de Ahorro</span>
        </h2>

        <form onSubmit={handleGuardarConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <span className="text-[10px] text-muted-foreground">Ingreso neto base proyectado</span>
            </div>

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
              <span className="text-[10px] text-muted-foreground">Fijo oficial para compras en $</span>
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
              <span className="text-[10px] text-muted-foreground">Monto reservado de ahorro</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Día de Pago Sueldo:</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={diaPago}
                onChange={(e) => setDiaPago(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
              />
              <span className="text-[10px] text-muted-foreground">Día mensual de abono (ej. 30)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
            >
              {savingConfig ? 'Guardando Ajustes...' : 'Guardar Parámetros Financieros'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. SECCIÓN: TABLA DE TARJETAS DE CRÉDITO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Tarjetas de Crédito Registradas</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Administración de tarjetas, fechas de facturación y días límite de pago.
            </p>
          </div>
        </div>

        {/* Tabla de Tarjetas */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Tarjeta / Nombre</th>
                  <th className="py-3 px-3">Banco</th>
                  <th className="py-3 px-3 text-center">Últimos 4 Dígitos</th>
                  <th className="py-3 px-3 text-center">Día Corte</th>
                  <th className="py-3 px-3 text-center">Día Pago</th>
                  <th className="py-3 px-3 text-center">Color Distintivo</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                {resumen?.tarjetasCredito && resumen.tarjetasCredito.length > 0 ? (
                  resumen.tarjetasCredito.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="py-3 px-3.5 border-l-4" style={{ borderLeftColor: t.color }}>
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span>{t.nombre}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                          {t.banco}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                        {t.ultimosCuatro ? `•••• ${t.ultimosCuatro}` : '—'}
                      </td>

                      <td className="py-3 px-3 text-center font-semibold text-sky-600 dark:text-sky-400">
                        Día {t.diaCorte}
                      </td>

                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        Día {t.diaPago}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className="inline-block w-4 h-4 rounded-full border border-border/80 shadow-xs"
                          style={{ backgroundColor: t.color }}
                          title={t.color}
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditarTarjeta(t)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                            title="Editar tarjeta"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarTarjeta(t.id, t.nombre)}
                            disabled={deletingTarjetaId === t.id}
                            className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No hay tarjetas de crédito configuradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario Agregar o Editar Tarjeta */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <form onSubmit={handleGuardarTarjeta} className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h3 className="font-bold text-foreground flex items-center gap-1.5">
                {editandoTarjeta ? <Pencil className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-sky-500" />}
                <span>{editandoTarjeta ? `Editar Tarjeta "${editandoTarjeta.nombre}"` : 'Registrar Nueva Tarjeta de Crédito'}</span>
              </h3>

              {editandoTarjeta && (
                <button
                  type="button"
                  onClick={handleCancelarEdicionTarjeta}
                  className="text-muted-foreground hover:text-foreground text-[11px] font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar edición
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Nombre de la Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Interbank Visa Signature"
                  value={nombreTarjeta}
                  onChange={(e) => setNombreTarjeta(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Banco Emisor</label>
                <input
                  type="text"
                  required
                  placeholder="ej. BCP, BBVA, Interbank"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Últimos 4 Dígitos</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="ej. 4589"
                  value={ultimosCuatro}
                  onChange={(e) => setUltimosCuatro(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Día Corte (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={diaCorte}
                  onChange={(e) => setDiaCorte(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Día Pago (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={diaPagoTarjeta}
                  onChange={(e) => setDiaPagoTarjeta(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Color Identificador:</label>
                <input
                  type="color"
                  value={colorTarjeta}
                  onChange={(e) => setColorTarjeta(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-muted-foreground">{colorTarjeta}</span>
              </div>

              <button
                type="submit"
                disabled={savingTarjeta}
                className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
              >
                {savingTarjeta ? 'Guardando...' : editandoTarjeta ? 'Actualizar Tarjeta' : '+ Registrar Tarjeta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. SECCIÓN: TABLA DE GESTIÓN DE CATEGORÍAS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Catálogo de Categorías de Gastos & Presupuestos</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Crea y clasifica tus categorías para etiquetar gastos fijos, recurrentes y variables.
            </p>
          </div>
        </div>

        {/* Tabla de Categorías */}
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Categoría</th>
                  <th className="py-3 px-3">Tipo Predeterminado</th>
                  <th className="py-3 px-3 text-center">Color Etiqueta</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                {loadingCategorias ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Cargando catálogo de categorías...
                    </td>
                  </tr>
                ) : categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="py-3 px-3.5 border-l-4" style={{ borderLeftColor: cat.color || '#2563eb' }}>
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <Tag className="w-3.5 h-3.5" style={{ color: cat.color || '#2563eb' }} />
                          <span>{cat.nombre}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {cat.esFijo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            Costo Fijo / Recurrente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Gasto Variable / Compra
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className="inline-block w-4 h-4 rounded-full border border-border/80 shadow-xs"
                          style={{ backgroundColor: cat.color || '#2563eb' }}
                          title={cat.color || '#2563eb'}
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                          disabled={deletingCatId === cat.id}
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No hay categorías registradas en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario Agregar Categoría */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <form onSubmit={handleCrearCategoria} className="space-y-3 text-xs">
            <h3 className="font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border/80">
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Registrar Nueva Categoría</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Entretenimiento, Educación, Mascotas"
                  value={nombreCat}
                  onChange={(e) => setNombreCat(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Color Identificador</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorCat}
                    onChange={(e) => setColorCat(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{colorCat}</span>
                </div>
              </div>

              <div className="space-y-1 flex flex-col justify-center">
                <label className="text-[11px] font-semibold text-muted-foreground">Naturaleza del Egreso</label>
                <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={esFijoCat}
                    onChange={(e) => setEsFijoCat(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-border focus:ring-sky-500"
                  />
                  <span className="text-xs text-foreground font-semibold">Es Costo Fijo / Suscripción</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingCat}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
              >
                {savingCat ? 'Registrando...' : '+ Registrar Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
