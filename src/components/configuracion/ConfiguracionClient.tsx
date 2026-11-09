'use client';

import React, { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  Trash2,
  Pencil,
  Plus,
  X,
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

      if (!res.ok) throw new Error('Error al guardar ajustes');
      toast.success('Parámetros actualizados');
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
            ultimosCuatro: ultimosCuatro.trim() || undefined,
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
            ultimosCuatro: ultimosCuatro.trim() || undefined,
            diaCorte: parseInt(diaCorte, 10),
            diaPago: parseInt(diaPagoTarjeta, 10),
            color: colorTarjeta,
          }),
        });
        if (!res.ok) throw new Error('Error al crear tarjeta');
        toast.success('Tarjeta agregada');
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
    if (!confirm(`¿Eliminar la tarjeta "${nombre}"?`)) return;
    try {
      setDeletingTarjetaId(id);
      const res = await fetch(`/api/tarjetas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la tarjeta');
      toast.success(`Tarjeta eliminada`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
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
      toast.success(`Categoría agregada`);
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
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success(`Categoría eliminada`);
      await cargarCategorias();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeletingCatId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Configuración
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sueldo base, tipo de cambio USD, meta de ahorro y tarjetas.
        </p>
      </div>

      {/* 1. PARÁMETROS FINANCIEROS */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Parámetros Base
        </h2>

        <form onSubmit={handleGuardarConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">
                Sueldo Base Mensual (S/):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={sueldoBase}
                onChange={(e) => setSueldoBase(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">
                Tipo de Cambio USD:
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">
                Meta de Ahorro (S/):
              </label>
              <input
                type="number"
                step="50"
                required
                value={metaAhorro}
                onChange={(e) => setMetaAhorro(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono font-medium text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">
                Día Pago Sueldo:
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={diaPago}
                onChange={(e) => setDiaPago(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingConfig}
              className="py-1.5 px-4 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50"
            >
              {savingConfig ? 'Guardando...' : 'Guardar Parámetros'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. TARJETAS DE CRÉDITO */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tarjetas de Crédito
        </h2>

        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Tarjeta</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Banco</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Dígitos</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Día Corte</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Día Pago</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Color</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {resumen?.tarjetasCredito && resumen.tarjetasCredito.length > 0 ? (
                  resumen.tarjetasCredito.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {t.nombre}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {t.banco}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                        {t.ultimosCuatro ? `•••• ${t.ultimosCuatro}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        Día {t.diaCorte}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        Día {t.diaPago}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: t.color }}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditarTarjeta(t)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                            title="Editar tarjeta"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarTarjeta(t.id, t.nombre)}
                            disabled={deletingTarjetaId === t.id}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 transition"
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
                    <td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">
                      No hay tarjetas configuradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario Tarjeta */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
          <form onSubmit={handleGuardarTarjeta} className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-medium text-foreground text-xs">
                {editandoTarjeta ? `Editar "${editandoTarjeta.nombre}"` : 'Nueva Tarjeta'}
              </span>
              {editandoTarjeta && (
                <button
                  type="button"
                  onClick={handleCancelarEdicionTarjeta}
                  className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Visa Signature"
                  value={nombreTarjeta}
                  onChange={(e) => setNombreTarjeta(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Banco</label>
                <input
                  type="text"
                  required
                  placeholder="ej. BCP, BBVA"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Últimos 4 Dígitos</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="ej. 4589"
                  value={ultimosCuatro}
                  onChange={(e) => setUltimosCuatro(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Día Corte</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={diaCorte}
                  onChange={(e) => setDiaCorte(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Día Pago</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={diaPagoTarjeta}
                  onChange={(e) => setDiaPagoTarjeta(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-muted-foreground text-xs">Color:</label>
                <input
                  type="color"
                  value={colorTarjeta}
                  onChange={(e) => setColorTarjeta(e.target.value)}
                  className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={savingTarjeta}
                className="py-1.5 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50"
              >
                {savingTarjeta ? 'Guardando...' : editandoTarjeta ? 'Actualizar Tarjeta' : '+ Agregar Tarjeta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. CATEGORÍAS */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Catálogo de Categorías
        </h2>

        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Tipo</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Color</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loadingCategorias ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {cat.nombre}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {cat.esFijo ? 'Fijo / Recurrente' : 'Variable / Compra'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: cat.color || '#2563eb' }}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                          disabled={deletingCatId === cat.id}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                      No hay categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario Categoría */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
          <form onSubmit={handleCrearCategoria} className="space-y-3 text-xs">
            <span className="font-medium text-foreground text-xs block pb-1 border-b border-border/60">
              Nueva Categoría
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Alimentación, Transporte"
                  value={nombreCat}
                  onChange={(e) => setNombreCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorCat}
                    onChange={(e) => setColorCat(e.target.value)}
                    className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{colorCat}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-1.5">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esFijoCat}
                    onChange={(e) => setEsFijoCat(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border"
                  />
                  <span className="text-xs text-muted-foreground">Es Costo Fijo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingCat}
                className="py-1.5 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50"
              >
                {savingCat ? 'Guardando...' : '+ Agregar Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
