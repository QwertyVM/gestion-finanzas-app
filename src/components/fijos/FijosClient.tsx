'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  formatMoney,
  formatPeriodoLabel,
  ClasificacionEgreso,
  ESTILOS_CLASIFICACION,
  esItemRecurrente,
} from '@/lib/utils';
import { ModalDetalleGasto, DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import {
  Home,
  Landmark,
  Repeat,
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
  Trash2,
  Table,
  LayoutGrid,
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

  const [modoVistaFijos, setModoVistaFijos] = useState<'TABLA' | 'TARJETAS'>('TABLA');
  const [modoVistaPrestamos, setModoVistaPrestamos] = useState<'TABLA' | 'TARJETAS'>('TABLA');

  const configTc = resumen?.config?.tipoCambioUSD || 4.00;

  // Form Nuevo Costo Fijo
  const [nuevoFijoConcepto, setNuevoFijoConcepto] = useState('');
  const [nuevoFijoMoneda, setNuevoFijoMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [nuevoFijoMonto, setNuevoFijoMonto] = useState('');
  const [nuevoFijoMontoUSD, setNuevoFijoMontoUSD] = useState('');
  const [nuevoFijoTc, setNuevoFijoTc] = useState(configTc.toString());
  const [nuevoFijoDia, setNuevoFijoDia] = useState('30');
  const [nuevoFijoMesInicio, setNuevoFijoMesInicio] = useState(periodo);
  const [nuevoFijoMesFin, setNuevoFijoMesFin] = useState('');

  // Form Editar Costo Fijo Base (No Retroactivo)
  const [editFijoConcepto, setEditFijoConcepto] = useState('');
  const [editFijoMoneda, setEditFijoMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [editFijoMonto, setEditFijoMonto] = useState('');
  const [editFijoMontoUSD, setEditFijoMontoUSD] = useState('');
  const [editFijoTc, setEditFijoTc] = useState(configTc.toString());
  const [editFijoDia, setEditFijoDia] = useState('30');
  const [editFijoMesDesde, setEditFijoMesDesde] = useState(periodo);
  const [editFijoMesFin, setEditFijoMesFin] = useState('');

  // Form Nuevo Préstamo
  const [nuevoPrestamoBanco, setNuevoPrestamoBanco] = useState('BCP');
  const [nuevoPrestamoConcepto, setNuevoPrestamoConcepto] = useState('');
  const [nuevoPrestamoMoneda, setNuevoPrestamoMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [nuevoPrestamoMontoTotal, setNuevoPrestamoMontoTotal] = useState('');
  const [nuevoPrestamoMontoCuota, setNuevoPrestamoMontoCuota] = useState('');
  const [nuevoPrestamoCuotaUSD, setNuevoPrestamoCuotaUSD] = useState('');
  const [nuevoPrestamoTotalUSD, setNuevoPrestamoTotalUSD] = useState('');
  const [nuevoPrestamoTc, setNuevoPrestamoTc] = useState(configTc.toString());
  const [nuevoPrestamoCuotasTotales, setNuevoPrestamoCuotasTotales] = useState('24');
  const [nuevoPrestamoCuotaInicial, setNuevoPrestamoCuotaInicial] = useState('1');
  const [nuevoPrestamoDiaPago, setNuevoPrestamoDiaPago] = useState('25');
  const [nuevoPrestamoTea, setNuevoPrestamoTea] = useState('14.50');
  const [nuevoPrestamoPeriodoInicio, setNuevoPrestamoPeriodoInicio] = useState(periodo);

  // Form Editar Préstamo Base (No Retroactivo)
  const [editPrestamoBanco, setEditPrestamoBanco] = useState('');
  const [editPrestamoConcepto, setEditPrestamoConcepto] = useState('');
  const [editPrestamoMoneda, setEditPrestamoMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [editPrestamoMontoCuota, setEditPrestamoMontoCuota] = useState('');
  const [editPrestamoCuotaUSD, setEditPrestamoCuotaUSD] = useState('');
  const [editPrestamoTc, setEditPrestamoTc] = useState(configTc.toString());
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

    const isUsd = cf.monedaOriginal === 'USD' || cf.concepto.includes('$');
    setEditFijoMoneda(isUsd ? 'USD' : 'PEN');
    if (cf.montoOriginal) {
      setEditFijoMontoUSD(cf.montoOriginal.toString());
    } else {
      const match = cf.concepto.match(/\$([0-9.]+)/);
      setEditFijoMontoUSD(match ? match[1] : '');
    }
    setEditFijoTc(cf.tipoCambio ? cf.tipoCambio.toString() : configTc.toString());
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

    const isUsd = p.monedaOriginal === 'USD' || p.concepto.includes('$');
    setEditPrestamoMoneda(isUsd ? 'USD' : 'PEN');
    if (p.montoOriginal) {
      setEditPrestamoCuotaUSD(p.montoOriginal.toString());
    } else {
      const match = p.concepto.match(/\$([0-9.]+)/);
      setEditPrestamoCuotaUSD(match ? match[1] : '');
    }
    setEditPrestamoTc(p.tipoCambio ? p.tipoCambio.toString() : configTc.toString());
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

  const handleEliminarCostoFijo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el costo fijo "${concepto}" y sus registros asociados?`)) return;
    try {
      setLoadingAction(`del-fijo-${id}`);
      const res = await fetch(`/api/fijos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar costo fijo');
      toast.success(`Costo fijo "${concepto}" eliminado`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEliminarPrestamo = async (id: string, concepto: string) => {
    if (!confirm(`¿Eliminar definitivamente el préstamo "${concepto}" y todas sus cuotas?`)) return;
    try {
      setLoadingAction(`del-prestamo-${id}`);
      const res = await fetch(`/api/prestamos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar préstamo');
      toast.success(`Préstamo "${concepto}" eliminado`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setLoadingAction(null);
    }
  };

  // Crear nuevo Costo Fijo
  const handleCrearCostoFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    let montoFinalSoles = parseFloat(nuevoFijoMonto);
    let conceptoFinal = nuevoFijoConcepto.trim();
    let notasFinal: string | null = null;

    if (nuevoFijoMoneda === 'USD') {
      const usdVal = parseFloat(nuevoFijoMontoUSD);
      const tcVal = parseFloat(nuevoFijoTc) || configTc;
      if (isNaN(usdVal) || usdVal <= 0) {
        toast.error('Ingresa un monto en dólares válido');
        return;
      }
      montoFinalSoles = Number((usdVal * tcVal).toFixed(2));
      notasFinal = `USD: $${usdVal} | TC: S/ ${tcVal}`;
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdVal} USD)`;
      }
    }

    if (!conceptoFinal || isNaN(montoFinalSoles) || montoFinalSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('crear-fijo');
      const res = await fetch('/api/fijos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: conceptoFinal,
          monto: montoFinalSoles,
          diaVencimiento: parseInt(nuevoFijoDia, 10),
          periodo,
          mesInicio: nuevoFijoMesInicio || periodo,
          mesFin: nuevoFijoMesFin.trim() || null,
          notas: notasFinal,
        }),
      });

      if (!res.ok) throw new Error('Error al crear costo fijo');
      toast.success('Costo fijo registrado');
      setModalFijoOpen(false);
      setNuevoFijoConcepto('');
      setNuevoFijoMonto('');
      setNuevoFijoMontoUSD('');
      setNuevoFijoMoneda('PEN');
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
    let montoFinalSoles = parseFloat(editFijoMonto);
    let conceptoFinal = editFijoConcepto.trim();

    if (editFijoMoneda === 'USD') {
      const usdVal = parseFloat(editFijoMontoUSD);
      const tcVal = parseFloat(editFijoTc) || configTc;
      if (isNaN(usdVal) || usdVal <= 0) {
        toast.error('Ingresa un monto en dólares válido');
        return;
      }
      montoFinalSoles = Number((usdVal * tcVal).toFixed(2));
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdVal} USD)`;
      }
    }

    if (!conceptoFinal || isNaN(montoFinalSoles) || montoFinalSoles <= 0) {
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
          concepto: conceptoFinal,
          monto: montoFinalSoles,
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
    let cuotaSoles = parseFloat(nuevoPrestamoMontoCuota);
    let totalSoles = nuevoPrestamoMontoTotal ? parseFloat(nuevoPrestamoMontoTotal) : 0;
    let conceptoFinal = nuevoPrestamoConcepto.trim();
    const cuotasTot = parseInt(nuevoPrestamoCuotasTotales, 10) || 12;

    if (nuevoPrestamoMoneda === 'USD') {
      const usdCuota = parseFloat(nuevoPrestamoCuotaUSD);
      const tcVal = parseFloat(nuevoPrestamoTc) || configTc;
      if (isNaN(usdCuota) || usdCuota <= 0) {
        toast.error('Ingresa la cuota en dólares');
        return;
      }
      cuotaSoles = Number((usdCuota * tcVal).toFixed(2));
      const usdTotal = parseFloat(nuevoPrestamoTotalUSD) || (usdCuota * cuotasTot);
      totalSoles = Number((usdTotal * tcVal).toFixed(2));
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdCuota} USD)`;
      }
    } else {
      if (!totalSoles) totalSoles = cuotaSoles * cuotasTot;
    }

    if (!conceptoFinal || isNaN(cuotaSoles) || cuotaSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('crear-prestamo');
      const res = await fetch('/api/prestamos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banco: nuevoPrestamoBanco,
          concepto: conceptoFinal,
          montoTotal: totalSoles,
          montoCuota: cuotaSoles,
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
      setNuevoPrestamoCuotaUSD('');
      setNuevoPrestamoMoneda('PEN');
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
    let cuotaSoles = parseFloat(editPrestamoMontoCuota);
    let conceptoFinal = editPrestamoConcepto.trim();

    if (editPrestamoMoneda === 'USD') {
      const usdCuota = parseFloat(editPrestamoCuotaUSD);
      const tcVal = parseFloat(editPrestamoTc) || configTc;
      if (isNaN(usdCuota) || usdCuota <= 0) {
        toast.error('Ingresa la cuota en dólares');
        return;
      }
      cuotaSoles = Number((usdCuota * tcVal).toFixed(2));
      if (!conceptoFinal.includes('$')) {
        conceptoFinal = `${conceptoFinal} ($${usdCuota} USD)`;
      }
    }

    if (!conceptoFinal || isNaN(cuotaSoles) || cuotaSoles <= 0) {
      toast.error('Ingresa datos válidos');
      return;
    }

    try {
      setLoadingAction('edit-prestamo');
      const res = await fetch('/api/prestamos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoPrestamo.id,
          concepto: conceptoFinal,
          banco: editPrestamoBanco.trim(),
          montoCuota: cuotaSoles,
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

          {/* Selector de Vista y Botón Agregar */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 bg-secondary/80 p-0.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setModoVistaFijos('TABLA')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  modoVistaFijos === 'TABLA'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ver como Tabla"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVistaFijos('TARJETAS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  modoVistaFijos === 'TARJETAS'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ver como Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            <button
              onClick={() => {
                setNuevoFijoMesInicio(periodo);
                setModalFijoOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Agregar Costo Fijo</span>
            </button>
          </div>
        </div>

        {modoVistaFijos === 'TABLA' ? (
          /* ======================================================== */
          /* TABLA DE COSTOS FIJOS DEL MES                            */
          /* ======================================================== */
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Tipo / Concepto</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3 text-center">Vence</th>
                    <th className="py-3 px-3 text-right">Monto</th>
                    <th className="py-3 px-3 text-center">Estado este mes</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-800/80">
                  {costosFijos.map((cf) => {
                    const esRecur = esItemRecurrente(cf.concepto, cf.categoria);
                    const clasificacion: ClasificacionEgreso = esRecur ? 'RECURRENTE' : 'FIJO';
                    const estilo = ESTILOS_CLASIFICACION[clasificacion];
                    const isLoading = loadingAction === `fijo-${cf.id}`;

                    return (
                      <tr
                        key={cf.id}
                        onClick={() =>
                          setDetalleItem({
                            id: `fijo-${cf.id}`,
                            dbId: cf.id,
                            tipo: 'FIJO',
                            clasificacion,
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
                          })
                        }
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className={`py-3 px-3 border-l-4 ${estilo.borderColor}`}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-foreground text-xs">{cf.concepto}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-md font-bold shrink-0 border ${estilo.badgeBg} ${estilo.badgeText} ${estilo.badgeBorder}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${estilo.dotColor}`} />
                              {estilo.badgeLabel}
                            </span>
                          </div>
                          {cf.monedaOriginal === 'USD' && cf.montoOriginal && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                              ${cf.montoOriginal.toFixed(2)} USD
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                          {cf.categoria || 'General'}
                        </td>

                        <td className="py-3 px-3 text-center text-muted-foreground whitespace-nowrap">
                          Día {cf.diaVencimiento}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-foreground whitespace-nowrap">
                          {formatMoney(cf.monto, moneda)}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {cf.estado === 'ADELANTADO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-500/20 dark:text-indigo-300">
                              ⚡ Adelantado
                            </span>
                          ) : cf.estado === 'PAGADO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/20 dark:text-emerald-300">
                              ✓ Pagado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-500/20 dark:text-sky-300">
                              ⏳ Pendiente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                handleToggleEstadoFijo(
                                  cf.id,
                                  cf.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                                )
                              }
                              disabled={isLoading}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Alternar Adelantado"
                            >
                              Adelantar
                            </button>

                            <button
                              onClick={() =>
                                handleToggleEstadoFijo(
                                  cf.id,
                                  cf.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                                )
                              }
                              disabled={isLoading}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                cf.estado === 'PAGADO'
                                  ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300'
                              }`}
                              title="Alternar Pagado"
                            >
                              {cf.estado === 'PAGADO' ? '✓ Pagado' : 'Pagar'}
                            </button>

                            <button
                              onClick={() => abrirEdicionCostoFijo(cf)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
                              title="Editar costo fijo base"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleEliminarCostoFijo(cf.id, cf.concepto)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Eliminar costo fijo"
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
        ) : (
          /* ======================================================== */
          /* VISTA TARJETAS                                           */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costosFijos.map((cf) => {
            const Icon = getIconForConcepto(cf.concepto);
            const isLoading = loadingAction === `fijo-${cf.id}`;
            const esRecur = esItemRecurrente(cf.concepto, cf.categoria);
            const clasificacion: ClasificacionEgreso = esRecur ? 'RECURRENTE' : 'FIJO';
            const estilo = ESTILOS_CLASIFICACION[clasificacion];

            return (
              <div
                key={cf.id}
                onClick={() =>
                  setDetalleItem({
                    id: `fijo-${cf.id}`,
                    dbId: cf.id,
                    tipo: 'FIJO',
                    clasificacion,
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
                  })
                }
                className={`group bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between border-l-4 ${estilo.borderColor} ${estilo.bgCardHover} hover:shadow-md transition cursor-pointer`}
                title="Haz clic para ver características completas"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2.5 rounded-xl ${esRecur ? 'bg-pink-500/10 text-pink-500' : 'bg-sky-500/10 text-sky-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground block group-hover:text-sky-400 transition">
                        {formatMoney(cf.monto, moneda)}
                      </span>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {(cf.monedaOriginal === 'USD' || cf.concepto.includes('$')) && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                            ${cf.montoOriginal ? cf.montoOriginal.toFixed(2) : (cf.concepto.match(/\$([0-9.]+)/)?.[1] || '')} USD
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          Vence: Día {cf.diaVencimiento}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground text-sm group-hover:text-sky-400 transition flex items-center gap-1.5 flex-wrap">
                        <span>{cf.concepto}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-md font-bold shrink-0 border ${estilo.badgeBg} ${estilo.badgeText} ${estilo.badgeBorder}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estilo.dotColor}`} />
                          {estilo.badgeLabel}
                        </span>
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
        )}
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

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setModoVistaPrestamos('TABLA')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  modoVistaPrestamos === 'TABLA'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ver como Tabla"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVistaPrestamos('TARJETAS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  modoVistaPrestamos === 'TARJETAS'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ver como Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            <button
              onClick={() => {
                setNuevoPrestamoPeriodoInicio(periodo);
                setModalPrestamoOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Agregar Préstamo</span>
            </button>
          </div>
        </div>

        {prestamos.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl">
            <Landmark className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
            <p className="text-sm font-semibold text-foreground mt-2">No hay préstamos activos</p>
          </div>
        ) : modoVistaPrestamos === 'TABLA' ? (
          /* ======================================================== */
          /* TABLA DE PRÉSTAMOS BANCARIOS Y CUOTAS                    */
          /* ======================================================== */
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Banco / Concepto</th>
                    <th className="py-3 px-3">Progreso Cuotas</th>
                    <th className="py-3 px-3 text-center">Día Pago</th>
                    <th className="py-3 px-3 text-center">TEA %</th>
                    <th className="py-3 px-3 text-right">Cuota Mensual</th>
                    <th className="py-3 px-3 text-right">Total Préstamo</th>
                    <th className="py-3 px-3 text-center">Estado este mes</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-800">
                  {prestamos.map((p) => {
                    const progreso = Math.round((p.cuotaActual / p.cuotasTotales) * 100);
                    const isLoading = loadingAction === `cuota-${p.cuotaId}` || loadingAction === `del-prestamo-${p.id}`;

                    return (
                      <tr
                        key={p.id}
                        onClick={() =>
                          setDetalleItem({
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
                          })
                        }
                        className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition cursor-pointer"
                      >
                        <td className="py-3 px-3 border-l-4 border-l-purple-500 dark:border-l-purple-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                              {p.banco}
                            </span>
                            <span className="font-bold text-foreground text-xs">{p.concepto}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-md font-bold shrink-0 border bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              Préstamo
                            </span>
                          </div>
                          {(p.monedaOriginal === 'USD' || p.concepto.includes('$')) && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                              ${p.montoOriginal ? p.montoOriginal.toFixed(2) : (p.concepto.match(/\$([0-9.]+)/)?.[1] || '')} USD
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="w-32 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                              <span>
                                {p.aplicaEsteMes === false
                                  ? 'Fuera de rango'
                                  : `Cta ${p.cuotaActual}/${p.cuotasTotales}`}
                              </span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">{progreso}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center text-muted-foreground whitespace-nowrap">
                          Día {p.diaPago}
                        </td>

                        <td className="py-3 px-3 text-center font-semibold text-foreground whitespace-nowrap">
                          {p.tasaInteresAnual}%
                        </td>

                        <td className="py-3 px-3 text-right font-extrabold text-foreground whitespace-nowrap">
                          {formatMoney(p.montoCuota, moneda)}
                        </td>

                        <td className="py-3 px-3 text-right text-muted-foreground font-semibold whitespace-nowrap">
                          {p.montoTotal ? formatMoney(p.montoTotal, moneda) : '—'}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {p.aplicaEsteMes === false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-secondary text-muted-foreground border border-border">
                              <Clock className="w-3 h-3" /> Fuera de periodo
                            </span>
                          ) : p.estado === 'PAGADO' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Pagado
                            </span>
                          ) : p.estado === 'ADELANTADO' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <FastForward className="w-3 h-3" /> Adelantado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {p.aplicaEsteMes !== false && (
                              <>
                                <button
                                  onClick={() =>
                                    handleToggleEstadoCuota(
                                      p.cuotaId,
                                      p.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                                    )
                                  }
                                  disabled={isLoading}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                    p.estado === 'ADELANTADO'
                                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                                      : 'bg-secondary/60 text-muted-foreground border-border hover:bg-secondary'
                                  }`}
                                  title="Marcar Adelantado"
                                >
                                  ⚡
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleEstadoCuota(
                                      p.cuotaId,
                                      p.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                                    )
                                  }
                                  disabled={isLoading}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                    p.estado === 'PAGADO'
                                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                                      : 'bg-secondary/60 text-muted-foreground border-border hover:bg-secondary'
                                  }`}
                                  title="Marcar Pagado"
                                >
                                  ✅
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => abrirEdicionPrestamo(p)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                              title="Editar condiciones base"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleEliminarPrestamo(p.id, `${p.banco} - ${p.concepto}`)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Eliminar préstamo"
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
                    })
                  }
                  className="group bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 border-l-4 border-l-purple-500 dark:border-l-purple-400 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition cursor-pointer"
                  title="Haz clic para ver características completas"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {p.banco}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 border bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Préstamo / Cuota
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-foreground group-hover:text-purple-400 transition flex items-center gap-1.5">
                          <span>{p.concepto}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                        </h3>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => abrirEdicionPrestamo(p)}
                            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 p-1 rounded hover:bg-secondary transition"
                            title="Editar condiciones base"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarPrestamo(p.id, `${p.banco} - ${p.concepto}`)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1 p-1 rounded hover:bg-rose-500/10 transition"
                            title="Eliminar préstamo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Día de pago programado: Día {p.diaPago} de cada mes
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-foreground group-hover:text-purple-400 transition">
                        {formatMoney(p.montoCuota, moneda)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {(p.monedaOriginal === 'USD' || p.concepto.includes('$')) && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                            ${p.montoOriginal ? p.montoOriginal.toFixed(2) : (p.concepto.match(/\$([0-9.]+)/)?.[1] || '')} USD
                          </span>
                        )}
                        <div className="text-[11px] text-muted-foreground font-semibold">
                          {p.aplicaEsteMes === false
                            ? (p.mensajePeriodo || `Total ${p.cuotasTotales} cuotas`)
                            : `Cuota ${p.cuotaActual} de ${p.cuotasTotales}`}
                        </div>
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
                      {p.aplicaEsteMes === false ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-500 text-xs">
                          <Clock className="w-3.5 h-3.5" /> {p.mensajePeriodo || 'No programado este mes'}
                        </span>
                      ) : p.estado === 'ADELANTADO' ? (
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

                    {p.aplicaEsteMes !== false ? (
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
                    ) : (
                      <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
                        {p.periodoInicio ? `Inicia: ${formatPeriodoLabel(p.periodoInicio)}` : 'Inactivo'}
                      </span>
                    )}
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

              {/* Selector de Moneda */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Moneda de Facturación:
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Se paga en Soles de tu presupuesto
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNuevoFijoMoneda('PEN')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      nuevoFijoMoneda === 'PEN'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    S/ Soles (PEN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevoFijoMoneda('USD')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      nuevoFijoMoneda === 'USD'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    $ Dólares (USD)
                  </button>
                </div>
              </div>

              {nuevoFijoMoneda === 'PEN' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Monto Mensual (S/):
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
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Monto USD ($):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="3.96"
                          value={nuevoFijoMontoUSD}
                          onChange={(e) => setNuevoFijoMontoUSD(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          value={nuevoFijoTc}
                          onChange={(e) => setNuevoFijoTc(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Día Vencimiento:</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={nuevoFijoDia}
                        onChange={(e) => setNuevoFijoDia(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-amber-500 text-foreground text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Conversión automática:</span>
                    <div className="font-extrabold text-foreground">
                      ={' '}
                      <span className="text-amber-500 text-sm">
                        S/ {((parseFloat(nuevoFijoMontoUSD) || 0) * (parseFloat(nuevoFijoTc) || configTc)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        al mes en soles
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Selector de Moneda en Edición */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Moneda de Facturación:
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Se paga en Soles
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFijoMoneda('PEN')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      editFijoMoneda === 'PEN'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    S/ Soles (PEN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFijoMoneda('USD')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      editFijoMoneda === 'USD'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    $ Dólares (USD)
                  </button>
                </div>
              </div>

              {editFijoMoneda === 'PEN' ? (
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
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Monto USD ($):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="3.96"
                          value={editFijoMontoUSD}
                          onChange={(e) => setEditFijoMontoUSD(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editFijoTc}
                          onChange={(e) => setEditFijoTc(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Día Vencimiento:</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={editFijoDia}
                        onChange={(e) => setEditFijoDia(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-amber-500 text-foreground text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nuevo valor en soles:</span>
                    <div className="font-extrabold text-foreground">
                      ={' '}
                      <span className="text-amber-500 text-sm">
                        S/ {((parseFloat(editFijoMontoUSD) || 0) * (parseFloat(editFijoTc) || configTc)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        en cuotas futuras
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Selector de Moneda */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Moneda del Préstamo:
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Se liquida en Soles
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNuevoPrestamoMoneda('PEN')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      nuevoPrestamoMoneda === 'PEN'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    S/ Soles (PEN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevoPrestamoMoneda('USD')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      nuevoPrestamoMoneda === 'USD'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    $ Dólares (USD)
                  </button>
                </div>
              </div>

              {nuevoPrestamoMoneda === 'PEN' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Monto Cuota Mensual (S/):
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
                      Monto Total Financiado (S/):
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
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Cuota USD ($):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="900"
                          value={nuevoPrestamoCuotaUSD}
                          onChange={(e) => setNuevoPrestamoCuotaUSD(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Total USD ($):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Opcional"
                          value={nuevoPrestamoTotalUSD}
                          onChange={(e) => setNuevoPrestamoTotalUSD(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          value={nuevoPrestamoTc}
                          onChange={(e) => setNuevoPrestamoTc(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cuota calculada en soles:</span>
                    <div className="font-extrabold text-foreground">
                      ={' '}
                      <span className="text-amber-500 text-sm">
                        S/ {((parseFloat(nuevoPrestamoCuotaUSD) || 0) * (parseFloat(nuevoPrestamoTc) || configTc)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        por mes
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Selector de Moneda en Edición */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Moneda de la Cuota:
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Se liquida en Soles
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPrestamoMoneda('PEN')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      editPrestamoMoneda === 'PEN'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    S/ Soles (PEN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPrestamoMoneda('USD')}
                    className={`py-1.5 px-3 rounded-xl font-bold border transition ${
                      editPrestamoMoneda === 'USD'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    $ Dólares (USD)
                  </button>
                </div>
              </div>

              {editPrestamoMoneda === 'PEN' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Nueva Cuota Mensual (S/):
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
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Cuota USD ($):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="900"
                          value={editPrestamoCuotaUSD}
                          onChange={(e) => setEditPrestamoCuotaUSD(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Tipo Cambio (S/):</span>
                      <div className="flex items-center gap-1 bg-background px-2.5 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground">S/</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrestamoTc}
                          onChange={(e) => setEditPrestamoTc(e.target.value)}
                          className="w-full text-xs font-bold bg-transparent outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500">Día de Pago:</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={editPrestamoDiaPago}
                        onChange={(e) => setEditPrestamoDiaPago(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-amber-500 text-foreground text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nueva cuota en soles:</span>
                    <div className="font-extrabold text-foreground">
                      ={' '}
                      <span className="text-amber-500 text-sm">
                        S/ {((parseFloat(editPrestamoCuotaUSD) || 0) * (parseFloat(editPrestamoTc) || configTc)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        en cuotas futuras
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
