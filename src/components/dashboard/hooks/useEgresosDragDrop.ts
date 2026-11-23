'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import type { ClasificacionEgreso } from '@/lib/utils';

export type EgresoItemConClasificacion = DetalleItemData & {
  clasificacion: ClasificacionEgreso;
  categoriaColor?: string;
  colorHex?: string;
  badgeLabel?: string;
};

interface UseEgresosDragDropProps {
  todosEgresos: EgresoItemConClasificacion[];
  usuarioId?: string;
  refresh: () => Promise<void>;
}

export function useEgresosDragDrop({
  todosEgresos,
  usuarioId,
  refresh,
}: UseEgresosDragDropProps) {
  const [itemsOrdenados, setItemsOrdenados] = useState<Array<any>>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setItemsOrdenados(todosEgresos);
  }, [todosEgresos]);

  const listaActivaEgresos = itemsOrdenados.length > 0 ? itemsOrdenados : todosEgresos;

  const handleDrop = async (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const baseList = [...listaActivaEgresos];
    const sourceIndex = baseList.findIndex((it) => it.id === sourceId);
    const targetIndex = baseList.findIndex((it) => it.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [movedItem] = baseList.splice(sourceIndex, 1);
    baseList.splice(targetIndex, 0, movedItem);

    setItemsOrdenados(baseList);

    try {
      const payload = baseList.map((item, idx) => ({
        id: (item as any).dbId || item.id,
        tipo: item.tipo,
        prestamoId: (item as any).prestamoId || null,
        orden: idx + 1,
      }));

      const res = await fetch('/api/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          usuarioId,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar orden');
      toast.success('Orden actualizado');
      await refresh();
    } catch {
      toast.error('Error al actualizar orden');
      await refresh();
    }
  };

  return {
    itemsOrdenados,
    listaActivaEgresos,
    draggedId,
    setDraggedId,
    dragOverId,
    setDragOverId,
    handleDrop,
  };
}
