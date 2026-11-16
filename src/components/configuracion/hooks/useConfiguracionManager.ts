'use client';

import { useState, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { toast } from 'sonner';

export interface CategoriaItem {
  id: string;
  nombre: string;
  color?: string | null;
  esFijo?: boolean;
  _count?: {
    costosFijos: number;
    gastos: number;
  };
}

export function useConfiguracionManager() {
  const { resumen, periodo, refresh, usuarioActual } = useFinanzas();

  // 1. Parámetros Base
  const [sueldoBase, setSueldoBase] = useState('6000');
  const [modoSueldoVigencia, setModoSueldoVigencia] = useState<'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO'>('ACTUAL');
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState(periodo || '2026-11');
  const [tipoCambio, setTipoCambio] = useState('4.00');
  const [metaAhorro, setMetaAhorro] = useState('1000');
  const [diaPago, setDiaPago] = useState('30');
  const [savingConfig, setSavingConfig] = useState(false);

  // 2. Seguridad & PIN
  const [pinActual, setPinActual] = useState('');
  const [nuevoPin, setNuevoPin] = useState('');
  const [confirmarNuevoPin, setConfirmarNuevoPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  // 3. Categorías
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [nombreCat, setNombreCat] = useState('');
  const [colorCat, setColorCat] = useState('#2563eb');
  const [esFijoCat, setEsFijoCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [editandoCat, setEditandoCat] = useState<CategoriaItem | null>(null);

  useEffect(() => {
    if (resumen?.config) {
      setSueldoBase(resumen.config.sueldoBaseMensual.toString());
      setTipoCambio(resumen.config.tipoCambioUSD.toString());
      setMetaAhorro(resumen.config.metaAhorroMensual.toString());
      setDiaPago((resumen.config.diaPagoSueldo || 30).toString());
    }
  }, [resumen]);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const url = usuarioActual?.id ? `/api/categorias?usuarioId=${usuarioActual.id}` : '/api/categorias';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, [usuarioActual?.id]);

  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      let periodoInicioSueldo = periodo;
      if (modoSueldoVigencia === 'PROXIMO') {
        const [y, m] = periodo.split('-').map(Number);
        const nextMonth = m === 12 ? 1 : m + 1;
        const nextYear = m === 12 ? y + 1 : y;
        periodoInicioSueldo = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
      } else if (modoSueldoVigencia === 'PERSONALIZADO') {
        periodoInicioSueldo = periodoPersonalizado;
      }

      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sueldoBaseMensual: parseFloat(sueldoBase),
          periodoInicioSueldo,
          tipoCambioUSD: parseFloat(tipoCambio),
          metaAhorroMensual: parseFloat(metaAhorro),
          diaPagoSueldo: parseInt(diaPago, 10),
        }),
      });

      if (!res.ok) throw new Error('Error al guardar configuración');
      toast.success('Configuración guardada exitosamente');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCambiarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPin || nuevoPin.length < 4 || nuevoPin.length > 6) {
      toast.error('El nuevo PIN debe tener entre 4 y 6 dígitos');
      return;
    }
    if (nuevoPin !== confirmarNuevoPin) {
      toast.error('La confirmación no coincide con el nuevo PIN');
      return;
    }

    try {
      setSavingPin(true);
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinActual: pinActual || undefined,
          nuevoPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar PIN');
      }
      toast.success(data.message || 'PIN actualizado exitosamente');
      setPinActual('');
      setNuevoPin('');
      setConfirmarNuevoPin('');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar PIN');
    } finally {
      setSavingPin(false);
    }
  };

  const handleEditarCategoria = (cat: CategoriaItem) => {
    setEditandoCat(cat);
    setNombreCat(cat.nombre);
    setColorCat(cat.color || '#2563eb');
    setEsFijoCat(!!cat.esFijo);
  };

  const handleCancelarEdicionCat = () => {
    setEditandoCat(null);
    setNombreCat('');
    setColorCat('#2563eb');
    setEsFijoCat(false);
  };

  const handleGuardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCat.trim()) return;

    try {
      setSavingCat(true);
      if (editandoCat) {
        const res = await fetch('/api/categorias', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editandoCat.id,
            nombre: nombreCat.trim(),
            color: colorCat,
            esFijo: esFijoCat,
          }),
        });
        if (!res.ok) throw new Error('Error al editar');
        toast.success(`Categoría "${nombreCat}" actualizada`);
      } else {
        const res = await fetch('/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombreCat.trim(),
            color: colorCat,
            esFijo: esFijoCat,
          }),
        });
        if (!res.ok) throw new Error('Error al crear');
        toast.success(`Categoría "${nombreCat}" creada`);
      }

      handleCancelarEdicionCat();
      await cargarCategorias();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar categoría');
    } finally {
      setSavingCat(false);
    }
  };

  const handleEliminarCategoria = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"? Los gastos asociados quedarán sin categoría.`)) return;

    try {
      setDeletingCatId(id);
      const res = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success(`Categoría "${nombre}" eliminada`);
      if (editandoCat?.id === id) handleCancelarEdicionCat();
      await cargarCategorias();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeletingCatId(null);
    }
  };

  return {
    periodo,
    resumen,
    refresh,
    usuarioActual,
    sueldoBase,
    setSueldoBase,
    modoSueldoVigencia,
    setModoSueldoVigencia,
    periodoPersonalizado,
    setPeriodoPersonalizado,
    tipoCambio,
    setTipoCambio,
    metaAhorro,
    setMetaAhorro,
    diaPago,
    setDiaPago,
    savingConfig,
    pinActual,
    setPinActual,
    nuevoPin,
    setNuevoPin,
    confirmarNuevoPin,
    setConfirmarNuevoPin,
    savingPin,
    categorias,
    loadingCategorias,
    nombreCat,
    setNombreCat,
    colorCat,
    setColorCat,
    esFijoCat,
    setEsFijoCat,
    savingCat,
    deletingCatId,
    editandoCat,
    handleGuardarConfig,
    handleCambiarPin,
    handleEditarCategoria,
    handleCancelarEdicionCat,
    handleGuardarCategoria,
    handleEliminarCategoria,
  };
}
