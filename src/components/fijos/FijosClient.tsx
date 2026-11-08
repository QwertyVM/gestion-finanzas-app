'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
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
  ChevronLeft,
  X,
  Pencil,
  Check,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export function FijosClient() {
  const { periodo, irMesAnterior, irMesSiguiente, resumen, refresh } = useFinanzas();
  const [detalleItem, setDetalleItem] = useState<DetalleItemData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modales
  const [modalFijoOpen, setModalFijoOpen] = useState(false);
  const [modalPrestamoOpen, setModalPrestamoOpen] = useState(false);
  const [editandoCostoFijo, setEditandoCostoFijo] = useState<any | null>(null);
  const [editandoPrestamo, setEditandoPrestamo] = useState<any | null>(null);

  // Form Nuevo Costo Fijo
  const [nuevoFijoConcepto, setNuevoFijoConcepto] = useState('');
  const [nuevoFijoMonto, setNuevoFijoMonto] = useState('');
  const [nuevoFijoDia, setNuevoFijoDia] = useState('30');
  const [nuevoFijoMesInicio, setNuevoFijoMesInicio] = useState(periodo);
  const [nuevoFijoMesFin, setNuevoFijoMesFin] = useState('');

  // Form Editar Costo Fijo Base (No Retroactivo)
  const [editFijoConcepto, setEditFijoConcepto] = useState('');
  const [editFijoMonto, setEditFijoMonto] = useState('');
  const [editFijoDia, setEditFijoDia] = useState('30');
  const [editFijoMesDesde, setEditFijoMesDesde] = useState(periodo);
  const [editFijoMesFin, setEditFijoMesFin] = useState('');

  // Form Nuevo Préstamo
  const [nuevoPrestamoBanco, setNuevoPrestamoBanco] = useState('BCP');
  const [nuevoPrestamoConcepto, setNuevoPrestamoConcepto] = useState('');
  const [nuevoPrestamoMontoTotal, setNuevoPrestamoMontoTotal] = useState('');
  const [nuevoPrestamoMontoCuota, setNuevoPrestamoMontoCuota] = useState('');
  const [nuevoPrestamoCuotasTotales, setNuevoPrestamoCuotasTotales] = useState('24');
  const [nuevoPrestamoCuotaInicial, setNuevoPrestamoCuotaInicial] = useState('1');
  const [nuevoPrestamoDiaPago, setNuevoPrestamoDiaPago] = useState('25');
  const [nuevoPrestamoTea, setNuevoPrestamoTea] = useState('14.50');
  const [nuevoPrestamoPeriodoInicio, setNuevoPrestamoPeriodoInicio] = useState(periodo);

  // Form Editar Préstamo Base (No Retroactivo)
  const [editPrestamoBanco, setEditPrestamoBanco] = useState('');
  const [editPrestamoConcepto, setEditPrestamoConcepto] = useState('');
  const [editPrestamoMontoCuota, setEditPrestamoMontoCuota] = useState('');
  const [editPrestamoDiaPago, setEditPrestamoDiaPago] = useState('25');
  const [editPrestamoTea, setEditPrestamoTea] = useState('14.50');
  const [editPrestamoMesDesde, setEditPrestamoMesDesde] = useState(periodo);

  const moneda = resumen?.config?.monedaSimbolo || 'S/';
  const costosFijos = resumen?.costosFijos || [];
  const prestamos = resumen?.prestamos || [];

  // Cuando se selecciona un Costo Fijo para editar base
  const abrirEdicionCostoFijo = (cf: any) => {
    setEditandoCostoFijo(cf);
    setEditFijoConcepto(cf.concepto);
    setEditFijoMonto(cf.monto.toString());
    setEditFijoDia(cf.diaVencimiento.toString());
    setEditFijoMesDesde(periodo);
    setEditFijoMesFin(cf.mesFin || '');
  };

  // Cuando se selecciona un Préstamo para editar base
  const abrirEdicionPrestamo = (p: any) => {
    setEditandoPrestamo(p);
    setEditPrestamoBanco(p.banco);
    setEditPrestamoConcepto(p.concepto);
    setEditPrestamoMontoCuota(p.montoCuota.toString());
    setEditPrestamoDiaPago(p.diaPago.toString());
    setEditPrestamoTea(p.tasaInteresAnual.toString());
    setEditPrestamoMesDesde(periodo);
  };

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

  // Guardar monto específico para un mes desde el modal de detalle
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
      }
      setDetalleItem((prev) => (prev ? { ...prev, monto: nuevoMonto } : null));
      await refresh();
    } catch (e: any) {
      toast.error('Error al actualizar monto');
    }
  };

  const handleCambiarEstadoModal = async (item: DetalleItemData, nuevoEstado: string) => {
    if (item.tipo === 'FIJO') {
      await handleToggleEstadoFijo(item.dbId, nuevoEstado);
    } else if (item.tipo === 'PRESTAMO') {
      await handleToggleEstadoCuota(item.dbId, nuevoEstado);
    }
    setDetalleItem((prev) => (prev ? { ...prev, estado: nuevoEstado as any } : null));
  };

  // Crear nuevo Costo Fijo
  const handleCrearCostoFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoFijoConcepto.trim() || !nuevoFijoMonto || parseFloat(nuevoFijoMonto) <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('crear-fijo');
      const res = await fetch('/api/fijos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: nuevoFijoConcepto.trim(),
          monto: parseFloat(nuevoFijoMonto),
          diaVencimiento: parseInt(nuevoFijoDia, 10),
          periodo,
          mesInicio: nuevoFijoMesInicio || periodo,
          mesFin: nuevoFijoMesFin.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Error al crear costo fijo');
      toast.success('Costo fijo registrado');
      setModalFijoOpen(false);
      setNuevoFijoConcepto('');
      setNuevoFijoMonto('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear');
    } finally {
      setLoadingAction(null);
    }
  };

  // Guardar edición base Costo Fijo (NO RETROACTIVA)
  const handleGuardarEdicionFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFijoConcepto.trim() || !editFijoMonto || parseFloat(editFijoMonto) <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('edit-fijo');
      const res = await fetch('/api/fijos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoCostoFijo.id,
          concepto: editFijoConcepto.trim(),
          monto: parseFloat(editFijoMonto),
          diaVencimiento: parseInt(editFijoDia, 10),
          mesDesde: editFijoMesDesde,
          mesFin: editFijoMesFin.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      toast.success('Costo fijo actualizado sin alterar pagos pasados');
      setEditandoCostoFijo(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoadingAction(null);
    }
  };

  // Crear nuevo Préstamo
  const handleCrearPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPrestamoConcepto.trim() || !nuevoPrestamoMontoCuota || parseFloat(nuevoPrestamoMontoCuota) <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('crear-prestamo');
      const cuotasTot = parseInt(nuevoPrestamoCuotasTotales, 10) || 12;
      const cuotaMonto = parseFloat(nuevoPrestamoMontoCuota);
      const montoTotal = nuevoPrestamoMontoTotal ? parseFloat(nuevoPrestamoMontoTotal) : cuotaMonto * cuotasTot;

      const res = await fetch('/api/prestamos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banco: nuevoPrestamoBanco,
          concepto: nuevoPrestamoConcepto.trim(),
          montoTotal,
          montoCuota: cuotaMonto,
          cuotasTotales: cuotasTot,
          cuotaInicial: parseInt(nuevoPrestamoCuotaInicial, 10) || 1,
          diaPago: parseInt(nuevoPrestamoDiaPago, 10) || 25,
          tasaInteresAnual: parseFloat(nuevoPrestamoTea) || 14.50,
          periodoInicio: nuevoPrestamoPeriodoInicio || periodo,
        }),
      });

      if (!res.ok) throw new Error('Error al crear préstamo');
      toast.success('Préstamo registrado y cuotas programadas');
      setModalPrestamoOpen(false);
      setNuevoPrestamoConcepto('');
      setNuevoPrestamoMontoTotal('');
      setNuevoPrestamoMontoCuota('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear préstamo');
    } finally {
      setLoadingAction(null);
    }
  };

  // Guardar edición base Préstamo (NO RETROACTIVA)
  const handleGuardarEdicionPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingAction('edit-prestamo');
      const res = await fetch('/api/prestamos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoPrestamo.id,
          concepto: editPrestamoConcepto.trim(),
          banco: editPrestamoBanco.trim(),
          montoCuota: parseFloat(editPrestamoMontoCuota),
          diaPago: parseInt(editPrestamoDiaPago, 10),
          tasaInteresAnual: parseFloat(editPrestamoTea),
          mesDesde: editPrestamoMesDesde,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      toast.success('Préstamo actualizado sin alterar pagos pasados');
      setEditandoPrestamo(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoadingAction(null);
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Home className="w-6 h-6 text-sky-500" />
                <span>Costos Fijos del Mes</span>
              </h1>
              {/* Selector de Mes */}
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
            <p className="text-xs text-muted-foreground mt-0.5">
              Haz clic en cualquier tarjeta para ver su ficha técnica o ajustar el monto pagado de este mes.
            </p>
          </div>

          <button
            onClick={() => {
              setNuevoFijoMesInicio(periodo);
              setModalFijoOpen(true);
            }}
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
                onClick={() =>
                  setDetalleItem({
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
                  })
                }
                className="group bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-md transition cursor-pointer"
                title="Haz clic para ver características completas"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground block group-hover:text-sky-400 transition">
                        {formatMoney(cf.monto, moneda)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Vence: Día {cf.diaVencimiento}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground text-sm group-hover:text-sky-400 transition flex items-center gap-1">
                        <span>{cf.concepto}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      </h3>
                      {/* Botón Editar Base No Retroactivo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirEdicionCostoFijo(cf);
                        }}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 p-1 rounded hover:bg-secondary transition"
                        title="Editar definición base (no retroactivo)"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{cf.categoria}</span>
                  </div>
                </div>

                {/* Estado y Botones de 1-Click */}
                <div className="pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Landmark className="w-6 h-6 text-purple-500" />
              <span>Préstamos Bancarios & Cuotas</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitoreo de cuotas mensuales, progreso de pago y amortización de deudas.
            </p>
          </div>

          <button
            onClick={() => {
              setNuevoPrestamoPeriodoInicio(periodo);
              setModalPrestamoOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Préstamo</span>
          </button>
        </div>

        {prestamos.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl">
            <Landmark className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
            <p className="text-sm font-semibold text-foreground mt-2">No hay préstamos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prestamos.map((p) => {
              const progreso = Math.round((p.cuotaActual / p.cuotasTotales) * 100);
              const isLoading = loadingAction === `cuota-${p.cuotaId}`;

              return (
                <div
                  key={p.id}
                  onClick={() =>
                    setDetalleItem({
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
                    })
                  }
                  className="group bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-purple-500/50 hover:shadow-md transition cursor-pointer"
                  title="Haz clic para ver características completas"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        {p.banco}
                      </span>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-foreground group-hover:text-purple-400 transition flex items-center gap-1.5">
                          <span>{p.concepto}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEdicionPrestamo(p);
                          }}
                          className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 p-1 rounded hover:bg-secondary transition"
                          title="Editar condiciones base (no retroactivo)"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Día de pago programado: Día {p.diaPago} de cada mes
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-foreground group-hover:text-purple-400 transition">
                        {formatMoney(p.montoCuota, moneda)}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-semibold">
                        Cuota {p.cuotaActual} de {p.cuotasTotales}
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

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                <X className="w-5 h-5" />
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
                  value={nuevoFijoConcepto}
                  onChange={(e) => setNuevoFijoConcepto(e.target.value)}
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
                    value={nuevoFijoMonto}
                    onChange={(e) => setNuevoFijoMonto(e.target.value)}
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
                    value={nuevoFijoDia}
                    onChange={(e) => setNuevoFijoDia(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Mes de Inicio:
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM (ej: 2026-11)"
                    value={nuevoFijoMesInicio}
                    onChange={(e) => setNuevoFijoMesInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Mes de Fin (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional (ej: 2027-07)"
                    value={nuevoFijoMesFin}
                    onChange={(e) => setNuevoFijoMesFin(e.target.value)}
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
                  disabled={loadingAction === 'crear-fijo'}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow disabled:opacity-50"
                >
                  {loadingAction === 'crear-fijo' ? 'Guardando...' : 'Guardar Costo Fijo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR COSTO FIJO BASE (NO RETROACTIVO) */}
      {editandoCostoFijo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-500" />
                <span>Editar Costo Fijo Base</span>
              </h3>
              <button
                onClick={() => setEditandoCostoFijo(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso No Retroactivo */}
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Edición No Retroactiva Garantizada</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Este cambio solo se aplicará sobre las cuotas pendientes a partir del mes seleccionado. Los meses anteriores y los pagos ya confirmados no sufrirán ninguna modificación.
              </p>
            </div>

            <form onSubmit={handleGuardarEdicionFijo} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Concepto:
                </label>
                <input
                  type="text"
                  required
                  value={editFijoConcepto}
                  onChange={(e) => setEditFijoConcepto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Nuevo Monto Base ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFijoMonto}
                    onChange={(e) => setEditFijoMonto(e.target.value)}
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
                    value={editFijoDia}
                    onChange={(e) => setEditFijoDia(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Aplica desde este mes:
                  </label>
                  <input
                    type="text"
                    required
                    value={editFijoMesDesde}
                    onChange={(e) => setEditFijoMesDesde(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Mes de Fin (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={editFijoMesFin}
                    onChange={(e) => setEditFijoMesFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditandoCostoFijo(null)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'edit-fijo'}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow disabled:opacity-50"
                >
                  {loadingAction === 'edit-fijo' ? 'Guardando...' : 'Aplicar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVO PRÉSTAMO */}
      {modalPrestamoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-500" />
                <span>Registrar Nuevo Préstamo Bancario</span>
              </h3>
              <button
                onClick={() => setModalPrestamoOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearPrestamo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Banco / Entidad:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: BCP, Interbank, BBVA"
                    value={nuevoPrestamoBanco}
                    onChange={(e) => setNuevoPrestamoBanco(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Concepto / Descripción:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Préstamo Personal"
                    value={nuevoPrestamoConcepto}
                    onChange={(e) => setNuevoPrestamoConcepto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Monto Cuota Mensual ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={nuevoPrestamoMontoCuota}
                    onChange={(e) => setNuevoPrestamoMontoCuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Monto Total Financiado ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    value={nuevoPrestamoMontoTotal}
                    onChange={(e) => setNuevoPrestamoMontoTotal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Cuotas Totales:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoPrestamoCuotasTotales}
                    onChange={(e) => setNuevoPrestamoCuotasTotales(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Inicia en Cuota:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevoPrestamoCuotaInicial}
                    onChange={(e) => setNuevoPrestamoCuotaInicial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Día de Pago:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={nuevoPrestamoDiaPago}
                    onChange={(e) => setNuevoPrestamoDiaPago(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Tasa TEA (% anual):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={nuevoPrestamoTea}
                    onChange={(e) => setNuevoPrestamoTea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Mes en que empieza a pagar:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM (ej: 2026-11)"
                    value={nuevoPrestamoPeriodoInicio}
                    onChange={(e) => setNuevoPrestamoPeriodoInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalPrestamoOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'crear-prestamo'}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow disabled:opacity-50"
                >
                  {loadingAction === 'crear-prestamo' ? 'Guardando...' : 'Crear Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRÉSTAMO BASE (NO RETROACTIVO) */}
      {editandoPrestamo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-500" />
                <span>Editar Condiciones del Préstamo</span>
              </h3>
              <button
                onClick={() => setEditandoPrestamo(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso No Retroactivo */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Edición No Retroactiva Garantizada</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Este ajuste solo afectará las cuotas pendientes a partir de {formatPeriodoLabel(editPrestamoMesDesde)}. Los pagos de meses anteriores y los pagos ya confirmados permanecen intactos.
              </p>
            </div>

            <form onSubmit={handleGuardarEdicionPrestamo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Banco:
                  </label>
                  <input
                    type="text"
                    required
                    value={editPrestamoBanco}
                    onChange={(e) => setEditPrestamoBanco(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Concepto:
                  </label>
                  <input
                    type="text"
                    required
                    value={editPrestamoConcepto}
                    onChange={(e) => setEditPrestamoConcepto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Nueva Cuota Mensual ({moneda}):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrestamoMontoCuota}
                    onChange={(e) => setEditPrestamoMontoCuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Día de Pago:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editPrestamoDiaPago}
                    onChange={(e) => setEditPrestamoDiaPago(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Tasa TEA (%):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrestamoTea}
                    onChange={(e) => setEditPrestamoTea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Aplica desde este mes:
                  </label>
                  <input
                    type="text"
                    required
                    value={editPrestamoMesDesde}
                    onChange={(e) => setEditPrestamoMesDesde(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditandoPrestamo(null)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'edit-prestamo'}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow disabled:opacity-50"
                >
                  {loadingAction === 'edit-prestamo' ? 'Guardando...' : 'Aplicar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE COMPROMISO */}
      <ModalDetalleGasto
        item={detalleItem}
        onClose={() => setDetalleItem(null)}
        onCambiarEstado={handleCambiarEstadoModal}
        onGuardarMonto={handleGuardarMontoModal}
        monedaSimbolo={moneda}
      />
    </div>
  );
}
