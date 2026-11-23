'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { Coffee, CalendarDays, Clock, Zap, Calendar } from 'lucide-react';
import type { SemanaRunwayItem } from '@/lib/finanzas-service';
import { RunwaySemanasGrid } from './RunwaySemanasGrid';

interface RunwayVelocimetroCardProps {
  nombreMesDestino: string;
  diasTotales: number;
  semanasTotales: number;
  limiteDiario: number;
  limiteSemanal: number;
  desgloseSemanas: SemanaRunwayItem[];
  moneda: string;
  diaPagoSueldo?: number;
  nombreSobre?: string;
  montoAsignado?: number;
  porcentajeAsignado?: number;
  onCambiarDiaPago?: (dia: number) => void;
}

export function RunwayVelocimetroCard({
  nombreMesDestino,
  diasTotales,
  semanasTotales,
  limiteDiario,
  limiteSemanal,
  desgloseSemanas,
  moneda,
  diaPagoSueldo = 30,
  nombreSobre = 'Bolsillo Personal & Ocio Flexible',
  montoAsignado = 0,
  porcentajeAsignado = 0,
  onCambiarDiaPago,
}: RunwayVelocimetroCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Ritmo de Ocio &amp; Runway Personal ({nombreMesDestino})
                    </h3>
                    <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>{nombreSobre}:</span>
                      <strong className="font-mono">{formatMoney(montoAsignado, moneda)}</strong>
                      <span>({porcentajeAsignado}%)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Velocidad máxima de gasto personal sin comprometer despensa, combustible ni compromisos fijos.
                  </p>
                </div>
              </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {onCambiarDiaPago && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/60">
                      <Calendar className="w-3 h-3 text-purple-500" />
                      <span>Día de cobro:</span>
                      <select
                        value={diaPagoSueldo}
                        onChange={(e) => onCambiarDiaPago(Number(e.target.value))}
                        className="bg-transparent font-bold text-foreground focus:outline-hidden cursor-pointer"
                      >
                        {[20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d) => (
                          <option key={d} value={d} className="bg-card text-foreground">
                            Día {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded">
                  {diasTotales} días · {semanasTotales} sem.
                </span>
              </div>
            </div>

                  {/* Métricas Destacadas: Diario vs Semanal de Ocio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span>Tope Diario de Ocio</span>
                        </span>
                        <div className="text-xl sm:text-2xl font-bold font-mono text-purple-900 dark:text-purple-200 tabular-nums">
                          {formatMoney(limiteDiario, moneda)}
                          <span className="text-xs font-normal text-muted-foreground"> / día</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Café diario, meriendas fuera o compras de impulso sin culpa.
                        </p>
                      </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                      </div>

                          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-indigo-500" />
                                <span>Tope Semanal de Ocio</span>
                              </span>
                              <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums">
                                {formatMoney(limiteSemanal, moneda)}
                                <span className="text-xs font-normal text-muted-foreground"> / sem</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                Para salidas de fin de semana, cenas, cine o entretenimiento.
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* Desglose de semanas */}
                        <RunwaySemanasGrid desgloseSemanas={desgloseSemanas} moneda={moneda} />
                      </div>
                      );
}
