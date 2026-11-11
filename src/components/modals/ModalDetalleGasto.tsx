'use client';

import React, { useState } from 'react';
import {
  formatMoney,
  formatPeriodoLabel,
  ClasificacionEgreso,
  obtenerClasificacionEgreso,
  ESTILOS_CLASIFICACION,
  getEstiloClasificacion,
  esItemRecurrente,
} from '@/lib/utils';
import {
  CreditCard,
  Landmark,
  Home,
  Banknote,
  Repeat,
  Sparkles,
  Clock,
  FastForward,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Trash2,
  X,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  Percent,
  Info,
  DollarSign,
  Tag,
  Receipt,
  FileText,
  Pencil,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFinanzas } from '@/context/FinanzasContext';

export interface DetalleItemData {
  id: string;
  dbId: string;
  tipo: 'TARJETA' | 'DIRECTO' | 'FIJO' | 'PRESTAMO';
  clasificacion?: ClasificacionEgreso;
  concepto: string;
  categoria?: string;
  categoriaColor?: string;
  categoriaIcono?: string;
  monto: number; // En Soles
  monedaOriginal?: string;
  montoOriginal?: number | null;
  tipoCambio?: number;
  fechaGasto?: string;
  periodoPago?: string;
  diaVencimiento?: number;
  estado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO';
  fechaPagoReal?: string | null;
  subtexto?: string;
  notas?: string | null;
  metodoPago?: string;

  // Cuotas
  cuotaActual?: number;
  totalCuotas?: number;
  cuotasTotales?: number;

  // Tarjeta de crédito
  tarjetaId?: string | null;
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  tarjetaUltimosCuatro?: string | null;
  tarjetaDiaCorte?: number;
  tarjetaDiaPago?: number;
  tarjetaColor?: string | null;

  // Préstamo
  banco?: string;
  nombrePrestamo?: string;
  montoTotal?: number;
  tasaInteresAnual?: number;
  prestamoId?: string;

  // Costo Fijo
  mesInicio?: string | null;
  mesFin?: string | null;
}

