'use client';

import React from 'react';
import { UserCheck, UserPlus } from 'lucide-react';

export type LoginTabMode = 'EXISTENTE' | 'NUEVA';

interface LoginTabsHeaderProps {
  mode: LoginTabMode;
  onSelectMode: (mode: LoginTabMode) => void;
  cuentasSinAsociarCount?: number;
}

export function LoginTabsHeader({
  mode,
  onSelectMode,
  cuentasSinAsociarCount = 0,
}: LoginTabsHeaderProps) {
  return (
    <div className="grid grid-cols-2 p-1 bg-secondary/60 rounded-2xl border border-border/80">
      <button
        type="button"
        onClick={() => onSelectMode('EXISTENTE')}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
          mode === 'EXISTENTE'
            ? 'bg-background text-foreground shadow-xs border border-border/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Cuenta existente</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectMode('NUEVA')}
        className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
          mode === 'NUEVA'
            ? 'bg-background text-foreground shadow-xs border border-border/60'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
        }`}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Crear cuenta nueva</span>
        {cuentasSinAsociarCount > 0 && (
          <span
            className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
            title="Hay cuentas existentes pendientes de vinculación"
          />
        )}
      </button>
    </div>
  );
}
