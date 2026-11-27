'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ModalConfirmarEliminarProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  descripcion: string;
  nombreItem: string;
  loading?: boolean;
}

export function ModalConfirmarEliminar({
  open,
  onClose,
  onConfirm,
  titulo,
  descripcion,
  nombreItem,
  loading = false,
}: ModalConfirmarEliminarProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-card-foreground p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-900/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-semibold text-base text-foreground tracking-tight">
            {titulo}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {descripcion}
          </p>
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs font-semibold text-foreground truncate mt-2">
            {nombreItem}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted/60 text-xs font-medium text-foreground transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition active:scale-98 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Eliminando...' : 'Eliminar de la plantilla'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
