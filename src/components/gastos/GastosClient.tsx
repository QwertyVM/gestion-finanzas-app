'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import {
  Plus,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FastForward,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function GastosClient() {
  const {
    periodo,
    resumen,
    refresh,
    selectedGastoIds,
    toggleSelectGasto,
    selectAllGastos,
  } = useFinanzas();

  // Estados locales
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleGasto, setDetalleGasto] = useState<DetalleItemData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('PENDIENTE');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('TODOS');
  const [submitting, setSubmitting] = useState(false);

  const adaptGastoToDetalle = (g: any): DetalleItemData => ({
    id: g.id,
    dbId: g.id,
    tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
    concepto: g.concepto,
    categoria: g.categoria,
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

  // Formulario nuevo gasto
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaGasto, setFechaGasto] = useState(() => new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState<'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA'>('TARJETA_CREDITO');
  const [tarjetaId, setTarjetaId] = useState('');
  const [totalCuotas, setTotalCuotas] = useState('1');
  const [estado, setEstado] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO'>('PENDIENTE');
  const [notas, setNotas] = useState('');

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const tarjetas = resumen?.tarjetasCredito || [];

  // Asignar primera tarjeta por defecto
  React.useEffect(() => {
    if (tarjetas.length > 0 && !tarjetaId) {
      setTarjetaId(tarjetas[0].id);
    }
  }, [tarjetas, tarjetaId]);

  // Cálculo en tiempo real de facturación al cambiar fecha o tarjeta
  const previewFacturacion = useMemo(() => {
    if (metodoPago !== 'TARJETA_CREDITO') return null;
    const tarjeta = tarjetas.find((t) => t.id === tarjetaId);
    const diaCorte = tarjeta?.diaCorte || 10;
    const diaPago = tarjeta?.diaPago || 30;
    const res = calcularPeriodoFacturacion(new Date(`${fechaGasto}T12:00:00`), diaCorte, diaPago);
    const cuotasNum = parseInt(totalCuotas, 10) || 1;
    const periodosCuotas = cuotasNum > 1 ? calcularCuotasPeriodos(res.periodoPago, cuotasNum) : [];

    return {
      ...res,
      cuotasNum,
      periodosCuotas,
    };
  }, [metodoPago, tarjetaId, fechaGasto, totalCuotas, tarjetas]);

  // Lista consolidada de gastos del periodo activo
  const listaGastos = useMemo(() => {
    if (!resumen) return [];
    const todos: Array<any> = [];

    // Gastos de tarjetas facturados en este periodo
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

    // Gastos directos (efectivo/debito/transferencia)
    for (const g of resumen.gastosDirectos) {
      todos.push({
        ...g,
        tarjetaNombre: null,
        tipoOrigen: 'directo',
      });
    }

    // Filtrar
    return todos.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;
      if (filtroMetodo !== 'TODOS' && item.metodoPago !== filtroMetodo) return false;
      return true;
    });
  }, [resumen, filtroEstado, filtroMetodo]);

  // Manejador para crear gasto
  const handleSubmitGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || !monto || parseFloat(monto) <= 0) {
      toast.error('Ingresa un concepto y un monto válido');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          monto: parseFloat(monto),
          fechaGasto: new Date(`${fechaGasto}T12:00:00`),
          metodoPago,
          tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : undefined,
          totalCuotas: parseInt(totalCuotas, 10),
          estado,
          notas,
        }),
      });

      if (!res.ok) throw new Error('Error al registrar gasto');
      toast.success('Gasto registrado con éxito');
      setModalOpen(false);
      setConcepto('');
      setMonto('');
      setTotalCuotas('1');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar estado individual
  const handleCambiarEstadoItem = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_estado',
          ids: [id],
          estado: nuevoEstado,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    await handleCambiarEstadoItem(item.dbId, nuevoEstado);
    setDetalleGasto((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
  };

  const handleEliminarGastoModal = async (item: DetalleItemData) => {
    try {
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eliminar',
          ids: [item.dbId],
        }),
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Gasto eliminado exitosamente');
      setDetalleGasto(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleGuardarMontoModal = async (item: DetalleItemData, nuevoMonto: number) => {
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
  };

  // Seleccionar / Deseleccionar todos
  const todosSeleccionados =
    listaGastos.length > 0 &&
    listaGastos.every((item) => selectedGastoIds.includes(item.id));

  const handleToggleSelectAll = () => {
    selectAllGastos(listaGastos.map((g) => ({ id: g.id, monto: g.monto })));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-500" />
            <span>Gastos & Facturación de Tarjetas</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro de compras con corte al día 10, selección interactiva para sumatorias y control de estados.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Registrar Gasto / Compra</span>
        </button>
      </div>

      {/* Barra de Filtros y Selección rápida */}
      <div className="bg-card border border-border/80 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Estado:</span>
          </div>

          {(['PENDIENTE', 'ADELANTADO', 'PAGADO', 'TODOS'] as const).map((est) => {
            const isSelected = filtroEstado === est;
            let dotColor = 'bg-slate-400';
            if (est === 'PENDIENTE') dotColor = 'bg-amber-500';
            if (est === 'ADELANTADO') dotColor = 'bg-indigo-500';
            if (est === 'PAGADO') dotColor = 'bg-emerald-500';

            return (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {est !== 'TODOS' && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
                <span>
                  {est === 'TODOS'
                    ? 'Todos'
                    : est === 'PENDIENTE'
                    ? 'Por Pagar'
                    : est === 'ADELANTADO'
                    ? 'Adelantados'
                    : 'Pagados'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seleccionar Todos */}
        {listaGastos.length > 0 && (
          <button
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-500 hover:text-sky-400 transition"
          >
            {todosSeleccionados ? (
              <>
                <CheckSquare className="w-4 h-4 text-sky-500" />
                <span>Deseleccionar todos</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-muted-foreground" />
                <span>Seleccionar todos para sumar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Lista de Gastos */}
      {listaGastos.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-base font-bold text-foreground">
            No hay gastos registrados en {formatPeriodoLabel(periodo)}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Registra una nueva compra en efectivo, tarjeta o cuotas para comenzar a controlar tus finanzas de este mes.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar primer gasto</span>
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3 w-10 text-center">✓</th>
                  <th className="p-3">Concepto / Detalle</th>
                  <th className="p-3">Método / Tarjeta</th>
                  <th className="p-3">Fecha Compra</th>
                  <th className="p-3">Cuota</th>
                  <th className="p-3 text-right">Monto</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listaGastos.map((gasto) => {
                  const isSelected = selectedGastoIds.includes(gasto.id);
                  const fechaObj = new Date(gasto.fechaGasto);
                  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  });

                  return (
                    <tr
                      key={gasto.id}
                      onClick={() => setDetalleGasto(adaptGastoToDetalle(gasto))}
                      className={`hover:bg-secondary/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-sky-500/10' : ''
                      }`}
                    >
                      {/* Checkbox para sumatoria */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectGasto(gasto.id, gasto.monto)}
                          className="p-1 rounded hover:bg-secondary transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-500" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Concepto */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground text-xs group-hover:text-sky-400 transition flex items-center gap-1.5">
                          <span>{gasto.concepto}</span>
                          <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                            (ver detalle)
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {gasto.categoria || 'Sin categoría'}
                        </div>
                      </td>

                      {/* Método / Tarjeta */}
                      <td className="p-3">
                        {gasto.metodoPago === 'TARJETA_CREDITO' ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: gasto.tarjetaColor || '#2563eb' }}
                            />
                            <span className="font-medium text-foreground">
                              {gasto.tarjetaNombre || 'Tarjeta Crédito'}
                            </span>
                          </div>
                        ) : gasto.metodoPago === 'EFECTIVO_DEBITO' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Banknote className="w-3.5 h-3.5" /> Efectivo / Débito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Transferencia
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {fechaFormateada}
                      </td>

                      {/* Cuota */}
                      <td className="p-3 whitespace-nowrap">
                        {gasto.totalCuotas > 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Cuota {gasto.cuotaActual}/{gasto.totalCuotas}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">1 cuota</span>
                        )}
                      </td>

                      {/* Monto */}
                      <td className="p-3 text-right font-bold text-foreground text-sm whitespace-nowrap">
                        {formatMoney(gasto.monto, moneda)}
                      </td>

                      {/* Estado */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {gasto.estado === 'ADELANTADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <FastForward className="w-3 h-3" /> Adelantado
                          </span>
                        ) : gasto.estado === 'PAGADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </td>

                      {/* Acciones Rápidas de Estado */}
                      <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleCambiarEstadoItem(
                                gasto.id,
                                gasto.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                              )
                            }
                            className={`p-1 rounded-lg text-xs transition ${
                              gasto.estado === 'ADELANTADO'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'hover:bg-secondary text-muted-foreground'
                            }`}
                            title="Alternar Adelantado"
                          >
                            <FastForward className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleCambiarEstadoItem(
                                gasto.id,
                                gasto.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                              )
                            }
                            className={`p-1 rounded-lg text-xs transition ${
                              gasto.estado === 'PAGADO'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'hover:bg-secondary text-muted-foreground'
                            }`}
                            title="Alternar Pagado"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
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
      )}

      {/* SECCIÓN INFORMATIVA: GASTOS POSTERIORES AL DÍA 10 (A PAGAR EL PRÓXIMO MES) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Consumos de Tarjeta que vencen el PRÓXIMO MES
              </h2>
              <p className="text-xs text-muted-foreground">
                Compras realizadas después del día 10 que ya consumiste y se descontarán del sueldo del siguiente mes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tarjetas.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{t.nombre}</span>
                <span className="font-extrabold text-sm text-indigo-400">
                  {formatMoney(t.totalSiguientePeriodo, moneda)}
                </span>
              </div>

              {t.gastosSiguientePeriodo.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No hay consumos registrados posteriores al corte del día {t.diaCorte}.
                </p>
              ) : (
                <ul className="text-xs space-y-1.5 pt-1 divide-y divide-border/60">
                  {t.gastosSiguientePeriodo.map((g: any) => (
                    <li
                      key={g.id}
                      onClick={() =>
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
                      className="pt-1.5 flex items-center justify-between cursor-pointer hover:text-sky-400 transition group"
                      title="Haz clic para ver detalles del gasto"
                    >
                      <div className="truncate pr-2">
                        <span className="text-foreground group-hover:text-sky-400 font-medium transition">
                          {g.concepto}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Comprado el {new Date(g.fechaGasto).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {formatMoney(g.monto, moneda)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL REGISTRAR NUEVO GASTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-500" />
                <span>Registrar Compra / Gasto</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGasto} className="space-y-4 text-xs">
              {/* Concepto */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Concepto / Descripción:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Supermercado Wong, Cena familiar, Zapatillas"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-sky-500 outline-none text-foreground"
                />
              </div>

              {/* Monto y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Monto ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-sky-500 outline-none text-foreground font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Fecha de la compra:
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaGasto}
                    onChange={(e) => setFechaGasto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-sky-500 outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA_CREDITO')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                      metodoPago === 'TARJETA_CREDITO'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px]">Tarjeta Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                      metodoPago === 'EFECTIVO_DEBITO'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[11px]">Efectivo/Débito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('TRANSFERENCIA')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border flex flex-col items-center gap-1 transition ${
                      metodoPago === 'TRANSFERENCIA'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="text-[11px]">Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Si es Tarjeta de Crédito */}
              {metodoPago === 'TARJETA_CREDITO' && (
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">
                        Selecciona la Tarjeta:
                      </label>
                      <select
                        value={tarjetaId}
                        onChange={(e) => setTarjetaId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                      >
                        {tarjetas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} (Corte día {t.diaCorte})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">
                        Número de Cuotas:
                      </label>
                      <select
                        value={totalCuotas}
                        onChange={(e) => setTotalCuotas(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground outline-none"
                      >
                        <option value="1">1 cuota (directo)</option>
                        <option value="2">2 cuotas</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                      </select>
                    </div>
                  </div>

                  {/* PREVIEW INTELIGENTE DE CORTE (DÍA 10) */}
                  {previewFacturacion && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-sky-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Liquidación inteligente de facturación:</span>
                      </div>
                      <p>{previewFacturacion.descripcionExplicativa}</p>
                      {previewFacturacion.cuotasNum > 1 && (
                        <div className="pt-1 text-[11px] font-semibold text-sky-200">
                          Se generarán {previewFacturacion.cuotasNum} cuotas de aprox.{' '}
                          {formatMoney(
                            parseFloat(monto || '0') / previewFacturacion.cuotasNum,
                            moneda
                          )}{' '}
                          en: {previewFacturacion.periodosCuotas.map(formatPeriodoLabel).join(', ')}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Estado Inicial */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Estado Inicial:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEstado('PENDIENTE')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border text-center transition ${
                      estado === 'PENDIENTE'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    ⏳ Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstado('ADELANTADO')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border text-center transition ${
                      estado === 'ADELANTADO'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    ⚡ Adelantado
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstado('PAGADO')}
                    className={`py-2 px-2.5 rounded-xl font-semibold border text-center transition ${
                      estado === 'PAGADO'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    ✅ Pagado
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE GASTO */}
      <ModalDetalleGasto
        item={detalleGasto}
        onClose={() => setDetalleGasto(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        onEliminarGasto={handleEliminarGastoModal}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
