'use client';

import React, { useState } from 'react';
import { Sparkles, X, Check } from 'lucide-react';

interface ModalGuardarEscenarioProps {
  open: boolean;
  onClose: () => void;
  onGuardar: (nombre: string, descripcion: string, icono: string) => void;
}

export function ModalGuardarEscenario({
  open,
  onClose,
  onGuardar,
}: ModalGuardarEscenarioProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [icono, setIcono] = useState('Sparkles');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onGuardar(nombre.trim(), descripcion.trim(), icono);
    setNombre('');
    setDescripcion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Guardar Escenario</h3>
              <p className="text-[11px] text-muted-foreground">Crea un preset con los % actuales</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Nombre del Escenario
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Verano / Vacaciones, Mes Austero"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              placeholder="Ej: Reduce ocio y prioriza despensa para viajes"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nombre.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Preset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
