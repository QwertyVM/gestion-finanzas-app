'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import {
  Home,
  Landmark,
  Plus,
  CheckCircle2,
  Clock,
  FastForward,
  Sparkles,
  Tv,
  Utensils,
  Zap,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export function FijosClient() {
  const { periodo, resumen, refresh } = useFinanzas();
  const [modalFijoOpen, setModalFijoOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form nuevo costo fijo
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [diaVencimiento, setDiaVencimiento] = useState('30');

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const costosFijos = resumen?.costosFijos || [];
  const prestamos = resumen?.prestamos || [];

  // Alternar estado de Costo Fijo para el mes
  const handleToggleEstadoFijo = async (costoFijoId: string, nuevoEstado: string) => {
    try {
      setLoadingAction(`fijo-${costoFijoId}`);
      const res = await fetch('/api/fijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costoFijoId,
          periodo,
          estado: nuevoEstado,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar costo fijo');
      toast.success(`Costo fijo actualizado a ${nuevoEstado}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoadingAction(null);
    }
  };

  // Alternar estado de Cuota de Préstamo
  const handleToggleEstadoCuota = async (cuotaId: string, nuevoEstado: string) => {
    try {
      setLoadingAction(`cuota-${cuotaId}`);
      const res = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuotaId,
          estado: nuevoEstado,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar cuota');
      toast.success(`Cuota actualizada a ${nuevoEstado}`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar cuota');
    } finally {
      setLoadingAction(null);
    }
  };

  // Crear nuevo Costo Fijo
  const handleCrearCostoFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || !monto || parseFloat(monto) <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      const res = await fetch('/api/fijos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto,
          monto: parseFloat(monto),
          diaVencimiento: parseInt(diaVencimiento, 10),
          periodo,
        }),
      });

      if (!res.ok) throw new Error('Error al crear costo fijo');
      toast.success('Costo fijo registrado');
      setModalFijoOpen(false);
      setConcepto('');
      setMonto('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear');
    }
  };

  const getIconForConcepto = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('casa') || n.includes('alquiler') || n.includes('depa')) return Home;
    if (n.includes('comida') || n.includes('supermercado')) return Utensils;
    if (n.includes('netflix') || n.includes('spotify') || n.includes('streaming')) return Tv;
    if (n.includes('luz') || n.includes('agua') || n.includes('internet') || n.includes('servicio')) return Zap;
    return ShieldCheck;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. SECCIÓN: COSTOS FIJOS RECURRENTES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Home className="w-6 h-6 text-sky-500" />
              <span>Costos Fijos del Mes ({formatPeriodoLabel(periodo)})</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Obligaciones recurrentes mensuales como el pago de la casa, comida y Netflix.
            </p>
          </div>

          <button
            onClick={() => setModalFijoOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Costo Fijo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costosFijos.map((cf) => {
            const Icon = getIconForConcepto(cf.concepto);
            const isLoading = loadingAction === `fijo-${cf.id}`;

            return (
              <div
                key={cf.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-sky-500/30 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground block">
                        {formatMoney(cf.monto, moneda)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Vence: Día {cf.diaVencimiento}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-sm">{cf.concepto}</h3>
                    <span className="text-[11px] text-muted-foreground">{cf.categoria}</span>
                  </div>
                </div>

                {/* Estado y Botones de 1-Click */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado este mes:</span>
                    {cf.estado === 'ADELANTADO' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500 text-[11px]">
                        <FastForward className="w-3.5 h-3.5" /> Adelantado
                      </span>
                    ) : cf.estado === 'PAGADO' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-500 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-sky-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Pendiente
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => handleToggleEstadoFijo(cf.id, 'PENDIENTE')}
                      disabled={isLoading}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border text-center transition ${
                        cf.estado === 'PENDIENTE'
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                          : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      Pendiente
                    </button>

                    <button
                      onClick={() => handleToggleEstadoFijo(cf.id, 'ADELANTADO')}
                      disabled={isLoading}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border text-center transition ${
                        cf.estado === 'ADELANTADO'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      Adelantado
                    </button>

                    <button
                      onClick={() => handleToggleEstadoFijo(cf.id, 'PAGADO')}
                      disabled={isLoading}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border text-center transition ${
                        cf.estado === 'PAGADO'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      Pagado
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECCIÓN: PRÉSTAMOS BANCARIOS */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-purple-500" />
            <span>Préstamos Bancarios & Cuotas</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoreo de cuotas mensuales, progreso de pago y amortización de deudas.
          </p>
        </div>

        {prestamos.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl">
            <Landmark className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
            <p className="text-sm font-semibold text-foreground mt-2">No hay préstamos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prestamos.map((p) => {
              const progreso = Math.round((p.numeroCuota / p.cuotasTotales) * 100);
              const isLoading = loadingAction === `cuota-${p.cuotaId}`;

              return (
                <div
                  key={p.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        {p.banco}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{p.concepto}</h3>
                      <p className="text-xs text-muted-foreground">
                        Día de pago programado: Día {p.diaPago} de cada mes
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-foreground">
                        {formatMoney(p.montoCuota, moneda)}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-semibold">
                        Cuota {p.numeroCuota} de {p.cuotasTotales}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de amortización */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Progreso de amortización:</span>
                      <span className="font-bold text-purple-400">{progreso}% completado</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  {/* Estado de la Cuota del Mes */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Estado en {formatPeriodoLabel(periodo)}:
                      </span>
                      {p.estado === 'ADELANTADO' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500 text-xs">
                          <FastForward className="w-3.5 h-3.5" /> Cuota Adelantada
                        </span>
                      ) : p.estado === 'PAGADO' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-500 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cuota Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-sky-500 text-xs">
                          <Clock className="w-3.5 h-3.5" /> Pendiente de pago
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleToggleEstadoCuota(
                            p.cuotaId,
                            p.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        disabled={isLoading}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          p.estado === 'ADELANTADO'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        ⚡ Adelantar
                      </button>

                      <button
                        onClick={() =>
                          handleToggleEstadoCuota(
                            p.cuotaId,
                            p.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                          )
                        }
                        disabled={isLoading}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          p.estado === 'PAGADO'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                        }`}
                      >
                        ✅ Pagado
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CREAR NUEVO COSTO FIJO */}
      {modalFijoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Home className="w-5 h-5 text-sky-500" />
                <span>Nuevo Costo Fijo Recurrente</span>
              </h3>
              <button
                onClick={() => setModalFijoOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearCostoFijo} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Concepto (ej. Alquiler, Internet, Gimnasio):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Internet Fibra Óptica"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Monto Mensual ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Día de Vencimiento:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={diaVencimiento}
                    onChange={(e) => setDiaVencimiento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalFijoOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow"
                >
                  Guardar Costo Fijo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
