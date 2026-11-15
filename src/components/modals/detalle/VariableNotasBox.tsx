'use client';

import React from 'react';
import { Pencil } from 'lucide-react';

interface VariableNotasBoxProps {
  notas?: string | null;
  editandoNotas: boolean;
  notasInput: string;
  savingNotas: boolean;
  permitirEditar: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeNotasInput: (val: string) => void;
  onSaveNotas: () => void;
}

export function VariableNotasBox({
  notas,
  editandoNotas,
  notasInput,
  savingNotas,
  permitirEditar,
  onStartEdit,
  onCancelEdit,
  onChangeNotasInput,
  onSaveNotas,
}: VariableNotasBoxProps) {
  return (
    <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground block">Notas / Observaciones</span>
        {!editandoNotas && permitirEditar && (
          <button
            type="button"
            onClick={onStartEdit}
            className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <Pencil className="w-2.5 h-2.5" />
            <span>{notas ? 'Editar' : 'Agregar'}</span>
          </button>
        )}
      </div>

      {!editandoNotas ? (
        <p className="font-medium text-foreground text-xs leading-relaxed">
          {notas || <span className="text-muted-foreground italic text-[11px]">Sin notas</span>}
        </p>
      ) : (
        <div className="space-y-1.5 pt-1">
          <textarea
            value={notasInput}
            onChange={(e) => onChangeNotasInput(e.target.value)}
            placeholder="Escribe una observación sobre este gasto..."
            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground outline-none resize-none h-16"
            maxLength={200}
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-2.5 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={savingNotas}
              onClick={onSaveNotas}
              className="px-3 py-1 rounded-md bg-foreground text-background text-[11px] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {savingNotas ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
