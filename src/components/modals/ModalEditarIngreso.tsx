'use client';

import React from 'react';
import { DollarSign, Loader2, X, Check, Trash2 } from 'lucide-react';
import type { IngresoItem } from '@/components/dashboard/IngresoCardMobile';
import { EditarIngresoCampos } from './ingreso/EditarIngresoCampos';
import { useEditarIngresoForm } from './ingreso/useEditarIngresoForm';

interface ModalEditarIngresoProps {
  ingreso: IngresoItem | null;
  isOpen: boolean;
  onClose: () => void;
  moneda?: string;
  periodoActual: string;
  onEliminarIngreso?: (id: string) => void;
}

export function ModalEditarIngreso({
  ingreso,
  isOpen,
  onClose,
  moneda = 'S/',
  periodoActual,
  onEliminarIngreso,
}: ModalEditarIngresoProps) {
  const {
    concepto,
    setConcepto,
    monto,
    setMonto,
    fecha,
    setFecha,
    recibido,
    setRecibido,
    modoSueldo,
    setModoSueldo,
    periodoPersonalizado,
    setPeriodoPersonalizado,
    saving,
    esSueldo,
    handleSubmit,
  } = useEditarIngresoForm(ingreso, periodoActual, onClose);

  if (!isOpen || !ingreso) return null;

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
              <h3 className="font-bold text-sm text-foreground">Editar Ingreso</h3>
              <p className="text-[11px] text-muted-foreground">{ingreso.concepto}</p>
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
          <EditarIngresoCampos
            esSueldo={esSueldo}
            concepto={concepto}
            monto={monto}
            fecha={fecha}
            recibido={recibido}
            moneda={moneda}
            periodoActual={periodoActual}
            modoSueldo={modoSueldo}
            periodoPersonalizado={periodoPersonalizado}
            onConceptoChange={setConcepto}
            onMontoChange={setMonto}
            onFechaChange={setFecha}
            onRecibidoChange={setRecibido}
            onModoSueldoChange={setModoSueldo}
            onPeriodoPersonalizadoChange={setPeriodoPersonalizado}
          />

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            {!esSueldo && onEliminarIngreso ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEliminarIngreso(ingreso.id);
                }}
                className="text-rose-500 hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
