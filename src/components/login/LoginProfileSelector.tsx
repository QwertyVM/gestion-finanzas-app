'use client';

import React from 'react';
import type { UsuarioItem } from '@/context/FinanzasContext';
import { Wallet, Check, User, Heart, KeyRound, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginProfileSelectorProps {
  usuarios: UsuarioItem[];
  usuarioActual: UsuarioItem | null;
  fromPath?: string;
  onSelectPerfil: (user: UsuarioItem) => void;
}

export function LoginProfileSelector({
  usuarios,
  usuarioActual,
  fromPath = '/',
  onSelectPerfil,
}: LoginProfileSelectorProps) {
  return (
    <>
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-foreground text-background shadow-md mb-1">
          <Wallet className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Iniciar Sesión
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
          Selecciona tu perfil financiero e ingresa tu PIN de acceso personal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {usuarios.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Cargando perfiles...</span>
          </div>
        ) : (
          usuarios.map((u) => {
            const isVictor = u.slug === 'victor';
            const isSelected = usuarioActual?.id === u.id;

            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelectPerfil(u)}
                className={`group relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-border bg-secondary/30 hover:border-border/80 hover:bg-secondary/60'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    <Check className="w-2.5 h-2.5" /> Activo
                  </span>
                )}

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg mb-2.5 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: u.color || (isVictor ? '#2563eb' : '#ec4899'),
                  }}
                >
                  {isVictor ? (
                    <User className="w-7 h-7 stroke-[2.2]" />
                  ) : (
                    <Heart className="w-7 h-7 stroke-[2.2]" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <h2 className="font-extrabold text-base text-foreground group-hover:text-indigo-400 transition-colors">
                    {u.nombre}
                  </h2>
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    {isVictor ? 'Cuenta Principal' : 'Cuenta Personal'}
                  </span>
                </div>

                <div className="mt-3 w-full pt-2.5 border-t border-border/60 flex items-center justify-center gap-1 text-xs font-bold text-foreground/80 group-hover:text-foreground">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Ingresar con PIN</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Opción de ingreso con Google */}
      <div className="pt-2">
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-semibold">
              O ingresa con
            </span>
          </div>
        </div>

        <GoogleSignInButton from={fromPath} />
      </div>

      <div className="pt-1 text-center">
        <span className="text-[11px] text-muted-foreground">
          Acceso biométrico, PIN criptográfico o autenticación única con Google.
        </span>
      </div>
    </>
  );
}
