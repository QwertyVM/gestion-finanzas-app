'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  formatMoney,
  ClasificacionEgreso,
} from '@/lib/utils';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import { FloatingSumBar } from '@/components/common/FloatingSumBar';
import {
  Plus,
  CheckCircle2,
  Home,
  Landmark,
  Layers,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';

import { ResumenHeroKpis } from './ResumenHeroKpis';
import { IngresosMesTabla } from './IngresosMesTabla';
import { DiferenciacionEgresosBar } from './DiferenciacionEgresosBar';
import { FiltrosEstadoBar } from './FiltrosEstadoBar';
import { SeccionEgresosTabla } from './SeccionEgresosTabla';

export function DashboardClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    resumen,
    loading,
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

  const [itemsOrdenados, setItemsOrdenados] = useState<Array<any>>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  const labelEspecial = mesActual === 7 ? 'Mes de Gratificación Fiestas Patrias' : mesActual === 12 ? 'Mes de Gratificación Navidad' : mesActual === 3 ? 'Mes de Utilidades' : '';

  // Consolidar todos los egresos del mes
  const todosEgresos = useMemo(() => {
    if (!resumen) return [];
    if (resumen.egresosConsolidados && resumen.egresosConsolidados.length > 0) {
      return resumen.egresosConsolidados as Array<
        DetalleItemData & {
          clasificacion: ClasificacionEgreso;
          categoriaColor?: string;
          colorHex?: string;
          badgeLabel?: string;
        }
      >;
    }

    const list: Array<DetalleItemData & { clasificacion: ClasificacionEgreso; categoriaColor?: string }> = [];
    for (const cf of resumen.costosFijos || []) {
      list.push({
        id: `fijo-${cf.id}`,
        dbId: cf.id,
        tipo: 'FIJO',
        clasificacion: 'FIJO',
        concepto: cf.concepto,
        categoria: cf.categoria,
        monto: cf.monto,
        diaVencimiento: cf.diaVencimiento,
        estado: cf.estado,
        fechaPagoReal: cf.fechaPagoReal,
        metodoPago: cf.metodoPago,
        subtexto: cf.metodoPago === 'TARJETA_CREDITO' ? 'Tarjeta de Crédito' : cf.metodoPago === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo / Débito',
      });
    }
    for (const p of resumen.prestamos || []) {
      if (p.aplicaEsteMes === false) continue;
      list.push({
        id: `prestamo-${p.cuotaId}`,
        dbId: p.cuotaId,
        prestamoId: p.id,
        tipo: 'PRESTAMO',
        clasificacion: 'PRESTAMO',
        concepto: `${p.banco} - ${p.concepto}`,
        categoria: 'Préstamo',
        monto: p.montoCuota,
        cuotaActual: p.cuotaActual,
        cuotasTotales: p.cuotasTotales,
        diaVencimiento: p.diaPago,
        estado: p.estado,
        subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} (${p.banco})`,
      });
    }
    for (const t of resumen.tarjetasCredito || []) {
      for (const g of t.gastosPeriodo || []) {
        const esCuota = (g.totalCuotas || 1) > 1;
        list.push({
          id: g.id,
          dbId: g.id,
          tipo: 'TARJETA',
          clasificacion: esCuota ? 'CUOTA' : 'VARIABLE',
          concepto: g.concepto,
          categoria: g.categoria,
          monto: g.monto,
          fechaGasto: g.fechaGasto,
          periodoPago: g.periodoPago,
          cuotaActual: g.cuotaActual,
          totalCuotas: g.totalCuotas,
          estado: g.estado,
          subtexto: esCuota ? `${t.nombre} · Cuota ${g.cuotaActual}/${g.totalCuotas}` : `${t.nombre} · Tarjeta`,
        });
      }
    }
    for (const g of resumen.gastosDirectos || []) {
      list.push({
        id: g.id,
        dbId: g.id,
        tipo: 'DIRECTO',
        clasificacion: 'VARIABLE',
        concepto: g.concepto,
        categoria: g.categoria,
        monto: g.monto,
        fechaGasto: g.fechaGasto,
        periodoPago: g.periodoPago,
        metodoPago: g.metodoPago,
        estado: g.estado,
        subtexto: 'Efectivo / Débito',
      });
    }
    return list;
  }, [resumen]);

  React.useEffect(() => {
    setItemsOrdenados(todosEgresos);
  }, [todosEgresos]);

  const listaActivaEgresos = itemsOrdenados.length > 0 ? itemsOrdenados : todosEgresos;

  // Manejo de Drop para Drag and Drop persistente
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

  // Filtrado reactivo por Clasificación primero
  const egresosPorClasificacion = useMemo(() => {
    return listaActivaEgresos.filter((item) => {
      if (filtroEgreso === 'FIJOS') return item.clasificacion === 'FIJO';
      if (filtroEgreso === 'PRESTAMOS') return item.clasificacion === 'PRESTAMO';
      if (filtroEgreso === 'CUOTAS') return item.clasificacion === 'CUOTA';
      if (filtroEgreso === 'VARIABLES') return item.clasificacion === 'VARIABLE';
      return true;
    });
  }, [listaActivaEgresos, filtroEgreso]);

  // Filtrado reactivo por Estado
  const egresosFiltrados = useMemo(() => {
    return egresosPorClasificacion.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;
      return true;
    });
  }, [egresosPorClasificacion, filtroEstado]);

  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});

  const toggleColapsarSeccion = (seccionId: string) => {
    setSeccionesColapsadas((prev) => ({
      ...prev,
      [seccionId]: !prev[seccionId],
    }));
  };

  // 3 Secciones principales y estructuradas
  const seccionesCompromisos = useMemo(() => {
    const configSecciones = [
      {
        id: 'FIJOS',
        clave: 'fijos',
        titulo: 'Compras fijas',
        descripcion: 'Gastos recurrentes y servicios regulares',
        icono: Home,
        headerBg: 'bg-sky-500/10 dark:bg-sky-950/40',
        iconBg: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200/80 dark:border-sky-800/60',
      },
      {
        id: 'PRESTAMOS',
        clave: 'prestamos',
        titulo: 'Préstamos bancarios',
        descripcion: 'Cuotas mensuales de financiamiento y créditos',
        icono: Landmark,
        headerBg: 'bg-purple-500/10 dark:bg-purple-950/40',
        iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200/80 dark:border-purple-800/60',
      },
      {
        id: 'CUOTAS',
        clave: 'cuotas',
        titulo: 'Compras a cuotas',
        descripcion: 'Compras en cuotas con tarjeta de crédito',
        icono: Layers,
        headerBg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
        iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
      },
      {
        id: 'VARIABLES',
        clave: 'variables',
        titulo: 'Gastos variables & directos',
        descripcion: 'Consumos directos, salidas y gastos del día a día',
        icono: Banknote,
        headerBg: 'bg-teal-500/10 dark:bg-teal-950/40',
        iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200/80 dark:border-teal-800/60',
      },
    ];

    return configSecciones.map((cfg) => {
      const itemsDeEstaSeccion = egresosFiltrados.filter((it) => {
        if (cfg.id === 'FIJOS') return it.clasificacion === 'FIJO';
        if (cfg.id === 'PRESTAMOS') return it.clasificacion === 'PRESTAMO';
        if (cfg.id === 'CUOTAS') return it.clasificacion === 'CUOTA';
        return it.clasificacion === 'VARIABLE';
      });

      const subtotal = itemsDeEstaSeccion.reduce((acc, curr) => acc + (curr.monto || 0), 0);
      return {
        ...cfg,
        itemsFiltrados: itemsDeEstaSeccion,
        subtotal,
        filteredCount: itemsDeEstaSeccion.length,
      };
    });
  }, [egresosFiltrados]);

  const seccionesVisibles = useMemo(() => {
    if (filtroEgreso === 'TODOS') {
      return seccionesCompromisos.filter((s) => s.filteredCount > 0);
    }
    return seccionesCompromisos.filter((s) => s.id === filtroEgreso);
  }, [seccionesCompromisos, filtroEgreso]);

  const isAllSelected = egresosFiltrados.length > 0 && egresosFiltrados.every((i) => selectedGastoIds.includes(i.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllGastos(egresosFiltrados.map((i) => ({ id: i.id, monto: i.monto })));
    }
  };

  // Handlers para acciones
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
      if (item.tipo === 'FIJO') {
        await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            costoFijoId: item.dbId,
            periodo,
            metodoPago: nuevoMetodo,
            tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
          }),
        });

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
      } else if (item.tipo === 'TARJETA' || item.tipo === 'DIRECTO') {
        await fetch('/api/gastos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.dbId,
            metodoPago: nuevoMetodo,
            tarjetaId: nuevoMetodo === 'TARJETA_CREDITO' ? tarjetaId : null,
          }),
        });
      }

      const tObj = resumen?.tarjetasCredito?.find((t) => t.id === tarjetaId);
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
    } catch {
      toast.error('Error al actualizar forma de pago');
    }
  };

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    await handleToggleEstadoItem(item, nuevoEstado);
    setDetalleItem((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
  };

  const handleAgregarASeccion = (seccionId: string) => {
    if (seccionId === 'FIJOS') {
      toast.info('Para registrar un costo fijo ve a "Fijos y Préstamos"');
    } else if (seccionId === 'PRESTAMOS') {
      toast.info('Para registrar un préstamo ve a "Fijos y Préstamos"');
    } else {
      openRecordModal('GASTO');
    }
  };

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  if (!resumen) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No se encontraron datos para este mes.</p>
      </div>
    );
  }

  const disponibleNeto = resumen.dineroDisponibleNeto;
  const conteoEgresosFiltrados = egresosFiltrados.length;
  const totalEgresosFiltrados = egresosFiltrados.reduce((sum, item) => sum + (item.monto || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <FloatingSumBar />

      {/* 1. HERO KPIS CARD */}
      <ResumenHeroKpis
        periodo={periodo}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        disponibleNeto={disponibleNeto}
        totalIngresos={resumen.totalIngresos}
        totalEgresos={resumen.totalEgresos}
        totalPendiente={resumen.totalPendiente}
        cantidadIngresos={resumen.ingresos.length}
        moneda={moneda}
        esMesEspecial={esMesEspecial}
        labelEspecial={labelEspecial}
        openRecordModal={openRecordModal}
      />

      {/* 2. SECCIÓN: INGRESOS DEL MES */}
      <IngresosMesTabla
        ingresos={resumen.ingresos}
        totalIngresos={resumen.totalIngresos}
        moneda={moneda}
        openRecordModal={openRecordModal}
        onToggleRecibido={handleToggleRecibidoIngreso}
        onEliminarIngreso={handleEliminarIngreso}
      />

      {/* 3. SECCIÓN: EGRESOS & COMPROMISOS DEL MES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Egresos & Compromisos del Mes
              </h2>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
                {todosEgresos.length} compromisos · {formatMoney(resumen.totalEgresos, moneda)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Costos fijos, cuotas de préstamos, consumos de tarjeta y gastos directos.
            </p>
          </div>

          <button
            onClick={() => openRecordModal('GASTO')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>
        </div>

        {/* Barra de composición y tarjetas de filtro por tipo */}
        <DiferenciacionEgresosBar
          totales={resumen?.totalesPorClasificacion}
          filtroEgreso={filtroEgreso}
          onSelectFiltro={setFiltroEgreso}
          moneda={moneda}
        />

        {/* Filtros de estado (Pendientes, Adelantados, Pagados, Todos) y Sumar lista */}
        <FiltrosEstadoBar
          filtroEstado={filtroEstado}
          onSelectEstado={setFiltroEstado}
          conteoPendiente={todosEgresos.filter((g) => g.estado === 'PENDIENTE').length}
          conteoAdelantado={todosEgresos.filter((g) => g.estado === 'ADELANTADO').length}
          conteoPagado={todosEgresos.filter((g) => g.estado === 'PAGADO').length}
          conteoTotal={todosEgresos.length}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          hasItems={conteoEgresosFiltrados > 0}
        />

        {/* Lista de Secciones */}
        {conteoEgresosFiltrados === 0 ? (
          <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
            <p className="text-xs text-muted-foreground">
              {filtroEstado === 'PENDIENTE'
                ? 'No hay compromisos pendientes para este mes.'
                : 'No se encontraron registros con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {seccionesVisibles.map((sec) => (
              <SeccionEgresosTabla
                key={sec.id}
                seccion={sec}
                estaColapsada={!!seccionesColapsadas[sec.id]}
                onToggleColapsar={() => toggleColapsarSeccion(sec.id)}
                onAgregarItem={() => handleAgregarASeccion(sec.id)}
                selectedGastoIds={selectedGastoIds}
                onToggleSelectGasto={toggleSelectGasto}
                onSelectItem={setDetalleItem}
                onToggleEstadoItem={handleToggleEstadoItem}
                moneda={moneda}
                draggedId={draggedId}
                dragOverId={dragOverId}
                onDragStart={(id, e) => {
                  e.dataTransfer.setData('text/plain', id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggedId(id);
                }}
                onDragOver={(id, e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverId !== id) setDragOverId(id);
                }}
                onDragLeave={(id) => {
                  if (dragOverId === id) setDragOverId(null);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                onDrop={handleDrop}
              />
            ))}

            {/* Total General de Compromisos Filtrados */}
            <div className="bg-card border border-border/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-medium shadow-xs">
              <div className="text-muted-foreground">
                Total Compromisos Filtrados ({conteoEgresosFiltrados} items en {seccionesVisibles.length} {seccionesVisibles.length === 1 ? 'sección' : 'secciones'})
              </div>
              <div className="font-mono font-bold text-sm text-foreground">
                {formatMoney(totalEgresosFiltrados, moneda)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE COMPROMISO */}
      <ModalDetalleGasto
        item={detalleItem}
        onClose={() => setDetalleItem(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        onEliminarGasto={handleEliminarGastoModal}
        onCambiarMetodoPago={handleCambiarMetodoPagoModal}
        tarjetas={resumen.tarjetasCredito}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
