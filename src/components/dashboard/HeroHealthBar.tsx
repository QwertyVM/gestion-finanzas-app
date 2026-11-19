'use client';

import React from 'react';
import Link from 'next/link';
import type { SaludFinancieraKPIs } from '@/lib/finanzas-service';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroHealthBarProps {
  salud?: SaludFinancieraKPIs;
}

export function HeroHealthBar({ salud }: HeroHealthBarProps) {
  if (!salud) return null;

  return (
    <div className="mt-4 pt-3.5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          Salud:
        </span>
        <span>
          DTI: <strong className="font-mono text-foreground">{salud.dti.porcentaje}%</strong>
        </span>
        <span className="text-border">·</span>
        <span>
          Rigidez: <strong className="font-mono text-foreground">{salud.rigidez.porcentaje}%</strong>
        </span>
        <span className="text-border">·</span>
        <span>
          50/30/20: <strong className="font-mono text-foreground">
            {salud.regla503020.necesidades.porcentaje}% / {salud.regla503020.deseos.porcentaje}% / {salud.regla503020.ahorroYDeuda.porcentaje}%
          </strong>
        </span>
      </div>
      <Link
        href="/dashboard"
        className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-[11px] shrink-0"
      >
        <span>Ver KPIs &amp; Diagnóstico</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
