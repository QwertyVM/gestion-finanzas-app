'use client';

import React, { useState, useMemo } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  formatMoney,
  formatPeriodoLabel,
  esItemRecurrente,
  obtenerClasificacionEgreso,
  getEstiloClasificacion,
} from '@/lib/utils';
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
  Layers,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  AlertCircle,
  Info,
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
    openRecordModal,
  } = useFinanzas();

  // Vista activa: 'MES' (gastos del mes) o 'COMPRAS_CUOTAS' (sección consolidada de compras en cuotas)
  const [vistaActiva, setVistaActiva] = useState<'MES' | 'COMPRAS_CUOTAS'>('MES');
  const [comprasCuotas, setComprasCuotas] = useState<any[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [compraDesplegada, setCompraDesplegada] = useState<string | null>(null);
  const [deletingCompraId, setDeletingCompraId] = useState<string | null>(null);

  // Modal para confirmar eliminación de gasto individual vs compra completa
  const [gastoParaEliminar, setGastoParaEliminar] = useState<any | null>(null);
  const [eliminandoGasto, setEliminandoGasto] = useState(false);

  // Estados locales
  const [detalleGasto, setDetalleGasto] = useState<DetalleItemData | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('PENDIENTE');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const cargarComprasCuotas = React.useCallback(async () => {
    try {
      setLoadingCuotas(true);
      const res = await fetch(`/api/gastos/compras-cuotas?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) {
        setComprasCuotas(data.compras || []);
      }
    } catch (err) {
      console.error('Error cargando compras en cuotas:', err);
    } finally {
      setLoadingCuotas(false);
    }
  }, [periodo]);

  React.useEffect(() => {
    cargarComprasCuotas();
  }, [cargarComprasCuotas, resumen]);

  const adaptGastoToDetalle = (g: any): DetalleItemData => ({
    id: g.id,
    dbId: g.id,
    tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
    clasificacion: g.clasificacion || obtenerClasificacionEgreso({
      tipo: g.metodoPago === 'TARJETA_CREDITO' ? 'TARJETA' : 'DIRECTO',
      concepto: g.concepto,
      categoria: g.categoria,
      totalCuotas: g.totalCuotas,
    }),
    concepto: g.concepto,
    categoria: g.categoria,
    categoriaColor: g.categoriaColor,
    categoriaIcono: g.categoriaIcono,
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

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const tarjetas = resumen?.tarjetasCredito || [];

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

  const onClickTrash = (gasto: any) => {
    if (gasto.totalCuotas > 1) {
      // Abre el modal inteligente con opciones para compras en cuotas
      setGastoParaEliminar(gasto);
    } else {
      handleEliminarGastoDirecto(gasto.id, gasto.concepto, false);
    }
  };

  const handleEliminarGastoDirecto = async (id: string, conceptoTexto: string, eliminarTodaLaSerie = false) => {
    if (!eliminarTodaLaSerie && !confirm(`¿Eliminar "${conceptoTexto}"?`)) return;
    try {
      setEliminandoGasto(true);
      const url = eliminarTodaLaSerie
        ? `/api/gastos?id=${id}&eliminarSerie=true`
        : `/api/gastos?id=${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      const data = await res.json();
      if (eliminarTodaLaSerie) {
        toast.success(`Compra eliminada (${data.count} cuotas eliminadas en total)`);
      } else {
        toast.success('Gasto eliminado');
      }
      setGastoParaEliminar(null);
      await refresh();
      await cargarComprasCuotas();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setEliminandoGasto(false);
    }
  };

  const handleEliminarCompraCuotasCompleta = async (compra: any) => {
    if (
      !confirm(
        `¿Eliminar TODA la compra "${compra.conceptoBase}"?\n\nSe eliminarán de una sola vez las ${compra.totalRegistrosEnDB} cuotas de todos los meses.`
      )
    ) {
      return;
    }

    try {
      setDeletingCompraId(compra.padreId);
      const res = await fetch(`/api/gastos/compras-cuotas?padreId=${compra.padreId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar la compra en cuotas');
      const data = await res.json();
      toast.success(`"${compra.conceptoBase}" eliminada (${data.count} registros eliminados)`);
      await refresh();
      await cargarComprasCuotas();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeletingCompraId(null);
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
            Registro con corte al día 10, selección interactiva y control de compras en cuotas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Vista: Gastos del Mes vs Compras en Cuotas */}
          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setVistaActiva('MES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${vistaActiva === 'MES'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos del Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('COMPRAS_CUOTAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${vistaActiva === 'COMPRAS_CUOTAS'
                ? 'bg-card text-indigo-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
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
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: COMPRAS EN CUOTAS CONSOLIDADAS */}
      {vistaActiva === 'COMPRAS_CUOTAS' ? (
        <div className="space-y-4">
          {/* Banner explicativo */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-sm sm:text-base text-foreground">
                  Sección de Compras en Cuotas (Tarjetas de Crédito)
                </h2>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl pl-9">
                Aquí ves cada compra financiada consolidada en una sola ficha con su progreso global. Puedes{' '}
                <strong className="text-foreground">eliminar la compra completa y todas sus cuotas de todos los meses de un solo golpe</strong>,
                sin tener que ir borrando cuota por cuota mes tras mes.
              </p>
            </div>
          </div>

          {loadingCuotas ? (
            <TableSkeleton rows={4} />
          ) : comprasCuotas.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-2">
              <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No tienes compras en cuotas registradas</p>
              <p className="text-xs text-muted-foreground">
                Cuando registres una compra con tarjeta en 2 o más cuotas, aparecerá consolidada aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comprasCuotas.map((compra) => {
                const tieneDuplicados = compra.totalRegistrosEnDB > compra.totalCuotas;
                const estaDesplegado = compraDesplegada === compra.padreId;
                const isDeleting = deletingCompraId === compra.padreId;

                return (
                  <div
                    key={compra.padreId || compra.conceptoBase}
                    className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-border transition"
                  >
                    <div className="space-y-3">
                      {/* Cabecera de la compra */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-md border text-white shadow-2xs"
                              style={{ backgroundColor: compra.tarjetaColor || '#4f46e5' }}
                            >
                              {compra.tarjetaNombre}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              {compra.categoriaNombre}
                            </span>
                            {tieneDuplicados && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{compra.totalRegistrosEnDB} registros (duplicados detectados)</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-foreground">
                            {compra.conceptoBase}
                          </h3>
                        </div>

                        <span className="font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 text-xs shrink-0">
                          Cuota {compra.cuotaActual} de {compra.totalCuotas}
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Progreso de pago</span>
                          <span className="font-semibold text-foreground">
                            {compra.porcentajeProgreso}% ({compra.cuotasRestantes} restantes)
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${compra.porcentajeProgreso}%` }}
                          />
                        </div>
                      </div>

                      {/* Grid de Métricas */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                          <span className="text-[10px] text-muted-foreground block font-medium">Cuota mensual</span>
                          <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                            {formatMoney(compra.montoCuota, moneda)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                          <span className="text-[10px] text-muted-foreground block font-medium">Total financiado</span>
                          <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                            {formatMoney(compra.montoTotal, moneda)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                          <span className="text-[10px] text-muted-foreground block font-medium">Plazo</span>
                          <span className="font-semibold text-foreground text-xs block mt-0.5">
                            {compra.primerPeriodo} → {compra.ultimoPeriodo}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                          <span className="text-[10px] text-muted-foreground block font-medium">Registros en BD</span>
                          <span className={`font-semibold text-xs block mt-0.5 ${tieneDuplicados ? 'text-amber-400 font-bold' : 'text-foreground'}`}>
                            {compra.totalRegistrosEnDB} cuotas {tieneDuplicados ? '(clonadas)' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Acordeón de desglose de cuotas */}
                      {estaDesplegado && (
                        <div className="pt-2 border-t border-border space-y-2">
                          <span className="text-[11px] font-semibold text-foreground block">
                            Detalle de todas las cuotas generadas:
                          </span>
                          <div className="max-h-48 overflow-y-auto divide-y divide-border/60 rounded-xl bg-background/50 border border-border p-2 text-[11px]">
                            {compra.cuotas.map((cu: any, idx: number) => (
                              <div key={cu.id || idx} className="py-1 px-1.5 flex items-center justify-between">
                                <span className="font-medium text-foreground">
                                  {cu.periodoPago} — Cuota {cu.cuotaActual}/{cu.totalCuotas}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-muted-foreground">
                                    {formatMoney(cu.monto, moneda)}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${cu.estado === 'PAGADO'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : cu.estado === 'ADELANTADO'
                                        ? 'bg-indigo-500/20 text-indigo-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                      }`}
                                  >
                                    {cu.estado}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setCompraDesplegada(estaDesplegado ? null : compra.padreId)}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-secondary transition"
                      >
                        {estaDesplegado ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Ocultar cuotas</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Ver todas las cuotas ({compra.totalRegistrosEnDB})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleEliminarCompraCuotasCompleta(compra)}
                        className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 py-2 px-3.5 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                        title="Eliminar toda la compra y todas sus cuotas de todos los meses de un solo golpe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeleting ? 'Eliminando...' : 'Eliminar compra completa'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
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
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${isSelected
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
                      const clasif = gasto.clasificacion || (esRecur ? 'FIJO' : esCuota ? 'CUOTA' : 'VARIABLE');
                      const estilo = getEstiloClasificacion(clasif);

                      return (
                        <tr
                          key={gasto.id}
                          onClick={() => setDetalleGasto(adaptGastoToDetalle(gasto))}
                          className={`hover:bg-muted/30 transition-colors cursor-pointer border-l-[3px] ${estilo.borderColor} ${isSelected ? 'bg-muted/40' : ''
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
                              {esRecur ? (
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                  Fijo
                                </span>
                              ) : esCuota ? (
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  Cuota
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold border bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                  Variable
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span
                                className="inline-block w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: gasto.categoriaColor || '#64748b' }}
                                title={gasto.categoria}
                              />
                              <span>{gasto.categoria || 'Sin categoría'}</span>
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
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${gasto.estado === 'ADELANTADO'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : gasto.estado === 'PAGADO'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${gasto.estado === 'ADELANTADO'
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
                                onClick={() => onClickTrash(gasto)}
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
                                onClick={() => onClickTrash(g)}
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
        </>
      )}

      {/* MODAL INTELIGENTE DE ELIMINACIÓN DE CUOTA */}
      {gastoParaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Eliminar Gasto en Cuotas
                </h3>
                <p className="text-xs text-muted-foreground">
                  {gastoParaEliminar.concepto}
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border">
              Este gasto forma parte de una compra en <strong>{gastoParaEliminar.totalCuotas} cuotas</strong> ({formatMoney(gastoParaEliminar.monto, moneda)}/mes). ¿Qué deseas eliminar?
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={eliminandoGasto}
                onClick={() => handleEliminarGastoDirecto(gastoParaEliminar.id, gastoParaEliminar.concepto, false)}
                className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-secondary text-foreground text-xs font-semibold flex items-center justify-between transition disabled:opacity-50"
              >
                <span>Eliminar SOLO la cuota de este mes ({formatPeriodoLabel(periodo)})</span>
                <span className="text-[10px] text-muted-foreground font-normal">Conserva los demás meses</span>
              </button>

              <button
                type="button"
                disabled={eliminandoGasto}
                onClick={() => handleEliminarGastoDirecto(gastoParaEliminar.id, gastoParaEliminar.concepto, true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-between shadow-xs transition disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar TODA la compra completa</span>
                </div>
                <span className="text-[10px] text-rose-100 font-medium">Todas las cuotas de todos los meses</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={eliminandoGasto}
                onClick={() => setGastoParaEliminar(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              >
                Cancelar
              </button>
            </div>
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
        tarjetas={tarjetas}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
