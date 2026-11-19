'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Edit2, Check, X, Loader2 } from 'lucide-react';
import { MINITAGS_POR_CATEGORIA, TODOS_LOS_MINITAGS_SUGERIDOS } from '@/lib/categoria-service';

interface DetalleTagSelectorProps {
  tag?: string | null;
  categoriaNombre?: string;
  tieneCuotas?: boolean;
  onCambiarTag: (nuevoTag: string, aplicarSerie?: boolean) => Promise<void>;
}

export function DetalleTagSelector({
  tag,
  categoriaNombre,
  tieneCuotas = false,
  onCambiarTag,
}: DetalleTagSelectorProps) {
  const [editando, setEditando] = useState(false);
  const [tagInput, setTagInput] = useState(tag || '');
  const [aplicarSerie, setAplicarSerie] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTagInput(tag || '');
  }, [tag]);

  const handleStartEdit = () => {
    setTagInput(tag || '');
    setEditando(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onCambiarTag(tagInput.trim(), tieneCuotas ? aplicarSerie : false);
      setEditando(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTagInput(tag || '');
    setEditando(false);
  };

  // Obtener sugerencias para la categoría actual
  const sugerencias =
    (categoriaNombre && MINITAGS_POR_CATEGORIA[categoriaNombre]) ||
    TODOS_LOS_MINITAGS_SUGERIDOS.slice(0, 8);

  return (
    <div className="p-3 rounded-xl bg-card border border-border/70 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span>Minitag Específico</span>
        </span>
        {!editando && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      {!editando ? (
        <div className="flex items-center gap-2">
          {tag ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted/60 text-foreground border border-border/50">
              #{tag}
            </span>
          ) : (
            <span className="text-muted-foreground/60 italic text-xs">Sin minitag específico</span>
          )}
        </div>
      ) : (
        <div className="space-y-2 mt-1">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Ej: Supermercado, Alquiler, Delivery..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            autoFocus
          />

          {/* Chips de sugerencias */}
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {sugerencias.map((sug) => {
              const isSelected = tagInput.toLowerCase() === sug.toLowerCase();
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTagInput(isSelected ? '' : sug)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground font-semibold'
                      : 'bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground'
                  }`}
                >
                  #{sug}
                </button>
              );
            })}
          </div>

          {tieneCuotas && (
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aplicarSerie}
                onChange={(e) => setAplicarSerie(e.target.checked)}
                className="rounded border-border text-indigo-600 focus:ring-0"
              />
              <span>Aplicar minitag a todas las cuotas</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted text-[11px] transition cursor-pointer"
            >
              <X className="w-3 h-3 inline mr-1" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 text-[11px] flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
