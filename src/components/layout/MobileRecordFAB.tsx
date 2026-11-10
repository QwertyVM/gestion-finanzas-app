'use client';

import React from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { Plus } from 'lucide-react';

export function MobileRecordFAB() {
  const { openRecordModal, selectedGastoIds, isRecordModalOpen } = useFinanzas();

  // Si el modal dinámico ya está abierto, no renderizar el botón flotante
  if (isRecordModalOpen) return null;

  const hasSelection = selectedGastoIds.length > 0;

  return (
    <div
      className={`fixed md:hidden z-40 transition-all duration-300 ease-out ${
        hasSelection ? 'bottom-20 right-4' : 'bottom-6 right-4'
      }`}
    >
      <button
        onClick={() => openRecordModal('GASTO')}
        className="flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-foreground text-background shadow-2xl border border-border/40 hover:opacity-95 active:scale-95 transition-all group"
        aria-label="Registrar nuevo movimiento"
      >
        <div className="w-5 h-5 rounded-full bg-background/20 text-background flex items-center justify-center transition-transform group-hover:rotate-90">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold tracking-tight">Registro</span>
      </button>
    </div>
  );
}
