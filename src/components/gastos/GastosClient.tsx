'use client';

import React, { useMemo } from 'react';
import { ModalDetalleGasto } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useGastosManager } from './hooks/useGastosManager';
import { GastosHeader } from './GastosHeader';
import { GastosFiltrosBar } from './GastosFiltrosBar';
import { GastosMesTabla } from './GastosMesTabla';
import { GastosSiguienteMesTabla } from './GastosSiguienteMesTabla';
import { ComprasCuotasSection } from './ComprasCuotasSection';
import { ModalEliminarCuota } from './ModalEliminarCuota';
import { ModalConfirmarEliminarCompra } from './ModalConfirmarEliminarCompra';

export function GastosClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
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
    compraParaEliminar,
    setCompraParaEliminar,
    deletingCompraId,
    gastoParaEliminar,
    setGastoParaEliminar,
    eliminandoGasto,
    detalleGasto,
    setDetalleGasto,
    filtroEstado,
    setFiltroEstado,
    filtroTarjeta,
    setFiltroTarjeta,
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

  // Métricas calculadas para cabecera ejecutiva
  const totalGastosMes = useMemo(
    () => listaGastos.reduce((sum, g) => sum + (g.monto || 0), 0),
    [listaGastos]
  );

  const totalPagadoMes = useMemo(
    () =>
      listaGastos
        .filter((g) => g.estado === 'PAGADO' || g.estado === 'ADELANTADO')
        .reduce((sum, g) => sum + (g.monto || 0), 0),
    [listaGastos]
  );

  const totalPendienteMes = useMemo(
    () =>
      listaGastos
        .filter((g) => g.estado !== 'PAGADO' && g.estado !== 'ADELANTADO')
        .reduce((sum, g) => sum + (g.monto || 0), 0),
    [listaGastos]
  );

  const totalSiguienteMes = useMemo(
    () => tarjetas.reduce((acc, t) => acc + (t.totalSiguientePeriodo || 0), 0),
    [tarjetas]
  );

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <GastosHeader
        periodo={periodo}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        puedeIrMesAnterior={puedeIrMesAnterior}
        prefetchMesAnterior={prefetchMesAnterior}
        prefetchMesSiguiente={prefetchMesSiguiente}
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        totalComprasCuotas={comprasCuotas.length}
        openRecordModal={openRecordModal}
        totalGastosMes={totalGastosMes}
        totalPagadoMes={totalPagadoMes}
        totalPendienteMes={totalPendienteMes}
        totalSiguienteMes={totalSiguienteMes}
        moneda={moneda}
        filtroEstadoActual={filtroEstado}
        onSelectFiltroKpi={(nuevoEstado) => setFiltroEstado(nuevoEstado)}
        onScrollToSiguiente={() => {
          const el = document.getElementById('seccion-proximo-mes');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {vistaActiva === 'COMPRAS_CUOTAS' ? (
        <ComprasCuotasSection
          comprasCuotas={comprasCuotas}
          loadingCuotas={loadingCuotas}
          moneda={moneda}
          compraDesplegada={compraDesplegada}
          onToggleDesplegar={(padreId) => setCompraDesplegada(compraDesplegada === padreId ? null : padreId)}
          deletingCompraId={deletingCompraId}
          onEliminarCompraCompleta={(compra) => setCompraParaEliminar(compra)}
        />
      ) : (
        <>
          <GastosFiltrosBar
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
            filtroTarjeta={filtroTarjeta}
            onFiltroTarjetaChange={setFiltroTarjeta}
            tarjetasDisponibles={tarjetas.map((t: any) => ({ id: t.id, nombre: t.nombre, color: t.color }))}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            totalItems={listaGastos.length}
            totalCoincidencias={listaGastos.length}
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

          <div id="seccion-proximo-mes">
            <GastosSiguienteMesTabla
              tarjetas={tarjetas}
              moneda={moneda}
              onSelectRow={(g, t) => setDetalleGasto(adaptGastoToDetalle({ ...g, tarjetaNombre: t.nombre, tarjetaColor: t.color, metodoPago: 'TARJETA_CREDITO' }))}
              onClickTrash={(g) => (g.totalCuotas > 1 ? setGastoParaEliminar(g) : handleEliminarGastoDirecto(g.id, g.concepto, false))}
            />
          </div>
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

      <ModalConfirmarEliminarCompra
        compra={compraParaEliminar}
        moneda={moneda}
        isDeleting={Boolean(deletingCompraId)}
        onClose={() => setCompraParaEliminar(null)}
        onConfirmar={() => {
          if (compraParaEliminar) {
            handleEliminarCompraCuotasCompleta(compraParaEliminar);
          }
        }}
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
