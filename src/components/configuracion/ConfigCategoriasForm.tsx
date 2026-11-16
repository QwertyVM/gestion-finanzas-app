'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { CategoriaItem } from './hooks/useConfiguracionManager';

interface ConfigCategoriasFormProps {
  editandoCat: CategoriaItem | null;
  nombreCat: string;
  setNombreCat: (n: string) => void;
  colorCat: string;
  setColorCat: (c: string) => void;
  esFijoCat: boolean;
  setEsFijoCat: (f: boolean) => void;
  savingCat: boolean;
  onCancelarEdicionCat: () => void;
  onGuardarCategoria: (e: React.FormEvent) => void;
}

export function ConfigCategoriasForm({
  editandoCat,
  nombreCat,
  setNombreCat,
  colorCat,
  setColorCat,
  esFijoCat,
  setEsFijoCat,
  savingCat,
  onCancelarEdicionCat,
  onGuardarCategoria,
}: ConfigCategoriasFormProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
      <form onSubmit={onGuardarCategoria} className="space-y-3 text-xs">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <span className="font-medium text-foreground text-xs block">
            {editandoCat ? `Editar Categoría "${editandoCat.nombre}"` : 'Nueva Categoría'}
          </span>
          {editandoCat && (
            <button
              type="button"
              onClick={onCancelarEdicionCat}
              className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-muted-foreground">Nombre</label>
            <input
              type="text"
              required
              placeholder="ej. Alimentación, Transporte"
              value={nombreCat}
              onChange={(e) => setNombreCat(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorCat}
                onChange={(e) => setColorCat(e.target.value)}
                className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-muted-foreground">{colorCat}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-1.5">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esFijoCat}
                onChange={(e) => setEsFijoCat(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border"
              />
              <span className="text-xs text-muted-foreground">Es Costo Fijo</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={savingCat}
            className="py-1.5 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {savingCat ? 'Guardando...' : editandoCat ? 'Actualizar Categoría' : '+ Agregar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}
