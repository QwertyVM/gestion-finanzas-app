'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Lock, Unlock, Sparkles } from 'lucide-react';
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
  const esBolsilloOcio = sobre.id === 'BOLSILLO_OCIO' || /bolsillo|ocio/i.test(sobre.nombre);

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
    <div
      className={`bg-card rounded-xl p-3 shadow-2xs space-y-2 flex flex-col justify-between transition border ${
        esBolsilloOcio
          ? 'border-purple-300/80 dark:border-purple-700/60 ring-1 ring-purple-500/10'
          : 'border-border/80 hover:border-border'
      }`}
    >
      <div className="space-y-2">
        {/* Header con icono, título y acciones */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${sobre.color}20`, color: sobre.color }}
            >
              <IconComponent className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-bold text-foreground truncate">{sobre.nombre}</h4>
                {esBolsilloOcio && (
                  <span className="text-[8px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-1 py-0.1 rounded-full shrink-0 flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" />
                    <span>Runway</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{sobre.descripcion}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {onToggleBloqueo && (
              <button
                type="button"
                onClick={() => onToggleBloqueo(sobre.id)}
                title={sobre.bloqueado ? 'Fijado con candado' : 'Fijar monto'}
                className={`p-1 rounded transition cursor-pointer ${
                  sobre.bloqueado
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                {sobre.bloqueado ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => onEditar(sobre)}
              title="Editar sobre"
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Input de Soles + Porcentaje */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-muted-foreground">Part.:</span>
            <span className="font-bold text-foreground px-1 py-0.2 rounded bg-muted/60 text-[10px]">
              {Number.isInteger(sobre.porcentaje) ? sobre.porcentaje : sobre.porcentaje.toFixed(1)}%
            </span>
            {sobre.bloqueado && (
              <span className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                Fijado
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 border rounded-md px-1.5 py-0.5 ${
              sobre.bloqueado
                ? 'bg-muted/15 border-border/40 opacity-75'
                : 'bg-muted/30 border-border/70 focus-within:ring-1 focus-within:ring-primary'
            }`}
          >
            <span className="text-[11px] font-bold font-mono text-muted-foreground">{moneda}</span>
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
              className={`w-20 text-right font-mono text-xs font-bold bg-transparent text-foreground focus:outline-hidden ${
                sobre.bloqueado ? 'cursor-not-allowed text-muted-foreground' : ''
              }`}
            />
          </div>
        </div>

        {/* Slider compacto */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={sobre.porcentaje}
          disabled={sobre.bloqueado}
          onChange={(e) => onActualizarPorcentaje(sobre.id, Number(e.target.value))}
          className={`w-full h-1 rounded-lg transition ${
            sobre.bloqueado
              ? 'accent-amber-500/50 bg-muted/40 opacity-50 cursor-not-allowed'
              : 'accent-primary bg-muted cursor-pointer'
          }`}
        />
      </div>

      {/* Ritmo Semanal y Diario en una sola línea limpia */}
      <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>Sem: <strong className="text-foreground">{formatMoney(sobre.montoSemanal, moneda)}</strong></span>
        <span>Día: <strong className="text-foreground">{formatMoney(sobre.montoDiario, moneda)}</strong></span>
      </div>
    </div>
  );
}
