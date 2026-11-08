'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { ModalRegistrarIngreso } from '@/components/modals/ModalRegistrarIngreso';
import { ModalRegistrarGasto } from '@/components/modals/ModalRegistrarGasto';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Home,
  Landmark,
  CreditCard,
  Banknote,
  Clock,
  FastForward,
  CheckCircle2,
  Calendar,
  Square,
  CheckSquare,
  PiggyBank,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Info,
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
  const [filtroEgreso, setFiltroEgreso] = useState<'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'TARJETAS'>('TODOS');

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  // Consolidar todos los egresos del mes
  const todosEgresos = useMemo(() => {
    if (!resumen) return [];
    const list: Array<DetalleItemData> = [];

    // 1. Costos fijos
    for (const cf of resumen.costosFijos) {
      list.push({
        id: `fijo-${cf.id}`,
        dbId: cf.id,
        tipo: 'FIJO',
        concepto: cf.concepto,
        categoria: cf.categoria,
        monto: cf.monto,
        diaVencimiento: cf.diaVencimiento,
        estado: cf.estado,
        fechaPagoReal: cf.fechaPagoReal,
        mesInicio: cf.mesInicio,
        mesFin: cf.mesFin,
        notas: cf.notas,
        subtexto: `Vence el día ${cf.diaVencimiento}`,
      });
    }

    // 2. Préstamos
    for (const p of resumen.prestamos) {
      list.push({
        id: `prestamo-${p.cuotaId}`,
        dbId: p.cuotaId,
        prestamoId: p.id,
        tipo: 'PRESTAMO',
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
        subtexto: `Cuota ${p.cuotaActual} de ${p.cuotasTotales} (Día ${p.diaPago})`,
      });
    }

    // 3. Tarjetas (compras imputadas a este mes por corte del día 10)
    for (const t of resumen.tarjetasCredito) {
      for (const g of t.gastosPeriodo) {
        list.push({
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
          subtexto: `${t.nombre} · Se paga a fin de este mes`,
        });
      }
    }

    // 4. Gastos directos (efectivo/débito)
    for (const g of resumen.gastosDirectos) {
      list.push({
        id: g.id,
        dbId: g.id,
        tipo: 'DIRECTO',
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

  // Filtrado reactivo por Estado (Pendientes por defecto) y Tipo
  const egresosFiltrados = useMemo(() => {
    return todosEgresos.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;
      if (filtroEgreso === 'FIJOS') return item.tipo === 'FIJO';
      if (filtroEgreso === 'PRESTAMOS') return item.tipo === 'PRESTAMO';
      if (filtroEgreso === 'TARJETAS') return item.tipo === 'TARJETA';
      return true;
    });
  }, [todosEgresos, filtroEstado, filtroEgreso]);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando tus finanzas...</p>
      </div>
    );
  }

  const disponibleBruto = resumen.dineroDisponibleBruto;
  const disponibleNeto = resumen.dineroDisponibleNeto;
  const metaAhorro = resumen.metaAhorro;
  const disponibleEsPositivo = disponibleBruto >= 0;

  // Alternar estado de egreso
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
      toast.success(`Estado actualizado a ${nuevoEstado}`);
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
      toast.success('Gasto eliminado exitosamente');
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

  const todosSeleccionados =
    todosEgresos.length > 0 &&
    todosEgresos.every((item) => selectedGastoIds.includes(item.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO PRINCIPAL: BALANCE Y ACCIONES DIRECTAS */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dinero Disponible
              </span>
              <div className="inline-flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-xl border border-border shadow-inner">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  className="p-0.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-sky-400 px-1">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  className="p-0.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  disponibleEsPositivo ? 'text-foreground' : 'text-rose-500'
                }`}
              >
                {formatMoney(disponibleBruto, moneda)}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  disponibleEsPositivo
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                {disponibleEsPositivo ? '✓ Saldo a favor' : '⚠ Déficit'}
              </span>
            </div>
          </div>

          {/* DOS BOTONES GRANDES E INEQUÍVOCOS PARA REGISTRAR */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Ingreso</span>
            </button>

            <button
              onClick={() => setModalGastoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition active:scale-95"
            >
              <MinusCircle className="w-4 h-4" />
              <span>Registrar Gasto</span>
            </button>
          </div>
        </div>

        {/* Tira de Resumen & Meta de Ahorro */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border text-xs">
          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-muted-foreground text-[11px] block">📥 Total Ingresos</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {formatMoney(resumen.totalIngresos, moneda)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-muted-foreground text-[11px] block">📤 Total Egresos</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              {formatMoney(resumen.totalEgresos, moneda)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-muted-foreground text-[11px] block">🎯 Meta de Ahorro</span>
            <span className="font-bold text-sky-500 text-sm">
              {formatMoney(metaAhorro, moneda)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-muted-foreground text-[11px] block">💎 Libre para Disfrutar</span>
            <span className="font-extrabold text-foreground text-sm">
              {formatMoney(disponibleNeto, moneda)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DOS COLUMNAS MINIMALISTAS: INGRESOS A LA IZQUIERDA, EGRESOS A LA DERECHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: INGRESOS (4 Columnas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Ingresos ({resumen.ingresos.length})</span>
            </h2>
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold"
            >
              + Agregar
            </button>
          </div>

          <div className="space-y-2">
            {resumen.ingresos.map((ing) => (
              <div
                key={ing.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 hover:border-emerald-500/30 transition"
              >
                <div className="space-y-0.5 truncate">
                  <div className="font-bold text-foreground text-xs truncate">
                    {ing.concepto}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {ing.tipo === 'SUELDO'
                      ? 'Sueldo de planilla'
                      : ing.tipo === 'GRATIFICACION'
                      ? '🎁 Gratificación de ley'
                      : ing.tipo === 'UTILIDADES'
                      ? '💼 Utilidades'
                      : 'Ingreso extra'}
                    {ing.monedaOriginal === 'USD' && ing.montoOriginal && (
                      <span className="block text-[10px] text-emerald-400 font-medium">
                        ${ing.montoOriginal} USD (T.C. S/ {ing.tipoCambio.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatMoney(ing.monto, moneda)}
                  </span>
                  {ing.tipo === 'EXTRA' && (
                    <button
                      onClick={() => handleEliminarIngreso(ing.id)}
                      className="text-muted-foreground hover:text-rose-500 p-1 transition"
                      title="Eliminar ingreso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tarjeta de Aviso Informativo del Día 10 */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sky-500">
              <Info className="w-4 h-4" />
              <span>Regla de Corte (Día 10)</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              • Compras hasta el día 10 $\to$ se pagan a fin de este mes.  
              • Compras desde el día 11 $\to$ se pagan con el sueldo del próximo mes.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: EGRESOS & COMPROMISOS (8 Columnas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <span>Egresos ({egresosFiltrados.length})</span>
            </h2>

            {/* FILTRO PRINCIPAL DE ESTADO (Por defecto PENDIENTE) */}
            <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border text-[11px] overflow-x-auto">
              <button
                type="button"
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  filtroEstado === 'PENDIENTE'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>⏳ Por Pagar</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'PENDIENTE' ? 'bg-white/20' : 'bg-secondary'}`}>
                  {countPendientes}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('ADELANTADO')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  filtroEstado === 'ADELANTADO'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>⚡ Adelantados</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'ADELANTADO' ? 'bg-white/20' : 'bg-secondary'}`}>
                  {countAdelantados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('PAGADO')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  filtroEstado === 'PAGADO'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>✓ Pagados</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'PAGADO' ? 'bg-white/20' : 'bg-secondary'}`}>
                  {countPagados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  filtroEstado === 'TODOS'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({todosEgresos.length})
              </button>
            </div>
          </div>

          {/* Subfiltro por tipo y acción de sumatoria */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border text-[11px]">
              {(['TODOS', 'FIJOS', 'PRESTAMOS', 'TARJETAS'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroEgreso(f)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    filtroEgreso === f
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'TODOS' ? 'Todos los tipos' : f === 'FIJOS' ? 'Fijos' : f === 'PRESTAMOS' ? 'Préstamos' : 'Tarjetas'}
                </button>
              ))}
            </div>

            {egresosFiltrados.length > 0 && (
              <button
                onClick={() =>
                  selectAllGastos(egresosFiltrados.map((e) => ({ id: e.id, monto: e.monto })))
                }
                className="font-semibold text-sky-500 hover:text-sky-400 flex items-center gap-1 shrink-0 text-[11px]"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Sumar lista mostrada</span>
              </button>
            )}
          </div>

          {/* Lista de Egresos o Mensaje Vacío */}
          {egresosFiltrados.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-foreground">
                {filtroEstado === 'PENDIENTE'
                  ? '¡No tienes ningún gasto pendiente para este periodo!'
                  : 'No se encontraron egresos con los filtros seleccionados'}
              </h3>
              {filtroEstado === 'PENDIENTE' && countPagados > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroEstado('PAGADO')}
                  className="text-xs text-sky-500 hover:underline font-semibold"
                >
                  Ver los {countPagados} egresos ya pagados →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {egresosFiltrados.map((item) => {
              const isSelected = selectedGastoIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setDetalleItem(item)}
                  className={`group bg-card border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 transition cursor-pointer hover:border-sky-500/50 hover:shadow-md ${
                    isSelected ? 'border-sky-500 bg-sky-500/5' : 'border-border'
                  }`}
                >
                  {/* Checkbox y Detalle */}
                  <div className="flex items-center gap-3 truncate">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectGasto(item.id, item.monto);
                      }}
                      className="p-1 rounded hover:bg-secondary transition shrink-0"
                      title={isSelected ? 'Deseleccionar' : 'Seleccionar para sumar'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-500" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="font-bold text-foreground text-xs truncate group-hover:text-sky-400 transition flex items-center gap-1.5">
                        <span>{item.concepto}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{item.subtexto}</span>
                        {item.monedaOriginal === 'USD' && item.montoOriginal && (
                          <span className="text-rose-400 font-medium">
                            (${item.montoOriginal} USD)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Monto y Botón de Estado de 1-Click */}
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="font-bold text-foreground text-sm">
                      {formatMoney(item.monto, moneda)}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          handleToggleEstadoItem(
                            item,
                            item.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                          item.estado === 'ADELANTADO'
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                            : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                        }`}
                        title="Alternar estado Adelantado"
                      >
                        ⚡ Adelantado
                      </button>

                      <button
                        onClick={() =>
                          handleToggleEstadoItem(
                            item,
                            item.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                          )
                        }
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                          item.estado === 'PAGADO'
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                            : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                        }`}
                        title="Alternar estado Pagado"
                      >
                        ✓ Pagado
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
