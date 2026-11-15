'use client';

import React from 'react';
import {
  CreditCard,
  Landmark,
  Home,
  Banknote,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { ClasificacionEgreso, getEstiloClasificacion } from '@/lib/utils';

interface DetalleHeaderProps {
  concepto: string;
  tipo: 'TARJETA' | 'DIRECTO' | 'FIJO' | 'PRESTAMO';
  clasificacion: ClasificacionEgreso;
  editandoConcepto: boolean;
  conceptoEditInput: string;
  savingConcepto: boolean;
  onStartEditConcepto: () => void;
  onCancelEditConcepto: () => void;
  onChangeConceptoInput: (val: string) => void;
  onGuardarConcepto: () => void;
  onClose: () => void;
}

export function DetalleHeader({
  concepto,
  tipo,
  clasificacion,
  editandoConcepto,
  conceptoEditInput,
  savingConcepto,
  onStartEditConcepto,
  onCancelEditConcepto,
  onChangeConceptoInput,
  onGuardarConcepto,
  onClose,
}: DetalleHeaderProps) {
  const estilo = getEstiloClasificacion(clasificacion);

  const getTipoLabel = () => {
    switch (tipo) {
      case 'FIJO':
        return 'Costo Fijo Mensual';
      case 'PRESTAMO':
        return 'Préstamo Bancario';
      case 'TARJETA':
        return 'Compra con Tarjeta';
      default:
        return 'Gasto Directo';
    }
  };

  const renderIcono = () => {
    switch (tipo) {
      case 'FIJO':
        return <Home className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'PRESTAMO':
        return <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'TARJETA':
        return <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Banknote className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-xl border shrink-0 ${estilo.badgeBg} ${estilo.badgeBorder}`}>
          {renderIcono()}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {getTipoLabel()}
          </span>
          {!editandoConcepto ? (
            <div className="flex items-center gap-1.5 group">
              <h2 className="text-sm sm:text-base font-semibold text-foreground truncate max-w-[220px] sm:max-w-xs">
                {concepto}
              </h2>
              <button
                type="button"
                onClick={onStartEditConcepto}
                className="p-1 rounded text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition"
                title="Editar descripción"
                aria-label="Editar descripción"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onGuardarConcepto();
              }}
              className="flex items-center gap-1.5 mt-0.5"
            >
              <input
                type="text"
                value={conceptoEditInput}
                onChange={(e) => onChangeConceptoInput(e.target.value)}
                disabled={savingConcepto}
                placeholder="Descripción"
                className="text-xs font-semibold px-2 py-1 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-56"
                autoFocus
              />
              <button
                type="submit"
                disabled={savingConcepto || !conceptoEditInput.trim()}
                className="p-1 rounded bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition"
                title="Guardar"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={savingConcepto}
                onClick={onCancelEditConcepto}
                className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground transition"
                title="Cancelar"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition shrink-0"
        title="Cerrar detalle"
        aria-label="Cerrar detalle"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
