'use client';

import React, { useState } from 'react';
import { Wallet, Pencil, Check, X } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { DetalleItemData } from './types';

interface DetalleIngresoAsignadoBoxProps {
  item: DetalleItemData;
  ingresosMes?: Array<{
    id: string;
    concepto: string;
    tipo: string;
    monto: number;
    disponible?: number;
  }>;
  onCambiarIngresoAsignado?: (item: DetalleItemData, ingresoId: string | null) => Promise<void>;
  monedaSimbolo?: string;
}

export function DetalleIngresoAsignadoBox({
  item,
  ingresosMes = [],
  onCambiarIngresoAsignado,
  monedaSimbolo = 'S/',
}: DetalleIngresoAsignadoBoxProps) {
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(item.ingresoId || '');

  // Solo mostrar si hay más de 1 ingreso en el mes
  if (!ingresosMes || ingresosMes.length <= 1) {
    return null;
  }

  const ingresoAsignado = ingresosMes.find((i) => i.id === item.ingresoId);

  const handleGuardar = async (nuevoId: string) => {
    if (!onCambiarIngresoAsignado) return;
    try {
      setSaving(true);
      await onCambiarIngresoAsignado(item, nuevoId || null);
      setSelectedId(nuevoId);
      setEditando(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          <span>Ingreso que cubre este gasto</span>
        </span>
        {onCambiarIngresoAsignado && !editando && (
          <button
            type="button"
            onClick={() => {
              setSelectedId(item.ingresoId || '');
              setEditando(true);
            }}
            className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      {!editando ? (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            {ingresoAsignado ? (
              <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
                💰 {ingresoAsignado.concepto}
              </span>
            ) : (
              <span className="text-muted-foreground font-normal">
                Por defecto (Sueldo / General)
              </span>
            )}
          </span>
          {ingresoAsignado && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Total fuente: {formatMoney(ingresoAsignado.monto, monedaSimbolo)}
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-1 gap-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleGuardar('')}
              className={`px-2.5 py-1.5 rounded-lg text-xs border text-left flex items-center justify-between transition cursor-pointer ${
                !selectedId
                  ? 'bg-foreground text-background font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <span>Por defecto (Sueldo / General)</span>
              {!selectedId && <Check className="w-3.5 h-3.5" />}
            </button>

            {ingresosMes.map((ing) => {
              const isSel = selectedId === ing.id;
              return (
                <button
                  key={ing.id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleGuardar(ing.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border text-left flex items-center justify-between transition cursor-pointer ${
                    isSel
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold dark:bg-amber-500 dark:text-slate-950'
                      : 'bg-card text-foreground border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-medium block truncate">{ing.concepto}</span>
                    <span className={`text-[10px] font-mono ${isSel ? 'text-white/80 dark:text-slate-900/80' : 'text-muted-foreground'}`}>
                      Monto: {formatMoney(ing.monto, monedaSimbolo)}
                    </span>
                  </div>
                  {isSel && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
