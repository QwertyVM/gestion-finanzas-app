'use client';

import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
}

export function SobreGastoCard({
  sobre,
  moneda,
  capitalTotal,
  onActualizarPorcentaje,
  onActualizarMonto,
  onEditar,
}: SobreGastoCardProps) {
  const IconComponent = getPresupuestoIcon(sobre.icono);
  const [montoInput, setMontoInput] = useState<string>(sobre.monto.toFixed(2));

  useEffect(() => {
    setMontoInput(sobre.monto.toFixed(2));
  }, [sobre.monto]);

  const handleBlurMonto = () => {
    const val = parseFloat(montoInput);
    if (!isNaN(val) && val >= 0) {
      onActualizarMonto(sobre.id, Number(val.toFixed(2)));
    } else {
      setMontoInput(sobre.monto.toFixed(2));
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

          <button
            type="button"
            onClick={() => onEditar(sobre)}
            title="Editar sobre"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input directo de Monto en Soles */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">Monto Asignado:</span>
          <div className="flex items-center gap-1 bg-muted/30 border border-border/70 rounded-lg px-2 py-0.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <span className="text-xs font-bold font-mono text-muted-foreground">{moneda}</span>
            <input
              type="number"
              step="1"
              min="0"
              max={capitalTotal * 2}
              value={montoInput}
              onChange={(e) => setMontoInput(e.target.value)}
              onBlur={handleBlurMonto}
              onKeyDown={handleKeyDownMonto}
              className="w-24 text-right font-mono text-sm font-bold bg-transparent text-foreground focus:outline-hidden"
            />
          </div>
        </div>

        {/* Slider interactivo y porcentaje sincronizado */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-muted-foreground">Participación</span>
            <span className="font-bold text-foreground px-1.5 py-0.2 rounded bg-muted/60">
              {sobre.porcentaje}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sobre.porcentaje}
            onChange={(e) => onActualizarPorcentaje(sobre.id, Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
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
