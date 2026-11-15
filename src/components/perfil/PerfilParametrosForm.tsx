'use client';

import React from 'react';
import { Loader2, Save, DollarSign, Calendar, Target, RefreshCw } from 'lucide-react';

interface PerfilParametrosFormProps {
  nombre: string;
  sueldoBase: string;
  diaPago: string;
  metaAhorro: string;
  tipoCambio: string;
  moneda: string;
  color: string;
  guardando: boolean;
  onNombreChange: (val: string) => void;
  onSueldoBaseChange: (val: string) => void;
  onDiaPagoChange: (val: string) => void;
  onMetaAhorroChange: (val: string) => void;
  onTipoCambioChange: (val: string) => void;
  onMonedaChange: (val: string) => void;
  onColorChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PRESET_COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export function PerfilParametrosForm({
  nombre,
  sueldoBase,
  diaPago,
  metaAhorro,
  tipoCambio,
  moneda,
  color,
  guardando,
  onNombreChange,
  onSueldoBaseChange,
  onDiaPagoChange,
  onMetaAhorroChange,
  onTipoCambioChange,
  onMonedaChange,
  onColorChange,
  onSubmit,
}: PerfilParametrosFormProps) {
  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';
  const monoClass = 'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

  return (
    <form onSubmit={onSubmit} className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-border/60 pb-3">
        <h2 className="text-base font-extrabold text-foreground">Parámetros Financieros Personales</h2>
        <p className="text-xs text-muted-foreground">Ajusta tu sueldo base, proyecciones de ahorro y reglas de cálculo mensual.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">Nombre para Mostrar</label>
          <input type="text" required value={nombre} onChange={(e) => onNombreChange(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">Moneda Principal</label>
          <select value={moneda} onChange={(e) => onMonedaChange(e.target.value)} className={inputClass}>
            <option value="S/">S/ (Soles Peruanos)</option>
            <option value="$">$ (Dólares USD)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sueldo Base Mensual ({moneda})</span>
          </label>
          <input type="number" step="0.01" min="0" required value={sueldoBase} onChange={(e) => onSueldoBaseChange(e.target.value)} className={monoClass} />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Meta de Ahorro Mensual ({moneda})</span>
          </label>
          <input type="number" step="0.01" min="0" required value={metaAhorro} onChange={(e) => onMetaAhorroChange(e.target.value)} className={monoClass} />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Día de Pago del Sueldo</span>
          </label>
          <input type="number" min="1" max="31" required value={diaPago} onChange={(e) => onDiaPagoChange(e.target.value)} className={monoClass} />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Tipo de Cambio USD de Referencia</span>
          </label>
          <input type="number" step="0.01" min="1" required value={tipoCambio} onChange={(e) => onTipoCambioChange(e.target.value)} className={monoClass} />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-foreground block mb-1.5">Color de Identidad</label>
          <div className="flex items-center gap-2.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={`w-8 h-8 rounded-xl transition-all ${
                  color === c ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 active:scale-98 transition flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          {guardando ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
