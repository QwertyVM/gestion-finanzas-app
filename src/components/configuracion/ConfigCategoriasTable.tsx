'use client';

import React from 'react';
import { Pencil, ShieldCheck, Sparkles, PiggyBank, Lock } from 'lucide-react';
import type { CategoriaItem } from './hooks/useConfiguracionManager';
import { MINITAGS_POR_CATEGORIA } from '@/lib/categoria-service';

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
  onEditarCategoria,
}: ConfigCategoriasTableProps) {
  const renderIcon = (catNombre: string) => {
    const n = catNombre.toLowerCase();
    if (n.includes('necesidad') || n.includes('50')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    if (n.includes('deseo') || n.includes('30')) {
      return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    if (n.includes('ahorro') || n.includes('invers') || n.includes('20')) {
      return <PiggyBank className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    return <span className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground" />;
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">Categoría (50/30/20)</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Objetivo</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Minitags Sugeridos</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Uso</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Color</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loadingCategorias ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                  Cargando categorías...
                </td>
              </tr>
            ) : categorias.length > 0 ? (
              categorias.map((cat) => {
                const totalUso = (cat._count?.costosFijos || 0) + (cat._count?.gastos || 0);
                const tagsSugeridos = MINITAGS_POR_CATEGORIA[cat.nombre] || [];

                return (
                  <tr key={cat.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {renderIcon(cat.nombre)}
                        <span className="font-semibold">{cat.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-muted/60 text-foreground border border-border/60">
                        {cat.nombre.includes('50')
                          ? '50% Ingreso'
                          : cat.nombre.includes('30')
                          ? '30% Ingreso'
                          : '20% Ingreso'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground max-w-xs">
                      <div className="flex items-center gap-1 flex-wrap">
                        {tagsSugeridos.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-muted/50 border border-border/40 text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                        {tagsSugeridos.length > 4 && (
                          <span className="text-[10px] text-muted-foreground/60">
                            +{tagsSugeridos.length - 4} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                      {cat._count ? (
                        <span title={`${cat._count.costosFijos} costos fijos, ${cat._count.gastos} gastos`}>
                          <span className="text-foreground font-semibold">{totalUso}</span>{' '}
                          <span className="font-normal text-muted-foreground">
                            reg. ({cat._count.costosFijos}F / {cat._count.gastos}G)
                          </span>
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
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
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditarCategoria(cat)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                          title="Editar color o detalles"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className="p-1 text-muted-foreground/40 cursor-not-allowed"
                          title="Categoría canónica del modelo 50/30/20 (protegida)"
                        >
                          <Lock className="w-3 h-3" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
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
