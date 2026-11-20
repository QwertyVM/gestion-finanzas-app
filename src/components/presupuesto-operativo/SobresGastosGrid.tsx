'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Utensils, Fuel, ShieldAlert, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SobreGastoOperativo } from '@/lib/finanzas-service';

interface SobresGastosGridProps {
  sobres: SobreGastoOperativo[];
  moneda: string;
  sumaPorcentajes: number;
  sumaMontos: number;
  capitalTotal: number;
  descuadrePorcentaje: number;
  onActualizarPorcentaje: (sobreId: string, nuevoPct: number) => void;
}

export function SobresGastosGrid({
  sobres,
  moneda,
  sumaPorcentajes,
  sumaMontos,
  capitalTotal,
  descuadrePorcentaje,
  onActualizarPorcentaje,
}: SobresGastosGridProps) {
  const getIcon = (icono: string) => {
    switch (icono) {
      case 'Utensils':
        return Utensils;
      case 'Fuel':
        return Fuel;
      case 'ShieldAlert':
        return ShieldAlert;
      case 'Coffee':
        return Coffee;
      default:
        return Utensils;
    }
  };

  const estaCuadrado = sumaPorcentajes === 100;

  return (
    <div className="space-y-3">
      {/* Barra de Validación de Cuadre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2">
          {estaCuadrado ? (
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <span className="text-xs font-bold text-foreground">
              {estaCuadrado ? 'Distribución 100% Cuadrada' : 'Ajuste de Sobres Pendiente'}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              {estaCuadrado
                ? `Todo el capital disponible (${formatMoney(capitalTotal, moneda)}) está asignado a sobres.`
                : descuadrePorcentaje > 0
                  ? `Falta asignar ${descuadrePorcentaje}% (${formatMoney((capitalTotal * descuadrePorcentaje) / 100, moneda)}) para completar el 100%.`
                  : `Has sobreasignado ${Math.abs(descuadrePorcentaje)}% (${formatMoney((capitalTotal * Math.abs(descuadrePorcentaje)) / 100, moneda)}) por encima del saldo.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs font-bold">
          <span className={`px-2 py-0.5 rounded ${estaCuadrado ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
            {sumaPorcentajes}% / 100%
          </span>
          <span className="text-foreground">
            {formatMoney(sumaMontos, moneda)}
          </span>
        </div>
      </div>

      {/* Grid de 4 Sobres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sobres.map((s) => {
          const IconComponent = getIcon(s.icono);

          return (
            <div
              key={s.id}
              className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                {/* Header del Sobre */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${s.color}20`, color: s.color }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{s.nombre}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{s.descripcion}</p>
                    </div>
                  </div>

                  <span className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums shrink-0">
                    {formatMoney(s.monto, moneda)}
                  </span>
                </div>

                {/* Slider interactivo y porcentaje */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">Porcentaje asignado</span>
                    <span className="font-bold text-foreground">{s.porcentaje}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={s.porcentaje}
                    onChange={(e) => onActualizarPorcentaje(s.id, Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Ritmo Semanal y Diario del Sobre */}
              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-muted/30">
                  <span className="text-muted-foreground block text-[9px] uppercase">Por semana</span>
                  <span className="font-bold text-foreground">{formatMoney(s.montoSemanal, moneda)}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/30">
                  <span className="text-muted-foreground block text-[9px] uppercase">Por día</span>
                  <span className="font-bold text-foreground">{formatMoney(s.montoDiario, moneda)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
