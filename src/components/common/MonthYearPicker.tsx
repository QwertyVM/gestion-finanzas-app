'use client';

import React from 'react';
import { Calendar, X } from 'lucide-react';

export interface MonthYearPickerProps {
  value: string; // formato YYYY-MM o vacío
  onChange: (value: string) => void;
  optional?: boolean;
  required?: boolean;
  accentColor?: 'sky' | 'purple' | 'indigo' | 'emerald';
  minYear?: number;
  maxYear?: number;
  className?: string;
}

const MESES = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export function MonthYearPicker({
  value,
  onChange,
  optional = false,
  required = false,
  accentColor = 'sky',
  minYear = 2023,
  maxYear = 2036,
  className = '',
}: MonthYearPickerProps) {
  // Parsear YYYY-MM
  const parseValue = () => {
    if (!value || typeof value !== 'string') {
      return { year: '', month: '' };
    }
    const parts = value.split('-');
    if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 2) {
      return { year: parts[0], month: parts[1] };
    }
    return { year: '', month: '' };
  };

  const { year: currentYear, month: currentMonth } = parseValue();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    if (!newMonth) {
      if (optional) onChange('');
      return;
    }
    const yr = currentYear || new Date().getFullYear().toString();
    onChange(`${yr}-${newMonth}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    if (!newYear) {
      if (optional) onChange('');
      return;
    }
    const mo = currentMonth || (new Date().getMonth() + 1).toString().padStart(2, '0');
    onChange(`${newYear}-${mo}`);
  };

  const handleClear = () => {
    onChange('');
  };

  // Generar lista de años
  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y.toString());
  }

  // Clases de foco según accentColor
  const ringClasses = {
    sky: 'focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500',
    purple: 'focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500',
    indigo: 'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500',
    emerald: 'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500',
  }[accentColor];

  const isEmpty = !currentYear || !currentMonth;

  return (
    <div
      className={`relative flex items-center bg-background border border-border rounded-xl transition-all shadow-xs ${ringClasses} ${className}`}
    >
      <div className="pl-2.5 pr-1 text-muted-foreground shrink-0 pointer-events-none">
        <Calendar className="w-4 h-4 opacity-70" />
      </div>

      {/* Selector de Mes */}
      <div className="flex-1 min-w-0">
        <select
          value={currentMonth}
          onChange={handleMonthChange}
          required={required && !optional}
          className="w-full py-2 pl-1 pr-1 bg-transparent text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer appearance-none truncate"
        >
          {optional && (
            <option value="" className="bg-card text-muted-foreground">
              Sin mes fin
            </option>
          )}
          {isEmpty && !optional && (
            <option value="" disabled className="bg-card text-muted-foreground">
              Mes
            </option>
          )}
          {MESES.map((m) => (
            <option key={m.value} value={m.value} className="bg-card text-foreground py-1">
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-4 w-px bg-border/80 shrink-0 mx-1" />

      {/* Selector de Año */}
      <div className="w-16 shrink-0">
        <select
          value={currentYear}
          onChange={handleYearChange}
          required={required && !optional}
          className="w-full py-2 px-1 bg-transparent text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer appearance-none text-center"
        >
          {optional && (
            <option value="" className="bg-card text-muted-foreground">
              Año
            </option>
          )}
          {isEmpty && !optional && (
            <option value="" disabled className="bg-card text-muted-foreground">
              Año
            </option>
          )}
          {years.map((y) => (
            <option key={y} value={y} className="bg-card text-foreground py-1">
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de Limpiar si es opcional y tiene valor */}
      {optional && value && (
        <button
          type="button"
          onClick={handleClear}
          className="mr-1.5 p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition shrink-0"
          title="Quitar fecha límite"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
