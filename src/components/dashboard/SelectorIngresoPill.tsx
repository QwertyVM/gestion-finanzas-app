'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 160;
    const dropdownWidth = 180;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const left = Math.max(8, Math.min(rect.left, window.innerWidth - dropdownWidth - 8));

    if (openUpward) {
      setMenuStyle({
        position: 'fixed',
        bottom: `${Math.round(window.innerHeight - rect.top + 4)}px`,
        left: `${Math.round(left)}px`,
        width: `${dropdownWidth}px`,
        zIndex: 9999,
      });
    } else {
      setMenuStyle({
        position: 'fixed',
        top: `${Math.round(rect.bottom + 4)}px`,
        left: `${Math.round(left)}px`,
        width: `${dropdownWidth}px`,
        zIndex: 9999,
      });
    }
  };

  // Cerrar menú al hacer clic fuera, scroll, redimensión o Escape
  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handleClickOutside(e: MouseEvent) {
        const target = e.target as Node;
        if (
          buttonRef.current &&
          !buttonRef.current.contains(target) &&
          menuRef.current &&
          !menuRef.current.contains(target)
        ) {
          setOpen(false);
        }
      }

        function handleScrollOrResize() {
          setOpen(false);
        }

        function handleKeyDown(e: KeyboardEvent) {
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          window.removeEventListener('scroll', handleScrollOrResize, true);
          window.removeEventListener('resize', handleScrollOrResize);
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [open]);

  if (!ingresos || ingresos.length <= 1) return null;

  const sueldoBase = ingresos.find((i) => i.tipo === 'SUELDO') || ingresos[0];
  const ingresoAsignado = ingresos.find((i) => i.id === ingresoId);
  const esGrati = ingresoAsignado?.tipo === 'GRATIFICACION';

  const label = ingresoAsignado
    ? (esGrati ? '🎁 Grati' : `💰 ${ingresoAsignado.concepto.split(' ')[0]}`)
    : '💰 Sueldo';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = async (nuevoId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    try {
      setSaving(true);
      await onAsignar(nuevoId);
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled || saving}
          onClick={handleToggle}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer shrink-0 ${esGrati
              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
            } ${saving ? 'opacity-50 animate-pulse' : ''}`}
          title="Cambiar fuente de ingreso que cubre este gasto"
        >
          <span>{label}</span>
          <span className="text-[8px] opacity-60">▾</span>
        </button>

            {mounted && open && typeof document !== 'undefined' && createPortal(
              <div
                ref={menuRef}
                style={menuStyle}
                className="rounded-lg bg-popover text-popover-foreground border border-border shadow-xl p-1 text-xs max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                  Descontar de:
                </div>

                {/* Opción Sueldo Base */}
                <button
                  type="button"
                  onClick={(e) => handleSelect(null, e)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] flex items-center justify-between transition cursor-pointer ${!ingresoId || ingresoId === sueldoBase?.id
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
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] flex items-center justify-between transition cursor-pointer ${isSelected
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
        </div>,
          document.body
        )}
      </div>
      );
}
