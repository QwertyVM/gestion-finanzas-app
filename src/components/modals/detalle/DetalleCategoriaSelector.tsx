'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Edit2, Check, X, Loader2 } from 'lucide-react';
import { CategoriaTagBadge } from '@/components/common/CategoriaTagBadge';

interface CategoriaItem {
  id: string;
  nombre: string;
  color?: string | null;
  icono?: string | null;
}

interface DetalleCategoriaSelectorProps {
  categoriaNombre?: string;
  categoriaId?: string | null;
  categoriaColor?: string;
  tieneCuotas?: boolean;
  onCambiarCategoria: (categoriaId: string, aplicarSerie?: boolean) => Promise<void>;
}

export function DetalleCategoriaSelector({
  categoriaNombre,
  categoriaId,
  categoriaColor,
  tieneCuotas = false,
  onCambiarCategoria,
}: DetalleCategoriaSelectorProps) {
  const [editando, setEditando] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>(categoriaId || '');
  const [aplicarSerie, setAplicarSerie] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedCatId(categoriaId || '');
  }, [categoriaId]);

  const handleStartEdit = async () => {
    setEditando(true);
    if (categorias.length === 0) {
      try {
        setLoadingCats(true);
        const res = await fetch('/api/categorias');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategorias(data);
            if (!selectedCatId && categoriaNombre) {
              const match = data.find(
                (c) => c.nombre.toLowerCase() === categoriaNombre.toLowerCase()
              );
              if (match) setSelectedCatId(match.id);
            }
          }
        }
      } catch {
        // ignore error
      } finally {
        setLoadingCats(false);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCatId) return;
    try {
      setSaving(true);
      await onCambiarCategoria(selectedCatId, tieneCuotas ? aplicarSerie : false);
      setEditando(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedCatId(categoriaId || '');
    setEditando(false);
  };

  return (
    <div className="p-3 rounded-xl bg-card border border-border/70 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span>Categoría</span>
        </span>
        {!editando && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      {!editando ? (
        <div className="pt-0.5">
          <CategoriaTagBadge
            categoria={categoriaNombre}
            categoriaColor={categoriaColor}
          />
        </div>
      ) : (
        <div className="space-y-2 mt-1">
          {loadingCats ? (
            <div className="flex items-center gap-2 py-1 text-muted-foreground text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Cargando categorías...</span>
            </div>
          ) : (
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="" disabled>Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )}

          {tieneCuotas && (
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aplicarSerie}
                onChange={(e) => setAplicarSerie(e.target.checked)}
                className="rounded border-border text-indigo-600 focus:ring-0"
              />
              <span>Aplicar a todas las cuotas de esta compra</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted text-[11px] transition"
            >
              <X className="w-3 h-3 inline mr-1" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedCatId}
              className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 text-[11px] flex items-center gap-1 transition disabled:opacity-50"
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
