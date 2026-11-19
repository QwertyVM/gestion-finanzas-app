'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface SelectorIngresoOption {
  id: string;
  concepto: string;
  tipo: string;
  monto: number;
}

interface SelectorIngresoPillProps {
  ingresoId?: string | null;
  ingresos: SelectorIngresoOption[];
  onAsignar: (nuevoIngresoId: string | null) => Promise<void> | void;
  disabled?: boolean;
}

export function SelectorIngresoPill({
  ingresoId,
  ingresos,
  onAsignar,
  disabled = false,
}: SelectorIngresoPillProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!ingresos || ingresos.length <= 1) return null;

  const sueldoBase = ingresos.find((i) => i.tipo === 'SUELDO') || ingresos[0];
  const ingresoAsignado = ingresos.find((i) => i.id === ingresoId);
  const esGrati = ingresoAsignado?.tipo === 'GRATIFICACION';

  const label = ingresoAsignado
    ? (esGrati ? '🎁 Grati' : `💰 ${ingresoAsignado.concepto.split(' ')[0]}`)
    : '💰 Sueldo';

  const handleSelect = async (nuevoId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSaving(true);
      await onAsignar(nuevoId);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled || saving}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer shrink-0 ${
          esGrati
            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/25'
            : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
        } ${saving ? 'opacity-50 animate-pulse' : ''}`}
        title="Cambiar fuente de ingreso que cubre este gasto"
      >
        <span>{label}</span>
        <span className="text-[8px] opacity-60">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-44 rounded-lg bg-popover text-popover-foreground border border-border shadow-lg p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
            Descontar de:
          </div>

          {/* Opción Sueldo Base */}
          <button
            type="button"
            onClick={(e) => handleSelect(null, e)}
            className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] flex items-center justify-between transition cursor-pointer ${
              !ingresoId || ingresoId === sueldoBase?.id
                ? 'bg-muted font-semibold text-foreground'
                : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="truncate">💰 Sueldo (Por defecto)</span>
            {(!ingresoId || ingresoId === sueldoBase?.id) && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
          </button>

          {/* Opciones de otras fuentes (Gratificación, etc.) */}
          {ingresos
            .filter((i) => i.id !== sueldoBase?.id)
            .map((ing) => {
              const isSelected = ingresoId === ing.id;
              const isGratiItem = ing.tipo === 'GRATIFICACION';
              return (
                <button
                  key={ing.id}
                  type="button"
                  onClick={(e) => handleSelect(ing.id, e)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 font-semibold text-amber-900 dark:text-amber-200'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="truncate">
                    {isGratiItem ? '🎁' : '💵'} {ing.concepto}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
