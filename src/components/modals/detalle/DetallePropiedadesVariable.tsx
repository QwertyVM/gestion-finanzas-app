'use client';

import React, { useState, useEffect } from 'react';
import { VariableFormaPagoBox } from './VariableFormaPagoBox';
import { VariableNotasBox } from './VariableNotasBox';
import { DetalleCategoriaSelector } from './DetalleCategoriaSelector';
import { DetalleFechaPeriodoBox } from './DetalleFechaPeriodoBox';

interface DetallePropiedadesVariableProps {
  metodoPago?: string;
  tarjetaId?: string | null;
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  tarjetaDiaCorte?: number;
  fechaGasto?: string;
  periodoPago?: string;
  categoria?: string;
  categoriaId?: string | null;
  categoriaColor?: string;
  tieneCuotas?: boolean;
  notas?: string | null;
  tarjetas?: Array<{
    id: string;
    nombre: string;
    banco: string;
    color?: string;
    diaCorte?: number;
    diaPago?: number;
  }>;
  onCambiarMetodoPago?: (nuevoMetodo: string, tarjetaId?: string | null) => Promise<void>;
  onCambiarCategoria?: (categoriaId: string, aplicarSerie?: boolean) => Promise<void>;
  onGuardarNotas?: (nuevasNotas: string) => Promise<void>;
  onGuardarFechaPeriodo?: (nuevaFecha: string, nuevoPeriodo: string, aplicarSerie?: boolean) => Promise<void>;
}

export function DetallePropiedadesVariable({
  metodoPago = 'EFECTIVO_DEBITO',
  tarjetaId,
  tarjetaNombre,
  tarjetaBanco,
  tarjetaDiaCorte = 10,
  fechaGasto,
  periodoPago,
  categoria,
  categoriaId,
  categoriaColor,
  tieneCuotas = false,
  notas,
  tarjetas = [],
  onCambiarMetodoPago,
  onCambiarCategoria,
  onGuardarNotas,
  onGuardarFechaPeriodo,
}: DetallePropiedadesVariableProps) {
  const [editandoMetodo, setEditandoMetodo] = useState(false);
  const [metodoSel, setMetodoSel] = useState(metodoPago);
  const [tarjetaSel, setTarjetaSel] = useState(tarjetaId || tarjetas[0]?.id || '');
  const [savingMetodo, setSavingMetodo] = useState(false);

  const [editandoNotas, setEditandoNotas] = useState(false);
  const [notasInput, setNotasInput] = useState(notas || '');
  const [savingNotas, setSavingNotas] = useState(false);

  useEffect(() => {
    setMetodoSel(metodoPago);
    setTarjetaSel(tarjetaId || tarjetas[0]?.id || '');
  }, [metodoPago, tarjetaId, tarjetas]);

  const handleSaveMetodo = async () => {
    if (!onCambiarMetodoPago) return;
    try {
      setSavingMetodo(true);
      const finalTarjeta = metodoSel === 'TARJETA_CREDITO' ? (tarjetaSel || tarjetas[0]?.id || null) : null;
      await onCambiarMetodoPago(metodoSel, finalTarjeta);
      setEditandoMetodo(false);
    } finally {
      setSavingMetodo(false);
    }
  };

  const handleSaveNotas = async () => {
    if (!onGuardarNotas) return;
    try {
      setSavingNotas(true);
      await onGuardarNotas(notasInput.trim());
      setEditandoNotas(false);
    } finally {
      setSavingNotas(false);
    }
  };

  const diaConsumo = fechaGasto ? new Date(fechaGasto).getUTCDate() : null;
  const diaCorteEfectivo = tarjetaDiaCorte || 10;
  const esAntesDeCorte = diaConsumo !== null ? diaConsumo <= diaCorteEfectivo : true;
  const fechaFormatted = fechaGasto
    ? new Date(fechaGasto).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="space-y-2.5 text-xs">
      {/* 1. FORMA DE PAGO */}
      <VariableFormaPagoBox
        metodoPago={metodoPago}
        tarjetaNombre={tarjetaNombre}
        tarjetaBanco={tarjetaBanco}
        tarjetaDiaCorte={diaCorteEfectivo}
        fechaFormatted={fechaFormatted}
        diaConsumo={diaConsumo}
        esAntesDeCorte={esAntesDeCorte}
        tarjetas={tarjetas}
        editandoMetodo={editandoMetodo}
        metodoSel={metodoSel}
        tarjetaSel={tarjetaSel}
        savingMetodo={savingMetodo}
        onStartEdit={() => setEditandoMetodo(true)}
        onCancelEdit={() => setEditandoMetodo(false)}
        onChangeMetodoSel={setMetodoSel}
        onChangeTarjetaSel={setTarjetaSel}
        onSaveMetodo={handleSaveMetodo}
        permitirEditar={Boolean(onCambiarMetodoPago)}
      />

      {/* 2. FECHA DE COMPRA & PERIODO IMPUTADO */}
      <DetalleFechaPeriodoBox
        fechaGasto={fechaGasto}
        periodoPago={periodoPago}
        tarjetaDiaCorte={diaCorteEfectivo}
        esTarjeta={metodoPago === 'TARJETA_CREDITO'}
        tieneCuotas={tieneCuotas}
        onGuardar={onGuardarFechaPeriodo}
        permitirEditar={Boolean(onGuardarFechaPeriodo)}
      />

      {/* 3. CATEGORÍA */}
      <DetalleCategoriaSelector
        categoriaNombre={categoria}
        categoriaId={categoriaId}
        categoriaColor={categoriaColor}
        tieneCuotas={tieneCuotas}
        onCambiarCategoria={onCambiarCategoria || (async () => {})}
      />

      {/* 4. NOTAS */}
      <VariableNotasBox
        notas={notas}
        editandoNotas={editandoNotas}
        notasInput={notasInput}
        savingNotas={savingNotas}
        permitirEditar={Boolean(onGuardarNotas)}
        onStartEdit={() => { setNotasInput(notas || ''); setEditandoNotas(true); }}
        onCancelEdit={() => setEditandoNotas(false)}
        onChangeNotasInput={setNotasInput}
        onSaveNotas={handleSaveNotas}
      />
    </div>
  );
}
