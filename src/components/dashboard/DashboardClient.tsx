'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  formatMoney,
  formatPeriodoLabel,
  ClasificacionEgreso,
  ESTILOS_CLASIFICACION,
  esItemRecurrente,
} from '@/lib/utils';
import { ModalRegistrarIngreso } from '@/components/modals/ModalRegistrarIngreso';
import { ModalRegistrarGasto } from '@/components/modals/ModalRegistrarGasto';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
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
  } = useFinanzas();

  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS'>('PENDIENTE');
  const [filtroEgreso, setFiltroEgreso] = useState<'TODOS' | 'FIJOS' | 'PRESTAMOS_CUOTAS' | 'VARIABLES'>('TODOS');
  const [modoVista, setModoVista] = useState<'TABLA' | 'TARJETAS'>('TABLA');

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

  // Consolidar todos los egresos del mes
  const todosEgresos = useMemo(() => {
    if (!resumen) return [];
    const list: Array<DetalleItemData & { clasificacion: ClasificacionEgreso }> = [];

    // 1. Costos fijos (incluye fijos esenciales y suscripciones)
    for (const cf of resumen.costosFijos) {
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
        mesInicio: cf.mesInicio,
        mesFin: cf.mesFin,
        notas: cf.notas,
        monedaOriginal: cf.monedaOriginal,
        montoOriginal: cf.montoOriginal,
        tipoCambio: cf.tipoCambio,
        subtexto: esItemRecurrente(cf.concepto, cf.categoria)
          ? `Suscripción · Día ${cf.diaVencimiento}`
          : `Costo fijo · Día ${cf.diaVencimiento}`,
      });
    }

    // 2. Préstamos bancarios
    for (const p of resumen.prestamos) {
      if (p.aplicaEsteMes === false) continue;
      list.push({
        id: `prestamo-${p.cuotaId}`,
        dbId: p.cuotaId,
        prestamoId: p.id,
        tipo: 'PRESTAMO',
        clasificacion: 'PRESTAMO_CUOTA',
        concepto: `${p.banco} - ${p.concepto}`,
        banco: p.banco,
        nombrePrestamo: p.concepto,
        categoria: 'Préstamo Bancario',
        monto: p.montoCuota,
        montoTotal: p.montoTotal,
        tasaInteresAnual: p.tasaInteresAnual,
        cuotaActual: p.cuotaActual,
        cuotasTotales: p.cuotasTotales,
        diaVencimiento: p.diaPago,
        estado: p.estado,
        fechaPagoReal: p.fechaPagoReal,
        monedaOriginal: p.monedaOriginal,
        montoOriginal: p.montoOriginal,
        tipoCambio: p.tipoCambio,
        subtexto: `Cuota ${p.cuotaActual}/${p.cuotasTotales} · Día ${p.diaPago}`,
      });
    }

    // 3. Tarjetas
    for (const t of resumen.tarjetasCredito) {
      for (const g of t.gastosPeriodo) {
        const esCuota = (g.totalCuotas || 1) > 1;
        const esRecur = !esCuota && esItemRecurrente(g.concepto, g.categoria);
        const clasificacion: ClasificacionEgreso = esCuota
          ? 'PRESTAMO_CUOTA'
          : esRecur
            ? 'FIJO'
            : 'VARIABLE';

        list.push({
          id: g.id,
          dbId: g.id,
          tipo: 'TARJETA',
          clasificacion,
          concepto: g.concepto,
          categoria: g.categoria,
          monto: g.monto,
          monedaOriginal: g.monedaOriginal,
          montoOriginal: g.montoOriginal,
          tipoCambio: g.tipoCambio,
          fechaGasto: g.fechaGasto,
          periodoPago: g.periodoPago || resumen.periodo,
          cuotaActual: g.cuotaActual,
          totalCuotas: g.totalCuotas,
          tarjetaNombre: t.nombre,
          tarjetaBanco: t.banco,
          tarjetaUltimosCuatro: t.ultimosCuatro,
          tarjetaDiaCorte: t.diaCorte,
          tarjetaDiaPago: t.diaPago,
          tarjetaColor: t.color,
          notas: g.notas,
          estado: g.estado,
          fechaPagoReal: g.fechaPagoReal,
          subtexto: esCuota
            ? `${t.nombre} · Cuota ${g.cuotaActual}/${g.totalCuotas}`
            : `${t.nombre} · Fin de mes`,
        });
      }
    }

    // 4. Gastos directos
    for (const g of resumen.gastosDirectos) {
      const esRecur = esItemRecurrente(g.concepto, g.categoria);
      const clasificacion: ClasificacionEgreso = esRecur ? 'FIJO' : 'VARIABLE';

      list.push({
        id: g.id,
        dbId: g.id,
        tipo: 'DIRECTO',
        clasificacion,
        concepto: g.concepto,
        categoria: g.categoria,
        monto: g.monto,
        monedaOriginal: g.monedaOriginal,
        montoOriginal: g.montoOriginal,
        tipoCambio: g.tipoCambio,
        fechaGasto: g.fechaGasto,
        periodoPago: g.periodoPago || resumen.periodo,
        metodoPago: g.metodoPago,
        notas: g.notas,
        estado: g.estado,
        fechaPagoReal: g.fechaPagoReal,
        subtexto: 'Efectivo / Débito',
      });
    }

    return list;
  }, [resumen]);

  // Filtrado reactivo por Estado y Clasificación
  const egresosFiltrados = useMemo(() => {
    return todosEgresos.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;
      if (filtroEgreso === 'FIJOS') return item.clasificacion === 'FIJO';
      if (filtroEgreso === 'PRESTAMOS_CUOTAS') return item.clasificacion === 'PRESTAMO_CUOTA';
      if (filtroEgreso === 'VARIABLES') return item.clasificacion === 'VARIABLE';
      return true;
    });
  }, [todosEgresos, filtroEstado, filtroEgreso]);

  // Conteo rápido de estados
  const countPendientes = useMemo(
    () => todosEgresos.filter((i) => i.estado === 'PENDIENTE').length,
    [todosEgresos]
  );
  const countAdelantados = useMemo(
    () => todosEgresos.filter((i) => i.estado === 'ADELANTADO').length,
    [todosEgresos]
  );
  const countPagados = useMemo(
    () => todosEgresos.filter((i) => i.estado === 'PAGADO').length,
    [todosEgresos]
  );

  if (loading || !resumen) {
    return <DashboardSkeleton />;
  }

  const disponibleNeto = resumen.dineroDisponibleNeto;
  const metaAhorro = resumen.metaAhorro;
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
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  disponibleEsPositivo
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {disponibleEsPositivo ? 'Saldo libre' : 'Déficit'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dinero disponible tras cubrir compromisos y descontar ahorro.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              onClick={() => setModalGastoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs transition active:scale-98"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Gasto</span>
            </button>
          </div>
        </div>

        {/* 3 Métricas en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
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

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block">Meta de Ahorro</span>
            <span className="text-lg font-semibold text-foreground font-mono mt-0.5 block">
              {formatMoney(metaAhorro, moneda)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Fondo protegido
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

      {/* 2. DOS COLUMNAS: INGRESOS & EGRESOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: INGRESOS (4 Columnas) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ingresos ({resumen.ingresos.length})
            </h2>
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="text-xs font-medium text-foreground hover:underline"
            >
              + Agregar
            </button>
          </div>

          <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                    <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                    <th scope="col" className="py-2.5 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {resumen.ingresos.map((ing) => (
                    <tr key={ing.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-foreground text-xs">{ing.concepto}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {ing.tipo === 'SUELDO' ? 'Sueldo mensual' : ing.tipo === 'GRATIFICACION' ? 'Gratificación' : ing.tipo === 'UTILIDADES' ? 'Utilidades' : 'Extra'}
                          {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
                            <span className="ml-1 text-muted-foreground">
                              (${ing.montoOriginal} USD)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap text-xs">
                        {formatMoney(ing.monto, moneda)}
                      </td>

                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {ing.tipo === 'EXTRA' && (
                          <button
                            type="button"
                            onClick={() => handleEliminarIngreso(ing.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded transition"
                            title="Eliminar ingreso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EGRESOS & COMPROMISOS (8 Columnas) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Compromisos del Mes ({egresosFiltrados.length})
            </h2>

            {/* Selector de Estado Minimalista */}
            <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filtroEstado === 'PENDIENTE'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Por pagar ({countPendientes})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('ADELANTADO')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filtroEstado === 'ADELANTADO'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Adelantados ({countAdelantados})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('PAGADO')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filtroEstado === 'PAGADO'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pagados ({countPagados})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  filtroEstado === 'TODOS'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({todosEgresos.length})
              </button>
            </div>
          </div>

          {/* Subfiltro de Clasificación + Controles de vista */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
              {[
                { key: 'TODOS', label: 'Todos' },
                { key: 'FIJOS', label: 'Fijos' },
                { key: 'PRESTAMOS_CUOTAS', label: 'Préstamos & Cuotas' },
                { key: 'VARIABLES', label: 'Variables' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltroEgreso(f.key as any)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    filtroEgreso === f.key
                      ? 'bg-foreground text-background font-medium'
                      : 'text-muted-foreground hover:text-foreground bg-muted/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {egresosFiltrados.length > 0 && (
                <button
                  onClick={() =>
                    selectAllGastos(egresosFiltrados.map((e) => ({ id: e.id, monto: e.monto })))
                  }
                  className="text-muted-foreground hover:text-foreground text-[11px] font-medium flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Sumar lista</span>
                </button>
              )}

              <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => cambiarModoVista('TABLA')}
                  className={`p-1 rounded transition ${
                    modoVista === 'TABLA' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                  title="Vista Tabla"
                  aria-label="Ver como tabla"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cambiarModoVista('TARJETAS')}
                  className={`p-1 rounded transition ${
                    modoVista === 'TARJETAS' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                  title="Vista Tarjetas"
                  aria-label="Ver como tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Egresos */}
          {egresosFiltrados.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
              <p className="text-xs text-muted-foreground">
                {filtroEstado === 'PENDIENTE'
                  ? 'No hay compromisos pendientes para este mes.'
                  : 'No se encontraron registros con los filtros seleccionados.'}
              </p>
            </div>
          ) : modoVista === 'TABLA' ? (
            /* TABLA MINIMALISTA */
            <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                    <tr>
                      <th scope="col" className="py-2.5 px-2 w-8 text-center"></th>
                      <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                      <th scope="col" className="py-2.5 px-3 text-center font-medium hidden sm:table-cell">Vence</th>
                      <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                      <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                      <th scope="col" className="py-2.5 px-3 text-center font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {egresosFiltrados.map((item) => {
                      const isSelected = selectedGastoIds.includes(item.id);
                      const estilo = ESTILOS_CLASIFICACION[item.clasificacion || 'VARIABLE'];

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setDetalleItem(item)}
                          className={`group transition-colors cursor-pointer hover:bg-muted/30 ${
                            isSelected ? 'bg-muted/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSelectGasto(item.id, item.monto)}
                              className="text-muted-foreground hover:text-foreground transition p-0.5"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground text-xs">
                                {item.concepto}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground">
                                {item.clasificacion === 'PRESTAMO_CUOTA' ? (
                                  item.tipo === 'PRESTAMO'
                                    ? `Cuota ${item.cuotaActual}/${item.cuotasTotales}`
                                    : `Cuota ${item.cuotaActual}/${item.totalCuotas}`
                                ) : item.clasificacion === 'FIJO' ? (
                                  'Fijo'
                                ) : (
                                  'Compra'
                                )}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {item.subtexto}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap text-muted-foreground text-xs hidden sm:table-cell">
                            {item.diaVencimiento ? `Día ${item.diaVencimiento}` : 'Fin de mes'}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-medium text-foreground text-xs">
                            <div>{formatMoney(item.monto, moneda)}</div>
                            {item.monedaOriginal === 'USD' && item.montoOriginal && (
                              <div className="text-[10px] text-muted-foreground">
                                ${item.montoOriginal.toFixed(2)} USD
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                item.estado === 'ADELANTADO'
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                  : item.estado === 'PAGADO'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.estado === 'ADELANTADO'
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
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                                  item.estado === 'PAGADO'
                                    ? 'text-muted-foreground hover:bg-muted'
                                    : 'bg-foreground text-background hover:opacity-90'
                                }`}
                              >
                                {item.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TARJETAS MINIMALISTAS */
            <div className="space-y-2">
              {egresosFiltrados.map((item) => {
                const isSelected = selectedGastoIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setDetalleItem(item)}
                    className={`bg-card border border-border/80 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition cursor-pointer hover:bg-muted/20 ${
                      isSelected ? 'bg-muted/30 border-foreground/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectGasto(item.id, item.monto);
                        }}
                        className="text-muted-foreground hover:text-foreground transition shrink-0"
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
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground shrink-0">
                            {item.clasificacion === 'PRESTAMO_CUOTA' ? (
                              item.tipo === 'PRESTAMO'
                                ? `Cuota ${item.cuotaActual}/${item.cuotasTotales}`
                                : `Cuota ${item.cuotaActual}/${item.totalCuotas}`
                            ) : item.clasificacion === 'FIJO' ? (
                              'Fijo'
                            ) : (
                              'Compra'
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.subtexto}
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
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                            item.estado === 'PAGADO'
                              ? 'text-muted-foreground hover:bg-muted'
                              : 'bg-foreground text-background hover:opacity-90'
                          }`}
                        >
                          {item.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <ModalRegistrarIngreso
        open={modalIngresoOpen}
        onClose={() => setModalIngresoOpen(false)}
      />
      <ModalRegistrarGasto
        open={modalGastoOpen}
        onClose={() => setModalGastoOpen(false)}
      />
      <ModalDetalleGasto
        item={detalleItem}
        onClose={() => setDetalleItem(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        onEliminarGasto={handleEliminarGastoModal}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
