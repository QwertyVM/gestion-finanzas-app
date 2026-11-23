'use client';

import { toast } from 'sonner';
import type { DetalleItemData, MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import type { EgresoItemConClasificacion } from './useEgresosDragDrop';

interface UseEgresosMutationsProps {
  periodo: string;
  listaActivaEgresos: EgresoItemConClasificacion[];
  selectedGastoIds: string[];
  refresh: () => Promise<void>;
  clearSelection: () => void;
  setDetalleItem: React.Dispatch<React.SetStateAction<DetalleItemData | null>>;
  openRecordModal: (tipo?: any, options?: any) => void;
}

export function useEgresosMutations({
  periodo,
  listaActivaEgresos,
  selectedGastoIds,
  refresh,
  clearSelection,
  setDetalleItem,
  openRecordModal,
}: UseEgresosMutationsProps) {
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
    handleAsignarIngresoItem,
    handleAsignarIngresoMasivo,
    handleCambiarIngresoAsignadoModal,
    handleAbrirRegistroSeccion,
  };
}
