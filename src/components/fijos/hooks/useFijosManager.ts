'use client';

import { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import type { DetalleItemData, MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import { toast } from 'sonner';

export function useFijosManager() {
  const {
    periodo,
    resumen,
    loading,
    refresh,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
  } = useFinanzas();

  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [modalFijoOpen, setModalFijoOpen] = useState(false);
  const [modalPrestamoOpen, setModalPrestamoOpen] = useState(false);
  const [editandoCostoFijo, setEditandoCostoFijo] = useState<any | null>(null);
  const [editandoPrestamo, setEditandoPrestamo] = useState<any | null>(null);

  const configTc = resumen?.config?.tipoCambioUSD || 4.00;
  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const costosFijos = resumen?.costosFijos || [];
  const prestamos = resumen?.prestamos || [];
  const tarjetas = resumen?.tarjetasCredito || [];

  const cuotasTarjeta = useMemo(() => {
    const list: any[] = [];
    for (const t of tarjetas) {
      for (const g of t.gastosPeriodo || []) {
        if ((g.totalCuotas || 1) > 1) {
          list.push({
            ...g,
            tarjetaNombre: t.nombre,
            tarjetaColor: t.color,
            tarjetaBanco: t.banco,
            tarjetaDiaPago: t.diaPago,
          });
        }
      }
    }
    return list;
  }, [tarjetas]);

  const totalCuotasTarjeta = useMemo(
    () => cuotasTarjeta.reduce((sum, c) => sum + (c.monto || 0), 0),
    [cuotasTarjeta]
  );

  const handleToggleEstadoFijo = async (costoFijoId: string, nuevoEstado: string) => {
    try {
      setLoadingAction(`fijo-${costoFijoId}`);
      const res = await fetch('/api/fijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costoFijoId, periodo, estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar costo fijo');
      toast.success(`Costo fijo actualizado a ${nuevoEstado}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCambiarMetodoPagoFijo = async (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => {
    try {
      setLoadingAction(`metodo-${costoFijoId}`);
      const res = await fetch('/api/fijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costoFijoId,
          periodo,
          metodoPago: nuevoMetodo,
          tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar forma de pago');
      const tarjetaNombre = tarjetas.find((t) => t.id === tarjetaId)?.nombre;
      const label = nuevoMetodo === 'TARJETA_CREDITO'
        ? (tarjetaNombre ? `Tarjeta (${tarjetaNombre})` : 'Tarjeta de Crédito')
        : nuevoMetodo === 'TRANSFERENCIA'
          ? 'Transferencia'
          : 'Efectivo / Débito';
      toast.success(`Forma de pago actualizada a: ${label}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar forma de pago');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEliminarCostoFijo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el costo fijo "${concepto}" y sus registros asociados?`)) return;
    try {
      setLoadingAction(`del-fijo-${id}`);
      const res = await fetch(`/api/fijos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar costo fijo');
      toast.success(`Costo fijo "${concepto}" eliminado`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleEstadoCuota = async (cuotaId: string, nuevoEstado: string) => {
    try {
      setLoadingAction(`cuota-${cuotaId}`);
      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuotaId, estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar cuota');
      toast.success(`Cuota actualizada a ${nuevoEstado}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuota');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEliminarPrestamo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el préstamo "${concepto}" y todas sus cuotas?`)) return;
    try {
      setLoadingAction(`del-prestamo-${id}`);
      const res = await fetch(`/api/prestamos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar préstamo');
      toast.success(`Préstamo "${concepto}" eliminado`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleEstadoGasto = async (gastoId: string, nuevoEstado: string) => {
    try {
      setLoadingAction(`gasto-${gastoId}`);
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_estado',
          ids: [gastoId],
          estado: nuevoEstado,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar compra en cuotas');
      toast.success(`Cuota actualizada a ${nuevoEstado.toLowerCase()}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuota');
    } finally {
      setLoadingAction(null);
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
          body: JSON.stringify({
            costoFijoId: item.dbId,
            periodo,
            monto: nuevoMonto,
            monedaOriginal: monedaInfo?.monedaOriginal,
            montoOriginal: monedaInfo?.montoOriginal,
            tipoCambio: monedaInfo?.tipoCambio,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar fijo');
      } else if (item.tipo === 'PRESTAMO') {
        const res = await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cuotaId: item.dbId,
            monto: nuevoMonto,
            monedaOriginal: monedaInfo?.monedaOriginal,
            montoOriginal: monedaInfo?.montoOriginal,
            tipoCambio: monedaInfo?.tipoCambio,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar cuota de préstamo');
      } else {
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
        if (!res.ok) throw new Error('Error al actualizar gasto');
      }
      setDetalleItem((prev) =>
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
        if (!res.ok) throw new Error('Error al actualizar');

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
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.dbId,
            metodoPago: nuevoMetodo,
            tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar');
      }

      const tObj = tarjetas.find((t) => t.id === tarjetaId);
      setDetalleItem((prev) =>
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

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    if (item.tipo === 'FIJO') {
      await handleToggleEstadoFijo(item.dbId, nuevoEstado);
    } else if (item.tipo === 'PRESTAMO') {
      await handleToggleEstadoCuota(item.dbId, nuevoEstado);
    } else {
      await handleToggleEstadoGasto(item.dbId, nuevoEstado);
    }
    setDetalleItem((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
  };

  return {
    periodo,
    resumen,
    loading,
    refresh,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
    detalleItem,
    setDetalleItem,
    loadingAction,
    modalFijoOpen,
    setModalFijoOpen,
    modalPrestamoOpen,
    setModalPrestamoOpen,
    editandoCostoFijo,
    setEditandoCostoFijo,
    editandoPrestamo,
    setEditandoPrestamo,
    configTc,
    moneda,
    costosFijos,
    prestamos,
    tarjetas,
    cuotasTarjeta,
    totalCuotasTarjeta,
    handleToggleEstadoFijo,
    handleCambiarMetodoPagoFijo,
    handleEliminarCostoFijo,
    handleToggleEstadoCuota,
    handleEliminarPrestamo,
    handleToggleEstadoGasto,
    handleGuardarMontoModal,
    handleCambiarMetodoPagoModal,
    handleCambiarEstadoModal,
  };
}
