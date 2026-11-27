'use client';

import React from 'react';
import { HeroPeriodoNav } from './HeroPeriodoNav';
import { Plus, Calendar, Sparkles } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';

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
  const mesLabel = formatPeriodoLabel(periodo);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* 1. Izquierda: Título y Contexto Ejecutivo del Mes (Adaptativo Desktop / Mobile) */}
      <div className="w-full md:w-auto flex flex-col md:flex-row items-center md:items-start gap-3">
        {/* En móvil: Controles directos de navegación rápida */}
        <div className="md:hidden w-full flex justify-center">
          <HeroPeriodoNav
            periodo={periodo}
            irMesAnterior={irMesAnterior}
            irMesSiguiente={irMesSiguiente}
            puedeIrMesAnterior={puedeIrMesAnterior}
            esMesEspecial={esMesEspecial}
            labelEspecial={labelEspecial}
          />
        </div>

        {/* En Desktop: Título limpio con badge para no duplicar los botones del sidebar */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight capitalize">
                Finanzas de {mesLabel}
              </h1>
              {esMesEspecial && labelEspecial && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{labelEspecial}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control mensual de compromisos, compras e ingresos asignados
            </p>
          </div>
        </div>
      </div>

      {/* 2. Botones de Acción Rápida con Jerarquía Clara */}
      <div className="flex items-center justify-center gap-2 w-full md:w-auto">
        <button
          onClick={() => openRecordModal('GASTO')}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-all active:scale-95 shadow-2xs cursor-pointer flex-1 md:flex-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Gasto</span>
          <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.2 text-[10px] bg-background/20 rounded font-mono font-normal">
            N
          </kbd>
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
