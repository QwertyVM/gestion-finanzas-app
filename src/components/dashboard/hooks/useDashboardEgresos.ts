'use client';

import { useState, useMemo, useEffect } from 'react';
import { Home, Landmark, Layers, ShoppingBag } from 'lucide-react';
import { useFinanzas } from '@/context/FinanzasContext';
import { ClasificacionEgreso } from '@/lib/utils';
import { DetalleItemData, MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import { toast } from 'sonner';
import type { IngresoItem } from '../IngresoCardMobile';

export function useDashboardEgresos() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
    resumen,
    loading,
    fetchError,
    refresh,
    openRecordModal,
    usuarioActual,
    selectedGastoIds,
    toggleSelectGasto,
    selectAllGastos,
    clearSelection,
  } = useFinanzas();

  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS'>('PENDIENTE');
  const [filtroEgreso, setFiltroEgreso] = useState<'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES'>('TODOS');
  const [filtroFuenteIngreso, setFiltroFuenteIngreso] = useState<string>('TODOS');

  const [itemsOrdenados, setItemsOrdenados] = useState<Array<any>>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [modalSueldoOpen, setModalSueldoOpen] = useState(false);
  const [sueldoParaEditar, setSueldoParaEditar] = useState(0);
  const [ingresoParaEditar, setIngresoParaEditar] = useState<IngresoItem | null>(null);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  const labelEspecial =
    mesActual === 7
      ? 'Mes de Gratificación Fiestas Patrias'
      : mesActual === 12
      ? 'Mes de Gratificación Navidad'
      : mesActual === 3
      ? 'Mes de Utilidades'
      : '';

  // Egresos consolidados provistos directamente por el Backend
  const todosEgresos = useMemo(() => {
    if (!resumen?.egresosConsolidados) return [];
    return resumen.egresosConsolidados as Array<
      DetalleItemData & {
        clasificacion: ClasificacionEgreso;
        categoriaColor?: string;
        colorHex?: string;
        badgeLabel?: string;
      }
    >;
  }, [resumen]);

  useEffect(() => {
    setItemsOrdenados(todosEgresos);
  }, [todosEgresos]);

  const listaActivaEgresos = itemsOrdenados.length > 0 ? itemsOrdenados : todosEgresos;

  // Drag and drop persistente
  const handleDrop = async (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const baseList = [...listaActivaEgresos];
    const sourceIndex = baseList.findIndex((it) => it.id === sourceId);
    const targetIndex = baseList.findIndex((it) => it.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [movedItem] = baseList.splice(sourceIndex, 1);
    baseList.splice(targetIndex, 0, movedItem);

    setItemsOrdenados(baseList);

    try {
      const payload = baseList.map((item, idx) => ({
        id: (item as any).dbId || item.id,
        tipo: item.tipo,
        prestamoId: (item as any).prestamoId || null,
        orden: idx + 1,
      }));

      const res = await fetch('/api/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          usuarioId: usuarioActual?.id,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar orden');
      toast.success('Orden actualizado');
      await refresh();
    } catch {
      toast.error('Error al actualizar orden');
      await refresh();
    }
  };

  // Filtrado reactivo por Clasificación
  const egresosPorClasificacion = useMemo(() => {
    return listaActivaEgresos.filter((item) => {
      if (filtroEgreso === 'FIJOS') return item.clasificacion === 'FIJO';
      if (filtroEgreso === 'PRESTAMOS') return item.clasificacion === 'PRESTAMO';
      if (filtroEgreso === 'CUOTAS') return item.clasificacion === 'CUOTA';
      if (filtroEgreso === 'VARIABLES') return item.clasificacion === 'VARIABLE';
      return true;
    });
  }, [listaActivaEgresos, filtroEgreso]);

  // Identificar el Sueldo principal para atribución por defecto
  const sueldoPrincipal = useMemo(() => {
    return resumen?.ingresos?.find((i: any) => i.tipo === 'SUELDO') || resumen?.ingresos?.[0];
  }, [resumen]);

  // Filtrado reactivo por Estado y Fuente de Ingreso
  const egresosFiltrados = useMemo(() => {
    return egresosPorClasificacion.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;

      if (filtroFuenteIngreso !== 'TODOS') {
        const esFiltroSueldo = filtroFuenteIngreso === sueldoPrincipal?.id || filtroFuenteIngreso === 'SUELDO';
        if (esFiltroSueldo) {
          return item.ingresoId === sueldoPrincipal?.id || !item.ingresoId;
        } else {
          return item.ingresoId === filtroFuenteIngreso;
        }
      }

      return true;
    });
  }, [egresosPorClasificacion, filtroEstado, filtroFuenteIngreso, sueldoPrincipal]);

  const toggleColapsarSeccion = (seccionId: string) => {
    setSeccionesColapsadas((prev) => ({
      ...prev,
      [seccionId]: !prev[seccionId],
    }));
  };

  // Secciones estructuradas sincronizadas con backend
  const seccionesCompromisos = useMemo(() => {
    const config = [
      {
        id: 'FIJOS',
        clasificacion: 'FIJO',
        titulo: 'Compras fijas',
        descripcion: 'Gastos recurrentes y servicios regulares',
        icono: Home,
        headerBg: 'bg-sky-500/10 dark:bg-sky-950/40',
        iconBg: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200/80 dark:border-sky-800/60',
        colorKey: 'sky',
      },
      {
        id: 'PRESTAMOS',
        clasificacion: 'PRESTAMO',
        titulo: 'Préstamos bancarios',
        descripcion: 'Cuotas mensuales de financiamiento y créditos',
        icono: Landmark,
        headerBg: 'bg-purple-500/10 dark:bg-purple-950/40',
        iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200/80 dark:border-purple-800/60',
        colorKey: 'purple',
      },
      {
        id: 'CUOTAS',
        clasificacion: 'CUOTA',
        titulo: 'Compras a cuotas',
        descripcion: 'Compras en cuotas con tarjeta de crédito',
        icono: Layers,
        headerBg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
        iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
        colorKey: 'indigo',
      },
      {
        id: 'VARIABLES',
        clasificacion: 'VARIABLE',
        titulo: 'Otras compras / Gastos variables',
        descripcion: 'Compras directas del mes y consumos variables',
        icono: ShoppingBag,
        headerBg: 'bg-teal-500/10 dark:bg-teal-950/40',
        iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200/80 dark:border-teal-800/60',
        colorKey: 'teal',
      },
    ];

    return config
      .map((conf) => {
        const items = egresosFiltrados.filter(
          (e) => e.clasificacion === conf.clasificacion || e.clasificacion === conf.id
        );
        const subtotal = items.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        return {
          ...conf,
          itemsFiltrados: items,
          items,
          subtotal,
          total: subtotal,
          filteredCount: items.length,
          colapsada: !!seccionesColapsadas[conf.id],
        };
      })
      .filter((sec) => {
        if (filtroEgreso === 'TODOS') {
          return sec.filteredCount > 0;
        }
        return filtroEgreso === sec.id;
      });
  }, [egresosFiltrados, filtroEgreso, seccionesColapsadas]);

  const handleSelectAll = () => {
    if (selectedGastoIds.length === egresosFiltrados.length && egresosFiltrados.length > 0) {
      clearSelection();
    } else {
      selectAllGastos(egresosFiltrados.map((i) => ({ id: i.id, monto: i.monto })));
    }
  };

  const handleToggleEstadoItem = async (item: DetalleItemData, nuevoEstado: string) => {
    try {
      if (item.tipo === 'FIJO') {
        const res = await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costoFijoId: item.dbId, periodo, estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error('Error al actualizar');
      } else if (item.tipo === 'PRESTAMO') {
        const res = await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cuotaId: item.dbId, estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error('Error al actualizar');
      } else {
        const res = await fetch('/api/gastos/masivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cambiar_estado', ids: [item.dbId], estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error('Error al actualizar');
      }
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      await refresh();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleToggleRecibidoIngreso = async (ingreso: any) => {
    try {
      const res = await fetch('/api/ingresos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ingreso.id, recibido: !ingreso.recibido }),
      });
      if (!res.ok) throw new Error('Error al actualizar ingreso');
      toast.success(ingreso.recibido ? 'Ingreso por recibir' : 'Ingreso recibido');
      await refresh();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleEliminarIngreso = async (id: string) => {
    if (!confirm('¿Eliminar este ingreso?')) return;
    try {
      const res = await fetch(`/api/ingresos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Ingreso eliminado');
      await refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleGuardarMontoModal = async (
    item: DetalleItemData,
    nuevoMonto: number,
    monedaInfo?: MonedaDetalleInfo
  ) => {
    try {
      if (item.tipo === 'FIJO') {
        const res = await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costoFijoId: item.dbId, periodo, monto: nuevoMonto }),
        });
        if (!res.ok) throw new Error('Error al actualizar monto fijo');
      } else if (item.tipo === 'PRESTAMO') {
        const res = await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cuotaId: item.dbId, monto: nuevoMonto }),
        });
        if (!res.ok) throw new Error('Error al actualizar cuota de préstamo');
      } else {
        const res = await fetch('/api/gastos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.dbId,
            monto: nuevoMonto,
            ...(monedaInfo
              ? {
                  monedaOriginal: monedaInfo.monedaOriginal,
                  montoOriginal: monedaInfo.montoOriginal,
                  tipoCambio: monedaInfo.tipoCambio,
                }
              : {}),
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar gasto');
      }
      setDetalleItem((prev) => (prev ? { ...prev, monto: nuevoMonto, ...(monedaInfo || {}) } : null));
      await refresh();
    } catch {
      toast.error('Error al actualizar monto');
    }
  };

  const handleEliminarGastoModal = async (item: DetalleItemData) => {
    try {
      if (item.tipo === 'FIJO') {
        await fetch(`/api/fijos?id=${item.dbId}`, { method: 'DELETE' });
      } else if (item.tipo === 'PRESTAMO') {
        await fetch(`/api/prestamos?id=${item.prestamoId || item.dbId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/gastos?id=${item.dbId}`, { method: 'DELETE' });
      }
      setDetalleItem(null);
      await refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleCambiarMetodoPagoModal = async (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => {
    try {
      if (item.tipo === 'FIJO' && item.clasificacion !== 'VARIABLE') {
        const res = await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            costoFijoId: item.dbId,
            periodo,
            metodoPago: nuevoMetodo,
            tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar método de pago');

        if (aplicarFuturos) {
          await fetch('/api/fijos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.dbId,
              metodoPago: nuevoMetodo,
              tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
              mesDesde: periodo,
            }),
          });
        }
      } else {
        const res = await fetch('/api/gastos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.dbId,
            metodoPago: nuevoMetodo,
            tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar método de pago');
      }

      toast.success('Forma de pago actualizada');
      await refresh();
    } catch {
      toast.error('Error al actualizar forma de pago');
    }
  };

  const handleCambiarClasificacionModal = async (
    item: DetalleItemData,
    nuevaClasificacion: 'FIJO' | 'VARIABLE'
  ) => {
    try {
      const targetId = item.dbId || item.id.replace('fijo-', '').replace('prestamo-', '');
      const res = await fetch('/api/finanzas/clasificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetId,
          tipo: item.tipo,
          nuevaClasificacion,
          periodo,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cambiar clasificación');
      }

      toast.success(nuevaClasificacion === 'FIJO' ? 'Movido a Compras fijas' : 'Movido a Compras variables');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar clasificación');
    }
  };

  const handleCambiarCategoriaModal = async (
    item: DetalleItemData,
    nuevaCategoriaId: string,
    aplicarSerie?: boolean
  ) => {
    try {
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
    } catch {
      toast.error('Error al actualizar categoría');
    }
  };

  const handleGuardarConceptoModal = async (item: DetalleItemData, nuevoConcepto: string) => {
    try {
      if (item.tipo === 'FIJO') {
        const id = item.dbId || item.id.replace('fijo-', '');
        const res = await fetch('/api/fijos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, concepto: nuevoConcepto }),
        });
        if (!res.ok) throw new Error('Error al actualizar descripción');
      } else {
        const res = await fetch('/api/gastos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.dbId || item.id, concepto: nuevoConcepto, actualizarSerie: true }),
        });
        if (!res.ok) throw new Error('Error al actualizar descripción');
      }
      toast.success('Descripción actualizada');
      await refresh();
    } catch {
      toast.error('Error al actualizar descripción');
    }
  };

  const handleGuardarNotasModal = async (item: DetalleItemData, nuevasNotas: string) => {
    try {
      if (item.tipo === 'FIJO') {
        const id = item.dbId || item.id.replace('fijo-', '');
        const res = await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costoFijoId: id, periodo, notas: nuevasNotas }),
        });
        if (!res.ok) throw new Error('Error al actualizar notas');
      } else {
        const res = await fetch('/api/gastos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.dbId || item.id, notas: nuevasNotas }),
        });
        if (!res.ok) throw new Error('Error al actualizar notas');
      }
      setDetalleItem((prev) => (prev ? { ...prev, notas: nuevasNotas } : null));
      toast.success('Notas actualizadas');
      await refresh();
    } catch {
      toast.error('Error al actualizar notas');
    }
  };

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    await handleToggleEstadoItem(item, nuevoEstado);
    setDetalleItem((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
  };

  const handleAsignarIngresoItem = async (item: DetalleItemData, nuevoIngresoId: string | null) => {
    try {
      const res = await fetch('/api/finanzas/asignar-ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: item.dbId || item.id, tipo: item.tipo }],
          ingresoId: nuevoIngresoId || null,
          periodo,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar ingreso asignado');
      setDetalleItem((prev) => (prev ? { ...prev, ingresoId: nuevoIngresoId || null } : null));
      toast.success(nuevoIngresoId ? 'Asignado a fuente de ingreso' : 'Asignado a Sueldo / General');
      await refresh();
    } catch {
      toast.error('Error al actualizar ingreso asignado');
    }
  };

  const handleAsignarIngresoMasivo = async (nuevoIngresoId: string | null) => {
    if (selectedGastoIds.length === 0) return;
    try {
      const itemsPayload = selectedGastoIds.map((id) => {
        const itemObj = listaActivaEgresos.find((e) => e.id === id);
        return {
          id: itemObj?.dbId || id,
          tipo: itemObj?.tipo || 'DIRECTO',
        };
      });

      const res = await fetch('/api/finanzas/asignar-ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          ingresoId: nuevoIngresoId || null,
          periodo,
        }),
      });

      if (!res.ok) throw new Error('Error en asignación masiva');
      toast.success(`Se asignaron ${itemsPayload.length} gastos correctamente`);
      clearSelection();
      await refresh();
    } catch {
      toast.error('Error al asignar gastos en lote');
    }
  };

  const handleCambiarIngresoAsignadoModal = async (item: DetalleItemData, nuevoIngresoId: string | null) => {
    await handleAsignarIngresoItem(item, nuevoIngresoId);
  };

  const handleAbrirRegistroSeccion = (seccionId: string) => {
    if (seccionId === 'FIJOS') {
      toast.info('Para registrar un costo fijo ve a "Fijos y Préstamos"');
    } else if (seccionId === 'PRESTAMOS') {
      toast.info('Para registrar un préstamo ve a "Fijos y Préstamos"');
    } else {
      openRecordModal('GASTO');
    }
  };

  return {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
    resumen,
    loading,
    fetchError,
    refresh,
    openRecordModal,
    usuarioActual,
    selectedGastoIds,
    toggleSelectGasto,
    clearSelection,
    moneda,
    mesActual,
    esMesEspecial,
    labelEspecial,
    disponibleNeto: resumen?.dineroDisponibleNeto ?? 0,
    filtroEstado,
    setFiltroEstado,
    filtroEgreso,
    setFiltroEgreso,
    filtroFuenteIngreso,
    setFiltroFuenteIngreso,
    handleAsignarIngresoItem,
    handleAsignarIngresoMasivo,
    draggedId,
    setDraggedId,
    dragOverId,
    setDragOverId,
    handleDrop,
    egresosFiltrados,
    seccionesCompromisos,
    toggleColapsarSeccion,
    handleSelectAll,
    detalleItem,
    setDetalleItem,
    modalSueldoOpen,
    setModalSueldoOpen,
    sueldoParaEditar,
    setSueldoParaEditar,
    ingresoParaEditar,
    setIngresoParaEditar,
    handleToggleEstadoItem,
    handleToggleRecibidoIngreso,
    handleEliminarIngreso,
    handleGuardarMontoModal,
    handleEliminarGastoModal,
    handleCambiarMetodoPagoModal,
    handleCambiarClasificacionModal,
    handleCambiarCategoriaModal,
    handleGuardarConceptoModal,
    handleGuardarNotasModal,
    handleCambiarEstadoModal,
    handleCambiarIngresoAsignadoModal,
    handleAbrirRegistroSeccion,
  };
}
