'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { obtenerClasificacionEgreso } from '@/lib/utils';
import type { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { toast } from 'sonner';

export function useGastosManager() {
  const {
    periodo,
    resumen,
    loading,
    refresh,
    selectedGastoIds,
    toggleSelectGasto,
    selectAllGastos,
    openRecordModal,
  } = useFinanzas();

  const [vistaActiva, setVistaActiva] = useState<'MES' | 'COMPRAS_CUOTAS'>('MES');
  const [comprasCuotas, setComprasCuotas] = useState<any[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [compraDesplegada, setCompraDesplegada] = useState<string | null>(null);
  const [deletingCompraId, setDeletingCompraId] = useState<string | null>(null);

  const [gastoParaEliminar, setGastoParaEliminar] = useState<any | null>(null);
  const [eliminandoGasto, setEliminandoGasto] = useState(false);
  const [detalleGasto, setDetalleGasto] = useState<DetalleItemData | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<string>('PENDIENTE');
  const [busqueda, setBusqueda] = useState<string>('');

  const cargarComprasCuotas = useCallback(async () => {
    try {
      setLoadingCuotas(true);
      const res = await fetch(`/api/gastos/compras-cuotas?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) {
        setComprasCuotas(data.compras || []);
      }
    } catch (err) {
      console.error('Error cargando compras en cuotas:', err);
    } finally {
      setLoadingCuotas(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargarComprasCuotas();
  }, [cargarComprasCuotas, resumen]);

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const tarjetas = resumen?.tarjetasCredito || [];

  const adaptGastoToDetalle = (g: any): DetalleItemData => ({
    id: g.id,
    dbId: g.id,
    tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
    clasificacion: g.clasificacion || obtenerClasificacionEgreso({
      tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
      concepto: g.concepto,
      categoria: g.categoria,
      totalCuotas: g.totalCuotas,
    }),
    concepto: g.concepto,
    categoria: g.categoria,
    categoriaColor: g.categoriaColor,
    categoriaIcono: g.categoriaIcono,
    monto: g.monto,
    monedaOriginal: g.monedaOriginal,
    montoOriginal: g.montoOriginal,
    tipoCambio: g.tipoCambio,
    fechaGasto: g.fechaGasto,
    periodoPago: g.periodoPago || periodo,
    estado: g.estado,
    cuotaActual: g.cuotaActual,
    totalCuotas: g.totalCuotas,
    tarjetaNombre: g.tarjetaNombre,
    tarjetaColor: g.tarjetaColor,
    tarjetaDiaCorte: 10,
    tarjetaDiaPago: 30,
    notas: g.notas,
    fechaPagoReal: g.fechaPagoReal,
  });

  const listaGastos = useMemo(() => {
    if (!resumen) return [];
    const todos: Array<any> = [];

    for (const t of resumen.tarjetasCredito) {
      for (const g of t.gastosPeriodo) {
        todos.push({
          ...g,
          metodoPago: 'TARJETA_CREDITO',
          tarjetaNombre: t.nombre,
          tarjetaColor: t.color,
          tipoOrigen: 'tarjeta',
        });
      }
    }

    for (const g of resumen.gastosDirectos) {
      todos.push({
        ...g,
        tarjetaNombre: null,
        tipoOrigen: 'directo',
      });
    }

    return todos.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase().trim();
        const matchConcepto = item.concepto?.toLowerCase().includes(term);
        const matchCategoria = item.categoria?.toLowerCase().includes(term);
        const matchTarjeta = item.tarjetaNombre?.toLowerCase().includes(term);
        if (!matchConcepto && !matchCategoria && !matchTarjeta) return false;
      }
      return true;
    });
  }, [resumen, filtroEstado, busqueda]);

  const handleCambiarEstadoItem = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cambiar_estado', ids: [id], estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      toast.success(`Estado: ${nuevoEstado.toLowerCase()}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  const handleEliminarGastoDirecto = async (id: string, conceptoTexto: string, eliminarTodaLaSerie = false) => {
    if (!eliminarTodaLaSerie && !confirm(`¿Eliminar "${conceptoTexto}"?`)) return;
    try {
      setEliminandoGasto(true);
      const url = eliminarTodaLaSerie ? `/api/gastos?id=${id}&eliminarSerie=true` : `/api/gastos?id=${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      const data = await res.json();
      toast.success(eliminarTodaLaSerie ? `Compra eliminada (${data.count} cuotas)` : 'Gasto eliminado');
      setGastoParaEliminar(null);
      await refresh();
      await cargarComprasCuotas();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setEliminandoGasto(false);
    }
  };

  const handleEliminarCompraCuotasCompleta = async (compra: any) => {
    if (!confirm(`¿Eliminar TODA la compra "${compra.conceptoBase}"?\n\nSe eliminarán las ${compra.totalRegistrosEnDB} cuotas de todos los meses.`)) return;
    try {
      setDeletingCompraId(compra.padreId);
      const res = await fetch(`/api/gastos/compras-cuotas?padreId=${compra.padreId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      const data = await res.json();
      toast.success(`"${compra.conceptoBase}" eliminada (${data.count} registros)`);
      await refresh();
      await cargarComprasCuotas();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeletingCompraId(null);
    }
  };

  // Modal Handlers
  const handleGuardarMonto = async (item: DetalleItemData, nuevoMonto: number, monedaInfo?: any) => {
    try {
      const body: any = {
        id: item.dbId,
        monto: nuevoMonto,
        ...(monedaInfo
          ? {
              monedaOriginal: monedaInfo.monedaOriginal,
              montoOriginal: monedaInfo.montoOriginal,
              tipoCambio: monedaInfo.tipoCambio,
            }
          : {}),
      };
      const res = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al actualizar monto');
      setDetalleGasto((prev) =>
        prev
          ? {
              ...prev,
              monto: nuevoMonto,
              ...(monedaInfo
                ? {
                    monedaOriginal: monedaInfo.monedaOriginal,
                    montoOriginal: monedaInfo.montoOriginal,
                    tipoCambio: monedaInfo.tipoCambio,
                  }
                : {}),
            }
          : null
      );
      await refresh();
    } catch {
      toast.error('Error al actualizar monto');
    }
  };

  const handleEliminarGasto = async (item: DetalleItemData) => {
    try {
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', ids: [item.dbId] }),
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Gasto eliminado');
      setDetalleGasto(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleCambiarClasificacion = async (item: DetalleItemData, nuevaClasificacion: string) => {
    try {
      const res = await fetch('/api/finanzas/clasificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.dbId || item.id,
          tipo: item.tipo,
          nuevaClasificacion,
          periodo,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al cambiar clasificación');
      }
      toast.success(
        nuevaClasificacion === 'FIJO'
          ? 'Movido a Compras fijas'
          : 'Movido a Compras variables'
      );
      if (nuevaClasificacion === 'FIJO') {
        setDetalleGasto(null);
      } else {
        setDetalleGasto((prev) =>
          prev ? { ...prev, clasificacion: nuevaClasificacion as any } : null
        );
      }
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar clasificación');
    }
  };

  const handleGuardarConcepto = async (item: DetalleItemData, nuevoConcepto: string) => {
    try {
      const res = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.dbId || item.id, concepto: nuevoConcepto, actualizarSerie: true }),
      });
      if (!res.ok) throw new Error('Error al actualizar descripción');
      const base = nuevoConcepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();
      const nuevoFormateado = (item.totalCuotas && item.totalCuotas > 1)
        ? `${base} (Cuota ${item.cuotaActual || 1}/${item.totalCuotas})`
        : nuevoConcepto;
      setDetalleGasto((prev) => (prev ? { ...prev, concepto: nuevoFormateado } : null));
      toast.success('Descripción actualizada');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar descripción');
    }
  };

  const handleCambiarCategoria = async (item: DetalleItemData, nuevaCategoriaId: string, aplicarSerie?: boolean) => {
    try {
      const res = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.dbId || item.id, categoriaId: nuevaCategoriaId, actualizarSerie: aplicarSerie }),
      });
      if (!res.ok) throw new Error('Error al actualizar categoría');
      toast.success('Categoría actualizada');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar categoría');
    }
  };

  const handleGuardarNotas = async (item: DetalleItemData, nuevasNotas: string) => {
    try {
      const res = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.dbId || item.id, notas: nuevasNotas }),
      });
      if (!res.ok) throw new Error('Error al actualizar notas');
      setDetalleGasto((prev) => (prev ? { ...prev, notas: nuevasNotas } : null));
      toast.success('Notas actualizadas');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar notas');
    }
  };

  const handleCambiarMetodoPago = async (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => {
    try {
      const res = await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.dbId || item.id,
          metodoPago: nuevoMetodo,
          tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar método de pago');
      const tObj = tarjetas.find((t) => t.id === tarjetaId);
      setDetalleGasto((prev) =>
        prev
          ? {
              ...prev,
              tipo: nuevoMetodo === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
              metodoPago: nuevoMetodo,
              tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? (tarjetaId || null) : null,
              tarjetaNombre: tObj?.nombre || null,
              tarjetaBanco: tObj?.banco || null,
              tarjetaColor: tObj?.color || null,
              tarjetaDiaCorte: tObj?.diaCorte,
              tarjetaDiaPago: tObj?.diaPago,
            }
          : null
      );
      toast.success('Forma de pago actualizada');
      await refresh();
    } catch {
      toast.error('Error al actualizar forma de pago');
    }
  };

  const todosSeleccionados = listaGastos.length > 0 && listaGastos.every((item) => selectedGastoIds.includes(item.id));

  return {
    periodo,
    resumen,
    loading,
    refresh,
    selectedGastoIds,
    toggleSelectGasto,
    selectAllGastos,
    openRecordModal,
    vistaActiva,
    setVistaActiva,
    comprasCuotas,
    loadingCuotas,
    compraDesplegada,
    setCompraDesplegada,
    deletingCompraId,
    gastoParaEliminar,
    setGastoParaEliminar,
    eliminandoGasto,
    detalleGasto,
    setDetalleGasto,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    moneda,
    tarjetas,
    adaptGastoToDetalle,
    listaGastos,
    todosSeleccionados,
    handleCambiarEstadoItem,
    handleEliminarGastoDirecto,
    handleEliminarCompraCuotasCompleta,
    handleGuardarMonto,
    handleEliminarGasto,
    handleCambiarClasificacion,
    handleGuardarConcepto,
    handleCambiarCategoria,
    handleGuardarNotas,
    handleCambiarMetodoPago,
  };
}
