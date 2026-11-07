'use client';

import React, { useState } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { CheckCircle2, FastForward, Clock, Trash2, X, Calculator } from 'lucide-react';
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
      toast.success(`${selectedGastoIds.length} gastos marcados como ${estado}`);
      clearSelection();
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error en la operación masiva');
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

      if (!res.ok) throw new Error('Error al eliminar gastos');
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border border-slate-700/60 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* Información de Sumatoria Automática */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
          <Calculator className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>Sumatoria Automática</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/30 text-sky-300">
              {selectedGastoIds.length} {selectedGastoIds.length === 1 ? 'gasto' : 'gastos'}
            </span>
          </div>
          <div className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {formatMoney(sumaSeleccionada, moneda)}
          </div>
        </div>
      </div>

      {/* Botones de Acción Masiva */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={() => handleCambiarEstado('ADELANTADO')}
          disabled={loading}
          className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          title="Marcar como pagado antes de la fecha normal"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Adelantado</span>
        </button>

        <button
          onClick={() => handleCambiarEstado('PAGADO')}
          disabled={loading}
          className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          title="Marcar como pagado"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Pagado</span>
        </button>

        <button
          onClick={() => handleCambiarEstado('PENDIENTE')}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          title="Marcar como pendiente"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendiente</span>
        </button>

        <button
          onClick={handleEliminar}
          disabled={loading}
          className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition active:scale-95 disabled:opacity-50"
          title="Eliminar gastos seleccionados"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={clearSelection}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition"
          title="Desmarcar todos"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
