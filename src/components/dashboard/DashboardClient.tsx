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

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = '🎁 Gratificación';
  if (mesActual === 12) labelEspecial = '🎄 Gratificación';
  if (mesActual === 3) labelEspecial = '💼 Utilidades';

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
      if (p.aplicaEsteMes === false) continue;
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
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold px-1 capitalize">
                  {formatPeriodoLabel(periodo)}
                </span>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {esMesEspecial && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200/50">
                  <Sparkles className="w-3 h-3" /> {labelEspecial}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Tu Dinero Libre este mes
              </span>
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                <span
                  className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${
                    disponibleEsPositivo ? 'text-slate-900 dark:text-white' : 'text-rose-600'
                  }`}
                >
                  {formatMoney(disponibleNeto, moneda)}
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${
                    disponibleEsPositivo
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${disponibleEsPositivo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {disponibleEsPositivo ? 'Saldo Libre' : 'Déficit'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Disponible limpio después de cubrir tus gastos y separar tu meta de ahorro.
              </p>
            </div>
          </div>

          {/* Botones de acción minimalistas y elegantes */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-xs transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>
                <span className="hidden sm:inline">+ Registrar </span>
                <span className="sm:hidden">+ </span>
                Ingreso
              </span>
            </button>

            <button
              onClick={() => setModalGastoOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-xs transition active:scale-95"
            >
              <MinusCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <span className="hidden sm:inline">- Registrar </span>
                <span className="sm:hidden">- </span>
                Gasto
              </span>
            </button>
          </div>
        </div>

        {/* 3 Cajas Métricas Armoniosas y Limpias */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-border/80">
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Total Ingresos
              </span>
              <span className="text-[10px] text-muted-foreground">{resumen.ingresos.length} fuentes</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatMoney(resumen.totalIngresos, moneda)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sueldo base + ingresos extras
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Total Egresos
              </span>
              <span className="text-[10px] text-muted-foreground">{todosEgresos.length} obligaciones</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatMoney(resumen.totalEgresos, moneda)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {formatMoney(resumen.totalPendiente, moneda)} por pagar
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Meta de Ahorro
              </span>
              <span className="text-[10px] text-muted-foreground">Reservado</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatMoney(metaAhorro, moneda)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Fondo protegido del mes
            </div>
          </div>
        </div>
      </div>

      {/* BANNER ESPECIAL DE DICIEMBRE (GRATIFICACIÓN Y PAGO A TÍA) */}
      {periodo.endsWith('-12') && (
        <div className="bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 rounded-3xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="font-extrabold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
              <span>🎄 Plan Especial de Diciembre: Gratificación y Pago Directo a tu Tía</span>
            </div>
            <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed text-[11px]">
              • <strong>Gratificación Navideña:</strong> + S/ 10,500.00 incluidos en tus ingresos.<br />
              • <strong>Pago Directo Tía ($900 USD):</strong> - S/ 3,060.00 proyectado para cancelarse con tu gratificación.<br />
              • <strong>Saldo a Favor:</strong> Cubriendo el pago a tu tía y todas tus deudas, te quedan más de <strong>S/ 10,500.00 libres</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 2. DOS COLUMNAS MINIMALISTAS: INGRESOS A LA IZQUIERDA, EGRESOS A LA DERECHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: INGRESOS (4 Columnas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tus Ingresos ({resumen.ingresos.length})</span>
            </h2>
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="text-xs text-emerald-600 hover:text-emerald-500 font-bold"
            >
              + Agregar
            </button>
          </div>

          <div className="space-y-2">
            {resumen.ingresos.map((ing) => (
              <div
                key={ing.id}
                className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition"
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
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ${ing.montoOriginal} USD (T.C. S/ {ing.tipoCambio.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
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
          <div className="bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Regla del Día 10</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              • <strong>Compras del 1 al 10</strong> → Se pagan a fin de este mes.<br />
              • <strong>Compras del 11 a fin de mes</strong> → Se pagan con el sueldo del próximo mes.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: EGRESOS & COMPROMISOS (8 Columnas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Compromisos del Mes ({egresosFiltrados.length})</span>
            </h2>

            {/* FILTRO PRINCIPAL DE ESTADO (Por defecto PENDIENTE) - Armónico y Elegante */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl border border-border/80 text-[11px] overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  filtroEstado === 'PENDIENTE'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Por Pagar
                </span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'PENDIENTE' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 font-extrabold' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {countPendientes}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('ADELANTADO')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  filtroEstado === 'ADELANTADO'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Adelantados
                </span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'ADELANTADO' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-300 font-extrabold' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {countAdelantados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('PAGADO')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  filtroEstado === 'PAGADO'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Pagados
                </span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroEstado === 'PAGADO' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-extrabold' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {countPagados}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  filtroEstado === 'TODOS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Todos ({todosEgresos.length})
              </button>
            </div>
          </div>

          {/* Subfiltro por tipo y acción de sumatoria */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-xl border border-border/60 text-[11px] overflow-x-auto max-w-full">
              {(['TODOS', 'FIJOS', 'PRESTAMOS', 'TARJETAS'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroEgreso(f)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                    filtroEgreso === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {f === 'TODOS' ? 'Todos los tipos' : f === 'FIJOS' ? 'Fijos' : f === 'PRESTAMOS' ? 'Préstamos' : 'Tarjetas & Directos'}
                </button>
              ))}
            </div>

            {egresosFiltrados.length > 0 && (
              <button
                onClick={() =>
                  selectAllGastos(egresosFiltrados.map((e) => ({ id: e.id, monto: e.monto })))
                }
                className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 flex items-center gap-1 shrink-0 text-[11px]"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Sumar lista mostrada</span>
              </button>
            )}
          </div>

          {/* Lista de Egresos o Mensaje Vacío */}
          {egresosFiltrados.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-foreground">
                {filtroEstado === 'PENDIENTE'
                  ? '¡Todo limpio! No tienes compromisos pendientes para este mes.'
                  : 'No se encontraron registros con los filtros seleccionados'}
              </h3>
              {filtroEstado === 'PENDIENTE' && countPagados > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroEstado('PAGADO')}
                  className="text-xs text-sky-600 hover:underline font-bold"
                >
                  Ver los {countPagados} egresos ya pagados →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {egresosFiltrados.map((item) => {
              const isSelected = selectedGastoIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setDetalleItem(item)}
                  className={`group bg-card border rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm ${
                    isSelected ? 'border-sky-400 bg-sky-50/20 dark:bg-sky-950/20' : 'border-border/80'
                  }`}
                >
                  {/* Checkbox y Detalle */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectGasto(item.id, item.monto);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                      title={isSelected ? 'Deseleccionar' : 'Seleccionar para sumar'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="font-bold text-foreground text-xs truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition flex items-center gap-1.5 sm:gap-2">
                        <span className="truncate">{item.concepto}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 shrink-0">
                          {item.tipo === 'FIJO' ? 'Fijo' : item.tipo === 'PRESTAMO' ? 'Préstamo' : 'Compra'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 hidden sm:inline" />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 truncate">
                        <span className="truncate">{item.subtexto}</span>
                        {item.monedaOriginal === 'USD' && item.montoOriginal && (
                          <span className="text-amber-700 dark:text-amber-300 font-semibold shrink-0">
                            (${item.montoOriginal} USD)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Monto y Botón de Estado de 1-Click */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
                    <div className="font-bold text-foreground text-sm">
                      {formatMoney(item.monto, moneda)}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          handleToggleEstadoItem(
                            item,
                            item.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                          item.estado === 'ADELANTADO'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Alternar estado Adelantado"
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
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                          item.estado === 'PAGADO'
                            ? 'bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs'
                        }`}
                        title="Alternar estado Pagado"
                      >
                        {item.estado === 'PAGADO' ? '✓ Pagado' : 'Pagar'}
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
