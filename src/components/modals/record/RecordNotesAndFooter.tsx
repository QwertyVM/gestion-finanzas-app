'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import type { TipoRecordModal } from '@/context/FinanzasContext';

interface RecordNotesAndFooterProps {
  tipoActivo: TipoRecordModal;
  notas: string;
  setNotas: (n: string) => void;
  showNotes: boolean;
  setShowNotes: (s: boolean) => void;
  seguirRegistrando: boolean;
  setSeguirRegistrando: (s: boolean) => void;
  submitting: boolean;
  onClose: () => void;
}

export function RecordNotesAndFooter({
  tipoActivo,
  notas,
  setNotas,
  showNotes,
  setShowNotes,
  seguirRegistrando,
  setSeguirRegistrando,
  submitting,
  onClose,
}: RecordNotesAndFooterProps) {
  const getSubmitLabel = () => {
    if (submitting) return 'Guardando...';
    switch (tipoActivo) {
      case 'GASTO':
        return 'Guardar Gasto';
      case 'INGRESO':
        return 'Guardar Ingreso';
      case 'FIJO':
        return 'Guardar Fijo';
      case 'PRESTAMO':
        return 'Guardar Préstamo';
    }
  };

  return (
    <>
      <div className="pt-1">
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-dotted transition cursor-pointer"
          >
            + Agregar nota o detalle
          </button>
        ) : (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-xs font-medium text-muted-foreground">Notas:</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles sobre el gasto, persona involucrada, etc."
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-foreground resize-none"
            />
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none self-start sm:self-auto">
          <input
            type="checkbox"
            checked={seguirRegistrando}
            onChange={(e) => setSeguirRegistrando(e.target.checked)}
            className="w-4 h-4 rounded border-border text-foreground focus:ring-0"
          />
          <span>Seguir registrando (modo rápido)</span>
        </label>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getSubmitLabel()}</span>
          </button>
        </div>
      </div>
    </>
  );
}
