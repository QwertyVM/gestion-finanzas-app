'use client';

import React from 'react';
import Link from 'next/link';
import { formatPeriodoLabel } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Tag,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { TabView } from './hooks/useExecutiveData';

const COMPROMISO_BADGE_STYLES: Record<string, string> = {
  BAJO: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  MODERADO: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
  ALTO: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  CRITICO: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
};

interface ExecutiveDashboardHeaderProps {
  periodo: string;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior: boolean;
  prefetchMesAnterior: () => void;
  prefetchMesSiguiente: () => void;
  esMesEspecial: boolean;
  labelEspecial: string;
  tabActiva: TabView;
  onTabChange: (tab: TabView) => void;
  totalCategorias: number;
  nivelCompromiso?: string;
  porcentajeComprometido?: number;
}

export function ExecutiveDashboardHeader({
  periodo,
  irMesAnterior,
  irMesSiguiente,
  puedeIrMesAnterior,
  prefetchMesAnterior,
  prefetchMesSiguiente,
  esMesEspecial,
  labelEspecial,
  tabActiva,
  onTabChange,
  totalCategorias,
  nivelCompromiso,
  porcentajeComprometido,
}: ExecutiveDashboardHeaderProps) {
  const badgeCompromiso = nivelCompromiso
    ? COMPROMISO_BADGE_STYLES[nivelCompromiso] || COMPROMISO_BADGE_STYLES.MODERADO
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Dashboard Financiero
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground capitalize">
              {formatPeriodoLabel(periodo)}
            </span>
            {nivelCompromiso && badgeCompromiso && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeCompromiso}`}
                title={`Nivel de compromiso: ${porcentajeComprometido}% de egresos fijos y deudas`}
              >
                Compromiso {nivelCompromiso}
              </span>
            )}
            {esMesEspecial && labelEspecial && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{labelEspecial}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inteligencia visual, análisis por categorías, tags y compromisos del mes.
          </p>
        </div>

        {/* Acciones del lado derecho: Selector móvil o enlace a finanzas-mes en desktop */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* En Móvil: Selector de navegación temporal rápido */}
          <div className="md:hidden inline-flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-medium border border-border/50">
            <button
              type="button"
              onClick={irMesAnterior}
              onMouseEnter={prefetchMesAnterior}
              disabled={!puedeIrMesAnterior}
              className={`p-1.5 rounded-lg transition ${
                puedeIrMesAnterior
                  ? 'hover:text-foreground text-muted-foreground cursor-pointer'
                  : 'text-muted-foreground/30 cursor-not-allowed opacity-40'
              }`}
              title={puedeIrMesAnterior ? 'Mes anterior' : 'Primer mes con registros'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="capitalize px-2 text-foreground font-semibold">
              {formatPeriodoLabel(periodo)}
            </span>
            <button
              type="button"
              onClick={irMesSiguiente}
              onMouseEnter={prefetchMesSiguiente}
              className="p-1.5 hover:text-foreground text-muted-foreground rounded-lg transition cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* En Desktop: Acceso rápido a gestionar los gastos del mes */}
          <Link
            href="/finanzas-mes"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition active:scale-95 shadow-2xs cursor-pointer"
          >
            <span>Ver finanzas del mes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onTabChange('general')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            tabActiva === 'general'
              ? 'bg-background text-foreground shadow-2xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Visión General</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('categorias')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            tabActiva === 'categorias'
              ? 'bg-background text-foreground shadow-2xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Categorías</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
            {totalCategorias}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('tags')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            tabActiva === 'tags'
              ? 'bg-background text-foreground shadow-2xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tags & Clasificación</span>
          <div className="flex items-center -space-x-1 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          </div>
        </button>
      </div>
    </div>
  );
}
