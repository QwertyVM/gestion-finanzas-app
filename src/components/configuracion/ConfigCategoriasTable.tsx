'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { CategoriaItem } from './hooks/useConfiguracionManager';

interface ConfigCategoriasTableProps {
  categorias: CategoriaItem[];
  loadingCategorias: boolean;
  deletingCatId: string | null;
  onEditarCategoria: (cat: CategoriaItem) => void;
  onEliminarCategoria: (id: string, nombre: string) => void;
}

export function ConfigCategoriasTable({
  categorias,
  loadingCategorias,
  deletingCatId,
  onEditarCategoria,
  onEliminarCategoria,
}: ConfigCategoriasTableProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">Categoría</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Tipo</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Uso</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Color</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loadingCategorias ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                  Cargando categorías...
                </td>
              </tr>
            ) : categorias.length > 0 ? (
              categorias.map((cat) => {
                const totalUso = (cat._count?.costosFijos || 0) + (cat._count?.gastos || 0);

                return (
                  <tr key={cat.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3 font-medium text-foreground flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full border border-border/60 shrink-0"
                        style={{ backgroundColor: cat.color || '#2563eb' }}
                      />
                      <span>{cat.nombre}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {cat.esFijo ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
                          Fijo / Recurrente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                          Variable / Compra
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                      {cat._count ? (
                        <span title={`${cat._count.costosFijos} costos fijos, ${cat._count.gastos} gastos`}>
                          {totalUso > 0 ? (
                            <span className="text-foreground font-semibold">
                              {totalUso} <span className="font-normal text-muted-foreground">reg. ({cat._count.costosFijos}F / {cat._count.gastos}G)</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">0 reg.</span>
                          )}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: cat.color || '#2563eb' }}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
                          {cat.color}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditarCategoria(cat)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                          title="Editar categoría"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminarCategoria(cat.id, cat.nombre)}
                          disabled={deletingCatId === cat.id}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
