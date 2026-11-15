'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatPeriodoLabel } from '@/lib/utils';
import { useFinanzas } from '@/context/FinanzasContext';

interface ModalEditarSueldoProps {
  isOpen: boolean;
  onClose: () => void;
  sueldoActual: number;
  periodoActual: string;
  monedaSimbolo?: string;
  onSueldoActualizado?: () => void;
}

export function ModalEditarSueldo({
  isOpen,
  onClose,
  sueldoActual,
  periodoActual,
  monedaSimbolo = 'S/',
  onSueldoActualizado,
}: ModalEditarSueldoProps) {
  const { refresh } = useFinanzas();
  const [nuevoSueldo, setNuevoSueldo] = useState<string>(String(sueldoActual || ''));
  const [modo, setModo] = useState<'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO'>('ACTUAL');
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState<string>(periodoActual || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNuevoSueldo(String(sueldoActual || ''));
      setModo('ACTUAL');
      setPeriodoPersonalizado(periodoActual || '');
    }
  }, [isOpen, sueldoActual, periodoActual]);

  if (!isOpen) return null;

  const [y, m] = (periodoActual || '').split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  const proximoPeriodo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(nuevoSueldo);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Por favor ingresa un sueldo válido');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/usuarios/sueldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevoSueldo: parsed,
          modo,
          periodoActual,
          periodoPersonalizado,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar el sueldo');
      }

      const data = await res.json();
      toast.success(`Sueldo actualizado a partir de ${formatPeriodoLabel(data.periodoDesde)}`);
      if (onSueldoActualizado) {
        onSueldoActualizado();
      }
      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-card-foreground p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Modificar Sueldo Mensual</h3>
              <p className="text-[11px] text-muted-foreground">Configura el nuevo sueldo y su vigencia temporal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Nuevo Sueldo Mensual ({monedaSimbolo})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              value={nuevoSueldo}
              onChange={(e) => setNuevoSueldo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              ¿A partir de qué mes aplicar el cambio?
            </label>
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ACTUAL">
                A partir del mes actual ({formatPeriodoLabel(periodoActual)})
              </option>
              <option value="PROXIMO">
                A partir del próximo mes ({formatPeriodoLabel(proximoPeriodo)})
              </option>
              <option value="PERSONALIZADO">Personalizado (elegir mes específico)</option>
            </select>
          </div>

          {modo === 'PERSONALIZADO' && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <label className="text-[11px] font-semibold text-foreground block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Mes de inicio de la vigencia</span>
              </label>
              <input
                type="month"
                required
                value={periodoPersonalizado}
                onChange={(e) => setPeriodoPersonalizado(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
            Los meses anteriores a la fecha seleccionada mantendrán su sueldo histórico intacto y no serán alterados.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
