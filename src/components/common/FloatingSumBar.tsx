'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, FastForward, Clock, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export function FloatingSumBar() {
  const { selectedGastoIds, sumaSeleccionada, clearSelection, refresh, resumen } = useFinanzas();
  const [loading, setLoading] = useState(false);

  if (selectedGastoIds.length === 0) return null;

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  const handleCambiarEstado = async (estado: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar_estado',
          ids: selectedGastoIds,
          estado,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar gastos');
      toast.success(`${selectedGastoIds.length} marcados como ${estado.toLowerCase()}`);
      clearSelection();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar los ${selectedGastoIds.length} gastos seleccionados?`)) return;
    try {
      setLoading(true);
      const res = await fetch('/api/gastos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'eliminar',
          ids: selectedGastoIds,
        }),
      });

      if (!res.ok) throw new Error('Error al eliminar');
      toast.success(`${selectedGastoIds.length} gastos eliminados`);
      clearSelection();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] bg-zinc-950/90 text-zinc-100 backdrop-blur-md border border-zinc-800 shadow-xl rounded-xl px-4 py-2.5 flex items-center gap-4 transition-all animate-in fade-in slide-in-from-bottom-3">
      {/* Información de Sumatoria */}
      <div className="flex items-center gap-2.5 text-xs whitespace-nowrap">
        <span className="text-zinc-400">
          {selectedGastoIds.length} {selectedGastoIds.length === 1 ? 'ítem' : 'ítems'}:
        </span>
        <span className="font-semibold text-white tracking-tight font-mono text-sm">
          {formatMoney(sumaSeleccionada, moneda)}
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      {/* Botones de Acción */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={() => handleCambiarEstado('PAGADO')}
          disabled={loading}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          title="Marcar como pagado"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pagado</span>
        </button>

        <button
          onClick={() => handleCambiarEstado('ADELANTADO')}
          disabled={loading}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          title="Marcar como adelantado"
        >
          <FastForward className="w-3.5 h-3.5 text-indigo-400" />
          <span>Adelantado</span>
        </button>

        <button
          onClick={() => handleCambiarEstado('PENDIENTE')}
          disabled={loading}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          title="Marcar como pendiente"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Pendiente</span>
        </button>

        <button
          onClick={handleEliminar}
          disabled={loading}
          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg text-xs transition disabled:opacity-50"
          title="Eliminar seleccionados"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={clearSelection}
          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition"
          title="Cerrar selección"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
