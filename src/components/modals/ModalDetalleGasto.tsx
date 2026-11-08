'use client';

import React, { useState } from 'react';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import {
  CreditCard,
  Landmark,
  Home,
  Banknote,
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
} from 'lucide-react';
import { toast } from 'sonner';

export interface DetalleItemData {
  id: string;
  dbId: string;
  tipo: 'TARJETA' | 'DIRECTO' | 'FIJO' | 'PRESTAMO';
  concepto: string;
  categoria?: string;
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
  tarjetaNombre?: string;
  tarjetaBanco?: string;
  tarjetaUltimosCuatro?: string | null;
  tarjetaDiaCorte?: number;
  tarjetaDiaPago?: number;
  tarjetaColor?: string;

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
  onEliminarGasto?: (item: DetalleItemData) => Promise<void>;
  monedaSimbolo?: string;
}

export function ModalDetalleGasto({
  item,
  onClose,
  onCambiarEstado,
  onEliminarGasto,
  monedaSimbolo = 'S/',
}: ModalDetalleGastoProps) {
  const [updating, setUpdating] = useState(false);

  if (!item) return null;

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
    if (!confirm(`¿Estás seguro de eliminar "${item.concepto}"?`)) return;
    try {
      setUpdating(true);
      await onEliminarGasto(item);
      onClose();
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

  // Icono según tipo
  const renderIconoTipo = () => {
    switch (item.tipo) {
      case 'TARJETA':
        return <CreditCard className="w-5 h-5 text-indigo-400" />;
      case 'PRESTAMO':
        return <Landmark className="w-5 h-5 text-amber-400" />;
      case 'FIJO':
        return <Home className="w-5 h-5 text-sky-400" />;
      case 'DIRECTO':
      default:
        return <Banknote className="w-5 h-5 text-emerald-400" />;
    }
  };

  const tipoLabel = () => {
    switch (item.tipo) {
      case 'TARJETA':
        return 'Gasto con Tarjeta de Crédito';
      case 'PRESTAMO':
        return 'Compromiso de Préstamo Bancario';
      case 'FIJO':
        return 'Costo Fijo Mensual';
      case 'DIRECTO':
      default:
        return 'Gasto en Efectivo / Débito';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden space-y-0 animate-in zoom-in-95 duration-200 text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA */}
        <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-secondary border border-border">
              {renderIconoTipo()}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {tipoLabel()}
              </span>
              <h2 className="text-base font-extrabold text-foreground truncate max-w-[280px] sm:max-w-[340px]">
                {item.concepto}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            title="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* MONTO PRINCIPAL Y MONEDA */}
          <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Monto Imputado al Mes</span>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatMoney(item.monto, monedaSimbolo)}
              </div>
            </div>

            {item.monedaOriginal === 'USD' && item.montoOriginal && (
              <div className="p-3 rounded-xl bg-card border border-border text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Moneda Original: USD</span>
                </div>
                <div className="text-foreground font-bold">
                  ${item.montoOriginal.toFixed(2)} USD
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Tipo de cambio: S/ {(item.tipoCambio || 4.0).toFixed(2)}
                </div>
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
                className={`text-xs font-extrabold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                  item.estado === 'PAGADO'
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                    item.estado === 'PENDIENTE'
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                    item.estado === 'ADELANTADO'
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                    item.estado === 'PAGADO'
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

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Cuotas restantes</span>
                  <span className="font-bold text-foreground">{cuotasRestantes} cuotas por pagar</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Monto total estimado</span>
                  <span className="font-bold text-foreground">
                    {formatMoney(item.montoTotal || item.monto * cuotasTot, monedaSimbolo)}
                  </span>
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

          {/* DETALLES DE COSTO FIJO Y VIGENCIA */}
          {item.tipo === 'FIJO' && (
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
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3 text-muted-foreground" />
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
        <div className="p-4 sm:p-5 border-t border-border bg-secondary/30 flex items-center justify-between gap-3">
          {(item.tipo === 'TARJETA' || item.tipo === 'DIRECTO') && onEliminarGasto ? (
            <button
              type="button"
              disabled={updating}
              onClick={handleEliminar}
              className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar gasto</span>
            </button>
          ) : (
            <div />
          )}

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
