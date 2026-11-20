'use client';

import React from 'react';
import { Scale, PartyPopper, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react';
import type { EscenarioPresupuesto } from '@/lib/finanzas-service';

interface EscenariosSelectorBarProps {
  escenarios: EscenarioPresupuesto[];
  escenarioActivo: string;
  onSeleccionarEscenario: (id: string) => void;
  onResetear: () => void;
}

export function EscenariosSelectorBar({
  escenarios,
  escenarioActivo,
  onSeleccionarEscenario,
  onResetear,
}: EscenariosSelectorBarProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'EQUILIBRADO':
        return Scale;
      case 'FIESTAS':
        return PartyPopper;
      case 'AUSTERO':
        return ShieldCheck;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Escenarios Preconfigurados de Subsistencia
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Aplica un perfil con 1 clic o desliza los controles individuales en los sobres.
          </p>
        </div>

        {escenarioActivo === 'PERSONALIZADO' && (
          <button
            type="button"
            onClick={onResetear}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer sugerido</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {escenarios.map((esc) => {
          const isActivo = escenarioActivo === esc.id;
          const IconComponent = getIcon(esc.id);

          return (
            <button
              key={esc.id}
              type="button"
              onClick={() => onSeleccionarEscenario(esc.id)}
              className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                isActivo
                  ? 'bg-foreground text-background border-foreground shadow-xs font-semibold'
                  : 'bg-muted/30 border-border/60 hover:border-border text-foreground hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-3.5 h-3.5 ${isActivo ? 'text-background' : 'text-primary'}`} />
                  <span className="text-xs font-semibold">{esc.nombre}</span>
                </div>
                {isActivo && (
                  <span className="text-[10px] bg-background/20 px-1.5 py-0.2 rounded font-normal">
                    Activo
                  </span>
                )}
              </div>
              <p className={`text-[10px] line-clamp-2 leading-relaxed ${isActivo ? 'text-background/80' : 'text-muted-foreground'}`}>
                {esc.descripcion}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
