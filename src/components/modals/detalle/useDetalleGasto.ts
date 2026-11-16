'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFinanzas } from '@/context/FinanzasContext';
import { DetalleItemData, MonedaDetalleInfo } from './types';
import { obtenerClasificacionEgreso, ClasificacionEgreso, formatPeriodoLabel } from '@/lib/utils';

export function useDetalleGasto(
  item: DetalleItemData | null,
  onClose: () => void,
  onCambiarEstado?: (item: DetalleItemData, nuevoEstado: string) => Promise<void>,
  onGuardarMonto?: (item: DetalleItemData, nuevoMonto: number, monedaInfo?: MonedaDetalleInfo) => Promise<void>,
  onEliminarGasto?: (item: DetalleItemData) => Promise<void>,
  onCambiarClasificacion?: (item: DetalleItemData, nuevaClasificacion: 'FIJO' | 'VARIABLE') => Promise<void>,
  onCambiarCategoria?: (item: DetalleItemData, nuevaCategoriaId: string, aplicarSerie?: boolean) => Promise<void>,
  onGuardarConcepto?: (item: DetalleItemData, nuevoConcepto: string) => Promise<void>,
  onGuardarNotas?: (item: DetalleItemData, nuevasNotas: string) => Promise<void>,
  onGuardarFechaPeriodo?: (item: DetalleItemData, nuevaFecha: string, nuevoPeriodo: string, aplicarSerie?: boolean) => Promise<void>,
  monedaSimbolo = 'S/'
) {
  const { refresh, periodo } = useFinanzas();
  const [updating, setUpdating] = useState(false);

  // Fecha y Periodo
  const [fechaGastoLocal, setFechaGastoLocal] = useState(item?.fechaGasto || '');
  const [periodoPagoLocal, setPeriodoPagoLocal] = useState(item?.periodoPago || '');
  const [savingFechaPeriodo, setSavingFechaPeriodo] = useState(false);

  // Monto
  const [editandoMonto, setEditandoMonto] = useState(false);
  const [montoEditInput, setMontoEditInput] = useState(item ? item.monto.toString() : '');
  const [savingMonto, setSavingMonto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<'SOLES' | 'DOLARES'>('SOLES');
  const [montoUsdEdit, setMontoUsdEdit] = useState('');
  const [tcEdit, setTcEdit] = useState('4.00');

  // Concepto
  const [conceptoLocal, setConceptoLocal] = useState(item?.concepto || '');
  const [editandoConcepto, setEditandoConcepto] = useState(false);
  const [conceptoEditInput, setConceptoEditInput] = useState(item?.concepto || '');
  const [savingConcepto, setSavingConcepto] = useState(false);

  // Notas
  const [notasLocal, setNotasLocal] = useState(item?.notas || '');

  // Clasificación
  const [clasificacionLocal, setClasificacionLocal] = useState<ClasificacionEgreso>(
    item?.clasificacion || (item ? obtenerClasificacionEgreso(item) : 'VARIABLE')
  );
  const [updatingClasificacion, setUpdatingClasificacion] = useState(false);

  // Categoría
  const [categoriaNombreLocal, setCategoriaNombreLocal] = useState(item?.categoria || '');
  const [categoriaColorLocal, setCategoriaColorLocal] = useState(item?.categoriaColor || '');
  const [categoriaIdLocal, setCategoriaIdLocal] = useState<string | null>(item?.categoriaId || null);

  useEffect(() => {
    if (item) {
      setCategoriaNombreLocal(item.categoria || '');
      setCategoriaColorLocal(item.categoriaColor || '');
      setCategoriaIdLocal(item.categoriaId || null);
      setClasificacionLocal(item.clasificacion || obtenerClasificacionEgreso(item));
      setMontoEditInput(item.monto.toString());
      setEditandoMonto(false);
      const baseCon = (item.totalCuotas && item.totalCuotas > 1)
        ? (item.concepto || '').replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim()
        : (item.concepto || '');
      setConceptoLocal(item.concepto || '');
      setConceptoEditInput(baseCon);
      setEditandoConcepto(false);
      setNotasLocal(item.notas || '');
      setFechaGastoLocal(item.fechaGasto || '');
      setPeriodoPagoLocal(item.periodoPago || '');

      const isUsd = item.monedaOriginal === 'USD' || item.concepto.includes('$');
      setModoEdicion(isUsd ? 'DOLARES' : 'SOLES');
      if (item.montoOriginal) {
        setMontoUsdEdit(item.montoOriginal.toString());
      } else {
        const match = item.concepto.match(/\$([0-9.]+)/);
        setMontoUsdEdit(match ? match[1] : '');
      }
      setTcEdit(item.tipoCambio ? item.tipoCambio.toString() : '4.00');
    }
  }, [item]);

  const handleClasificacionChange = async (nueva: 'FIJO' | 'VARIABLE') => {
    if (!item || updatingClasificacion || clasificacionLocal === nueva) return;
    try {
      setUpdatingClasificacion(true);
      if (onCambiarClasificacion) {
        await onCambiarClasificacion(item, nueva);
      } else {
        const targetId = item.dbId || item.id.replace('fijo-', '').replace('prestamo-', '');
        const res = await fetch('/api/finanzas/clasificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetId, tipo: item.tipo, nuevaClasificacion: nueva, periodo }),
        });
        if (!res.ok) throw new Error('Error al cambiar clasificación');
        const resData = await res.json();
        if (resData.tipo === 'CONVERTIDO_A_FIJO' && resData.nuevoCostoFijoId) {
          item.tipo = 'FIJO';
          item.dbId = resData.nuevoCostoFijoId;
        } else if (resData.tipo === 'CONVERTIDO_A_GASTO' && resData.nuevoGastoId) {
          item.tipo = 'DIRECTO';
          item.dbId = resData.nuevoGastoId;
        }
        toast.success(nueva === 'FIJO' ? 'Movido a Compras fijas' : 'Movido a Compras variables');
        await refresh();
      }
      setClasificacionLocal(nueva);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar clasificación');
    } finally {
      setUpdatingClasificacion(false);
    }
  };

  const handleCambiarCategoria = async (nuevaCategoriaId: string, aplicarSerie?: boolean) => {
    if (!item) return;
    try {
      if (onCambiarCategoria) {
        await onCambiarCategoria(item, nuevaCategoriaId, aplicarSerie);
      } else {
        const id = item.dbId || item.id.replace('fijo-', '');
        if (item.tipo === 'FIJO') {
          const res = await fetch('/api/fijos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, categoriaId: nuevaCategoriaId }),
          });
          if (!res.ok) throw new Error('Error al actualizar categoría');
        } else {
          const res = await fetch('/api/gastos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, categoriaId: nuevaCategoriaId, actualizarSerie: aplicarSerie }),
          });
          if (!res.ok) throw new Error('Error al actualizar categoría');
        }
        toast.success('Categoría actualizada');
        await refresh();
      }
      setCategoriaIdLocal(nuevaCategoriaId);

      try {
        const catRes = await fetch('/api/categorias');
        if (catRes.ok) {
          const cats = await catRes.json();
          const match = cats.find((c: any) => c.id === nuevaCategoriaId);
          if (match) {
            setCategoriaNombreLocal(match.nombre);
            if (match.color) setCategoriaColorLocal(match.color);
            item.categoria = match.nombre;
            item.categoriaColor = match.color;
            item.categoriaId = match.id;
          }
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const handleStartEditConcepto = () => {
    if (item) {
      const base = (item.totalCuotas && item.totalCuotas > 1)
        ? (conceptoLocal || item.concepto).replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim()
        : (conceptoLocal || item.concepto);
      setConceptoEditInput(base);
    }
    setEditandoConcepto(true);
  };

  const handleCancelEditConcepto = () => {
    if (item) {
      const base = (item.totalCuotas && item.totalCuotas > 1)
        ? (conceptoLocal || item.concepto).replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim()
        : (conceptoLocal || item.concepto);
      setConceptoEditInput(base);
    }
    setEditandoConcepto(false);
  };

  const handleGuardarConcepto = async () => {
    if (!item || savingConcepto || !conceptoEditInput.trim()) return;
    const nuevo = conceptoEditInput.trim();
    try {
      setSavingConcepto(true);
      if (onGuardarConcepto) {
        await onGuardarConcepto(item, nuevo);
      } else {
        const id = item.dbId || item.id.replace('fijo-', '');
        const url = item.tipo === 'FIJO' ? '/api/fijos' : '/api/gastos';
        const method = item.tipo === 'FIJO' ? 'PUT' : 'PATCH';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, concepto: nuevo, actualizarSerie: true }),
        });
        toast.success('Descripción actualizada');
        await refresh();
      }
      const base = nuevo.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();
      const nuevoFormateado = (item.totalCuotas && item.totalCuotas > 1)
        ? `${base} (Cuota ${item.cuotaActual || 1}/${item.totalCuotas})`
        : nuevo;
      setConceptoLocal(nuevoFormateado);
      setConceptoEditInput(base);
      setEditandoConcepto(false);
    } catch {
      toast.error('Error al actualizar descripción');
    } finally {
      setSavingConcepto(false);
    }
  };

  const handleGuardarNotas = async (nuevasNotas: string) => {
    if (!item) return;
    try {
      if (onGuardarNotas) {
        await onGuardarNotas(item, nuevasNotas);
      } else {
        const id = item.dbId || item.id.replace('fijo-', '');
        const url = item.tipo === 'FIJO' ? '/api/fijos' : '/api/gastos';
        const body = item.tipo === 'FIJO'
          ? { costoFijoId: id, periodo, notas: nuevasNotas }
          : { id, notas: nuevasNotas };
        await fetch(url, {
          method: item.tipo === 'FIJO' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        toast.success('Notas actualizadas');
        await refresh();
      }
      setNotasLocal(nuevasNotas);
    } catch {
      toast.error('Error al actualizar notas');
    }
  };

  const handleGuardarMonto = async () => {
    if (!item || !onGuardarMonto) return;
    let val: number;
    let monedaOriginal: 'PEN' | 'USD' = 'PEN';
    let montoOriginal: number | null = null;
    let tipoCambio: number = 4.0;

    if (modoEdicion === 'DOLARES') {
      const usdVal = parseFloat(montoUsdEdit);
      const tcVal = parseFloat(tcEdit) || 4.0;
      if (isNaN(usdVal) || usdVal < 0) return toast.error('Ingresa un monto válido');
      val = Number((usdVal * tcVal).toFixed(2));
      monedaOriginal = 'USD';
      montoOriginal = usdVal;
      tipoCambio = tcVal;
    } else {
      val = parseFloat(montoEditInput);
      monedaOriginal = 'PEN';
      montoOriginal = null;
      tipoCambio = parseFloat(tcEdit) || 4.0;
    }
    if (isNaN(val) || val < 0) return toast.error('Ingresa un monto válido');

    try {
      setSavingMonto(true);
      await onGuardarMonto(item, val, { monedaOriginal, montoOriginal, tipoCambio });
      item.monto = val;
      item.monedaOriginal = monedaOriginal;
      item.montoOriginal = montoOriginal;
      item.tipoCambio = tipoCambio;
      setEditandoMonto(false);
      toast.success(
        monedaOriginal === 'USD'
          ? `Monto actualizado a $${montoOriginal?.toFixed(2)} USD (S/ ${val.toFixed(2)})`
          : `Monto actualizado a ${monedaSimbolo} ${val.toFixed(2)}`
      );
    } catch {
      toast.error('Error al actualizar monto');
    } finally {
      setSavingMonto(false);
    }
  };

  const handleEstado = async (nuevoEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO') => {
    if (!item || updating || item.estado === nuevoEstado || !onCambiarEstado) return;
    try {
      setUpdating(true);
      await onCambiarEstado(item, nuevoEstado);
    } finally {
      setUpdating(false);
    }
  };

  const handleEliminar = async () => {
    if (!item || updating || !onEliminarGasto) return;
    if (!confirm(`¿Eliminar "${item.concepto}" de este mes?`)) return;
    try {
      setUpdating(true);
      await onEliminarGasto(item);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  const handleEliminarCompraCompleta = async () => {
    if (!item || updating) return;
    const baseName = item.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();
    if (!confirm(`¿Eliminar la compra completa "${baseName}" y todas sus cuotas?`)) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/gastos/compra-completa?id=${item.dbId || item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar compra');
      toast.success('Compra completa y sus cuotas eliminadas');
      await refresh();
      onClose();
    } catch {
      toast.error('Error al eliminar compra completa');
    } finally {
      setUpdating(false);
    }
  };

  const handleGuardarCuotaActual = async (val: number) => {
    if (!item) return;
    const cuotasTot = item.totalCuotas || item.cuotasTotales || 1;
    const targetId = item.prestamoId || item.dbId || item.id;
    await fetch('/api/cuotas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: item.tipo,
        id: targetId,
        cuotaActual: val,
        cuotasTotales: cuotasTot,
        periodoActual: item.periodoPago || periodo,
      }),
    });
    item.cuotaActual = val;
    toast.success(`Cuota actualizada: vas en la ${val} de ${cuotasTot}`);
    await refresh();
  };

  const handleGuardarCuotasTotales = async (val: number) => {
    if (!item) return;
    const targetId = item.prestamoId || item.dbId || item.id;
    await fetch('/api/cuotas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: item.tipo,
        id: targetId,
        cuotaActual: item.cuotaActual || 1,
        cuotasTotales: val,
        periodoActual: item.periodoPago || periodo,
      }),
    });
    item.cuotasTotales = val;
    item.totalCuotas = val;
    toast.success(`Plazo actualizado: ${val} cuotas`);
    await refresh();
  };

  const handleGuardarCuotasRestantes = async (numRestantes: number) => {
    if (!item) return;
    const currentCuota = item.cuotaActual || 1;
    const targetId = item.prestamoId || item.dbId || item.id;
    await fetch('/api/cuotas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: item.tipo,
        id: targetId,
        cuotasRestantes: numRestantes,
        cuotaActual: currentCuota,
        periodoActual: item.periodoPago || periodo,
      }),
    });
    const nuevoTotal = currentCuota + numRestantes;
    item.cuotasTotales = nuevoTotal;
    item.totalCuotas = nuevoTotal;
    toast.success(`Cuotas restantes actualizadas: ${numRestantes}`);
    await refresh();
  };

  const handleGuardarMontoTotal = async (montoTot: number) => {
    if (!item?.prestamoId) return;
    await fetch('/api/prestamos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.prestamoId, montoTotal: montoTot }),
    });
    item.montoTotal = montoTot;
    toast.success('Monto total de crédito actualizado');
    await refresh();
  };

  const handleGuardarFechaPeriodo = async (
    nuevaFecha: string,
    nuevoPeriodo: string,
    aplicarSerie = true
  ) => {
    if (!item || savingFechaPeriodo) return;
    try {
      setSavingFechaPeriodo(true);
      if (onGuardarFechaPeriodo) {
        await onGuardarFechaPeriodo(item, nuevaFecha, nuevoPeriodo, aplicarSerie);
      } else {
        const id = item.dbId || item.id.replace('fijo-', '');
        const res = await fetch('/api/gastos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            fechaGasto: nuevaFecha ? new Date(`${nuevaFecha}T12:00:00`) : undefined,
            periodoPago: nuevoPeriodo || undefined,
            actualizarSerie: aplicarSerie,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error al actualizar fecha y periodo');
        }
        await refresh();
      }

      const isoFecha = nuevaFecha ? new Date(`${nuevaFecha}T12:00:00`).toISOString() : fechaGastoLocal;
      setFechaGastoLocal(isoFecha);
      setPeriodoPagoLocal(nuevoPeriodo || periodoPagoLocal);
      item.fechaGasto = isoFecha;
      item.periodoPago = nuevoPeriodo || item.periodoPago;

      const mesLabel = formatPeriodoLabel(nuevoPeriodo);
      if (nuevoPeriodo && nuevoPeriodo !== periodo) {
        toast.success(`Gasto trasladado a ${mesLabel}`);
        onClose();
      } else {
        toast.success(`Fecha actualizada para ${mesLabel}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar fecha');
      throw err;
    } finally {
      setSavingFechaPeriodo(false);
    }
  };

  return {
    updating,
    clasificacionLocal,
    updatingClasificacion,
    handleClasificacionChange,
    categoriaNombreLocal,
    categoriaColorLocal,
    categoriaIdLocal,
    handleCambiarCategoria,
    conceptoLocal,
    editandoConcepto,
    setEditandoConcepto,
    handleStartEditConcepto,
    handleCancelEditConcepto,
    conceptoEditInput,
    setConceptoEditInput,
    savingConcepto,
    handleGuardarConcepto,
    notasLocal,
    handleGuardarNotas,
    fechaGastoLocal,
    periodoPagoLocal,
    savingFechaPeriodo,
    handleGuardarFechaPeriodo,
    editandoMonto,
    setEditandoMonto,
    montoEditInput,
    setMontoEditInput,
    savingMonto,
    modoEdicion,
    setModoEdicion,
    montoUsdEdit,
    setMontoUsdEdit,
    tcEdit,
    setTcEdit,
    handleGuardarMonto,
    handleEstado,
    handleEliminar,
    handleEliminarCompraCompleta,
    handleGuardarCuotaActual,
    handleGuardarCuotasTotales,
    handleGuardarCuotasRestantes,
    handleGuardarMontoTotal,
  };
}
