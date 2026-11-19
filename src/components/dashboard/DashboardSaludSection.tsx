'use client';

import React, { useState } from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { Regla503020Card } from './Regla503020Card';
import { SaludFinancieraScorecard } from './SaludFinancieraScorecard';
import { AlertasConsultorCategorias } from './AlertasConsultorCategorias';
import { ShieldCheck, PieChart, Activity, AlertCircle } from 'lucide-react';

interface DashboardSaludSectionProps {
  salud?: SaludFinancieraKPIs;
  moneda: string;
}

export function DashboardSaludSection({ salud, moneda }: DashboardSaludSectionProps) {
  const [tabActiva, setTabActiva] = useState<'503020' | 'RATIOS' | 'ALERTAS'>('503020');

  if (!salud) return null;

  return (
    <div className="space-y-3">
      {/* Selector de pestañas de salud mensual */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Salud Financiera del Mes
          </span>
        </div>

        <div className="inline-flex p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTabActiva('503020')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
              tabActiva === '503020'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PieChart className="w-3 h-3" />
            <span>Regla 50/30/20</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('RATIOS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
              tabActiva === 'RATIOS'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Ratios &amp; DTI</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('ALERTAS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
              tabActiva === 'ALERTAS'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Alertas &amp; Fugas</span>
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      <div className="animate-in fade-in duration-150">
        {tabActiva === '503020' && (
          <Regla503020Card regla={salud.regla503020} moneda={moneda} />
        )}
        {tabActiva === 'RATIOS' && (
          <SaludFinancieraScorecard salud={salud} moneda={moneda} />
        )}
        {tabActiva === 'ALERTAS' && (
          <AlertasConsultorCategorias alertas={salud.alertasCategorias} moneda={moneda} />
        )}
      </div>
    </div>
  );
}
