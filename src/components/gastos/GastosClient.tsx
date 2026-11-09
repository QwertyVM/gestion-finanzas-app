'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel, esItemRecurrente, obtenerClasificacionEgreso } from '@/lib/utils';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { TableSkeleton } from '@/components/common/Skeleton';
import {
  Plus,
  Banknote,
  ArrowRightLeft,
  CheckCircle2,
  FastForward,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function GastosClient() {
  const {
    periodo,
    resumen,
    loading,
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
  const [busqueda, setBusqueda] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const adaptGastoToDetalle = (g: any): DetalleItemData => ({
    id: g.id,
    dbId: g.id,
    tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
    clasificacion: obtenerClasificacionEgreso({
      tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
      concepto: g.concepto,
      categoria: g.categoria,
      totalCuotas: g.totalCuotas,
    }),
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

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const tarjetas = resumen?.tarjetasCredito || [];

  React.useEffect(() => {
    if (tarjetas.length > 0 && !tarjetaId) {
      setTarjetaId(tarjetas[0].id);
    }
  }, [tarjetas, tarjetaId]);

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
      if (filtroMetodo !== 'TODOS' && item.metodoPago !== filtroMetodo) return false;
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase().trim();
        const matchConcepto = item.concepto?.toLowerCase().includes(term);
        const matchCategoria = item.categoria?.toLowerCase().includes(term);
        const matchTarjeta = item.tarjetaNombre?.toLowerCase().includes(term);
        if (!matchConcepto && !matchCategoria && !matchTarjeta) return false;
      }
      return true;
    });
  }, [resumen, filtroEstado, filtroMetodo, busqueda]);

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
        }),
      });

      if (!res.ok) throw new Error('Error al registrar gasto');
      toast.success('Gasto registrado');
      setModalOpen(false);
      setConcepto('');
      setMonto('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

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
      toast.success(`Estado: ${nuevoEstado.toLowerCase()}`);
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
      toast.success('Gasto eliminado');
      setDetalleGasto(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const handleEliminarGastoDirecto = async (id: string, conceptoTexto: string) => {
    if (!confirm(`¿Eliminar "${conceptoTexto}"?`)) return;
    try {
      const res = await fetch(`/api/gastos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Eliminado');
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

  const todosSeleccionados =
    listaGastos.length > 0 &&
    listaGastos.every((item) => selectedGastoIds.includes(item.id));

  const handleToggleSelectAll = () => {
    selectAllGastos(listaGastos.map((g) => ({ id: g.id, monto: g.monto })));
  };

  if (loading && !resumen) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Gastos & Compras
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro con corte al día 10, selección interactiva y control de pagos.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg">
            {(['PENDIENTE', 'ADELANTADO', 'PAGADO', 'TODOS'] as const).map((est) => {
              const isSelected = filtroEstado === est;
              return (
                <button
                  key={est}
                  onClick={() => setFiltroEstado(est)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {est === 'TODOS'
                    ? 'Todos'
                    : est === 'PENDIENTE'
                    ? 'Por Pagar'
                    : est === 'ADELANTADO'
                    ? 'Adelantados'
                    : 'Pagados'}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar concepto o tarjeta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-7 py-1 rounded-md bg-muted/40 border border-border/70 text-xs focus:border-foreground outline-none text-foreground placeholder:text-muted-foreground transition"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {listaGastos.length > 0 && (
          <button
            onClick={handleToggleSelectAll}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition font-medium self-end sm:self-auto"
          >
            {todosSeleccionados ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                <span>Deseleccionar todos</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Seleccionar todos</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Lista de Gastos */}
      {listaGastos.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-10 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {busqueda.trim()
              ? `No se encontraron gastos que coincidan con "${busqueda}".`
              : `No hay gastos registrados para ${formatPeriodoLabel(periodo)}.`}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-2 w-8 text-center"><span className="sr-only">Seleccionar</span></th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Método</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Fecha</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Cuota</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listaGastos.map((gasto) => {
                  const isSelected = selectedGastoIds.includes(gasto.id);
                  const fechaObj = new Date(gasto.fechaGasto);
                  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  });
                  const esCuota = gasto.totalCuotas > 1;
                  const esRecur = esItemRecurrente(gasto.concepto, gasto.categoria);

                  return (
                    <tr
                      key={gasto.id}
                      onClick={() => setDetalleGasto(adaptGastoToDetalle(gasto))}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        isSelected ? 'bg-muted/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectGasto(gasto.id, gasto.monto)}
                          className="text-muted-foreground hover:text-foreground transition p-0.5"
                          aria-label={isSelected ? `Deseleccionar ${gasto.concepto}` : `Seleccionar ${gasto.concepto}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-foreground text-xs flex items-center gap-1.5 flex-wrap">
                          <span>{gasto.concepto}</span>
                          {esRecur && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground">
                              Fijo
                            </span>
                          )}
                          {esCuota && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground">
                              Cuota
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {gasto.categoria || 'Sin categoría'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {gasto.metodoPago === 'TARJETA_CREDITO' ? (
                          <span className="font-medium text-foreground">
                            {gasto.tarjetaNombre || 'Tarjeta'}
                          </span>
                        ) : gasto.metodoPago === 'EFECTIVO_DEBITO' ? (
                          <span className="text-muted-foreground">Efectivo / Débito</span>
                        ) : (
                          <span className="text-muted-foreground">Transferencia</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {fechaFormateada}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {gasto.totalCuotas > 1 ? (
                          `Cuota ${gasto.cuotaActual}/${gasto.totalCuotas}`
                        ) : (
                          '1 cuota'
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground text-xs whitespace-nowrap">
                        {formatMoney(gasto.monto, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            gasto.estado === 'ADELANTADO'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : gasto.estado === 'PAGADO'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              gasto.estado === 'ADELANTADO'
                                ? 'bg-indigo-500'
                                : gasto.estado === 'PAGADO'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {gasto.estado === 'ADELANTADO'
                            ? 'Adelantado'
                            : gasto.estado === 'PAGADO'
                            ? 'Pagado'
                            : 'Pendiente'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleCambiarEstadoItem(
                                gasto.id,
                                gasto.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                              )
                            }
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            title="Alternar Adelantado"
                            aria-label={`Alternar estado adelantado para ${gasto.concepto}`}
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
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            title="Alternar Pagado"
                            aria-label={`Alternar estado pagado para ${gasto.concepto}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEliminarGastoDirecto(gasto.id, gasto.concepto)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition"
                            title="Eliminar gasto"
                            aria-label={`Eliminar gasto ${gasto.concepto}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* SECCIÓN: GASTOS POSTERIORES AL DÍA 10 */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consumos a pagar el próximo mes
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compras posteriores al día 10 que se debitarán en la facturación siguiente.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tarjetas.map((t) => (
              <div
                key={t.id}
                className="px-2.5 py-1 rounded-md bg-muted/40 border border-border/40 flex items-center gap-2 text-xs"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-muted-foreground">{t.nombre}:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatMoney(t.totalSiguientePeriodo, moneda)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Tarjeta</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Fecha</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Cuota</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tarjetas.some((t) => t.gastosSiguientePeriodo && t.gastosSiguientePeriodo.length > 0) ? (
                  tarjetas.flatMap((t) =>
                    (t.gastosSiguientePeriodo || []).map((g: any) => (
                      <tr
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
                        className="hover:bg-muted/30 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {t.nombre}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {g.concepto}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {g.categoria || 'Sin categoría'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                          {new Date(g.fechaGasto).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap text-muted-foreground">
                          {g.totalCuotas > 1 ? `Cuota ${g.cuotaActual}/${g.totalCuotas}` : '1 cuota'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                          {formatMoney(g.monto, moneda)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEliminarGastoDirecto(g.id, g.concepto)}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 transition"
                            title="Eliminar"
                            aria-label={`Eliminar ${g.concepto}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">
                      No hay compras facturadas para el mes siguiente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR NUEVO GASTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-sm font-semibold text-foreground">
                Registrar Gasto
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGasto} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Concepto:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Supermercado, Almuerzo, Uber"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-foreground outline-none text-foreground text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">
                    Monto ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-foreground outline-none text-foreground font-mono text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">
                    Fecha:
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaGasto}
                    onChange={(e) => setFechaGasto(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-foreground outline-none text-foreground text-xs"
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('TARJETA_CREDITO')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      metodoPago === 'TARJETA_CREDITO'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      metodoPago === 'EFECTIVO_DEBITO'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('TRANSFERENCIA')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      metodoPago === 'TRANSFERENCIA'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Transferencia
                  </button>
                </div>
              </div>

              {metodoPago === 'TARJETA_CREDITO' && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">
                        Tarjeta:
                      </label>
                      <select
                        value={tarjetaId}
                        onChange={(e) => setTarjetaId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
                      >
                        {tarjetas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} (Corte día {t.diaCorte})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-muted-foreground">
                        Cuotas:
                      </label>
                      <select
                        value={totalCuotas}
                        onChange={(e) => setTotalCuotas(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
                      >
                        <option value="1">1 cuota</option>
                        <option value="2">2 cuotas</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                      </select>
                    </div>
                  </div>

                  {previewFacturacion && (
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {previewFacturacion.descripcionExplicativa}
                    </p>
                  )}
                </div>
              )}

              {/* Estado */}
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Estado:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEstado('PENDIENTE')}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                      estado === 'PENDIENTE'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstado('ADELANTADO')}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                      estado === 'ADELANTADO'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Adelantado
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstado('PAGADO')}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                      estado === 'PAGADO'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Pagado
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50"
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
