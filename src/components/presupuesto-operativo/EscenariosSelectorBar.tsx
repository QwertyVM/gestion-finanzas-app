'use client';

import React, { useState } from 'react';
import { Scale, PartyPopper, ShieldCheck, Sparkles, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { ModalGuardarEscenario } from './ModalGuardarEscenario';
import type { EscenarioPresupuesto } from '@/lib/finanzas-service';

interface EscenariosSelectorBarProps {
  escenarios: EscenarioPresupuesto[];
  escenarioActivo: string;
  onSeleccionarEscenario: (id: string) => void;
  onGuardarNuevoEscenario: (nombre: string, descripcion: string, icono: string) => void;
  onEliminarEscenario: (id: string) => void;
  onResetear: () => void;
}

export function EscenariosSelectorBar({
  escenarios,
  escenarioActivo,
  onSeleccionarEscenario,
  onGuardarNuevoEscenario,
  onEliminarEscenario,
  onResetear,
}: EscenariosSelectorBarProps) {
  const [modalGuardarOpen, setModalGuardarOpen] = useState(false);

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
            Escenarios de Subsistencia
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Aplica un perfil con 1 clic, crea tus propios presets o ajusta sobres individuales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalGuardarOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Guardar como preset</span>
          </button>

          <button
            type="button"
            onClick={onResetear}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition cursor-pointer"
            title="Restablecer sobres y escenarios a valores de fábrica"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {escenarios.map((esc) => {
          const isActivo = escenarioActivo === esc.id;
          const IconComponent = getIcon(esc.id);

          return (
            <div
              key={esc.id}
              onClick={() => onSeleccionarEscenario(esc.id)}
              className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 group relative ${
                isActivo
                  ? 'bg-foreground text-background border-foreground shadow-xs font-semibold'
                  : 'bg-muted/30 border-border/60 hover:border-border text-foreground hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isActivo ? 'text-background' : 'text-primary'}`} />
                  <span className="text-xs font-semibold truncate">{esc.nombre}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {esc.esPersonalizado && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEliminarEscenario(esc.id);
                      }}
                      title="Eliminar este preset"
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                        isActivo ? 'hover:bg-background/20 text-background' : 'hover:bg-destructive/10 text-destructive'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  {isActivo && (
                    <span className="text-[10px] bg-background/20 px-1.5 py-0.2 rounded font-normal">
                      Activo
                    </span>
                  )}
                </div>
              </div>

              <p className={`text-[10px] line-clamp-2 leading-relaxed ${isActivo ? 'text-background/80' : 'text-muted-foreground'}`}>
                {esc.descripcion || 'Preset personalizado de usuario.'}
              </p>
            </div >
          );
})}
      </div >

  <ModalGuardarEscenario
    open={modalGuardarOpen}
    onClose={() => setModalGuardarOpen(false)}
    onGuardar={onGuardarNuevoEscenario}
  />
    </div >
  );
}
