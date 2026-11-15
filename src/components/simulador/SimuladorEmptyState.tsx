'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, Landmark, ArrowRight } from 'lucide-react';

export function SimuladorEmptyState() {
  return (
    <div className="p-10 text-center bg-card border border-border/80 rounded-2xl space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto shadow-2xs">
        <Calculator className="w-6 h-6" />
      </div>
      <h2 className="text-base font-bold text-foreground">
        Sin préstamos activos registrados
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Tu cuenta actualmente no tiene créditos o préstamos bancarios registrados. Al crear un préstamo en la sección Fijos y Préstamos, podrás calcular aquí el ahorro en intereses y reducción de plazo.
      </p>
      <div className="pt-2">
        <Link
          href="/fijos-y-prestamos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-98 transition shadow-xs"
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Ir a Fijos y Préstamos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
