'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  formatMoney,
  formatPeriodoLabel,
  type ClasificacionEgreso,
  ESTILOS_CLASIFICACION,
  getEstiloClasificacion,
  esItemRecurrente,
} from '@/lib/utils';
import { ModalDetalleGasto, type DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Table,
  LayoutGrid,
  CheckSquare,
  Square,
  CheckCircle2,
  Trash2,
  Home,
  Landmark,
  Layers,
  Banknote,
  GripVertical,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardClient() {
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    resumen,
    loading,
    refresh,
    selectedGastoIds,
    toggleSelectGasto,
    selectAllGastos,
    openRecordModal,
    usuarioActual,
  } = useFinanzas();

  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS'>('PENDIENTE');
  const [filtroEgreso, setFiltroEgreso] = useState<'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES'>('TODOS');
  const [modoVista, setModoVista] = useState<'TABLA' | 'TARJETAS'>('TABLA');

  const [itemsOrdenados, setItemsOrdenados] = useState<Array<any>>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('finanzapp_modoVista_dashboard');
      if (saved === 'TABLA' || saved === 'TARJETAS') {
        setModoVista(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const cambiarModoVista = (modo: 'TABLA' | 'TARJETAS') => {
    setModoVista(modo);
    try {
      localStorage.setItem('finanzapp_modoVista_dashboard', modo);
    } catch {
      // ignore
    }
  };

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = 'Gratificación';
  if (mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  // Consolidar todos los egresos del mes provistos por el backend
  const todosEgresos = useMemo(() => {
    if (!resumen) return [];
    if (resumen.egresosConsolidados && resumen.egresosConsolidados.length > 0) {
      return resumen.egresosConsolidados as Array<
        DetalleItemData & {
          clasificacion: ClasificacionEgreso;
          categoriaColor?: string;
          colorHex?: string;
          colorKey?: string;
          badgeLabel?: string;
        }
      >;
    }

    // Fallback de contingencia si egresosConsolidados viniera vacío
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
        subtexto: `Costo Fijo · Día ${cf.diaVencimiento}`,
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
        subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} · Día ${p.diaPago}`,
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

  // Sincronizar items al cargar o actualizar resumen
  React.useEffect(() => {
    setItemsOrdenados(todosEgresos);
  }, [todosEgresos]);

  // Lista activa de items (prioriza el orden local reactivo)
  const listaActivaEgresos = itemsOrdenados.length > 0 ? itemsOrdenados : todosEgresos;

  // Manejo de Drop para Drag and Drop persistente a la base de datos
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
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

    // Feedback visual inmediato
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

      if (!res.ok) throw new Error('Error al guardar el nuevo orden');
      toast.success('Orden actualizado para todos los meses posteriores');
      await refresh();
    } catch (error) {
      console.error('Error al persistir orden:', error);
      toast.error('Error al actualizar el orden');
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

  // 3 Secciones principales y estructuradas provistas por el modelo de negocio
  const seccionesCompromisos = useMemo(() => {
    const configSecciones = [
      {
        id: 'FIJOS',
        clave: 'fijos',
        titulo: 'Compras fijas',
        descripcion: 'Gastos y servicios fijos programados para este mes',
        icono: Home,
        colorKey: 'sky',
        headerBg: 'bg-sky-50/70 dark:bg-sky-950/25',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200 dark:border-sky-800/60',
        borderColor: 'border-l-sky-500',
        iconBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400',
      },
      {
        id: 'PRESTAMOS',
        clave: 'prestamos',
        titulo: 'Compras de préstamos bancario',
        descripcion: 'Amortización de préstamos personales, vehiculares y créditos',
        icono: Landmark,
        colorKey: 'purple',
        headerBg: 'bg-purple-50/70 dark:bg-purple-950/25',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200 dark:border-purple-800/60',
        borderColor: 'border-l-purple-500',
        iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400',
      },
      {
        id: 'CUOTAS',
        clave: 'cuotas',
        titulo: 'Compras en tarjeta en cuotas',
        descripcion: 'Cuotas mensuales de consumos financiados con tarjeta de crédito',
        icono: CreditCard,
        colorKey: 'indigo',
        headerBg: 'bg-indigo-50/70 dark:bg-indigo-950/25',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200 dark:border-indigo-800/60',
        borderColor: 'border-l-indigo-500',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400',
      },
      {
        id: 'VARIABLES',
        clave: 'variables',
        titulo: 'Otras compras / Gastos variables',
        descripcion: 'Compras directas y gastos corrientes del mes',
        icono: Banknote,
        colorKey: 'teal',
        headerBg: 'bg-teal-50/70 dark:bg-teal-950/25',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200 dark:border-teal-800/60',
        borderColor: 'border-l-teal-500',
        iconBg: 'bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400',
      },
    ];

    return configSecciones.map((cfg) => {
      const itemsDeSeccion = listaActivaEgresos.filter((it) => {
        if (cfg.id === 'FIJOS') return it.clasificacion === 'FIJO';
        if (cfg.id === 'PRESTAMOS') return it.clasificacion === 'PRESTAMO';
        if (cfg.id === 'CUOTAS') return it.clasificacion === 'CUOTA';
        if (cfg.id === 'VARIABLES') return it.clasificacion === 'VARIABLE';
        return it.clasificacion === cfg.id;
      });
      const itemsFiltrados = itemsDeSeccion.filter((it) => {
        if (filtroEstado !== 'TODOS' && it.estado !== filtroEstado) return false;
        return true;
      });
      const subtotal = itemsFiltrados.reduce((acc, it) => acc + (it.monto || 0), 0);

      return {
        ...cfg,
        itemsBase: itemsDeSeccion,
        itemsFiltrados,
        subtotal,
        totalCount: itemsDeSeccion.length,
        filteredCount: itemsFiltrados.length,
      };
    });
  }, [listaActivaEgresos, filtroEstado]);

  const seccionesVisibles = useMemo(() => {
    return seccionesCompromisos.filter((sec) => {
      if (filtroEgreso === 'FIJOS' && sec.id !== 'FIJOS') return false;
      if (filtroEgreso === 'PRESTAMOS' && sec.id !== 'PRESTAMOS') return false;
      if (filtroEgreso === 'CUOTAS' && sec.id !== 'CUOTAS') return false;
      if (filtroEgreso === 'VARIABLES' && sec.id !== 'VARIABLES') return false;

      // Si no hay filtro específico y la sección variables está vacía, mostrar exactamente las 3 solicitadas
      if (filtroEgreso === 'TODOS' && sec.id === 'VARIABLES' && sec.itemsBase.length === 0) {
        return false;
      }
      return true;
    });
  }, [seccionesCompromisos, filtroEgreso]);

  const totalEgresosFiltrados = useMemo(
    () => seccionesVisibles.reduce((acc, sec) => acc + sec.subtotal, 0),
    [seccionesVisibles]
  );

  const conteoEgresosFiltrados = useMemo(
    () => seccionesVisibles.reduce((acc, sec) => acc + sec.filteredCount, 0),
    [seccionesVisibles]
  );

  // Conteo rápido de estados según la clasificación activa
  const countPendientes = useMemo(
    () => egresosPorClasificacion.filter((i) => i.estado === 'PENDIENTE').length,
    [egresosPorClasificacion]
  );
  const countAdelantados = useMemo(
    () => egresosPorClasificacion.filter((i) => i.estado === 'ADELANTADO').length,
    [egresosPorClasificacion]
  );
  const countPagados = useMemo(
    () => egresosPorClasificacion.filter((i) => i.estado === 'PAGADO').length,
    [egresosPorClasificacion]
  );

  const handleAgregarASeccion = (seccionId: string) => {
    if (seccionId === 'FIJOS') {
      openRecordModal('FIJO');
    } else if (seccionId === 'PRESTAMOS') {
      openRecordModal('PRESTAMO');
    } else if (seccionId === 'CUOTAS') {
      openRecordModal('GASTO', { metodoPago: 'TARJETA_CREDITO', totalCuotas: 2 });
    } else if (seccionId === 'VARIABLES') {
      openRecordModal('GASTO', { totalCuotas: 1 });
    } else {
      openRecordModal('GASTO');
    }
  };

  if (loading || !resumen) {
    return <DashboardSkeleton />;
  }

  const disponibleNeto = resumen.dineroDisponibleNeto;
  const disponibleEsPositivo = disponibleNeto >= 0;

  // Cambiar estado de un ítem
  const handleToggleEstadoItem = async (item: any, nuevoEstado: string) => {
    try {
      if (item.tipo === 'FIJO') {
        await fetch('/api/fijos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costoFijoId: item.dbId, periodo, estado: nuevoEstado }),
        });
      } else if (item.tipo === 'PRESTAMO') {
        await fetch('/api/prestamos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cuotaId: item.dbId, estado: nuevoEstado }),
        });
      } else {
        await fetch('/api/gastos/masivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cambiar_estado', ids: [item.dbId], estado: nuevoEstado }),
        });
      }
      await refresh();
      toast.success(`Estado actualizado a ${nuevoEstado.toLowerCase()}`);
    } catch (e: any) {
      toast.error('Error al actualizar');
    }
  };

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    await handleToggleEstadoItem(item, nuevoEstado);
    setDetalleItem((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
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
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.dbId, monto: nuevoMonto }),
        });
      }
      setDetalleItem((prev) => (prev ? { ...prev, monto: nuevoMonto } : null));
      await refresh();
    } catch (e: any) {
      toast.error('Error al actualizar monto');
    }
  };

  const handleEliminarGastoModal = async (item: DetalleItemData) => {
    try {
      await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', ids: [item.dbId] }),
      });
      toast.success('Gasto eliminado');
      setDetalleItem(null);
      await refresh();
    } catch (e: any) {
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

        const tObj = resumen.tarjetasCredito.find((t) => t.id === tarjetaId);
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
    } catch (e: any) {
      toast.error('Error al actualizar forma de pago');
    }
  };

  const handleEliminarIngreso = async (id: string) => {
    if (!confirm('¿Eliminar este ingreso?')) return;
    try {
      await fetch(`/api/ingresos?id=${id}`, { method: 'DELETE' });
      toast.success('Ingreso eliminado');
      await refresh();
    } catch (e: any) {
      toast.error('Error al eliminar');
    }
  };

  const handleToggleRecibidoIngreso = async (ingreso: any) => {
    try {
      const nuevoEstado = !ingreso.recibido;
      const res = await fetch('/api/ingresos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ingreso.id, recibido: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar ingreso');
      await refresh();
      toast.success(nuevoEstado ? 'Ingreso marcado como recibido' : 'Ingreso marcado como pendiente');
    } catch (e: any) {
      toast.error('Error al actualizar estado del ingreso');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO CARD: DINERO LIBRE & METRICAS */}
      <div className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Periodo
              </span>
              <div className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md text-xs font-medium">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  className="hover:text-foreground text-muted-foreground transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="capitalize px-1 text-foreground">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  className="hover:text-foreground text-muted-foreground transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {esMesEspecial && (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  · {labelEspecial}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-mono">
                {formatMoney(disponibleNeto, moneda)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${disponibleEsPositivo
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
              >
                {disponibleEsPositivo ? 'Saldo libre' : 'Déficit'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dinero disponible tras cubrir compromisos del mes.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => openRecordModal('INGRESO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => openRecordModal('GASTO')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs transition active:scale-98"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* Métricas clave en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block">Total Ingresos</span>
            <span className="text-lg font-semibold text-foreground font-mono mt-0.5 block">
              {formatMoney(resumen.totalIngresos, moneda)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {resumen.ingresos.length} {resumen.ingresos.length === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block">Total Egresos</span>
            <span className="text-lg font-semibold text-foreground font-mono mt-0.5 block">
              {formatMoney(resumen.totalEgresos, moneda)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatMoney(resumen.totalPendiente, moneda)} pendientes
            </span>
          </div>
        </div>
      </div>

      {/* BANNER DICIEMBRE */}
      {periodo.endsWith('-12') && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Plan Especial Diciembre</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Gratificación incluida (+S/ 10,500). Pago Tía cancelable con gratificación (-S/ 3,060).
          </p>
        </div>
      )}

      {/* 2. SECCIÓN: INGRESOS DEL MES */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Ingresos del Mes
              </h2>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                {resumen.ingresos.length} {resumen.ingresos.length === 1 ? 'fuente' : 'fuentes'} · {formatMoney(resumen.totalIngresos, moneda)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sueldo, gratificaciones y entradas adicionales programadas.
            </p>
          </div>

          <button
            onClick={() => openRecordModal('INGRESO')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Ingreso</span>
          </button>
        </div>

        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Tipo / Origen</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Fecha Esperada</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {resumen.ingresos.map((ing) => {
                  const fechaObj = new Date(ing.fechaEsperada);
                  const fechaLabel = !isNaN(fechaObj.getTime())
                    ? fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
                    : 'Fin de mes';

                  return (
                    <tr key={ing.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-foreground text-xs">{ing.concepto}</div>
                        {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
                          <div className="text-[11px] text-muted-foreground">
                            ${ing.montoOriginal} USD (TC: {ing.tipoCambio})
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ing.tipo === 'SUELDO'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : ing.tipo === 'GRATIFICACION'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : ing.tipo === 'UTILIDADES'
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {ing.tipo === 'SUELDO'
                            ? 'Sueldo Planilla'
                            : ing.tipo === 'GRATIFICACION'
                              ? 'Gratificación'
                              : ing.tipo === 'UTILIDADES'
                                ? 'Utilidades'
                                : 'Ingreso Extra'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                        {fechaLabel}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleRecibidoIngreso(ing)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer hover:opacity-80 ${ing.recibido
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          title="Hacer clic para alternar estado"
                          aria-label={ing.recibido ? 'Ingreso recibido' : 'Ingreso por recibir'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${ing.recibido ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                          />
                          <span>{ing.recibido ? 'Recibido' : 'Por recibir'}</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap text-xs">
                        {formatMoney(ing.monto, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleRecibidoIngreso(ing)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
                            title={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
                            aria-label={ing.recibido ? 'Marcar como por recibir' : 'Marcar como recibido'}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${ing.recibido ? 'text-emerald-500' : 'text-muted-foreground'
                                }`}
                            />
                          </button>

                          {ing.tipo === 'EXTRA' && (
                            <button
                              type="button"
                              onClick={() => handleEliminarIngreso(ing.id)}
                              className="text-muted-foreground hover:text-rose-500 p-1 rounded hover:bg-muted transition"
                              title="Eliminar ingreso"
                              aria-label="Eliminar ingreso extra"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/20 border-t border-border/60 text-xs font-medium">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-muted-foreground">
                    Total Ingresos del Mes
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatMoney(resumen.totalIngresos, moneda)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: EGRESOS & COMPROMISOS DEL MES */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Egresos & Compromisos del Mes
              </h2>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                {todosEgresos.length} compromisos · {formatMoney(resumen.totalEgresos, moneda)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Costos fijos, cuotas de préstamos, consumos de tarjeta y gastos directos.
            </p>
          </div>

          <button
            onClick={() => openRecordModal('GASTO')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>
        </div>

        {/* Barra de Composición y Diferenciación por Color */}
        {resumen?.totalesPorClasificacion && (
          <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                Diferenciación de Egresos por Tipo
              </span>
              <span className="font-mono text-muted-foreground text-[11px]">
                Total: {formatMoney(resumen.totalesPorClasificacion.total, moneda)}
              </span>
            </div>

            {/* Barra segmentada de colores */}
            <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
              {resumen.totalesPorClasificacion.porcentajeFijos > 0 && (
                <div
                  style={{ width: `${resumen.totalesPorClasificacion.porcentajeFijos}%` }}
                  className="bg-sky-500 h-full transition-all duration-300"
                  title={`Costos Fijos: ${resumen.totalesPorClasificacion.porcentajeFijos}%`}
                />
              )}
              {resumen.totalesPorClasificacion.porcentajePrestamos > 0 && (
                <div
                  style={{ width: `${resumen.totalesPorClasificacion.porcentajePrestamos}%` }}
                  className="bg-purple-500 h-full transition-all duration-300"
                  title={`Préstamos: ${resumen.totalesPorClasificacion.porcentajePrestamos}%`}
                />
              )}
              {resumen.totalesPorClasificacion.porcentajeCuotas > 0 && (
                <div
                  style={{ width: `${resumen.totalesPorClasificacion.porcentajeCuotas}%` }}
                  className="bg-indigo-500 h-full transition-all duration-300"
                  title={`Cuotas: ${resumen.totalesPorClasificacion.porcentajeCuotas}%`}
                />
              )}
              {resumen.totalesPorClasificacion.porcentajeVariables > 0 && (
                <div
                  style={{ width: `${resumen.totalesPorClasificacion.porcentajeVariables}%` }}
                  className="bg-teal-500 h-full transition-all duration-300"
                  title={`Variables: ${resumen.totalesPorClasificacion.porcentajeVariables}%`}
                />
              )}
            </div>

            {/* Botones / Tarjetas de métricas con color distintivo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFiltroEgreso(filtroEgreso === 'FIJOS' ? 'TODOS' : 'FIJOS')}
                className={`p-2.5 rounded-xl border text-left transition ${filtroEgreso === 'FIJOS'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-xs'
                    : 'border-border/60 hover:bg-muted/40'
                  }`}
              >
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium text-[11px]">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span>Costos Fijos</span>
                </div>
                <div className="font-mono font-semibold text-foreground text-xs mt-1">
                  {formatMoney(resumen.totalesPorClasificacion.fijos, moneda)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {resumen.totalesPorClasificacion.conteoFijos} fijos · {resumen.totalesPorClasificacion.porcentajeFijos}%
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEgreso(filtroEgreso === 'PRESTAMOS' ? 'TODOS' : 'PRESTAMOS')}
                className={`p-2.5 rounded-xl border text-left transition ${filtroEgreso === 'PRESTAMOS'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-xs'
                    : 'border-border/60 hover:bg-muted/40'
                  }`}
              >
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium text-[11px]">
                  <Landmark className="w-3.5 h-3.5 shrink-0" />
                  <span>Préstamos</span>
                </div>
                <div className="font-mono font-semibold text-foreground text-xs mt-1">
                  {formatMoney(resumen.totalesPorClasificacion.prestamos, moneda)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {resumen.totalesPorClasificacion.conteoPrestamos} cuotas · {resumen.totalesPorClasificacion.porcentajePrestamos}%
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEgreso(filtroEgreso === 'CUOTAS' ? 'TODOS' : 'CUOTAS')}
                className={`p-2.5 rounded-xl border text-left transition ${filtroEgreso === 'CUOTAS'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-border/60 hover:bg-muted/40'
                  }`}
              >
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Cuotas Tarjeta</span>
                </div>
                <div className="font-mono font-semibold text-foreground text-xs mt-1">
                  {formatMoney(resumen.totalesPorClasificacion.cuotas, moneda)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {resumen.totalesPorClasificacion.conteoCuotas} items · {resumen.totalesPorClasificacion.porcentajeCuotas}%
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEgreso(filtroEgreso === 'VARIABLES' ? 'TODOS' : 'VARIABLES')}
                className={`p-2.5 rounded-xl border text-left transition ${filtroEgreso === 'VARIABLES'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 shadow-xs'
                    : 'border-border/60 hover:bg-muted/40'
                  }`}
              >
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium text-[11px]">
                  <Banknote className="w-3.5 h-3.5 shrink-0" />
                  <span>Compras / Var.</span>
                </div>
                <div className="font-mono font-semibold text-foreground text-xs mt-1">
                  {formatMoney(resumen.totalesPorClasificacion.variables, moneda)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {resumen.totalesPorClasificacion.conteoVariables} items · {resumen.totalesPorClasificacion.porcentajeVariables}%
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Barra de Filtros Minimalista */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/80 rounded-xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Estado */}
            <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${filtroEstado === 'PENDIENTE'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Por pagar ({countPendientes})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('ADELANTADO')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${filtroEstado === 'ADELANTADO'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Adelantados ({countAdelantados})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('PAGADO')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${filtroEstado === 'PAGADO'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Pagados ({countPagados})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${filtroEstado === 'TODOS'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Todos ({egresosPorClasificacion.length})
              </button>
            </div>

            {/* Clasificación por Tipos / Colores */}
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
              {[
                { key: 'TODOS', label: 'Todos', dot: 'bg-zinc-400', count: todosEgresos.length },
                {
                  key: 'FIJOS',
                  label: 'Fijos',
                  dot: 'bg-sky-500',
                  activeClass: 'bg-sky-600 text-white dark:bg-sky-500',
                  count: resumen?.totalesPorClasificacion?.conteoFijos ?? todosEgresos.filter((e) => e.clasificacion === 'FIJO').length,
                },
                {
                  key: 'PRESTAMOS',
                  label: 'Préstamos',
                  dot: 'bg-purple-500',
                  activeClass: 'bg-purple-600 text-white dark:bg-purple-500',
                  count: resumen?.totalesPorClasificacion?.conteoPrestamos ?? todosEgresos.filter((e) => e.clasificacion === 'PRESTAMO').length,
                },
                {
                  key: 'CUOTAS',
                  label: 'Cuotas',
                  dot: 'bg-indigo-500',
                  activeClass: 'bg-indigo-600 text-white dark:bg-indigo-500',
                  count: resumen?.totalesPorClasificacion?.conteoCuotas ?? todosEgresos.filter((e) => e.clasificacion === 'CUOTA').length,
                },
                {
                  key: 'VARIABLES',
                  label: 'Variables',
                  dot: 'bg-teal-500',
                  activeClass: 'bg-teal-600 text-white dark:bg-teal-500',
                  count: resumen?.totalesPorClasificacion?.conteoVariables ?? todosEgresos.filter((e) => e.clasificacion === 'VARIABLE').length,
                },
              ].map((f) => {
                const isActive = filtroEgreso === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFiltroEgreso(f.key as any)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${isActive
                        ? f.activeClass || 'bg-foreground text-background font-medium'
                        : 'text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                    <span>{f.label}</span>
                    <span className="text-[10px] opacity-75">({f.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {egresosFiltrados.length > 0 && (
              <button
                onClick={() =>
                  selectAllGastos(egresosFiltrados.map((e) => ({ id: e.id, monto: e.monto })))
                }
                className="text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 transition"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Sumar lista</span>
              </button>
            )}

            <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => cambiarModoVista('TABLA')}
                className={`p-1 rounded transition ${modoVista === 'TABLA' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                title="Vista Tabla"
                aria-label="Ver egresos como tabla"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => cambiarModoVista('TARJETAS')}
                className={`p-1 rounded transition ${modoVista === 'TARJETAS' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                title="Vista Tarjetas"
                aria-label="Ver egresos como tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Egresos organizada en Secciones */}
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
            {seccionesVisibles.map((sec) => {
              const estaColapsada = !!seccionesColapsadas[sec.id];
              const IconComponent = sec.icono;

              if (modoVista === 'TABLA') {
                return (
                  <div
                    key={sec.id}
                    className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs transition-all"
                  >
                    {/* Header de Sección con estilo visual refinado */}
                    <div
                      className={`px-3.5 py-2.5 flex items-center justify-between border-b border-border/60 ${sec.headerBg} cursor-pointer select-none`}
                      onClick={() => toggleColapsarSeccion(sec.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${sec.iconBg}`}>
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                              {sec.titulo}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sec.badgeBg} ${sec.badgeText} ${sec.badgeBorder}`}
                            >
                              {sec.filteredCount} {sec.filteredCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground hidden sm:block">
                            {sec.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgregarASeccion(sec.id);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-muted text-foreground border border-border/80 shadow-2xs hover:border-foreground/40 transition active:scale-95 text-xs font-medium cursor-pointer"
                          title={`Agregar a ${sec.titulo}`}
                          aria-label={`Agregar item a ${sec.titulo}`}
                        >
                          <Plus className="w-3.5 h-3.5 text-foreground" />
                          <span className="hidden sm:inline text-[11px]">Agregar</span>
                        </button>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
                            Subtotal
                          </span>
                          <span className="font-mono font-bold text-xs text-foreground">
                            {formatMoney(sec.subtotal, moneda)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleColapsarSeccion(sec.id);
                          }}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
                          title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
                          aria-label={estaColapsada ? `Expandir ${sec.titulo}` : `Colapsar ${sec.titulo}`}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${estaColapsada ? '-rotate-90' : ''
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Tabla de la Sección */}
                    {!estaColapsada && (
                      sec.itemsFiltrados.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 space-y-2">
                          <p>No hay compromisos en {sec.titulo.toLowerCase()} con el filtro seleccionado.</p>
                          <button
                            type="button"
                            onClick={() => handleAgregarASeccion(sec.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar primer compromiso</span>
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-muted/30 text-muted-foreground text-[11px] border-b border-border/50">
                              <tr>
                                <th scope="col" className="py-2 px-1.5 w-6 text-center"><span className="sr-only">Mover</span></th>
                                <th scope="col" className="py-2 px-2 w-8 text-center"><span className="sr-only">Seleccionar</span></th>
                                <th scope="col" className="py-2 px-3 font-medium">Concepto & Detalle</th>
                                <th scope="col" className="py-2 px-3 font-medium">Clasificación</th>
                                <th scope="col" className="py-2 px-3 text-center font-medium">Vencimiento</th>
                                <th scope="col" className="py-2 px-3 text-center font-medium">Estado</th>
                                <th scope="col" className="py-2 px-3 text-right font-medium">Monto</th>
                                <th scope="col" className="py-2 px-3 text-center font-medium">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {sec.itemsFiltrados.map((item) => {
                                const isSelected = selectedGastoIds.includes(item.id);
                                const estilo = getEstiloClasificacion(item.clasificacion);

                                return (
                                  <tr
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', item.id);
                                      e.dataTransfer.effectAllowed = 'move';
                                      setDraggedId(item.id);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (dragOverId !== item.id) setDragOverId(item.id);
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverId === item.id) setDragOverId(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedId(null);
                                      setDragOverId(null);
                                    }}
                                    onDrop={(e) => handleDrop(e, item.id)}
                                    onClick={() => setDetalleItem(item)}
                                    className={`group transition-all cursor-pointer hover:bg-muted/30 border-l-[3px] ${estilo.borderColor} ${isSelected ? 'bg-muted/40' : ''
                                      } ${dragOverId === item.id ? 'border-t-2 border-t-primary bg-primary/10' : ''} ${draggedId === item.id ? 'opacity-40' : ''
                                      }`}
                                  >
                                    <td
                                      className="py-2.5 px-1.5 text-center cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-muted-foreground transition hover:text-foreground"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Arrastrar para ordenar"
                                    >
                                      <GripVertical className="w-3.5 h-3.5 mx-auto" />
                                    </td>
                                    <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => toggleSelectGasto(item.id, item.monto)}
                                        className="text-muted-foreground hover:text-foreground transition p-0.5"
                                        aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
                                      >
                                        {isSelected ? (
                                          <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                                        ) : (
                                          <Square className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </td>

                                    <td className="py-2.5 px-3">
                                      <div className="font-medium text-foreground text-xs">
                                        {item.concepto}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
                                        <span
                                          className="inline-block w-2 h-2 rounded-full shrink-0"
                                          style={{ backgroundColor: item.categoriaColor || '#64748b' }}
                                          title={item.categoria}
                                        />
                                        <span className="text-foreground/80 font-medium">{item.categoria}</span>
                                        <span>·</span>
                                        <span className="truncate">{item.subtexto}</span>
                                      </div>
                                    </td>

                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${estilo.badgeBg} ${estilo.badgeText} ${estilo.badgeBorder}`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${estilo.dotColor}`} />
                                        {item.clasificacion === 'PRESTAMO' ? (
                                          `Préstamo · ${item.cuotaActual}/${item.cuotasTotales}`
                                        ) : item.clasificacion === 'CUOTA' ? (
                                          `Cuota ${item.cuotaActual}/${item.totalCuotas}`
                                        ) : item.clasificacion === 'FIJO' ? (
                                          'Costo Fijo'
                                        ) : (
                                          'Variable'
                                        )}
                                      </span>
                                    </td>

                                    <td className="py-2.5 px-3 text-center whitespace-nowrap text-muted-foreground text-xs">
                                      {item.diaVencimiento ? `Día ${item.diaVencimiento}` : 'Fin de mes'}
                                    </td>

                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${item.estado === 'ADELANTADO'
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                            : item.estado === 'PAGADO'
                                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                          }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${item.estado === 'ADELANTADO'
                                              ? 'bg-indigo-500'
                                              : item.estado === 'PAGADO'
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                            }`}
                                        />
                                        {item.estado === 'ADELANTADO'
                                          ? 'Adelantado'
                                          : item.estado === 'PAGADO'
                                            ? 'Pagado'
                                            : 'Pendiente'}
                                      </span>
                                    </td>

                                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-medium text-foreground text-xs">
                                      <div>{formatMoney(item.monto, moneda)}</div>
                                      {item.monedaOriginal === 'USD' && item.montoOriginal && (
                                        <div className="text-[10px] text-muted-foreground">
                                          ${item.montoOriginal.toFixed(2)} USD
                                        </div>
                                      )}
                                    </td>

                                    <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          onClick={() =>
                                            handleToggleEstadoItem(
                                              item,
                                              item.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                                            )
                                          }
                                          className="px-2 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                          aria-label={`Alternar adelantado ${item.concepto}`}
                                        >
                                          Adelantar
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleToggleEstadoItem(
                                              item,
                                              item.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                                            )
                                          }
                                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${item.estado === 'PAGADO'
                                              ? 'text-muted-foreground hover:bg-muted'
                                              : 'bg-foreground text-background hover:opacity-90'
                                            }`}
                                          aria-label={`Pagar ${item.concepto}`}
                                        >
                                          {item.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-muted/15 border-t border-border/60 text-xs font-medium">
                              <tr>
                                <td colSpan={6} className="py-2 px-3 text-muted-foreground text-[11px]">
                                  Subtotal {sec.titulo} ({sec.filteredCount} items)
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                                  {formatMoney(sec.subtotal, moneda)}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )
                    )}
                  </div>
                );
              }

              // modoVista === 'TARJETAS'
              return (
                <div
                  key={sec.id}
                  className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs transition-all space-y-0"
                >
                  {/* Header de Sección */}
                  <div
                    className={`px-3.5 py-2.5 flex items-center justify-between border-b border-border/60 ${sec.headerBg} cursor-pointer select-none`}
                    onClick={() => toggleColapsarSeccion(sec.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${sec.iconBg}`}>
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                            {sec.titulo}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sec.badgeBg} ${sec.badgeText} ${sec.badgeBorder}`}
                          >
                            {sec.filteredCount} {sec.filteredCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground hidden sm:block">
                          {sec.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgregarASeccion(sec.id);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-muted text-foreground border border-border/80 shadow-2xs hover:border-foreground/40 transition active:scale-95 text-xs font-medium cursor-pointer"
                        title={`Agregar a ${sec.titulo}`}
                        aria-label={`Agregar item a ${sec.titulo}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-foreground" />
                        <span className="hidden sm:inline text-[11px]">Agregar</span>
                      </button>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
                          Subtotal
                        </span>
                        <span className="font-mono font-bold text-xs text-foreground">
                          {formatMoney(sec.subtotal, moneda)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColapsarSeccion(sec.id);
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
                        title={estaColapsada ? 'Expandir sección' : 'Colapsar sección'}
                        aria-label={estaColapsada ? `Expandir ${sec.titulo}` : `Colapsar ${sec.titulo}`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${estaColapsada ? '-rotate-90' : ''
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {!estaColapsada && (
                    <div className="p-3 space-y-2">
                      {sec.itemsFiltrados.length === 0 ? (
                        <div className="p-5 text-center text-xs text-muted-foreground space-y-2">
                          <p>No hay compromisos en esta sección con los filtros actuales.</p>
                          <button
                            type="button"
                            onClick={() => handleAgregarASeccion(sec.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition active:scale-95 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar compromiso</span>
                          </button>
                        </div>
                      ) : (
                        sec.itemsFiltrados.map((item) => {
                          const isSelected = selectedGastoIds.includes(item.id);
                          const estilo = getEstiloClasificacion(item.clasificacion);

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', item.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedId(item.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverId !== item.id) setDragOverId(item.id);
                              }}
                              onDragLeave={() => {
                                if (dragOverId === item.id) setDragOverId(null);
                              }}
                              onDragEnd={() => {
                                setDraggedId(null);
                                setDragOverId(null);
                              }}
                              onDrop={(e) => handleDrop(e, item.id)}
                              onClick={() => setDetalleItem(item)}
                              className={`bg-card border border-border/80 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer hover:bg-muted/20 border-l-4 ${estilo.borderColor} ${estilo.bgCardHover} ${isSelected ? 'bg-muted/30 border-foreground/30' : ''
                                } ${dragOverId === item.id ? 'ring-2 ring-primary ring-offset-2' : ''} ${draggedId === item.id ? 'opacity-40' : ''
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition p-0.5 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Arrastrar para ordenar"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectGasto(item.id, item.monto);
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition shrink-0"
                                  aria-label={isSelected ? `Deseleccionar ${item.concepto}` : `Seleccionar ${item.concepto}`}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="font-medium text-foreground text-xs flex items-center gap-1.5">
                                    <span className="truncate">{item.concepto}</span>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${estilo.badgeBg} ${estilo.badgeText} ${estilo.badgeBorder} shrink-0 inline-flex items-center gap-1`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${estilo.dotColor}`} />
                                      {item.clasificacion === 'PRESTAMO' ? (
                                        `Cuota ${item.cuotaActual}/${item.cuotasTotales}`
                                      ) : item.clasificacion === 'CUOTA' ? (
                                        `Cuota ${item.cuotaActual}/${item.totalCuotas}`
                                      ) : item.clasificacion === 'FIJO' ? (
                                        'Fijo'
                                      ) : (
                                        'Variable'
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                    <span
                                      className="inline-block w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: item.categoriaColor || '#64748b' }}
                                      title={item.categoria}
                                    />
                                    <span className="text-foreground/80 font-medium">{item.categoria}</span>
                                    <span>·</span>
                                    <span className="truncate">{item.subtexto}</span>
                                    {item.monedaOriginal === 'USD' && item.montoOriginal && (
                                      <span className="ml-1 text-muted-foreground">
                                        (${item.montoOriginal.toFixed(2)} USD)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <span className="font-mono font-medium text-foreground text-xs">
                                  {formatMoney(item.monto, moneda)}
                                </span>

                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() =>
                                      handleToggleEstadoItem(
                                        item,
                                        item.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                                      )
                                    }
                                    className="px-2 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                    aria-label={`Alternar adelantado ${item.concepto}`}
                                  >
                                    Adelantar
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleToggleEstadoItem(
                                        item,
                                        item.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                                      )
                                    }
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${item.estado === 'PAGADO'
                                        ? 'text-muted-foreground hover:bg-muted'
                                        : 'bg-foreground text-background hover:opacity-90'
                                      }`}
                                    aria-label={`Pagar ${item.concepto}`}
                                  >
                                    {item.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {/* Subtotal en vista tarjeta */}
                      <div className="flex items-center justify-between text-xs font-medium pt-2 text-muted-foreground border-t border-border/40">
                        <span>Subtotal {sec.titulo}</span>
                        <span className="font-mono font-semibold text-foreground">{formatMoney(sec.subtotal, moneda)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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

      {/* MODALES */}
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
