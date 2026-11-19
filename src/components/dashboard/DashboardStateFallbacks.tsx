'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';

interface DashboardStateFallbacksProps {
  tipo: 'NO_AUTH' | 'ERROR' | 'VACIO';
  mensajeError?: string | null;
  onReintentar?: () => void;
}

export function DashboardStateFallbacks({
  tipo,
  mensajeError,
  onReintentar,
}: DashboardStateFallbacksProps) {
  if (tipo === 'NO_AUTH') {
    return (
      <div className="p-8 text-center bg-card border border-border/80 rounded-2xl space-y-4 max-w-md mx-auto my-12 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Sesión no iniciada</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Debes iniciar sesión con tu cuenta de Google para acceder a tu información financiera.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-98 transition shadow-xs cursor-pointer"
        >
          <span>Ir a Iniciar Sesión</span>
        </Link>
      </div>
    );
  }

  if (tipo === 'ERROR') {
    return (
      <div className="p-8 text-center bg-card border border-rose-500/30 rounded-2xl space-y-4 max-w-md mx-auto my-12 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
            Error de conexión
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {mensajeError || 'No se pudo conectar con el servidor o cargar los datos financieros.'}
          </p>
        </div>
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-98 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar carga</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 text-center bg-card border border-border rounded-xl">
      <p className="text-muted-foreground text-sm">No se encontraron datos para este mes.</p>
    </div>
  );
}
