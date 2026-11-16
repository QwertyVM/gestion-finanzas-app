'use client';

import React from 'react';
import type { CategoriaItem } from './hooks/useConfiguracionManager';
import { ConfigCategoriasTable } from './ConfigCategoriasTable';
import { ConfigCategoriasForm } from './ConfigCategoriasForm';

interface ConfigCategoriasSectionProps {
  categorias: CategoriaItem[];
  loadingCategorias: boolean;
  deletingCatId: string | null;
  editandoCat: CategoriaItem | null;
  nombreCat: string;
  setNombreCat: (n: string) => void;
  colorCat: string;
  setColorCat: (c: string) => void;
  esFijoCat: boolean;
  setEsFijoCat: (f: boolean) => void;
  savingCat: boolean;
  onEditarCategoria: (cat: CategoriaItem) => void;
  onCancelarEdicionCat: () => void;
  onGuardarCategoria: (e: React.FormEvent) => void;
  onEliminarCategoria: (id: string, nombre: string) => void;
}

export function ConfigCategoriasSection({
  categorias,
  loadingCategorias,
  deletingCatId,
  editandoCat,
  nombreCat,
  setNombreCat,
  colorCat,
  setColorCat,
  esFijoCat,
  setEsFijoCat,
  savingCat,
  onEditarCategoria,
  onCancelarEdicionCat,
  onGuardarCategoria,
  onEliminarCategoria,
}: ConfigCategoriasSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Catálogo de Categorías / Tags
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Etiquetas generales para clasificar y organizar costos fijos, préstamos y compras.
        </p>
      </div>

      <ConfigCategoriasTable
        categorias={categorias}
        loadingCategorias={loadingCategorias}
        deletingCatId={deletingCatId}
        onEditarCategoria={onEditarCategoria}
        onEliminarCategoria={onEliminarCategoria}
      />

      <ConfigCategoriasForm
        editandoCat={editandoCat}
        nombreCat={nombreCat}
        setNombreCat={setNombreCat}
        colorCat={colorCat}
        setColorCat={setColorCat}
        esFijoCat={esFijoCat}
        setEsFijoCat={setEsFijoCat}
        savingCat={savingCat}
        onCancelarEdicionCat={onCancelarEdicionCat}
        onGuardarCategoria={onGuardarCategoria}
      />
    </div>
  );
}
