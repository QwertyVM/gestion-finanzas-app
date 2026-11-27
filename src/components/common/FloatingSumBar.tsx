'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, FastForward, Clock, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingCategoryMenu } from './FloatingCategoryMenu';
import { FloatingIncomeMenu } from './FloatingIncomeMenu';

export function FloatingSumBar() {
  const { selectedGastoIds, sumaSeleccionada, clearSelection, refresh, resumen } = useFinanzas();
  const [loading, setLoading] = useState(false);
  const [menuCatOpen, setMenuCatOpen] = useState(false);
  const [menuIngresoOpen, setMenuIngresoOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categorias, setCategorias] = useState<Array<{ id: string; nombre: string }>>([]);

  if (selectedGastoIds.length === 0) return null;

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const handleOpenCategorias = async () => {
    if (categorias.length === 0) {
      try {
        const res = await fetch('/api/categorias');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setCategorias(data);
        }
      } catch {
        // ignore
      }
    }
    setMenuCatOpen((prev) => !prev);
  };

  const executeMasivoAction = async (payload: any, successMsg: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedGastoIds, ...payload }),
      });
      if (!res.ok) throw new Error('Error en la operación');
      toast.success(successMsg);
      setMenuCatOpen(false);
      clearSelection();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarIngresoMasivo = async (ingresoId: string | null) => {
    try {
      setLoading(true);
      const itemsPayload = selectedGastoIds.map((id) => {
        const itemObj = (resumen?.egresosConsolidados as any[])?.find((e) => e.id === id);
        return {
          id: itemObj?.dbId || id,
          tipo: itemObj?.tipo || 'DIRECTO',
        };
      });

      const res = await fetch('/api/finanzas/asignar-ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          ingresoId: ingresoId || null,
          periodo: resumen?.periodo,
        }),
      });

      if (!res.ok) throw new Error('Error al asignar ingreso');
      toast.success(ingresoId ? 'Gastos asignados a la fuente' : 'Gastos asignados a Sueldo');
      setMenuIngresoOpen(false);
      clearSelection();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[96vw] bg-zinc-950/95 text-zinc-100 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-4 transition-all animate-in fade-in slide-in-from-bottom-3">
      {/* Información de Sumatoria */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs whitespace-nowrap">
        <span className="text-zinc-400 text-[11px] sm:text-xs">
          {selectedGastoIds.length} {selectedGastoIds.length === 1 ? 'ítem' : 'ítems'}:
        </span>
        <span className="font-semibold text-white tracking-tight font-mono text-xs sm:text-sm">
          {formatMoney(sumaSeleccionada, moneda)}
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      {/* Botones de Acción */}
      <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap overflow-x-auto no-scrollbar">
        <button
          onClick={() => executeMasivoAction({ action: 'cambiar_estado', estado: 'PAGADO' }, `${selectedGastoIds.length} marcados como pagado`)}
          disabled={loading}
          className="px-2 sm:px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition disabled:opacity-50"
          title="Marcar como pagado"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden min-[420px]:inline">Pagado</span>
        </button>

        <button
          onClick={() => executeMasivoAction({ action: 'cambiar_estado', estado: 'ADELANTADO' }, `${selectedGastoIds.length} marcados como adelantado`)}
          disabled={loading}
          className="px-2 sm:px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition disabled:opacity-50"
          title="Marcar como adelantado"
        >
          <FastForward className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden min-[420px]:inline">Adelantado</span>
        </button>

        <button
          onClick={() => executeMasivoAction({ action: 'cambiar_estado', estado: 'PENDIENTE' }, `${selectedGastoIds.length} marcados como pendiente`)}
          disabled={loading}
          className="px-2 sm:px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition disabled:opacity-50"
          title="Marcar como pendiente"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden min-[420px]:inline">Pendiente</span>
        </button>

        {/* Categoría Masiva */}
        <FloatingCategoryMenu
          categorias={categorias}
          open={menuCatOpen}
          loading={loading}
          onToggleOpen={handleOpenCategorias}
          onSelectCategory={(catId) => executeMasivoAction({ action: 'cambiar_categoria', categoriaId: catId }, `Categoría aplicada a ${selectedGastoIds.length} ítem(s)`)}
        />

        {/* Fuente de Pago Masiva */}
        <FloatingIncomeMenu
          ingresos={resumen?.ingresos || []}
          open={menuIngresoOpen}
          loading={loading}
          onToggleOpen={() => setMenuIngresoOpen((prev) => !prev)}
          onSelectIncome={handleAsignarIngresoMasivo}
        />

        {confirmDelete ? (
          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-lg text-xs animate-in fade-in">
            <span className="text-[11px] text-rose-200 font-medium">¿Eliminar {selectedGastoIds.length}?</span>
            <button
              onClick={() => {
                setConfirmDelete(false);
                executeMasivoAction({ action: 'eliminar' }, `${selectedGastoIds.length} gastos eliminados`);
              }}
              disabled={loading}
              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition cursor-pointer"
            >
              Sí
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] transition cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
            className="p-1 sm:p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
            title="Eliminar seleccionados"
            aria-label="Eliminar seleccionados"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={clearSelection}
          className="p-1 sm:p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition"
          title="Cerrar selección"
          aria-label="Cerrar selección"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
