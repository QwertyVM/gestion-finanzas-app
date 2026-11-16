'use client';

import React from 'react';
import { KeyRound, ShieldCheck, Lock } from 'lucide-react';

interface ConfigSeguridadSectionProps {
  usuarioNombre?: string | null;
  pinActual: string;
  setPinActual: (p: string) => void;
  nuevoPin: string;
  setNuevoPin: (p: string) => void;
  confirmarNuevoPin: string;
  setConfirmarNuevoPin: (p: string) => void;
  savingPin: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ConfigSeguridadSection({
  usuarioNombre,
  pinActual,
  setPinActual,
  nuevoPin,
  setNuevoPin,
  confirmarNuevoPin,
  setConfirmarNuevoPin,
  savingPin,
  onSubmit,
}: ConfigSeguridadSectionProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Seguridad & PIN de Acceso
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Credenciales personales para <strong className="text-foreground">{usuarioNombre || 'tu perfil'}</strong>. PIN inicial por defecto: <code className="font-mono bg-secondary px-1 py-0.5 rounded text-foreground">1234</code>.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Protegido
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 text-xs pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              PIN Actual:
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinActual}
              onChange={(e) => setPinActual(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej: 1234"
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono text-center tracking-widest text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Nuevo PIN (4 a 6 dígitos):
            </label>
            <input
              type="password"
              maxLength={6}
              required
              value={nuevoPin}
              onChange={(e) => setNuevoPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono text-center tracking-widest text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-muted-foreground">
              Confirmar Nuevo PIN:
            </label>
            <input
              type="password"
              maxLength={6}
              required
              value={confirmarNuevoPin}
              onChange={(e) => setConfirmarNuevoPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-3 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono text-center tracking-widest text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={savingPin || !nuevoPin}
            className="py-1.5 px-4 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{savingPin ? 'Actualizando...' : 'Actualizar PIN de Acceso'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
