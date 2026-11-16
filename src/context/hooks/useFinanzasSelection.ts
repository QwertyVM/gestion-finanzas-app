'use client';

import { useState, useCallback } from 'react';

export function useFinanzasSelection() {
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  const toggleSelectGasto = useCallback((id: string, monto: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, monto);
      }
      return next;
    });
  }, []);

  const selectAllGastos = useCallback((items: Array<{ id: string; monto: number }>) => {
    setSelectedItems((prev) => {
      const allSelected = items.every((item) => prev.has(item.id));
      if (allSelected) {
        return new Map();
      }
      const next = new Map();
      for (const item of items) {
        next.set(item.id, item.monto);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  const selectedGastoIds = Array.from(selectedItems.keys());
  const sumaSeleccionada = Array.from(selectedItems.values()).reduce((a, b) => a + b, 0);

  return {
    selectedItems,
    setSelectedItems,
    selectedGastoIds,
    sumaSeleccionada,
    toggleSelectGasto,
    selectAllGastos,
    clearSelection,
  };
}
