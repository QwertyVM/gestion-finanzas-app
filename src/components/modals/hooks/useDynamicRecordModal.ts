'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { calcularPeriodoFacturacion, calcularCuotasPeriodos } from '@/lib/billing-cycles';
import { toast } from 'sonner';
import type { TipoRecordModal } from '@/context/FinanzasContext';

export interface CategoriaItem {
  id: string;
  nombre: string;
  icono?: string | null;
  color?: string | null;
}

export function useDynamicRecordModal() {
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

  const handleAddAmount = (amountToAdd: number) => {
    const current = parseFloat(montoInput) || 0;
    const updated = current + amountToAdd;
    setMontoInput(updated.toString());
  };

  const handleClearAmount = () => {
    setMontoInput('');
    amountInputRef.current?.focus();
  };

  const setQuickDate = (mode: 'HOY' | 'AYER') => {
    const now = new Date();
    if (mode === 'AYER') {
      now.setDate(now.getDate() - 1);
    }
    setFecha(now.toISOString().split('T')[0]);
  };

  const handleSelectCategoria = (cat: CategoriaItem) => {
    setCategoriaId(cat.id === categoriaId ? '' : cat.id);
    if (!concepto.trim()) {
      setConcepto(cat.nombre.split('/')[0].trim());
    }
  };

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
            diaVencimiento: 30,
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
            diaPago: 30,
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

  return {
    isRecordModalOpen,
    tipoActivo,
    setTipoActivo,
    concepto,
    setConcepto,
    montoInput,
    setMontoInput,
    moneda,
    setMoneda,
    tipoCambioInput,
    setTipoCambioInput,
    fecha,
    setFecha,
    metodoPago,
    setMetodoPago,
    tarjetas,
    tarjetaId,
    setTarjetaId,
    totalCuotas,
    setTotalCuotas,
    categoriaId,
    setCategoriaId,
    categorias,
    bancoPrestamo,
    setBancoPrestamo,
    cuotasTotalesPrestamo,
    setCuotasTotalesPrestamo,
    cuotaInicialPrestamo,
    setCuotaInicialPrestamo,
    teaPrestamo,
    setTeaPrestamo,
    montoTotalPrestamoInput,
    setMontoTotalPrestamoInput,
    estadoGasto,
    setEstadoGasto,
    tipoIngreso,
    setTipoIngreso,
    ingresoRecibido,
    setIngresoRecibido,
    diaVencimientoFijo,
    setDiaVencimientoFijo,
    notas,
    setNotas,
    seguirRegistrando,
    setSeguirRegistrando,
    submitting,
    showNotes,
    setShowNotes,
    amountInputRef,
    tcEfectivo,
    montoNumero,
    montoSoles,
    previewTarjeta,
    handleAddAmount,
    handleClearAmount,
    setQuickDate,
    handleSelectCategoria,
    handleSubmit,
    closeRecordModal,
  };
}
