'use client';

import React from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import { DetalleCategoriaSelector } from './DetalleCategoriaSelector';
import { DetalleFechaPeriodoBox } from './DetalleFechaPeriodoBox';

interface DetallePropiedadesTarjetaProps {
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  tarjetaDiaCorte?: number;
  fechaGasto?: string;
  periodoPago?: string;
  categoria?: string;
  categoriaId?: string | null;
  categoriaColor?: string;
  tieneCuotas?: boolean;
  onCambiarCategoria?: (categoriaId: string, aplicarSerie?: boolean) => Promise<void>;
  onGuardarFechaPeriodo?: (nuevaFecha: string, nuevoPeriodo: string, aplicarSerie?: boolean) => Promise<void>;
}

export function DetallePropiedadesTarjeta({
  tarjetaNombre,
  tarjetaBanco,
  tarjetaDiaCorte = 10,
  fechaGasto,
  periodoPago,
  categoria,
  categoriaId,
  categoriaColor,
  tieneCuotas = false,
  onCambiarCategoria,
  onGuardarFechaPeriodo,
}: DetallePropiedadesTarjetaProps) {
  const diaConsumo = fechaGasto ? new Date(fechaGasto).getUTCDate() : null;
  const esAntesDeCorte = diaConsumo !== null ? diaConsumo <= tarjetaDiaCorte : true;
  const fechaFormatted = fechaGasto
    ? new Date(fechaGasto).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="space-y-2.5 text-xs">
      <div className="p-3 rounded-xl bg-card border border-border/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
            <span>{tarjetaNombre || 'Tarjeta de Crédito'} {tarjetaBanco ? `(${tarjetaBanco})` : ''}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            Corte: Día {tarjetaDiaCorte} · Pago: Fin de mes
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>Facturación de tarjeta</span>
          </div>
          {esAntesDeCorte ? (
            <p>
              Consumo registrado el <strong className="text-foreground">{fechaFormatted || `día ${diaConsumo}`}</strong> (hasta el corte). Se liquida a <span className="text-emerald-600 dark:text-emerald-400 font-semibold">finales de este mismo mes</span>.
            </p>
          ) : (
            <p>
              Consumo registrado después del corte. Se difiere a <span className="text-sky-600 dark:text-sky-400 font-semibold">finales del próximo mes</span>.
            </p>
          )}
        </div>
      </div>

      <DetalleFechaPeriodoBox
        fechaGasto={fechaGasto}
        periodoPago={periodoPago}
        tarjetaDiaCorte={tarjetaDiaCorte}
        esTarjeta={true}
        tieneCuotas={tieneCuotas}
        onGuardar={onGuardarFechaPeriodo}
        permitirEditar={Boolean(onGuardarFechaPeriodo)}
      />

      {/* CATEGORÍA */}
      <DetalleCategoriaSelector
        categoriaNombre={categoria}
        categoriaId={categoriaId}
        categoriaColor={categoriaColor}
        tieneCuotas={tieneCuotas}
        onCambiarCategoria={onCambiarCategoria || (async () => {})}
      />
    </div>
  );
}
