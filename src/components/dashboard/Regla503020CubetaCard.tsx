'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Check, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Regla503020CubetaCardProps {
  titulo: string;
  porcentaje: number;
  monto: number;
  desvio: number;
  moneda: string;
  estaSeleccionada: boolean;
  onToggle: () => void;
  colorKey: 'sky' | 'teal' | 'purple';
}

export function Regla503020CubetaCard({
  titulo,
  porcentaje,
  monto,
  desvio,
  moneda,
  estaSeleccionada,
  onToggle,
  colorKey,
}: Regla503020CubetaCardProps) {
  const renderDesvio = (val: number) => {
    if (Math.abs(val) <= 2) {
      return (
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
          <Check className="w-3 h-3" /> En objetivo
        </span>
      );
    }
    const positivo = val > 0;
    return (
      <span
        className={`text-[10px] font-semibold inline-flex items-center gap-0.5 ${
          positivo
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {positivo ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {positivo ? `+${val}%` : `${val}%`}
      </span>
    );
  };

  const colorStyles = {
    sky: {
      active: 'bg-sky-100/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 ring-2 ring-sky-400/30',
      idle: 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50 hover:border-sky-300',
      title: 'text-sky-800 dark:text-sky-300',
      subtext: 'text-sky-700 dark:text-sky-400',
    },
    teal: {
      active: 'bg-teal-100/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 ring-2 ring-teal-400/30',
      idle: 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 hover:border-teal-300',
      title: 'text-teal-800 dark:text-teal-300',
      subtext: 'text-teal-700 dark:text-teal-400',
    },
    purple: {
      active: 'bg-purple-100/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 ring-2 ring-purple-400/30',
      idle: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50 hover:border-purple-300',
      title: 'text-purple-800 dark:text-purple-300',
      subtext: 'text-purple-700 dark:text-purple-400',
    },
  }[colorKey];

  return (
    <div
      onClick={onToggle}
      className={`p-3 rounded-lg border transition cursor-pointer select-none space-y-1 ${
        estaSeleccionada ? colorStyles.active : colorStyles.idle
      }`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-semibold ${colorStyles.title}`}>{titulo}</span>
        {renderDesvio(desvio)}
      </div>
      <div className="text-lg font-bold text-foreground font-mono">
        {porcentaje}%
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>{formatMoney(monto, moneda)}</span>
        <span className={`text-[10px] ${colorStyles.subtext} font-sans inline-flex items-center gap-0.5`}>
          {estaSeleccionada ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{estaSeleccionada ? 'Ocultar' : 'Subcategorías'}</span>
        </span>
      </div>
    </div>
  );
}
