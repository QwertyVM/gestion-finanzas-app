'use client';

import React from 'react';
import { ModalDetalleGasto } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import { Receipt, Layers, Plus } from 'lucide-react';
import { useGastosManager } from './hooks/useGastosManager';
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
    handleCambiarIngresoAsignado,
  } = useGastosManager();

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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                vistaActiva === 'MES' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos del Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('COMPRAS_CUOTAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
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
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-xs cursor-pointer"
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
            onSelectRow={(g, t) => setDetalleGasto(adaptGastoToDetalle({ ...g, tarjetaNombre: t.nombre, tarjetaColor: t.color, metodoPago: 'TARJETA_CREDITO' }))}
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
        onGuardarMonto={handleGuardarMonto}
        onEliminarGasto={handleEliminarGasto}
        onCambiarClasificacion={handleCambiarClasificacion}
        onGuardarConcepto={handleGuardarConcepto}
        onCambiarCategoria={handleCambiarCategoria}
        onGuardarNotas={handleGuardarNotas}
        onCambiarMetodoPago={handleCambiarMetodoPago}
        onCambiarIngresoAsignado={handleCambiarIngresoAsignado}
        ingresosMes={resumen?.ingresos || []}
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
