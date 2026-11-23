'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Lock, Unlock } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { getPresupuestoIcon } from './iconHelper';
import type { SobreGastoOperativo } from '@/lib/finanzas-service';

interface SobreGastoCardProps {
  sobre: SobreGastoOperativo;
  moneda: string;
  capitalTotal: number;
  onActualizarPorcentaje: (sobreId: string, nuevoPct: number) => void;
  onActualizarMonto: (sobreId: string, nuevoMonto: number) => void;
  onEditar: (sobre: SobreGastoOperativo) => void;
  onToggleBloqueo?: (sobreId: string) => void;
}

export function SobreGastoCard({
  sobre,
  moneda,
  capitalTotal,
  onActualizarPorcentaje,
  onActualizarMonto,
  onEditar,
  onToggleBloqueo,
}: SobreGastoCardProps) {
  const IconComponent = getPresupuestoIcon(sobre.icono);
  const [montoInput, setMontoInput] = useState<string>(
    Number.isInteger(sobre.monto) ? sobre.monto.toString() : sobre.monto.toFixed(2)
  );

  useEffect(() => {
    setMontoInput(
      Number.isInteger(sobre.monto) ? sobre.monto.toString() : sobre.monto.toFixed(2)
    );
  }, [sobre.monto]);

  const handleBlurMonto = () => {
    const val = parseFloat(montoInput);
    if (!isNaN(val) && val >= 0) {
      onActualizarMonto(sobre.id, Number(val.toFixed(2)));
    } else {
      setMontoInput(
        Number.isInteger(sobre.monto) ? sobre.monto.toString() : sobre.monto.toFixed(2)
      );
    }
  };

  const handleKeyDownMonto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-border transition">
      <div className="space-y-2">
        {/* Header con icono, título y botón editar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${sobre.color}20`, color: sobre.color }}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{sobre.nombre}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{sobre.descripcion}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleBloqueo && (
              <button
                type="button"
                onClick={() => onToggleBloqueo(sobre.id)}
                title={
                  sobre.bloqueado
                    ? 'Sobre fijado con candado. Haz clic para desbloquearlo.'
                    : 'Fijar porcentaje con candado para que no cambie al ajustar otros sobres'
                }
                className={`p-1 rounded-md transition cursor-pointer ${sobre.bloqueado
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted'
                  }`}
              >
                {sobre.bloqueado ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onEditar(sobre)}
              title="Editar sobre"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input directo de Monto en Soles */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">Monto Asignado:</span>
          <div
            className={`flex items-center gap-1 border rounded-lg px-2 py-0.5 ${sobre.bloqueado
              ? 'bg-muted/15 border-border/40 opacity-75'
              : 'bg-muted/30 border-border/70 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary'
              }`}
          >
            <span className="text-xs font-bold font-mono text-muted-foreground">{moneda}</span>
            <input
              type="number"
              step="any"
              min="0"
              max={capitalTotal * 2}
              value={montoInput}
              disabled={sobre.bloqueado}
              onChange={(e) => setMontoInput(e.target.value)}
              onBlur={handleBlurMonto}
              onKeyDown={handleKeyDownMonto}
              className={`w-24 text-right font-mono text-sm font-bold bg-transparent text-foreground focus:outline-hidden ${sobre.bloqueado ? 'cursor-not-allowed text-muted-foreground' : ''
                }`}
            />
          </div>
        </div>

        {/* Slider interactivo y porcentaje sincronizado */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Participación</span>
              {sobre.bloqueado && (
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded inline-flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  Fijado
                </span>
              )}
            </div>
            <span className="font-bold text-foreground px-1.5 py-0.2 rounded bg-muted/60">
              {Number.isInteger(sobre.porcentaje) ? sobre.porcentaje : sobre.porcentaje.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={sobre.porcentaje}
            disabled={sobre.bloqueado}
            onChange={(e) => onActualizarPorcentaje(sobre.id, Number(e.target.value))}
            className={`w-full h-1.5 rounded-lg transition ${sobre.bloqueado
              ? 'accent-amber-500/50 bg-muted/40 opacity-50 cursor-not-allowed'
              : 'accent-primary bg-muted cursor-pointer'
              }`}
          />
        </div>
      </div>

      {/* Ritmo Semanal y Diario del Sobre */}
      <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="p-1.5 rounded bg-muted/30">
          <span className="text-muted-foreground block text-[9px] uppercase">Por semana</span>
          <span className="font-bold text-foreground">{formatMoney(sobre.montoSemanal, moneda)}</span>
        </div>
        <div className="p-1.5 rounded bg-muted/30">
          <span className="text-muted-foreground block text-[9px] uppercase">Por día</span>
          <span className="font-bold text-foreground">{formatMoney(sobre.montoDiario, moneda)}</span>
        </div>
      </div>
    </div>
  );
}