interface ModalDetalleGastoProps {
  item: DetalleItemData | null;
  onClose: () => void;
  onCambiarEstado?: (item: DetalleItemData, nuevoEstado: string) => Promise<void>;
  onGuardarMonto?: (item: DetalleItemData, nuevoMonto: number) => Promise<void>;
  onEliminarGasto?: (item: DetalleItemData) => Promise<void>;
  onCambiarMetodoPago?: (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => Promise<void>;
  monedaSimbolo?: string;
  tarjetas?: Array<{
    id: string;
    nombre: string;
    banco: string;
    color: string;
    ultimosCuatro?: string | null;
  }>;
}

export function ModalDetalleGasto({
  item,
  onClose,
  onCambiarEstado,
  onGuardarMonto,
  onEliminarGasto,
  onCambiarMetodoPago,
  monedaSimbolo = 'S/',
  tarjetas = [],
}: ModalDetalleGastoProps) {
  const { refresh, periodo } = useFinanzas();
  const [updating, setUpdating] = useState(false);
  const [editandoMonto, setEditandoMonto] = useState(false);
  const [montoEditInput, setMontoEditInput] = useState(item ? item.monto.toString() : '');
  const [savingMonto, setSavingMonto] = useState(false);
  const [editandoMontoTotal, setEditandoMontoTotal] = useState(false);
  const [nuevoMontoTotal, setNuevoMontoTotal] = useState(item?.montoTotal ? item.montoTotal.toString() : '');
  const [savingMontoTotal, setSavingMontoTotal] = useState(false);

  // Edición de cuotas restantes / totales / cuota actual ("cuántas voy pagando")
  const [editandoCuotaActual, setEditandoCuotaActual] = useState(false);
  const [nuevaCuotaActual, setNuevaCuotaActual] = useState('');
  const [savingCuotaActual, setSavingCuotaActual] = useState(false);

  const [editandoCuotasTotales, setEditandoCuotasTotales] = useState(false);
  const [nuevasCuotasTotales, setNuevasCuotasTotales] = useState('');
  const [savingCuotasTotales, setSavingCuotasTotales] = useState(false);

  const [editandoCuotas, setEditandoCuotas] = useState(false);
  const [nuevasCuotasRestantes, setNuevasCuotasRestantes] = useState('');
  const [savingCuotas, setSavingCuotas] = useState(false);

  // Edición método de pago (Fijo)
  const [editandoMetodoPago, setEditandoMetodoPago] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(item?.metodoPago || 'EFECTIVO_DEBITO');
  const [tarjetaIdSeleccionada, setTarjetaIdSeleccionada] = useState(item?.tarjetaId || (tarjetas?.[0]?.id || ''));
  const [aplicarMetodoAFuturos, setAplicarMetodoAFuturos] = useState(false);
  const [savingMetodo, setSavingMetodo] = useState(false);

  // Conversor en edición
  const [modoEdicion, setModoEdicion] = useState<'SOLES' | 'DOLARES'>('SOLES');
  const [montoUsdEdit, setMontoUsdEdit] = useState('');
  const [tcEdit, setTcEdit] = useState('4.00');

  React.useEffect(() => {
    if (item) {
      setMontoEditInput(item.monto.toString());
      setEditandoMonto(false);
      const isUsd = item.monedaOriginal === 'USD' || item.concepto.includes('$');
      setModoEdicion(isUsd ? 'DOLARES' : 'SOLES');
      if (item.montoOriginal) {
        setMontoUsdEdit(item.montoOriginal.toString());
      } else {
        const match = item.concepto.match(/\$([0-9.]+)/);
        setMontoUsdEdit(match ? match[1] : '');
      }
      setTcEdit(item.tipoCambio ? item.tipoCambio.toString() : '4.00');
      setNuevoMontoTotal(item.montoTotal ? item.montoTotal.toString() : '');
      setEditandoMontoTotal(false);
      const cuotasTotInit = item.totalCuotas || item.cuotasTotales || 1;
      const cuotaActInit = item.cuotaActual || 1;
      setNuevaCuotaActual(cuotaActInit.toString());
      setEditandoCuotaActual(false);
      setNuevasCuotasTotales(cuotasTotInit.toString());
      setEditandoCuotasTotales(false);
      setNuevasCuotasRestantes(Math.max(0, cuotasTotInit - cuotaActInit).toString());
      setEditandoCuotas(false);
      setMetodoPagoSeleccionado(item.metodoPago || 'EFECTIVO_DEBITO');
      setTarjetaIdSeleccionada(item.tarjetaId || (tarjetas?.[0]?.id || ''));
      setEditandoMetodoPago(false);
      setAplicarMetodoAFuturos(false);
    }
  }, [item, tarjetas]);

  if (!item) return null;

  const handleGuardarMetodoPago = async () => {
    if (!onCambiarMetodoPago) return;
    try {
      setSavingMetodo(true);
      await onCambiarMetodoPago(
        item,
        metodoPagoSeleccionado,
        metodoPagoSeleccionado === 'TARJETA_CREDITO' ? tarjetaIdSeleccionada : null,
        aplicarMetodoAFuturos
      );
      setEditandoMetodoPago(false);
    } finally {
      setSavingMetodo(false);
    }
  };

  const handleGuardarMontoTotal = async () => {
    const val = parseFloat(nuevoMontoTotal);
    if (isNaN(val) || val <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    if (!item?.prestamoId) return;
    try {
      setSavingMontoTotal(true);
      const res = await fetch('/api/prestamos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.prestamoId,
          montoTotal: val,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar monto total');
      item.montoTotal = val;
      setEditandoMontoTotal(false);
      toast.success(`Monto total actualizado a ${monedaSimbolo} ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    } catch (err: any) {
      toast.error('Error al actualizar monto total');
    } finally {
      setSavingMontoTotal(false);
    }
  };

  const handleGuardarCuotaActual = async () => {
    const val = parseInt(nuevaCuotaActual, 10);
    if (isNaN(val) || val < 1) {
      toast.error('Ingresa una cuota válida (mínimo 1)');
      return;
    }

    try {
      setSavingCuotaActual(true);
      const targetId = item.prestamoId || item.dbId || item.id;
      const res = await fetch('/api/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: item.tipo,
          id: targetId,
          cuotaActual: val,
          cuotasTotales: cuotasTot,
          periodoActual: item.periodoPago || periodo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar cuota actual');

      item.cuotaActual = val;
      setEditandoCuotaActual(false);
      toast.success(`Cuota actual actualizada: vas pagando la cuota ${val} de ${cuotasTot}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuota actual');
    } finally {
      setSavingCuotaActual(false);
    }
  };

  const handleGuardarCuotasTotales = async () => {
    const val = parseInt(nuevasCuotasTotales, 10);
    if (isNaN(val) || val < 1) {
      toast.error('Ingresa una cantidad válida de cuotas totales (mínimo 1)');
      return;
    }

    try {
      setSavingCuotasTotales(true);
      const targetId = item.prestamoId || item.dbId || item.id;
      const res = await fetch('/api/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: item.tipo,
          id: targetId,
          cuotaActual: cuotaAct,
          cuotasTotales: val,
          periodoActual: item.periodoPago || periodo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar cuotas totales');

      item.cuotasTotales = val;
      item.totalCuotas = val;
      setEditandoCuotasTotales(false);
      toast.success(`Total de cuotas actualizado: ${val} cuotas pactadas`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuotas totales');
    } finally {
      setSavingCuotasTotales(false);
    }
  };

  const handleGuardarCuotas = async () => {
    const numRestantes = parseInt(nuevasCuotasRestantes, 10);
    if (isNaN(numRestantes) || numRestantes < 0) {
      toast.error('Ingresa una cantidad válida de cuotas restantes (0 o más)');
      return;
    }

    try {
      setSavingCuotas(true);
      const targetId = item.prestamoId || item.dbId || item.id;
      const currentCuota = item.cuotaActual || 1;
      const res = await fetch('/api/cuotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: item.tipo,
          id: targetId,
          cuotasRestantes: numRestantes,
          cuotaActual: currentCuota,
          periodoActual: item.periodoPago || periodo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar cuotas');

      const nuevoTotal = currentCuota + numRestantes;
      item.cuotasTotales = nuevoTotal;
      item.totalCuotas = nuevoTotal;

      setEditandoCuotas(false);
      toast.success(
        `Cuotas actualizadas: ${numRestantes} cuotas por pagar (Total: ${nuevoTotal} cuotas)`
      );
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuotas');
    } finally {
      setSavingCuotas(false);
    }
  };

  const handleGuardarMonto = async () => {
    let val: number;
    if (modoEdicion === 'DOLARES') {
      const usdVal = parseFloat(montoUsdEdit);
      const tcVal = parseFloat(tcEdit) || 4.0;
      if (isNaN(usdVal) || usdVal < 0) {
        toast.error('Ingresa un monto en dólares válido');
        return;
      }
      val = Number((usdVal * tcVal).toFixed(2));
    } else {
      val = parseFloat(montoEditInput);
    }

    if (isNaN(val) || val < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    if (!onGuardarMonto) return;
    try {
      setSavingMonto(true);
      await onGuardarMonto(item, val);
      setEditandoMonto(false);
      toast.success(`Monto actualizado a ${monedaSimbolo} ${val.toFixed(2)}`);
    } catch (err: any) {
      toast.error('Error al actualizar monto');
    } finally {
      setSavingMonto(false);
    }
  };

  const handleEstado = async (nuevoEstado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO') => {
    if (updating || item.estado === nuevoEstado) return;
    try {
      setUpdating(true);
      if (onCambiarEstado) {
        await onCambiarEstado(item, nuevoEstado);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleEliminar = async () => {
    if (updating || !onEliminarGasto) return;
    if (!confirm(`¿Estás seguro de eliminar "${item.concepto}" de este mes?`)) return;
    try {
      setUpdating(true);
      await onEliminarGasto(item);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  const handleEliminarCompraCompleta = async () => {
    if (updating) return;
    const baseName = item.concepto.replace(/\s*\(Cuota\s+\d+\/\d+\)/i, '').trim();
    if (
      !confirm(
        `¿Estás seguro de eliminar TODA la compra "${baseName}" y todas sus cuotas de todos los meses?\n\nEsta acción eliminará el registro por completo de forma permanente.`
      )
    ) {
      return;
    }
    try {
      setUpdating(true);
      const res = await fetch(`/api/gastos?id=${item.dbId}&eliminarSerie=true`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar compra completa');
      const data = await res.json();
      toast.success(`Compra eliminada (${data.count} cuotas eliminadas en total)`);
      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setUpdating(false);
    }
  };

  // Identificar fecha de consumo
  let fechaConsumoFormatted: string | null = null;
  let diaConsumo: number | null = null;
  if (item.fechaGasto) {
    try {
      const d = new Date(item.fechaGasto);
      diaConsumo = d.getUTCDate();
      fechaConsumoFormatted = d.toLocaleDateString('es-PE', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      fechaConsumoFormatted = item.fechaGasto;
    }
  }

  // Identificar cuotas
  const cuotaAct = item.cuotaActual || 1;
  const cuotasTot = item.totalCuotas || item.cuotasTotales || 1;
  const tieneCuotas = cuotasTot > 1;
  const cuotasRestantes = Math.max(0, cuotasTot - cuotaAct);
  const porcentajeProgreso = Math.min(100, Math.round((cuotaAct / cuotasTot) * 100));

  // Regla de corte para tarjetas
  const diaCorte = item.tarjetaDiaCorte || 10;
  const esAntesDeCorte = diaConsumo !== null ? diaConsumo <= diaCorte : true;

  // Clasificación y estilos de color
  const clasificacionEfectiva: ClasificacionEgreso = item.clasificacion || obtenerClasificacionEgreso(item);
  const estilo = getEstiloClasificacion(clasificacionEfectiva);

  // Icono según tipo y clasificación
  const renderIconoTipo = () => {
    switch (clasificacionEfectiva) {
      case 'PRESTAMO':
      case 'PRESTAMO_CUOTA':
        return item.tipo === 'PRESTAMO' ? (
          <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        );
      case 'CUOTA':
        return <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'FIJO':
        return <Home className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'VARIABLE':
      default:
        return item.tipo === 'TARJETA' ? (
          <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        ) : (
          <Banknote className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        );
    }
  };

  const tipoLabel = () => {
    switch (clasificacionEfectiva) {
      case 'PRESTAMO':
      case 'PRESTAMO_CUOTA':
        return item.tipo === 'PRESTAMO'
          ? 'Compromiso de Préstamo Bancario'
          : `Compra diferida en ${cuotasTot} cuotas`;
      case 'CUOTA':
        return `Compra diferida en ${cuotasTot} cuotas`;
      case 'FIJO':
        return esItemRecurrente(item.concepto, item.categoria)
          ? 'Costo Fijo / Suscripción Mensual'
          : 'Costo Fijo Mensual';
      case 'VARIABLE':
      default:
        return item.tipo === 'TARJETA'
          ? 'Gasto puntual con Tarjeta de Crédito'
          : 'Gasto en Efectivo / Débito';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-lg rounded-xl shadow-xl overflow-hidden space-y-0 animate-in zoom-in-95 duration-150 text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA */}
        <div className="p-5 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${estilo.badgeBg} ${estilo.badgeBorder}`}>
              {renderIconoTipo()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                  {tipoLabel()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${estilo.badgeBg} ${estilo.badgeText} ${estilo.badgeBorder} inline-flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estilo.dotColor}`} />
                  {estilo.badgeLabel}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-foreground truncate max-w-[280px] sm:max-w-[340px]">
                {item.concepto}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition"
            title="Cerrar detalle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* MONTO PRINCIPAL Y MONEDA */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-muted-foreground block">Monto este mes</span>
                {!editandoMonto && onGuardarMonto && (
                  <button
                    type="button"
                    onClick={() => {
                      setMontoEditInput(item.monto.toString());
                      setEditandoMonto(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1 transition"
                    title="Modificar monto"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Modificar</span>
                  </button>
                )}
              </div>

              {!editandoMonto ? (
                <div className="space-y-0.5">
                  <div className="text-2xl font-semibold font-mono text-foreground tracking-tight">
                    {formatMoney(item.monto, monedaSimbolo)}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Total a pagar en soles
                  </span>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Selector de Modo de Edición */}
                  <div className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border w-fit">
                    <button
                      type="button"
                      onClick={() => setModoEdicion('SOLES')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${modoEdicion === 'SOLES'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Monto directo en Soles (S/)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoEdicion('DOLARES')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${modoEdicion === 'DOLARES'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Calcular desde $ USD
                    </button>
                  </div>

                  {modoEdicion === 'SOLES' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">{monedaSimbolo}</span>
                      <input
                        type="number"
                        step="0.01"
                        autoFocus
                        value={montoEditInput}
                        onChange={(e) => setMontoEditInput(e.target.value)}
                        className="w-36 px-3 py-1.5 rounded-xl bg-background border border-border font-extrabold text-foreground text-lg outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        disabled={savingMonto}
                        onClick={handleGuardarMonto}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{savingMonto ? '...' : 'Guardar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoMonto(false)}
                        className="px-2.5 py-1.5 rounded-xl text-muted-foreground hover:bg-secondary text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-500">Monto en $ USD:</span>
                          <div className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border">
                            <span className="text-xs font-bold text-muted-foreground">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={montoUsdEdit}
                              onChange={(e) => setMontoUsdEdit(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-500">Tipo de Cambio (S/):</span>
                          <div className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border">
                            <span className="text-xs font-bold text-muted-foreground">S/</span>
                            <input
                              type="number"
                              step="0.01"
                              value={tcEdit}
                              onChange={(e) => setTcEdit(e.target.value)}
                              placeholder="4.00"
                              className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                        <div className="text-xs font-bold text-foreground">
                          Total en soles:{' '}
                          <span className="text-amber-500 font-extrabold text-sm">
                            S/{' '}
                            {(
                              (parseFloat(montoUsdEdit) || 0) * (parseFloat(tcEdit) || 4.0)
                            ).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={savingMonto}
                            onClick={handleGuardarMonto}
                            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{savingMonto ? '...' : 'Aplicar'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoMonto(false)}
                            className="px-2 py-1 rounded-xl text-muted-foreground hover:bg-secondary text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    💡 Modifica únicamente el valor de este mes. No altera meses pasados ni el historial de pagos.
                  </p>
                </div>
              )}
            </div>

            {(item.monedaOriginal === 'USD' || item.concepto.includes('$')) && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-xs space-y-1.5 shrink-0 self-start">
                <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>Cobrado en Dólares (USD)</span>
                </div>
                <div className="text-foreground font-extrabold text-sm">
                  ${item.montoOriginal ? item.montoOriginal.toFixed(2) : (item.concepto.match(/\$([0-9.]+)/)?.[1] || '---')} USD
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Tipo de cambio: <strong>S/ {(item.tipoCambio || 4.0).toFixed(2)}</strong>
                </div>
                <span className="text-[9px] text-amber-600/90 dark:text-amber-400/90 block leading-tight pt-0.5">
                  Convertido y pagado en Soles de tu presupuesto
                </span>
              </div>
            )}
          </div>

          {/* ESTADO ACTUAL Y ACCIÓN DE 1-CLIC */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Estado del Pago
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${item.estado === 'PAGADO'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : item.estado === 'ADELANTADO'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  }`}
              >
                {item.estado === 'PAGADO' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pagado ✓
                  </>
                )}
                {item.estado === 'ADELANTADO' && (
                  <>
                    <FastForward className="w-3.5 h-3.5" /> Adelantado ⚡
                  </>
                )}
                {item.estado === 'PENDIENTE' && (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Pendiente de pago
                  </>
                )}
              </span>
            </div>

            {/* BOTONES PARA CAMBIAR ESTADO */}
            {onCambiarEstado && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleEstado('PENDIENTE')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${item.estado === 'PENDIENTE'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Pendiente</span>
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleEstado('ADELANTADO')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${item.estado === 'ADELANTADO'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <FastForward className="w-3 h-3" />
                  <span>Adelantado ⚡</span>
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleEstado('PAGADO')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${item.estado === 'PAGADO'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Pagado ✓</span>
                </button>
              </div>
            )}

            {item.fechaPagoReal && (
              <p className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirmado el {new Date(item.fechaPagoReal).toLocaleDateString('es-PE')}</span>
              </p>
            )}
          </div>

          {/* TARJETA DE CRÉDITO Y REGLA DEL DÍA 10 */}
          {item.tipo === 'TARJETA' && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <CreditCard className="w-4 h-4" />
                  <span>{item.tarjetaNombre || 'Tarjeta de Crédito'}</span>
                </span>
                <span className="text-muted-foreground">
                  Corte: Día {diaCorte} · Pago: Día {item.tarjetaDiaPago || 30}
                </span>
              </div>

              {/* EXPLICACIÓN VISUAL DE LA REGLA DE CORTE */}
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Lógica de Facturación con Sueldo</span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  {esAntesDeCorte ? (
                    <p>
                      📅 Realizado el <strong className="text-foreground">{fechaConsumoFormatted || 'día ' + (diaConsumo || '10')}</strong> (hasta el día 10). Se incluye en la facturación del mes y <span className="text-emerald-400 font-semibold">se paga a finales de este mismo mes</span> con tu sueldo actual.
                    </p>
                  ) : (
                    <p>
                      📅 Realizado el <strong className="text-foreground">{fechaConsumoFormatted || 'después del día 10'}</strong> (posterior al corte). <span className="text-sky-400 font-semibold">Se difiere a finales del próximo mes</span> para pagarse con el siguiente sueldo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DETALLES DE CUOTAS Y PROGRESO (SI APLICA) */}
          {tieneCuotas && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Financiamiento en Cuotas</span>
                </span>
                <span className="font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Cuota {cuotaAct} de {cuotasTot}
                </span>
              </div>

              {/* BARRA DE PROGRESO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Progreso de amortización</span>
                  <span>{porcentajeProgreso}% completado</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {/* 1. CUOTA ACTUAL / CUÁNTAS VOY PAGANDO */}
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      Voy pagando (Cuota actual)
                    </span>
                    {!editandoCuotaActual && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevaCuotaActual(cuotaAct.toString());
                          setEditandoCuotaActual(true);
                        }}
                        className="text-muted-foreground hover:text-indigo-400 p-0.5 rounded transition"
                        title="Modificar cuota que vas pagando"
                        aria-label="Modificar cuota que vas pagando"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editandoCuotaActual ? (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="360"
                          value={nuevaCuotaActual}
                          onChange={(e) => setNuevaCuotaActual(e.target.value)}
                          placeholder="ej. 23"
                          className="w-full px-2 py-0.5 rounded bg-background border border-indigo-500/50 text-xs font-mono font-bold text-foreground outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGuardarCuotaActual();
                            } else if (e.key === 'Escape') {
                              setEditandoCuotaActual(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleGuardarCuotaActual}
                          disabled={savingCuotaActual}
                          className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                          title="Guardar cuota actual"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoCuotaActual(false)}
                          disabled={savingCuotaActual}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[9.5px] text-muted-foreground block leading-tight">
                        Este mes pagas la cuota{' '}
                        <strong className="text-indigo-400">{nuevaCuotaActual || cuotaAct}</strong> de {cuotasTot}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-bold text-foreground text-sm">
                        Cuota {cuotaAct}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        (de {cuotasTot})
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. TOTAL DE CUOTAS */}
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      Total de cuotas
                    </span>
                    {!editandoCuotasTotales && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevasCuotasTotales(cuotasTot.toString());
                          setEditandoCuotasTotales(true);
                        }}
                        className="text-muted-foreground hover:text-indigo-400 p-0.5 rounded transition"
                        title="Modificar total de cuotas"
                        aria-label="Modificar total de cuotas"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editandoCuotasTotales ? (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="360"
                          value={nuevasCuotasTotales}
                          onChange={(e) => setNuevasCuotasTotales(e.target.value)}
                          placeholder="ej. 48"
                          className="w-full px-2 py-0.5 rounded bg-background border border-indigo-500/50 text-xs font-mono font-bold text-foreground outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGuardarCuotasTotales();
                            } else if (e.key === 'Escape') {
                              setEditandoCuotasTotales(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleGuardarCuotasTotales}
                          disabled={savingCuotasTotales}
                          className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                          title="Guardar cuotas totales"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoCuotasTotales(false)}
                          disabled={savingCuotasTotales}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[9.5px] text-muted-foreground block leading-tight">
                        Plazo pactado:{' '}
                        <strong className="text-foreground">{nuevasCuotasTotales || cuotasTot}</strong> cuotas
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-bold text-foreground text-sm">
                        {cuotasTot} cuotas
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        en total
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. CUOTAS RESTANTES */}
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground block font-medium">Cuotas restantes</span>
                    {!editandoCuotas && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevasCuotasRestantes(cuotasRestantes.toString());
                          setEditandoCuotas(true);
                        }}
                        className="text-muted-foreground hover:text-indigo-400 p-0.5 rounded transition"
                        title="Modificar cuotas restantes"
                        aria-label="Modificar cuotas restantes"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editandoCuotas ? (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={nuevasCuotasRestantes}
                          onChange={(e) => setNuevasCuotasRestantes(e.target.value)}
                          placeholder="ej. 25"
                          className="w-full px-2 py-0.5 rounded bg-background border border-indigo-500/50 text-xs font-mono font-bold text-foreground outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleGuardarCuotas();
                            } else if (e.key === 'Escape') {
                              setEditandoCuotas(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleGuardarCuotas}
                          disabled={savingCuotas}
                          className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                          title="Guardar cuotas"
                          aria-label="Guardar cuotas"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoCuotas(false)}
                          disabled={savingCuotas}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                          title="Cancelar"
                          aria-label="Cancelar edición"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[9.5px] text-muted-foreground block leading-tight">
                        Total:{' '}
                        <strong className="text-foreground">
                          {cuotaAct + (parseInt(nuevasCuotasRestantes, 10) || 0)}
                        </strong>{' '}
                        cuotas ({cuotaAct} actual + {parseInt(nuevasCuotasRestantes, 10) || 0} por pagar)
                      </span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-bold text-foreground text-sm">
                        {cuotasRestantes} cuotas
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        por pagar
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. MONTO TOTAL DEL CRÉDITO */}
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground block font-medium">Monto total del crédito</span>
                    {item.tipo === 'PRESTAMO' && item.prestamoId && !editandoMontoTotal && (
                      <button
                        type="button"
                        onClick={() => setEditandoMontoTotal(true)}
                        className="text-muted-foreground hover:text-indigo-400 p-0.5 rounded transition"
                        title="Modificar monto total"
                        aria-label="Modificar monto total"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editandoMontoTotal ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        step="0.01"
                        value={nuevoMontoTotal}
                        onChange={(e) => setNuevoMontoTotal(e.target.value)}
                        className="w-full px-2 py-0.5 rounded bg-background border border-border text-xs font-mono font-bold text-foreground outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleGuardarMontoTotal}
                        disabled={savingMontoTotal}
                        className="p-1 rounded bg-foreground text-background hover:opacity-90 transition"
                        title="Guardar"
                        aria-label="Guardar monto total"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoMontoTotal(false)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                        title="Cancelar"
                        aria-label="Cancelar edición"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-0.5">
                      <span className="font-bold text-foreground font-mono text-sm block">
                        {formatMoney(item.montoTotal || item.monto * cuotasTot, monedaSimbolo)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DETALLES DE PRÉSTAMO BANCARIO */}
          {item.tipo === 'PRESTAMO' && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Landmark className="w-4 h-4" />
                <span>Condiciones del Crédito Bancario</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Banco / Entidad</span>
                  <span className="font-bold text-foreground">{item.banco || 'Banco'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Tasa Anual (TEA)</span>
                  <span className="font-bold text-amber-400">
                    {item.tasaInteresAnual ? `${item.tasaInteresAnual.toFixed(2)}%` : 'Sin interés'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-muted-foreground block">Día de vencimiento</span>
                  <span className="font-bold text-foreground">Día {item.diaVencimiento || 25} de cada mes</span>
                </div>
              </div>
            </div>
          )}

          {/* DETALLES DE COSTO FIJO: FORMA DE PAGO (TARJETA O EFECTIVO) Y VIGENCIA */}
          {item.tipo === 'FIJO' && (
            <>
              {/* FORMA DE PAGO: TARJETA O EFECTIVO */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-foreground">
                    {item.metodoPago === 'TARJETA_CREDITO' ? (
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                    ) : item.metodoPago === 'TRANSFERENCIA' ? (
                      <Landmark className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Banknote className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Forma de Pago del Mes</span>
                  </div>
                  {onCambiarMetodoPago && !editandoMetodoPago && (
                    <button
                      type="button"
                      onClick={() => setEditandoMetodoPago(true)}
                      className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Cambiar</span>
                    </button>
                  )}
                </div>

                {!editandoMetodoPago ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${item.metodoPago === 'TARJETA_CREDITO'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : item.metodoPago === 'TRANSFERENCIA'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                      >
                        {item.metodoPago === 'TARJETA_CREDITO' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : item.metodoPago === 'TRANSFERENCIA' ? (
                          <Landmark className="w-4 h-4" />
                        ) : (
                          <Banknote className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {item.metodoPago === 'TARJETA_CREDITO'
                            ? (item.tarjetaNombre || 'Tarjeta de Crédito')
                            : item.metodoPago === 'TRANSFERENCIA'
                              ? 'Transferencia Bancaria'
                              : 'Efectivo / Débito'}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {item.metodoPago === 'TARJETA_CREDITO'
                            ? `Cargo mensual a tu tarjeta ${item.tarjetaBanco ? `(${item.tarjetaBanco})` : ''}`
                            : item.metodoPago === 'TRANSFERENCIA'
                              ? 'Transferencia directa o débito en cuenta'
                              : 'Pago en efectivo o saldo disponible'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.metodoPago === 'TARJETA_CREDITO'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : item.metodoPago === 'TRANSFERENCIA'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                    >
                      {item.metodoPago === 'TARJETA_CREDITO'
                        ? 'A la Tarjeta'
                        : item.metodoPago === 'TRANSFERENCIA'
                          ? 'Transferencia'
                          : 'Efectivo'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 p-3.5 rounded-xl bg-secondary/40 border border-border text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMetodoPagoSeleccionado('EFECTIVO_DEBITO')}
                        className={`py-2 px-2 rounded-xl text-center font-bold border transition ${metodoPagoSeleccionado === 'EFECTIVO_DEBITO'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-xs'
                            : 'bg-background/80 text-muted-foreground border-border hover:text-foreground'
                          }`}
                      >
                        <Banknote className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>Efectivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMetodoPagoSeleccionado('TRANSFERENCIA')}
                        className={`py-2 px-2 rounded-xl text-center font-bold border transition ${metodoPagoSeleccionado === 'TRANSFERENCIA'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-xs'
                            : 'bg-background/80 text-muted-foreground border-border hover:text-foreground'
                          }`}
                      >
                        <Landmark className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>Transferencia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMetodoPagoSeleccionado('TARJETA_CREDITO')}
                        className={`py-2 px-2 rounded-xl text-center font-bold border transition ${metodoPagoSeleccionado === 'TARJETA_CREDITO'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500 shadow-xs'
                            : 'bg-background/80 text-muted-foreground border-border hover:text-foreground'
                          }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>Tarjeta</span>
                      </button>
                    </div>

                    {metodoPagoSeleccionado === 'TARJETA_CREDITO' && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-semibold text-foreground block">
                          Selecciona la Tarjeta de Crédito:
                        </label>
                        <select
                          value={tarjetaIdSeleccionada}
                          onChange={(e) => setTarjetaIdSeleccionada(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {tarjetas && tarjetas.length > 0 ? (
                            tarjetas.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nombre} ({t.banco})
                              </option>
                            ))
                          ) : (
                            <option value="">No hay tarjetas registradas</option>
                          )}
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={aplicarMetodoAFuturos}
                        onChange={(e) => setAplicarMetodoAFuturos(e.target.checked)}
                        className="rounded border-border text-sky-500 focus:ring-sky-500"
                      />
                      <span>Aplicar también como método predeterminado a meses futuros</span>
                    </label>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setEditandoMetodoPago(false)}
                        className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={savingMetodo}
                        onClick={handleGuardarMetodoPago}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow disabled:opacity-50"
                      >
                        {savingMetodo ? 'Guardando...' : 'Guardar Forma de Pago'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* VIGENCIA Y RECURRENCIA */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Home className="w-4 h-4" />
                  <span>Vigencia y Recurrencia</span>
                </div>

                <div className="space-y-2 text-xs">
                  {item.mesFin ? (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 space-y-1">
                      <span className="font-bold block">⏳ Compromiso con Vigencia Temporal</span>
                      <p className="text-[11px] text-muted-foreground">
                        Activo desde <strong className="text-foreground">{formatPeriodoLabel(item.mesInicio || '2026-11')}</strong> hasta <strong className="text-foreground">{formatPeriodoLabel(item.mesFin)}</strong>.
                        Al concluir su vigencia, dejará de descontarse automáticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border text-[11px] text-muted-foreground">
                      🔄 Costo mensual recurrente. Se factura todos los meses con vencimiento el día <strong className="text-foreground">{item.diaVencimiento || 30}</strong>.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* CARACTERÍSTICAS ADICIONALES: CATEGORÍA, FECHA, PERIODO, NOTAS */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-2.5 text-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Ficha Técnica
            </span>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {item.categoria && (
                <div>
                  <span className="text-[10px] text-muted-foreground block">Categoría</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.categoriaColor || '#64748b' }}
                    />
                    {item.categoria}
                  </span>
                </div>
              )}

              {fechaConsumoFormatted && (
                <div>
                  <span className="text-[10px] text-muted-foreground block">Fecha de Compra</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {fechaConsumoFormatted}
                  </span>
                </div>
              )}

              {item.periodoPago && (
                <div>
                  <span className="text-[10px] text-muted-foreground block">Periodo Imputado</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <Receipt className="w-3 h-3 text-muted-foreground" />
                    {formatPeriodoLabel(item.periodoPago)}
                  </span>
                </div>
              )}

              {item.diaVencimiento && (
                <div>
                  <span className="text-[10px] text-muted-foreground block">Día de Pago/Cierre</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    Día {item.diaVencimiento} del mes
                  </span>
                </div>
              )}
            </div>

            {item.notas && (
              <div className="pt-2 border-t border-border mt-2">
                <span className="text-[10px] text-muted-foreground block">Notas / Observaciones</span>
                <p className="text-[11px] text-foreground italic mt-0.5">
                  "{item.notas}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PIE DE MODAL */}
        <div className="p-4 sm:p-5 border-t border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {(item.tipo === 'TARJETA' || item.tipo === 'DIRECTO') && onEliminarGasto && (
              <button
                type="button"
                disabled={updating}
                onClick={handleEliminar}
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition"
                title={tieneCuotas ? 'Eliminar únicamente la cuota de este mes' : 'Eliminar este gasto'}
              >
                <Trash2 className="w-4 h-4" />
                <span>{tieneCuotas ? 'Eliminar solo esta cuota' : 'Eliminar gasto'}</span>
              </button>
            )}

            {(item.tipo === 'TARJETA' || item.tipo === 'DIRECTO') && tieneCuotas && (
              <button
                type="button"
                disabled={updating}
                onClick={handleEliminarCompraCompleta}
                className="text-xs text-white bg-rose-600 hover:bg-rose-500 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-xs transition"
                title="Eliminar la compra completa y todas sus cuotas de todos los meses"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar compra completa (todas las cuotas)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition border border-border"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
