'use client';

import React from 'react';
import { HeroPeriodoNav } from './HeroPeriodoNav';
import { Plus, Minus } from 'lucide-react';

interface FinanzasMesHeaderProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior?: boolean;
  esMesEspecial: boolean;
  labelEspecial?: string;
  openRecordModal: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function FinanzasMesHeader({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior = true,
  esMesEspecial,
  labelEspecial,
  openRecordModal,
}: FinanzasMesHeaderProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Navegación de Periodo centrada y limpia */}
      <div className="w-full md:w-auto flex justify-center md:justify-start">
        <HeroPeriodoNav
          periodo={periodo}
          irMesAnterior={irMesAnterior}
          irMesSiguiente={irMesSiguiente}
          puedeIrMesAnterior={puedeIrMesAnterior}
          esMesEspecial={esMesEspecial}
          labelEspecial={labelEspecial}
        />
      </div>

      {/* Botones de Acción Rápida con Jerarquía Clara */}
      <div className="flex items-center justify-center gap-2 w-full md:w-auto">
        <button
          onClick={() => openRecordModal('GASTO')}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-all active:scale-95 shadow-2xs cursor-pointer flex-1 md:flex-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Gasto</span>
        </button>

        <button
          onClick={() => openRecordModal('INGRESO')}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-background hover:bg-muted text-foreground border border-border/80 font-medium text-xs transition-all active:scale-95 shadow-2xs cursor-pointer flex-1 md:flex-none"
        >
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Ingreso</span>
        </button>
      </div>
    </div>
  );
}
