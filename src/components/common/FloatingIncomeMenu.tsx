'use client';

import React from 'react';
import { Wallet } from 'lucide-react';

interface FloatingIncomeMenuProps {
  ingresos: any[];
  open: boolean;
  loading: boolean;
  onToggleOpen: () => void;
  onSelectIncome: (ingresoId: string | null) => void;
}

export function FloatingIncomeMenu({
  ingresos,
  open,
  loading,
  onToggleOpen,
  onSelectIncome,
}: FloatingIncomeMenuProps) {
  if (!ingresos || ingresos.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        disabled={loading}
        className="px-2 sm:px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition disabled:opacity-50 cursor-pointer"
        title="Asignar fuente de pago en lote"
      >
        <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="hidden min-[480px]:inline">Fuente</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 bg-zinc-900 border border-zinc-700 shadow-xl rounded-xl p-1.5 min-w-[210px] z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-0.5 block">
            Descontar de:
          </span>
          <button
            onClick={() => onSelectIncome(null)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-200 font-medium text-[11px] transition flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>💰 Sueldo (Por defecto)</span>
          </button>
          {ingresos
            .filter((i: any) => i.tipo !== 'SUELDO')
            .map((ing: any) => (
              <button
                key={ing.id}
                onClick={() => onSelectIncome(ing.id)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-200 font-medium text-[11px] transition flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="truncate">
                  {ing.tipo === 'GRATIFICACION' ? '🎁' : '💵'} {ing.concepto}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
