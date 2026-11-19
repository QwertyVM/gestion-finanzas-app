'use client';

import React, { useState } from 'react';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { Regla503020Card } from './Regla503020Card';
import { SaludFinancieraScorecard } from './SaludFinancieraScorecard';
import { AlertasConsultorCategorias } from './AlertasConsultorCategorias';
import { InstructivoGuiaTab } from './InstructivoGuiaTab';
import { ShieldCheck, PieChart, Activity, AlertCircle, BookOpen, ChevronDown } from 'lucide-react';

interface DashboardSaludSectionProps {
  salud?: SaludFinancieraKPIs;
  moneda: string;
  onOpenRecordModal?: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function DashboardSaludSection({
  salud,
  moneda,
  onOpenRecordModal,
}: DashboardSaludSectionProps) {
  const [colapsado, setColapsado] = useState(false);
  const [tabActiva, setTabActiva] = useState<'503020' | 'RATIOS' | 'ALERTAS' | 'GUIA'>('503020');

  if (!salud) return null;

  return (
    <div className="space-y-3 pt-2">
      {/* Barra de cabecera con selector de pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setColapsado(!colapsado)}
        >
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition">
            Diagnóstico &amp; Salud Financiera
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
              colapsado ? '-rotate-90' : ''
            }`}
          />
        </div>

        {!colapsado && (
          <div className="inline-flex p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setTabActiva('503020')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer whitespace-nowrap ${
                tabActiva === 'ALERTAS'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Alertas &amp; Fugas</span>
            </button>

            <button
              type="button"
              onClick={() => setTabActiva('GUIA')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer whitespace-nowrap ${
                tabActiva === 'GUIA'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Guía &amp; Registro</span>
            </button>
          </div>
        )}
      </div>

      {/* Contenido según pestaña (cuando no está colapsado) */}
      {!colapsado && (
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
          {tabActiva === 'GUIA' && (
            <InstructivoGuiaTab onOpenRecordModal={onOpenRecordModal} />
          )}
        </div>
      )}
    </div>
  );
}
