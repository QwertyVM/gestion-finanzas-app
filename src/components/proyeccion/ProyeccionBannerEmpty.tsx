'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Sparkles } from 'lucide-react';

interface ProyeccionBannerEmptyProps {
  moneda: string;
}

export function ProyeccionBannerEmpty({ moneda }: ProyeccionBannerEmptyProps) {
  return (
    <div className="bg-muted/30 border border-border/70 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Proyección anual inicializada en {moneda} 0.00
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configura tu sueldo base en tu perfil para proyectar tus ingresos y márgenes de ahorro.
          </p>
        </div>
      </div>
      <Link
        href="/perfil"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition shrink-0"
      >
        <Settings className="w-3.5 h-3.5" />
        Configurar en Mi Perfil
      </Link>
    </div>
  );
}
