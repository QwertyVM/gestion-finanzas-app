'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import type { DetalleItemData, MonedaDetalleInfo } from '@/components/modals/ModalDetalleGasto';
import { toast } from 'sonner';

export function useFijosManager() {
  const {
    periodo,
    resumen,
    refresh: refreshGlobal,
  } = useFinanzas();

  const [loading, setLoading] = useState(true);
  const [costosFijos, setCostosFijos] = useState<any[]>([]);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [tarjetas, setTarjetas] = useState<any[]>([]);

  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [modalFijoOpen, setModalFijoOpen] = useState(false);
  const [modalPrestamoOpen, setModalPrestamoOpen] = useState(false);
  const [editandoCostoFijo, setEditandoCostoFijo] = useState<any | null>(null);
  const [editandoPrestamo, setEditandoPrestamo] = useState<any | null>(null);

  const configTc = resumen?.config?.tipoCambioUSD || 4.00;
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  // Cargar datos base concurrentes maestros (sin filtro por mes)
  const cargarDatosBase = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fijos');
      if (!res.ok) throw new Error('Error al cargar fijos y préstamos');
      const data = await res.json();
      setCostosFijos(data.costosFijos || []);
      setPrestamos(data.prestamos || []);
      setTarjetas(data.tarjetas || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosBase();
  }, [cargarDatosBase]);

  const refresh = useCallback(async () => {
    await Promise.all([cargarDatosBase(), refreshGlobal()]);
  }, [cargarDatosBase, refreshGlobal]);

  const handleCambiarMetodoPagoFijo = async (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => {
    try {
      setLoadingAction(`metodo-${costoFijoId}`);
      const res = await fetch('/api/fijos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: costoFijoId,
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
      toast.success(`Forma de pago base actualizada a: ${label}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar forma de pago');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEliminarCostoFijo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el costo fijo base "${concepto}"?`)) return;
    try {
      setLoadingAction(`del-fijo-${id}`);
      const res = await fetch(`/api/fijos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar costo fijo');
      toast.success(`Costo fijo base "${concepto}" eliminado`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEliminarPrestamo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el préstamo "${concepto}" y todas sus cuotas?`)) return;
    try {
      setLoadingAction(`del-pres-${id}`);
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

  const handleGuardarMontoModal = async (
    item: DetalleItemData,
    nuevoMonto: number,
    monedaInfo?: MonedaDetalleInfo
  ) => {
    try {
      if (item.tipo === 'FIJO') {
        const res = await fetch('/api/fijos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.dbId,
            monto: nuevoMonto,
            monedaOriginal: monedaInfo?.monedaOriginal,
            montoOriginal: monedaInfo?.montoOriginal,
            tipoCambio: monedaInfo?.tipoCambio,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar monto fijo base');
      } else if (item.tipo === 'PRESTAMO') {
        const res = await fetch('/api/prestamos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.prestamoId || item.dbId,
            montoCuota: nuevoMonto,
            monedaOriginal: monedaInfo?.monedaOriginal,
            montoOriginal: monedaInfo?.montoOriginal,
            tipoCambio: monedaInfo?.tipoCambio,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar cuota préstamo base');
      }
      setDetalleItem((prev) => (prev ? { ...prev, monto: nuevoMonto } : null));
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar monto');
      throw err;
    }
  };

  const handleCambiarMetodoPagoModal = async (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null
  ) => {
    try {
      if (item.tipo === 'FIJO') {
        const res = await fetch('/api/fijos', {
          method: 'PUT',
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
            }
          : null
      );
      toast.success('Forma de pago actualizada');
      await refresh();
    } catch {
      toast.error('Error al actualizar forma de pago');
    }
  };

  return {
    periodo,
    resumen,
    loading,
    refresh,
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
    handleCambiarMetodoPagoFijo,
    handleEliminarCostoFijo,
    handleEliminarPrestamo,
    handleGuardarMontoModal,
    handleCambiarMetodoPagoModal,
  };
}
