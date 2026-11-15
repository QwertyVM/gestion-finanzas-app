'use client';

import React, { useState } from 'react';
import type { UsuarioItem } from '@/context/FinanzasContext';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { toast } from 'sonner';

interface AsociarCuentaModalProps {
  usuario: UsuarioItem;
  pinUsado: string;
  fromPath?: string;
  onExito: () => void;
  onOmitir: () => void;
}

export function AsociarCuentaModal({
  usuario,
  pinUsado,
  fromPath = '/',
  onExito,
  onOmitir,
}: AsociarCuentaModalProps) {
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleAsociarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch('/api/usuarios/asociar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: usuario.id,
          email: email.trim(),
          pin: pinUsado,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al vincular correo');
      }

      toast.success('¡Cuenta vinculada exitosamente con tu correo!');
      onExito();
    } catch (err: any) {
      toast.error(err.message || 'Error al vincular');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Asocia tu cuenta a un correo
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          ¡PIN correcto! Asocia tu cuenta de <strong>{usuario.nombre}</strong> a tu correo para habilitar la creación de perfiles y acceso con Google.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3">
        <GoogleSignInButton
          slug={usuario.slug}
          from={fromPath}
          label="Vincular con mi cuenta de Google"
        />

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-semibold">
              O escribe tu correo
            </span>
          </div>
        </div>

        <form onSubmit={handleAsociarManual} className="space-y-2.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="tu-correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={guardando}
            />
          </div>

          <button
            type="submit"
            disabled={guardando || !email.trim()}
            className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {guardando ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Vinculando...</span>
              </>
            ) : (
              <>
                <span>Guardar y Vincular Correo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onOmitir}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 transition"
        >
          Omitir por ahora e ingresar al sistema
        </button>
      </div>
    </div>
  );
}
