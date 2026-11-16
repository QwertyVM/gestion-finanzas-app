'use client';

import React from 'react';
import { Calendar, X, Check, Loader2, Sparkles } from 'lucide-react';

interface DetalleFechaPeriodoEditorProps {
  fechaInput: string;
  periodoInput: string;
  tarjetaDiaCorte: number;
  esTarjeta: boolean;
  tieneCuotas: boolean;
  aplicarSerie: boolean;
  saving: boolean;
  opcionesMeses: { value: string; label: string }[];
  onChangeFecha: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePeriodo: (nuevoPeriodo: string) => void;
  onChangeAplicarSerie: (val: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function DetalleFechaPeriodoEditor({
  fechaInput,
  periodoInput,
  tarjetaDiaCorte,
  esTarjeta,
  tieneCuotas,
  aplicarSerie,
  saving,
  opcionesMeses,
  onChangeFecha,
  onChangePeriodo,
  onChangeAplicarSerie,
  onSave,
  onCancel,
}: DetalleFechaPeriodoEditorProps) {
  return (
    <div className="p-3 rounded-xl bg-card border border-primary/40 space-y-3 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Editar Fecha y Periodo Imputado</span>
        </span>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-medium block">Fecha de Compra</label>
          <input
            type="date"
            value={fechaInput}
            onChange={onChangeFecha}
            disabled={saving}
            className="w-full text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-medium block">Periodo Imputado (Mes a pagar)</label>
          <select
            value={periodoInput}
            onChange={(e) => onChangePeriodo(e.target.value)}
            disabled={saving}
            className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            {opcionesMeses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {esTarjeta && (
        <p className="text-[10.5px] text-muted-foreground leading-relaxed flex items-start gap-1 bg-muted/30 p-2 rounded-lg border border-border/40">
          <Sparkles className="w-3 h-3 text-sky-500 shrink-0 mt-0.5" />
          <span>
            Corte día {tarjetaDiaCorte}. Las compras pasadas ese día se sugieren para el mes siguiente, pero puedes elegir el periodo que desees.
          </span>
        </p>
      )}

      {tieneCuotas && (
        <label className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={aplicarSerie}
            onChange={(e) => onChangeAplicarSerie(e.target.checked)}
            disabled={saving}
            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
          />
          <span>Mover todas las cuotas consecutivas de esta compra</span>
        </label>
      )}

      <div className="flex justify-end items-center gap-2 pt-1 border-t border-border/50">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-2.5 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !fechaInput || !periodoInput}
          className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-xs"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          <span>Guardar cambios</span>
        </button>
      </div>
    </div>
  );
}
