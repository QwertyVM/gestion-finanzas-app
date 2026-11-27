'use client';

import React from 'react';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet, Landmark } from 'lucide-react';

interface ExecutiveGeneralKpisProps {
  totalIngresos: number;
  sueldoBase: number;
  totalEgresos: number;
  totalPendiente: number;
  totalAdelantado: number;
  disponibleNeto: number;
  disponibleEsPositivo: boolean;
  deudaTotalConsolidada: number;
  prestamosActivosCount: number;
  moneda: string;
}

export function ExecutiveGeneralKpis({
  totalIngresos,
  sueldoBase,
  totalEgresos,
  totalPendiente,
  totalAdelantado,
  disponibleNeto,
  disponibleEsPositivo,
  deudaTotalConsolidada,
  prestamosActivosCount,
  moneda,
}: ExecutiveGeneralKpisProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Ingresos */}
      <Link
        href="/finanzas-mes"
        className="group bg-card hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 shadow-2xs space-y-1.5 transition active:scale-[0.98] cursor-pointer"
        title="Ver ingresos en Finanzas del Mes"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Ingresos
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-emerald-600 transition" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {formatMoney(totalIngresos, moneda)}
        </div>
        <span className="text-[11px] text-muted-foreground block">
          Base sueldo: {formatMoney(sueldoBase, moneda)}
        </span>
      </Link>

      {/* 2. Egresos */}
      <Link
        href="/finanzas-mes"
        className="group bg-card hover:bg-sky-50/30 dark:hover:bg-sky-950/20 border border-sky-500/20 rounded-2xl p-4 shadow-2xs space-y-1.5 transition active:scale-[0.98] cursor-pointer"
        title="Gestionar egresos en Finanzas del Mes"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Egresos
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-sky-600 transition" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {formatMoney(totalEgresos, moneda)}
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
          <span>{formatMoney(totalPendiente, moneda)} pendientes</span>
          {totalAdelantado > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              · ⚡ {formatMoney(totalAdelantado, moneda)}
            </span>
          )}
        </div>
      </Link>

      {/* 3. Dinero Libre */}
      <Link
        href="/presupuesto-operativo"
        className="group bg-card hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 shadow-2xs space-y-1.5 transition active:scale-[0.98] cursor-pointer"
        title="Distribuir remanente en Presupuesto Operativo"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Dinero Libre
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-indigo-600 transition" />
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums ${
            disponibleEsPositivo
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {formatMoney(disponibleNeto, moneda)}
        </div>
        <span className="text-[11px] text-muted-foreground block truncate">
          {totalAdelantado > 0 ? 'Disponible neto real de tu sueldo' : 'Ingresos menos egresos netos'}
        </span>
      </Link>

      {/* 4. Deuda en Préstamos */}
      <Link
        href="/fijos-y-prestamos"
        className="group bg-card hover:bg-purple-50/30 dark:hover:bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 shadow-2xs space-y-1.5 transition active:scale-[0.98] cursor-pointer"
        title="Ver préstamos y cronogramas de amortización"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Deuda Total
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-purple-600 transition" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {formatMoney(deudaTotalConsolidada, moneda)}
        </div>
        <span className="text-[11px] text-muted-foreground block">
          {prestamosActivosCount} {prestamosActivosCount === 1 ? 'crédito activo' : 'créditos activos'}
        </span>
      </Link>
    </div>
  );
}
