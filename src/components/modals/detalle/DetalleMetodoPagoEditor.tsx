'use client';

import React from 'react';

interface DetalleMetodoPagoEditorProps {
  metodoSel: string;
  tarjetaSel: string;
  aplicarFuturos?: boolean;
  savingMetodo: boolean;
  tarjetas: Array<{ id: string; nombre: string; banco: string }>;
  onChangeMetodoSel: (val: string) => void;
  onChangeTarjetaSel: (val: string) => void;
  onChangeAplicarFuturos?: (val: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  mostrarAplicarFuturos?: boolean;
}

export function DetalleMetodoPagoEditor({
  metodoSel,
  tarjetaSel,
  aplicarFuturos = false,
  savingMetodo,
  tarjetas,
  onChangeMetodoSel,
  onChangeTarjetaSel,
  onChangeAplicarFuturos,
  onSave,
  onCancel,
  mostrarAplicarFuturos = true,
}: DetalleMetodoPagoEditorProps) {
  return (
    <div className="space-y-2.5 pt-1">
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onChangeMetodoSel('EFECTIVO_DEBITO')}
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition ${
            metodoSel === 'EFECTIVO_DEBITO'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 font-semibold'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Efectivo
        </button>
        <button
          type="button"
          onClick={() => onChangeMetodoSel('TRANSFERENCIA')}
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition ${
            metodoSel === 'TRANSFERENCIA'
              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-300 font-semibold'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Transferencia
        </button>
        <button
          type="button"
          onClick={() => onChangeMetodoSel('TARJETA_CREDITO')}
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition ${
            metodoSel === 'TARJETA_CREDITO'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300 font-semibold'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Tarjeta
        </button>
      </div>

      {metodoSel === 'TARJETA_CREDITO' && (
        <select
          value={tarjetaSel}
          onChange={(e) => onChangeTarjetaSel(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground outline-none"
        >
          {tarjetas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} ({t.banco})
            </option>
          ))}
        </select>
      )}

      {mostrarAplicarFuturos && (
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={aplicarFuturos}
            onChange={(e) => onChangeAplicarFuturos?.(e.target.checked)}
            className="rounded border-border"
          />
          <span>Aplicar también a meses futuros</span>
        </label>
      )}

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={savingMetodo}
          onClick={onSave}
          className="px-3 py-1 rounded-md bg-foreground text-background text-[11px] font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {savingMetodo ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
