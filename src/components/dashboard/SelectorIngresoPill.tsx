'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Wallet, Gift } from 'lucide-react';

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

    setMenuStyle({
      position: 'fixed',
      [openUpward ? 'bottom' : 'top']: `${Math.round(openUpward ? window.innerHeight - rect.top + 4 : rect.bottom + 4)}px`,
      left: `${Math.round(left)}px`,
      width: `${dropdownWidth}px`,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          buttonRef.current &&
          !buttonRef.current.contains(target) &&
          menuRef.current &&
          !menuRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      const handleScrollOrResize = () => setOpen(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };

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
    ?(esGrati ? 'Grati' : ingresoAsignado.concepto.split(' ')[0])
    : 'Sueldo';

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
        className={`inline-flex items-center gap-1 bg-secondary/70 hover:bg-secondary border border-border/70 text-foreground text-[11px] font-medium px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${saving ? 'opacity-50 animate-pulse' : ''
          }`}
        title="Cambiar cuenta o fuente de ingreso"
      >
        <Wallet className="w-3 h-3 text-primary shrink-0" />
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {mounted && open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="rounded-xl bg-popover text-popover-foreground border border-border shadow-xl p-1 text-xs max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
            Descontar de:
          </div>

          {/* Opción Sueldo Base */}
          <button
            type="button"
            onClick={(e) => handleSelect(null, e)}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${!ingresoId || ingresoId === sueldoBase?.id
                ? 'bg-muted font-semibold text-foreground'
                : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Wallet className="w-3 h-3 text-primary shrink-0" />
              <span>Sueldo (Por defecto)</span>
            </span>
            {(!ingresoId || ingresoId === sueldoBase?.id) && (
              <Check className="w-3 h-3 text-primary shrink-0" />
            )}
          </button>

          {/* Opciones de otras fuentes */}
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
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${isSelected
                      ? 'bg-secondary font-semibold text-foreground'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {isGratiItem ? (
                      <Gift className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <Wallet className="w-3 h-3 text-primary shrink-0" />
                    )}
                    <span>{ing.concepto}</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                </button>
              );
            })}
        </div>,
        document.body
      )}
    </div>
  );
}
