'use client';

import React, { useState } from 'react';
import { CreditCard, Landmark, Banknote, Pencil } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';
import { DetalleMetodoPagoEditor } from './DetalleMetodoPagoEditor';
import { DetalleCategoriaSelector } from './DetalleCategoriaSelector';
import { DetalleTagSelector } from './DetalleTagSelector';
import { VariableNotasBox } from './VariableNotasBox';

interface DetallePropiedadesFijoProps {
  metodoPago?: string;
  tarjetaId?: string | null;
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  categoria?: string;
  categoriaId?: string | null;
  categoriaColor?: string;
  tag?: string | null;
  mesInicio?: string | null;
  mesFin?: string | null;
  notas?: string | null;
  tarjetas?: Array<{ id: string; nombre: string; banco: string }>;
  onCambiarMetodoPago?: (nuevoMetodo: string, tarjetaId?: string | null, aplicarFuturos?: boolean) => Promise<void>;
  onCambiarCategoria?: (categoriaId: string) => Promise<void>;
  onCambiarTag?: (nuevoTag: string) => Promise<void>;
  onGuardarNotas?: (nuevasNotas: string) => Promise<void>;
}

export function DetallePropiedadesFijo({
  metodoPago = 'EFECTIVO_DEBITO',
  tarjetaId,
  tarjetaNombre,
  tarjetaBanco,
  categoria,
  categoriaId,
  categoriaColor,
  tag,
  mesInicio,
  mesFin,
  notas,
  tarjetas = [],
  onCambiarMetodoPago,
  onCambiarCategoria,
  onCambiarTag,
  onGuardarNotas,
}: DetallePropiedadesFijoProps) {
  const [editandoMetodo, setEditandoMetodo] = useState(false);
  const [metodoSel, setMetodoSel] = useState(metodoPago);
  const [tarjetaSel, setTarjetaSel] = useState(tarjetaId || (tarjetas[0]?.id || ''));
  const [aplicarFuturos, setAplicarFuturos] = useState(false);
  const [savingMetodo, setSavingMetodo] = useState(false);

  const [editandoNotas, setEditandoNotas] = useState(false);
  const [notasInput, setNotasInput] = useState(notas || '');
  const [savingNotas, setSavingNotas] = useState(false);

  const handleSaveMetodo = async () => {
    if (!onCambiarMetodoPago) return;
    try {
      setSavingMetodo(true);
      await onCambiarMetodoPago(metodoSel, metodoSel === 'TARJETA_CREDITO' ? tarjetaSel : null, aplicarFuturos);
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

  return (
    <div className="space-y-2.5 text-xs">
      {/* 1. FORMA DE PAGO */}
      <div className="p-3 rounded-xl bg-card border border-border/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">Forma de Pago</span>
          {onCambiarMetodoPago && !editandoMetodo && (
            <button
              type="button"
              onClick={() => setEditandoMetodo(true)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              <span>Cambiar</span>
            </button>
          )}
        </div>

        {!editandoMetodo ? (
          <div className="font-medium text-foreground flex items-center gap-1.5">
            {metodoPago === 'TARJETA_CREDITO' ? (
              <>
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                <span>{tarjetaNombre || 'Tarjeta de Crédito'} {tarjetaBanco ? `(${tarjetaBanco})` : ''}</span>
              </>
            ) : metodoPago === 'TRANSFERENCIA' ? (
              <>
                <Landmark className="w-3.5 h-3.5 text-cyan-500" />
                <span>Transferencia Bancaria</span>
              </>
            ) : (
              <>
                <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                <span>Efectivo / Débito</span>
              </>
            )}
          </div>
        ) : (
          <DetalleMetodoPagoEditor
            metodoSel={metodoSel}
            tarjetaSel={tarjetaSel}
            aplicarFuturos={aplicarFuturos}
            savingMetodo={savingMetodo}
            tarjetas={tarjetas}
            onChangeMetodoSel={setMetodoSel}
            onChangeTarjetaSel={setTarjetaSel}
            onChangeAplicarFuturos={setAplicarFuturos}
            onSave={handleSaveMetodo}
            onCancel={() => setEditandoMetodo(false)}
          />
        )}
      </div>

      {/* 2. VIGENCIA */}
      <div className="p-3 rounded-xl bg-card border border-border/70">
        <span className="text-[10px] text-muted-foreground block mb-0.5">Vigencia</span>
        <span className="font-medium text-foreground block truncate">
          {mesFin ? `${formatPeriodoLabel(mesInicio || '2026-11')} – ${formatPeriodoLabel(mesFin)}` : 'Mensual recurrente'}
        </span>
      </div>

      {/* 3. CATEGORÍA */}
      <DetalleCategoriaSelector
        categoriaNombre={categoria}
        categoriaId={categoriaId}
        categoriaColor={categoriaColor}
        tieneCuotas={false}
        onCambiarCategoria={onCambiarCategoria || (async () => {})}
      />

      {/* 3.1 MINITAG ESPECÍFICO */}
      <DetalleTagSelector
        tag={tag}
        categoriaNombre={categoria}
        tieneCuotas={false}
        onCambiarTag={onCambiarTag || (async () => {})}
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
