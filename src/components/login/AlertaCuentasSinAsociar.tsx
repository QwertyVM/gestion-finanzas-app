'use client';

import React from 'react';
import type { UsuarioItem } from '@/context/FinanzasContext';
import { AlertTriangle, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';

interface AlertaCuentasSinAsociarProps {
  cuentasSinAsociar: UsuarioItem[];
  onIrACuentaExistente: (usuario?: UsuarioItem) => void;
}

export function AlertaCuentasSinAsociar({
  cuentasSinAsociar,
  onIrACuentaExistente,
}: AlertaCuentasSinAsociarProps) {
  const nombres = cuentasSinAsociar.map((u) => u.nombre).join(', ');

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Cuentas pendientes de asociación
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Tienes una o más cuentas existentes que aún no han sido vinculadas a un correo electrónico.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/90 space-y-1">
            <span className="font-bold block text-amber-700 dark:text-amber-300">
              Cuenta pendiente: {nombres}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Para proteger tus registros existentes y evitar cuentas huérfanas, por favor ingresa primero con tu PIN a tu cuenta de <strong>{nombres}</strong> y asóciala a tu correo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onIrACuentaExistente(cuentasSinAsociar[0])}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Ingresar y vincular {cuentasSinAsociar[0]?.nombre || 'cuenta'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-center">
        <span className="text-[11px] text-muted-foreground">
          Una vez asociada tu cuenta antigua, podrás crear perfiles adicionales libremente.
        </span>
      </div>
    </div>
  );
}
