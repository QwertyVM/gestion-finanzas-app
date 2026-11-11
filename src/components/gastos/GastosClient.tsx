'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { obtenerClasificacionEgreso } from '@/lib/utils';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Receipt, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { GastosFiltrosBar } from './GastosFiltrosBar';
import { GastosMesTabla } from './GastosMesTabla';
import { GastosSiguienteMesTabla } from './GastosSiguienteMesTabla';
import { ComprasCuotasSection } from './ComprasCuotasSection';
import { ModalEliminarCuota } from './ModalEliminarCuota';

export function GastosClient() {
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

  const todosSeleccionados = listaGastos.length > 0 && listaGastos.every((item) => selectedGastoIds.includes(item.id));

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Gastos & Compras
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro con corte al día 10, selección interactiva y control de compras en cuotas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setVistaActiva('MES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                vistaActiva === 'MES' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos del Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('COMPRAS_CUOTAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                vistaActiva === 'COMPRAS_CUOTAS' ? 'bg-card text-indigo-400 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compras en Cuotas</span>
              {comprasCuotas.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                  {comprasCuotas.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => openRecordModal('GASTO')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {vistaActiva === 'COMPRAS_CUOTAS' ? (
        <ComprasCuotasSection
          comprasCuotas={comprasCuotas}
          loadingCuotas={loadingCuotas}
          moneda={moneda}
          compraDesplegada={compraDesplegada}
          onToggleDesplegar={(padreId) => setCompraDesplegada(compraDesplegada === padreId ? null : padreId)}
          deletingCompraId={deletingCompraId}
          onEliminarCompraCompleta={handleEliminarCompraCuotasCompleta}
        />
      ) : (
        <>
          <GastosFiltrosBar
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            totalItems={listaGastos.length}
            todosSeleccionados={todosSeleccionados}
            onToggleSelectAll={() => selectAllGastos(listaGastos.map((g) => ({ id: g.id, monto: g.monto })))}
          />

          <GastosMesTabla
            gastos={listaGastos}
            selectedGastoIds={selectedGastoIds}
            moneda={moneda}
            periodo={periodo}
            busqueda={busqueda}
            onSelectRow={(g) => setDetalleGasto(adaptGastoToDetalle(g))}
            onToggleSelectGasto={toggleSelectGasto}
            onCambiarEstadoItem={handleCambiarEstadoItem}
            onClickTrash={(g) => (g.totalCuotas > 1 ? setGastoParaEliminar(g) : handleEliminarGastoDirecto(g.id, g.concepto, false))}
          />

          <GastosSiguienteMesTabla
            tarjetas={tarjetas}
            moneda={moneda}
            onSelectRow={(g, t) =>
              setDetalleGasto({
                id: g.id,
                dbId: g.id,
                tipo: 'TARJETA',
                concepto: g.concepto,
                categoria: g.categoria,
                monto: g.monto,
                monedaOriginal: g.monedaOriginal,
                montoOriginal: g.montoOriginal,
                tipoCambio: g.tipoCambio,
                fechaGasto: g.fechaGasto,
                periodoPago: g.periodoPago,
                estado: g.estado,
                cuotaActual: g.cuotaActual,
                totalCuotas: g.totalCuotas,
                tarjetaNombre: t.nombre,
                tarjetaColor: t.color,
                tarjetaDiaCorte: t.diaCorte,
                tarjetaDiaPago: t.diaPago,
                notas: g.notas,
              })
            }
            onClickTrash={(g) => (g.totalCuotas > 1 ? setGastoParaEliminar(g) : handleEliminarGastoDirecto(g.id, g.concepto, false))}
          />
        </>
      )}

      <ModalEliminarCuota
        gasto={gastoParaEliminar}
        periodo={periodo}
        moneda={moneda}
        eliminando={eliminandoGasto}
        onClose={() => setGastoParaEliminar(null)}
        onEliminarSoloMes={() => handleEliminarGastoDirecto(gastoParaEliminar.id, gastoParaEliminar.concepto, false)}
        onEliminarTodaLaSerie={() => handleEliminarGastoDirecto(gastoParaEliminar.id, gastoParaEliminar.concepto, true)}
      />

      <ModalDetalleGasto
        item={detalleGasto}
        onClose={() => setDetalleGasto(null)}
        onCambiarEstado={async (item, nuevoEstado) => {
          await handleCambiarEstadoItem(item.dbId, nuevoEstado);
          setDetalleGasto((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
        }}
        onGuardarMonto={async (item, nuevoMonto) => {
          try {
            const res = await fetch('/api/gastos', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: item.dbId, monto: nuevoMonto }),
            });
            if (!res.ok) throw new Error('Error al actualizar monto');
            setDetalleGasto((prev) => (prev ? { ...prev, monto: nuevoMonto } : null));
            await refresh();
          } catch (err: any) {
            toast.error('Error al actualizar monto');
          }
        }}
        onEliminarGasto={async (item) => {
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
        }}
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
