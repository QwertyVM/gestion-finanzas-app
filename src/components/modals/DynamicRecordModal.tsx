'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFinanzas, type TipoRecordModal } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel } from '@/lib/utils';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import {
  X,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  FastForward,
  TrendingUp,
  TrendingDown,
  Repeat,
  Plus,
  Minus,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Tv,
  Zap,
  Coffee,
  HeartPulse,
  GraduationCap,
  HelpCircle,
  Landmark,
  Tag,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface CategoriaItem {
  id: string;
  nombre: string;
  icono?: string | null;
  color?: string | null;
  esFijo?: boolean;
}

const ICON_MAP: Record<string, any> = {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Tv,
  Zap,
  Coffee,
  HeartPulse,
  GraduationCap,
  Landmark,
  HelpCircle,
  Tag,
};

export function DynamicRecordModal() {
  const {
    isRecordModalOpen,
    recordModalType,
    recordModalOptions,
    closeRecordModal,
    resumen,
    periodo,
    refresh,
    usuarioActual,
  } = useFinanzas();

  // Tipo de movimiento
  const [tipoActivo, setTipoActivo] = useState<TipoRecordModal>('GASTO');

  // Datos base
  const [concepto, setConcepto] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const configTc = resumen?.config?.tipoCambioUSD || 4.0;
  const [tipoCambioInput, setTipoCambioInput] = useState(configTc.toString());
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // Método de pago y tarjeta (para Gasto y Fijo)
  const [metodoPago, setMetodoPago] = useState<'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA'>('TARJETA_CREDITO');
  const tarjetas = resumen?.tarjetasCredito || [];
  const [tarjetaId, setTarjetaId] = useState('');
  const [totalCuotas, setTotalCuotas] = useState('1');

  // Categoría
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);

  // Préstamo específico
  const [bancoPrestamo, setBancoPrestamo] = useState('BCP');
  const [cuotasTotalesPrestamo, setCuotasTotalesPrestamo] = useState('12');
  const [cuotaInicialPrestamo, setCuotaInicialPrestamo] = useState('1');
  const [diaPagoPrestamo, setDiaPagoPrestamo] = useState('25');
  const [teaPrestamo, setTeaPrestamo] = useState('14.50');
  const [montoTotalPrestamoInput, setMontoTotalPrestamoInput] = useState('');

  // Estado y subclasificaciones
  const [estadoGasto, setEstadoGasto] = useState<'PENDIENTE' | 'ADELANTADO' | 'PAGADO'>('PENDIENTE');
  const [tipoIngreso, setTipoIngreso] = useState<'SUELDO' | 'GRATIFICACION' | 'UTILIDADES' | 'EXTRA'>('EXTRA');
  const [ingresoRecibido, setIngresoRecibido] = useState<boolean>(true);
  const [diaVencimientoFijo, setDiaVencimientoFijo] = useState<string>('30');
  const [notas, setNotas] = useState('');

  // Modos de UX
  const [seguirRegistrando, setSeguirRegistrando] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar tipo y opciones al abrir
  useEffect(() => {
    if (isRecordModalOpen) {
      setTipoActivo(recordModalType);
      if (resumen?.config?.tipoCambioUSD) {
        setTipoCambioInput(resumen.config.tipoCambioUSD.toString());
      }
      if (tarjetas.length > 0 && !tarjetaId) {
        setTarjetaId(tarjetas[0].id);
      }

      // Aplicar opciones contextuales (ej: cuotas, tarjeta, método)
      if (recordModalOptions) {
        if (recordModalOptions.metodoPago) {
          setMetodoPago(recordModalOptions.metodoPago);
        }
        if (recordModalOptions.totalCuotas !== undefined) {
          setTotalCuotas(recordModalOptions.totalCuotas.toString());
        }
        if (recordModalOptions.tarjetaId) {
          setTarjetaId(recordModalOptions.tarjetaId);
        }
        if (recordModalOptions.categoriaId) {
          setCategoriaId(recordModalOptions.categoriaId);
        }
        if (recordModalOptions.banco) {
          setBancoPrestamo(recordModalOptions.banco);
        }
      }

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isRecordModalOpen, recordModalType, recordModalOptions, resumen?.config?.tipoCambioUSD, tarjetas, tarjetaId]);

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategorias() {
      try {
        const url = usuarioActual?.id ? `/api/categorias?usuarioId=${usuarioActual.id}` : '/api/categorias';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategorias(data);
          }
        }
      } catch {
        // ignore
      }
    }
    loadCategorias();
  }, [usuarioActual?.id]);

  // Cálculos dinámicos de montos y TC
  const tcEfectivo = parseFloat(tipoCambioInput) > 0 ? parseFloat(tipoCambioInput) : configTc;
  const montoNumero = parseFloat(montoInput) || 0;
  const montoSoles = moneda === 'USD' ? Number((montoNumero * tcEfectivo).toFixed(2)) : montoNumero;

  // Cálculo en vivo de facturación y cuotas de Tarjeta de Crédito
  const previewTarjeta = useMemo(() => {
    if (metodoPago !== 'TARJETA_CREDITO' || !tarjetaId) return null;
    const tarjeta = tarjetas.find((t) => t.id === tarjetaId);
    if (!tarjeta) return null;

    const diaCorte = tarjeta.diaCorte || 10;
    const diaPago = tarjeta.diaPago || 30;
    const dateObj = new Date(`${fecha}T12:00:00`);
    const res = calcularPeriodoFacturacion(dateObj, diaCorte, diaPago);
    const cuotasNum = parseInt(totalCuotas, 10) || 1;
    const periodosCuotas = cuotasNum > 1 ? calcularCuotasPeriodos(res.periodoPago, cuotasNum) : [];
    const montoCuota = cuotasNum > 0 ? montoSoles / cuotasNum : montoSoles;

    return {
      ...res,
      tarjeta,
      diaCorte,
      diaPago,
      cuotasNum,
      periodosCuotas,
      montoCuota,
    };
  }, [metodoPago, tarjetaId, fecha, totalCuotas, tarjetas, montoSoles]);

  if (!isRecordModalOpen) return null;

  // Atajos rápidos de monto (+10, +20, +50, +100, +200)
  const handleAddAmount = (amountToAdd: number) => {
    const current = parseFloat(montoInput) || 0;
    const updated = current + amountToAdd;
    setMontoInput(updated.toString());
  };

  const handleClearAmount = () => {
    setMontoInput('');
    amountInputRef.current?.focus();
  };

  // Atajos de fecha rápida
  const setQuickDate = (mode: 'HOY' | 'AYER') => {
    const now = new Date();
    if (mode === 'AYER') {
      now.setDate(now.getDate() - 1);
    }
    setFecha(now.toISOString().split('T')[0]);
  };

  // Selección rápida de categoría
  const handleSelectCategoria = (cat: CategoriaItem) => {
    setCategoriaId(cat.id === categoriaId ? '' : cat.id);
    if (!concepto.trim()) {
      // Auto-sugerencia amigable si el concepto está vacío
      setConcepto(cat.nombre.split('/')[0].trim());
    }
  };

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (montoNumero <= 0) {
      toast.error('Ingresa un monto válido mayor a 0');
      amountInputRef.current?.focus();
      return;
    }
    if (!concepto.trim()) {
      toast.error('Ingresa un concepto o descripción');
      return;
    }

    try {
      setSubmitting(true);
      const headers = {
        'Content-Type': 'application/json',
        ...(usuarioActual?.id ? { 'x-usuario-id': usuarioActual.id } : {}),
      };

      if (tipoActivo === 'GASTO') {
        const res = await fetch('/api/gastos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            concepto: concepto.trim(),
            monto: montoSoles,
            monedaOriginal: moneda,
            montoOriginal: moneda === 'USD' ? montoNumero : null,
            tipoCambio: tcEfectivo,
            fechaGasto: new Date(`${fecha}T12:00:00`),
            metodoPago,
            tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : undefined,
            totalCuotas: parseInt(totalCuotas, 10),
            categoriaId: categoriaId || undefined,
            estado: estadoGasto,
            notas: notas.trim() || undefined,
            usuarioId: usuarioActual?.id,
          }),
        });
        if (!res.ok) throw new Error('Error al registrar gasto');
        toast.success(`Gasto "${concepto}" guardado (S/ ${montoSoles.toFixed(2)})`);
      } else if (tipoActivo === 'INGRESO') {
        const res = await fetch('/api/ingresos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            periodo,
            tipo: tipoIngreso,
            concepto: concepto.trim(),
            monto: montoSoles,
            monedaOriginal: moneda,
            montoOriginal: moneda === 'USD' ? montoNumero : null,
            tipoCambio: tcEfectivo,
            fechaEsperada: new Date(`${fecha}T12:00:00`),
            recibido: ingresoRecibido,
            usuarioId: usuarioActual?.id,
          }),
        });
        if (!res.ok) throw new Error('Error al registrar ingreso');
        toast.success(`Ingreso "${concepto}" guardado (S/ ${montoSoles.toFixed(2)})`);
      } else if (tipoActivo === 'FIJO') {
        const res = await fetch('/api/fijos/nuevo', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            concepto: concepto.trim(),
            monto: montoSoles,
            diaVencimiento: parseInt(diaVencimientoFijo, 10) || 30,
            periodo,
            mesInicio: periodo,
            categoriaId: categoriaId || undefined,
            metodoPago,
            tarjetaId: metodoPago === 'TARJETA_CREDITO' ? tarjetaId : undefined,
            notas: notas.trim() || undefined,
            usuarioId: usuarioActual?.id,
          }),
        });
        if (!res.ok) throw new Error('Error al registrar costo fijo');
        toast.success(`Costo Fijo "${concepto}" configurado (S/ ${montoSoles.toFixed(2)}/mes)`);
      } else if (tipoActivo === 'PRESTAMO') {
        const cuotasTotNum = parseInt(cuotasTotalesPrestamo, 10) || 12;
        const totalCalc = parseFloat(montoTotalPrestamoInput) > 0
          ? parseFloat(montoTotalPrestamoInput)
          : Number((montoSoles * cuotasTotNum).toFixed(2));

        const res = await fetch('/api/prestamos/nuevo', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            banco: bancoPrestamo.trim() || 'BCP',
            concepto: concepto.trim(),
            montoTotal: totalCalc,
            montoCuota: montoSoles,
            cuotasTotales: cuotasTotNum,
            cuotaInicial: parseInt(cuotaInicialPrestamo, 10) || 1,
            diaPago: parseInt(diaPagoPrestamo, 10) || 25,
            tasaInteresAnual: parseFloat(teaPrestamo) || 14.50,
            periodoInicio: periodo,
          }),
        });
        if (!res.ok) throw new Error('Error al registrar préstamo');
        toast.success(`Préstamo "${concepto}" guardado (${cuotasTotNum} cuotas de S/ ${montoSoles.toFixed(2)})`);
      }

      await refresh();

      if (seguirRegistrando) {
        setConcepto('');
        setMontoInput('');
        setMontoTotalPrestamoInput('');
        setNotas('');
        amountInputRef.current?.focus();
      } else {
        closeRecordModal();
        setConcepto('');
        setMontoInput('');
        setMontoTotalPrestamoInput('');
        setNotas('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar registro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      {/* Contenedor Adaptativo: Bottom-Sheet en Celular / Modal Flotante en Desktop */}
      <div
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dynamic-record-title"
      >
        {/* Barra de Arrastre visual táctil para Móvil */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Encabezado: Switcher de Tipo Dinámico (Gasto, Ingreso, Fijo, Préstamo) */}
        <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-border/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="grid grid-cols-4 p-1 bg-muted/60 rounded-xl border border-border/60 gap-0.5">
              <button
                type="button"
                onClick={() => setTipoActivo('GASTO')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${tipoActivo === 'GASTO'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Minus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Gasto</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoActivo('INGRESO')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${tipoActivo === 'INGRESO'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Ingreso</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoActivo('FIJO')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${tipoActivo === 'FIJO'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Repeat className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Fijo</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoActivo('PRESTAMO')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${tipoActivo === 'PRESTAMO'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Landmark className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                <span>Préstamo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeRecordModal}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Cerrar (Esc)"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario con Scroll Suave */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* SECCIÓN 1: MONTO GIGANTE Y SELECTOR DE MONEDA (UX MODERNA) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary/35 border border-border/80 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              {/* Botón de Moneda */}
              <div className="inline-flex p-0.5 rounded-lg bg-background border border-border shadow-xs">
                <button
                  type="button"
                  onClick={() => setMoneda('PEN')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${moneda === 'PEN'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  S/ Soles
                </button>
                <button
                  type="button"
                  onClick={() => setMoneda('USD')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${moneda === 'USD'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  $ USD
                </button>
              </div>

              {montoInput && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-md transition"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Input Principal de Monto */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-muted-foreground">
                {moneda === 'PEN' ? 'S/' : '$'}
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                className="w-48 sm:w-60 text-3xl sm:text-4xl font-mono font-bold tracking-tight text-center bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 focus:border-b-2 focus:border-foreground"
              />
            </div>

            {/* Chips de Suma Rápida (1-tap add) */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
              {[10, 20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddAmount(amt)}
                  className="px-2.5 py-1 text-xs font-semibold font-mono rounded-lg bg-background border border-border/80 hover:border-foreground/40 text-foreground transition active:scale-95 shadow-xs"
                >
                  +{amt}
                </button>
              ))}
            </div>

            {/* Conversión USD a Soles en vivo con T.C. editable */}
            {moneda === 'USD' && (
              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground px-2">
                <div className="flex items-center gap-1.5">
                  <span>Tipo de Cambio:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tipoCambioInput}
                    onChange={(e) => setTipoCambioInput(e.target.value)}
                    className="w-16 px-1.5 py-0.5 font-mono text-center rounded bg-background border border-border text-foreground font-semibold"
                  />
                </div>
                <div className="font-mono">
                  <span>Equivale a: </span>
                  <span className="font-bold text-foreground">S/ {montoSoles.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: CONCEPTO */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Descripción / Concepto:</span>
              <span className="text-[10px] text-muted-foreground">Requerido</span>
            </label>
            <input
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder={
                tipoActivo === 'GASTO'
                  ? 'Ej: Supermercado Wong, Almuerzo, Uber, Ropa'
                  : tipoActivo === 'INGRESO'
                    ? 'Ej: Sueldo fin de mes, Venta, Bono Freelance'
                    : tipoActivo === 'FIJO'
                      ? 'Ej: Alquiler, Internet Fibra, Netflix, Gimnasio'
                      : 'Ej: Préstamo Personal, Crédito Vehicular, Préstamo Efectivo'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-foreground transition placeholder:text-muted-foreground/60 shadow-xs"
            />
          </div>

          {/* SECCIÓN 3: SUBTIPO (PARA INGRESO), CONFIGURACIÓN (PARA PRÉSTAMO) O MÉTODO DE PAGO (PARA GASTO/FIJO) */}
          {tipoActivo === 'INGRESO' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tipo de Ingreso:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'EXTRA', label: 'Extra / Freelance' },
                  { id: 'SUELDO', label: 'Sueldo Base' },
                  { id: 'GRATIFICACION', label: 'Grati' },
                  { id: 'UTILIDADES', label: 'Utilidades' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoIngreso(t.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border transition text-center truncate ${tipoIngreso === t.id
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : tipoActivo === 'PRESTAMO' ? (
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Banco / Entidad Financiera:</label>
                  <span className="text-[10px] text-muted-foreground">Emisor</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pb-1">
                  {['BCP', 'Interbank', 'BBVA', 'Scotiabank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBancoPrestamo(b)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                        bancoPrestamo === b
                          ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={bancoPrestamo}
                  onChange={(e) => setBancoPrestamo(e.target.value)}
                  placeholder="Otro banco / entidad (ej: BanBif, Pichincha, Caja Piura)"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Cuotas Totales:</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={cuotasTotalesPrestamo}
                    onChange={(e) => setCuotasTotalesPrestamo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs font-semibold outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Cuota Inicial:</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cuotaInicialPrestamo}
                    onChange={(e) => setCuotaInicialPrestamo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Día de Pago:</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={diaPagoPrestamo}
                    onChange={(e) => setDiaPagoPrestamo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">TEA %:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={teaPrestamo}
                    onChange={(e) => setTeaPrestamo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total acumulado estimado:</span>
                  <span className="font-semibold text-foreground">
                    {parseInt(cuotasTotalesPrestamo, 10) || 1} cuotas × S/ {montoSoles.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-foreground">
                  S/ {(montoSoles * (parseInt(cuotasTotalesPrestamo, 10) || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Método de Pago:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago('TARJETA_CREDITO')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${metodoPago === 'TARJETA_CREDITO'
                      ? 'bg-foreground text-background border-foreground font-semibold'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('EFECTIVO_DEBITO')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${metodoPago === 'EFECTIVO_DEBITO'
                      ? 'bg-foreground text-background border-foreground font-semibold'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('TRANSFERENCIA')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${metodoPago === 'TRANSFERENCIA'
                      ? 'bg-foreground text-background border-foreground font-semibold'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transf.</span>
                </button>
              </div>

              {/* DETALLE DINÁMICO DE TARJETA DE CRÉDITO Y CUOTAS */}
              {metodoPago === 'TARJETA_CREDITO' && (
                <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-muted-foreground">Tarjeta:</span>
                      <select
                        value={tarjetaId}
                        onChange={(e) => setTarjetaId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                      >
                        {tarjetas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} (Corte {t.diaCorte})
                          </option>
                        ))}
                      </select>
                    </div>

                    {tipoActivo === 'GASTO' && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Cuotas:</span>
                        <select
                          value={totalCuotas}
                          onChange={(e) => setTotalCuotas(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground font-medium"
                        >
                          <option value="1">1 cuota (Directo)</option>
                          <option value="2">2 cuotas</option>
                          <option value="3">3 cuotas</option>
                          <option value="4">4 cuotas</option>
                          <option value="6">6 cuotas</option>
                          <option value="12">12 cuotas</option>
                          <option value="18">18 cuotas</option>
                          <option value="24">24 cuotas</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* PREVIEW DINÁMICO DE FACTURACIÓN Y CUOTAS */}
                  {previewTarjeta && (
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>
                          {previewTarjeta.esMesSiguiente
                            ? `Compra posterior al corte (Día ${previewTarjeta.diaCorte}). Se liquida en el sueldo de:`
                            : `Compra antes del corte (Día ${previewTarjeta.diaCorte}). Se liquida en el sueldo de:`}
                        </span>
                      </div>

                      <div className="inline-block px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold capitalize text-[11px]">
                        📅 {formatPeriodoLabel(previewTarjeta.periodoPago)}
                      </div>

                      {previewTarjeta.cuotasNum > 1 && (
                        <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground space-y-1">
                          <div className="flex justify-between font-medium text-foreground">
                            <span>Monto por cuota:</span>
                            <span className="font-mono">
                              {formatMoney(previewTarjeta.montoCuota, 'S/')} / mes
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {previewTarjeta.periodosCuotas.slice(0, 6).map((p, idx) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-foreground"
                              >
                                C{idx + 1}: {p}
                              </span>
                            ))}
                            {previewTarjeta.cuotasNum > 6 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{previewTarjeta.cuotasNum - 6} más...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 4: CATEGORÍAS RÁPIDAS (CHIPS DINÁMICOS) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Categoría:</label>
              <span className="text-[10px] text-muted-foreground">Opcional</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {categorias.map((cat) => {
                const IconComponent = cat.icono && ICON_MAP[cat.icono] ? ICON_MAP[cat.icono] : Tag;
                const isSelected = categoriaId === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategoria(cat)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition ${isSelected
                        ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                      }`}
                  >
                    <IconComponent className="w-3 h-3 shrink-0" />
                    <span>{cat.nombre.split('/')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 5: FECHA Y ESTADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Fecha con botones de acceso rápido */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Fecha:</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickDate('HOY')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium transition"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('AYER')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium transition"
                  >
                    Ayer
                  </button>
                </div>
              </div>

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
              />
            </div>

            {/* Estado Inicial */}
            {tipoActivo === 'INGRESO' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Estado:</label>
                <div className="grid grid-cols-2 gap-1.5 h-[34px]">
                  <button
                    type="button"
                    onClick={() => setIngresoRecibido(true)}
                    className={`rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1 ${ingresoRecibido
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Recibido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngresoRecibido(false)}
                    className={`rounded-xl text-xs font-medium border transition flex items-center justify-center gap-1 ${!ingresoRecibido
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Esperado</span>
                  </button>
                </div>
              </div>
            ) : tipoActivo === 'GASTO' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Estado:</label>
                <div className="grid grid-cols-3 gap-1 h-[34px]">
                  <button
                    type="button"
                    onClick={() => setEstadoGasto('PENDIENTE')}
                    className={`rounded-xl text-xs font-medium border transition ${estadoGasto === 'PENDIENTE'
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstadoGasto('ADELANTADO')}
                    className={`rounded-xl text-xs font-medium border transition ${estadoGasto === 'ADELANTADO'
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    Adelantado
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstadoGasto('PAGADO')}
                    className={`rounded-xl text-xs font-medium border transition ${estadoGasto === 'PAGADO'
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground'
                      }`}
                  >
                    Pagado
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Día Vencimiento:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimientoFijo}
                  onChange={(e) => setDiaVencimientoFijo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground"
                />
              </div>
            )}
          </div>

          {/* NOTAS ADICIONALES (EXPANDIBLE) */}
          <div className="pt-1">
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-dotted transition"
              >
                + Agregar nota o detalle
              </button>
            ) : (
              <div className="space-y-1 animate-in fade-in duration-150">
                <label className="text-xs font-medium text-muted-foreground">Notas:</label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Detalles sobre el gasto, persona involucrada, etc."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground resize-none"
                />
              </div>
            )}
          </div>

          {/* SECCIÓN 6: BOTONES DE ACCIÓN FIJOS / STICKY EN FOOTER */}
          <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Opción rápida: seguir registrando en lote */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none self-start sm:self-auto">
              <input
                type="checkbox"
                checked={seguirRegistrando}
                onChange={(e) => setSeguirRegistrando(e.target.checked)}
                className="w-4 h-4 rounded border-border text-foreground focus:ring-0"
              />
              <span>Seguir registrando (modo rápido)</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeRecordModal}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Guardando...'
                    : tipoActivo === 'GASTO'
                      ? 'Guardar Gasto'
                      : tipoActivo === 'INGRESO'
                        ? 'Guardar Ingreso'
                        : tipoActivo === 'FIJO'
                          ? 'Guardar Fijo'
                          : 'Guardar Préstamo'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
