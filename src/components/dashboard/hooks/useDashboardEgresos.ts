'use client';

import { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import type { IngresoItem } from '../IngresoCardMobile';
import { useEgresosDragDrop, EgresoItemConClasificacion } from './useEgresosDragDrop';
import { useEgresosFiltros } from './useEgresosFiltros';
import { useEgresosMutations } from './useEgresosMutations';

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

  // Estados de Modals y Edición
  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [modalSueldoOpen, setModalSueldoOpen] = useState(false);
  const [sueldoParaEditar, setSueldoParaEditar] = useState(0);
  const [ingresoParaEditar, setIngresoParaEditar] = useState<IngresoItem | null>(null);

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
    return resumen.egresosConsolidados as EgresoItemConClasificacion[];
  }, [resumen]);

  // Sub-hook 1: Drag & Drop y reordenamiento persistente
  const dragDrop = useEgresosDragDrop({
    todosEgresos,
    usuarioId: usuarioActual?.id,
    refresh,
  });

  // Identificar el Sueldo principal para atribución por defecto
  const sueldoPrincipal = useMemo(() => {
    return resumen?.ingresos?.find((i: any) => i.tipo === 'SUELDO') || resumen?.ingresos?.[0];
  }, [resumen]);

  // Sub-hook 2: Filtrado por clasificación, estado, fuente de ingreso y secciones
  const filtros = useEgresosFiltros({
    listaActivaEgresos: dragDrop.listaActivaEgresos,
    sueldoPrincipal,
  });

  // Sub-hook 3: Mutaciones y acciones API del dashboard
  const mutations = useEgresosMutations({
    periodo,
    listaActivaEgresos: dragDrop.listaActivaEgresos,
    selectedGastoIds,
    refresh,
    clearSelection,
    setDetalleItem,
    openRecordModal,
  });

  const handleSelectAll = () => {
    if (selectedGastoIds.length === filtros.egresosFiltrados.length && filtros.egresosFiltrados.length > 0) {
      clearSelection();
    } else {
      selectAllGastos(filtros.egresosFiltrados.map((i) => ({ id: i.id, monto: i.monto })));
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
    filtroEstado: filtros.filtroEstado,
    setFiltroEstado: filtros.setFiltroEstado,
    filtroEgreso: filtros.filtroEgreso,
    setFiltroEgreso: filtros.setFiltroEgreso,
    filtroFuenteIngreso: filtros.filtroFuenteIngreso,
    setFiltroFuenteIngreso: filtros.setFiltroFuenteIngreso,
    handleAsignarIngresoItem: mutations.handleAsignarIngresoItem,
    handleAsignarIngresoMasivo: mutations.handleAsignarIngresoMasivo,
    draggedId: dragDrop.draggedId,
    setDraggedId: dragDrop.setDraggedId,
    dragOverId: dragDrop.dragOverId,
    setDragOverId: dragDrop.setDragOverId,
    handleDrop: dragDrop.handleDrop,
    egresosFiltrados: filtros.egresosFiltrados,
    seccionesCompromisos: filtros.seccionesCompromisos,
    toggleColapsarSeccion: filtros.toggleColapsarSeccion,
    handleSelectAll,
    detalleItem,
    setDetalleItem,
    modalSueldoOpen,
    setModalSueldoOpen,
    sueldoParaEditar,
    setSueldoParaEditar,
    ingresoParaEditar,
    setIngresoParaEditar,
    handleToggleEstadoItem: mutations.handleToggleEstadoItem,
    handleToggleRecibidoIngreso: mutations.handleToggleRecibidoIngreso,
    handleEliminarIngreso: mutations.handleEliminarIngreso,
    handleGuardarMontoModal: mutations.handleGuardarMontoModal,
    handleEliminarGastoModal: mutations.handleEliminarGastoModal,
    handleCambiarMetodoPagoModal: mutations.handleCambiarMetodoPagoModal,
    handleCambiarClasificacionModal: mutations.handleCambiarClasificacionModal,
    handleCambiarCategoriaModal: mutations.handleCambiarCategoriaModal,
    handleGuardarConceptoModal: mutations.handleGuardarConceptoModal,
    handleGuardarNotasModal: mutations.handleGuardarNotasModal,
    handleCambiarEstadoModal: mutations.handleCambiarEstadoModal,
    handleCambiarIngresoAsignadoModal: mutations.handleCambiarIngresoAsignadoModal,
    handleAbrirRegistroSeccion: mutations.handleAbrirRegistroSeccion,
  };
}
