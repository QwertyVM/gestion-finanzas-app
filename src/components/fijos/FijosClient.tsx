'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatPeriodoLabel } from '@/lib/utils';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { FijosTabla } from './FijosTabla';
import { PrestamosTabla } from './PrestamosTabla';
import { CuotasTarjetaTabla } from './CuotasTarjetaTabla';
import { ModalCrearFijo } from './modals/ModalCrearFijo';
import { ModalEditarFijo } from './modals/ModalEditarFijo';
import { ModalCrearPrestamo } from './modals/ModalCrearPrestamo';
import { ModalEditarPrestamo } from './modals/ModalEditarPrestamo';

export function FijosClient() {
  const { periodo, irMesAnterior, irMesSiguiente, resumen, loading, refresh } = useFinanzas();
  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modales
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

  // Acciones de Costo Fijo
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

  // Acciones de Préstamos
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

  // Acciones de Cuotas de Tarjeta
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

  // Handlers para el Modal de Detalle
  const handleGuardarMontoModal = async (item: DetalleItemData, nuevoMonto: number) => {
    try {
      if (item.tipo === 'FIJO') {
        await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costoFijoId: item.dbId, periodo, monto: nuevoMonto }),
        });
      } else if (item.tipo === 'PRESTAMO') {
        await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cuotaId: item.dbId, monto: nuevoMonto }),
        });
      } else {
        await fetch('/api/gastos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.dbId, monto: nuevoMonto }),
        });
      }
      setDetalleItem((prev) => (prev ? { ...prev, monto: nuevoMonto } : null));
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
      if (item.tipo === 'FIJO') {
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

        const tObj = tarjetas.find((t) => t.id === tarjetaId);
        setDetalleItem((prev) =>
          prev
            ? {
                ...prev,
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
      }
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

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. SECCIÓN: COSTOS FIJOS DEL MES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Costos Fijos del Mes
              </h1>
              {/* Selector de Mes */}
              <div className="inline-flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  className="p-1 hover:text-foreground text-muted-foreground rounded transition"
                  title="Mes anterior"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold px-1 text-foreground capitalize">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  className="p-1 hover:text-foreground text-muted-foreground rounded transition"
                  title="Mes siguiente"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gastos recurrentes y servicios fijos programados para este mes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalFijoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Agregar Costo Fijo</span>
            </button>
          </div>
        </div>

        <FijosTabla
          costosFijos={costosFijos}
          tarjetas={tarjetas}
          moneda={moneda}
          loadingAction={loadingAction}
          onSelect={setDetalleItem}
          onToggleEstado={handleToggleEstadoFijo}
          onCambiarMetodoPago={handleCambiarMetodoPagoFijo}
          onEditarBase={(cf) => setEditandoCostoFijo(cf)}
          onEliminar={handleEliminarCostoFijo}
        />
      </div>

      {/* 2. SECCIÓN: PRÉSTAMOS BANCARIOS */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Préstamos Bancarios & Cuotas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitoreo de cuotas mensuales, progreso y amortización.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalPrestamoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Agregar Préstamo</span>
            </button>
          </div>
        </div>

        {prestamos.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
            <p className="text-xs text-muted-foreground">No hay préstamos activos registrados.</p>
          </div>
        ) : (
          <PrestamosTabla
            prestamos={prestamos}
            moneda={moneda}
            loadingAction={loadingAction}
            onSelect={setDetalleItem}
            onToggleEstado={handleToggleEstadoCuota}
            onEditarBase={(p) => setEditandoPrestamo(p)}
            onEliminar={handleEliminarPrestamo}
          />
        )}
      </div>

      {/* 3. SECCIÓN: COMPRAS EN CUOTAS CON TARJETA */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Compras en Tarjeta en Cuotas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compras diferidas a cuotas mensuales registradas en tus tarjetas de crédito.
            </p>
          </div>
        </div>

        {cuotasTarjeta.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/80 rounded-xl">
            <p className="text-xs text-muted-foreground">
              No hay compras en cuotas con tarjeta registradas para este periodo.
            </p>
          </div>
        ) : (
          <CuotasTarjetaTabla
            cuotasTarjeta={cuotasTarjeta}
            totalCuotasTarjeta={totalCuotasTarjeta}
            moneda={moneda}
            loadingAction={loadingAction}
            onSelect={setDetalleItem}
            onToggleEstado={handleToggleEstadoGasto}
          />
        )}
      </div>

      {/* MODAL CREAR COSTO FIJO */}
      <ModalCrearFijo
        open={modalFijoOpen}
        onClose={() => setModalFijoOpen(false)}
        periodo={periodo}
        configTc={configTc}
        tarjetas={tarjetas}
        onSuccess={refresh}
      />

      {/* MODAL EDITAR COSTO FIJO BASE (NO RETROACTIVO) */}
      <ModalEditarFijo
        costoFijo={editandoCostoFijo}
        onClose={() => setEditandoCostoFijo(null)}
        periodo={periodo}
        configTc={configTc}
        moneda={moneda}
        tarjetas={tarjetas}
        onSuccess={refresh}
      />

      {/* MODAL CREAR PRÉSTAMO */}
      <ModalCrearPrestamo
        open={modalPrestamoOpen}
        onClose={() => setModalPrestamoOpen(false)}
        periodo={periodo}
        configTc={configTc}
        onSuccess={refresh}
      />

      {/* MODAL EDITAR PRÉSTAMO BASE (NO RETROACTIVO) */}
      <ModalEditarPrestamo
        prestamo={editandoPrestamo}
        onClose={() => setEditandoPrestamo(null)}
        periodo={periodo}
        configTc={configTc}
        onSuccess={refresh}
      />

      {/* MODAL DETALLE DE COMPROMISO */}
      <ModalDetalleGasto
        item={detalleItem}
        onClose={() => setDetalleItem(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        onCambiarMetodoPago={handleCambiarMetodoPagoModal}
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
