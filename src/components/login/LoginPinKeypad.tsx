'use client';

import React from 'react';
import type { UsuarioItem } from '@/context/FinanzasContext';
import {
  User,
  Heart,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { PinNumberPad } from './PinNumberPad';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginPinKeypadProps {
  usuario: UsuarioItem;
  pin: string;
  mostrarPin: boolean;
  errorPin: string | null;
  validando: boolean;
  pinEsperado: number;
  fromPath?: string;
  pinInputRef: React.RefObject<HTMLInputElement | null>;
  onVolver: () => void;
  onToggleMostrarPin: () => void;
  onPinChange: (val: string) => void;
  onKeypadPress: (digit: string) => void;
  onKeypadDelete: () => void;
  onLimpiar: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginPinKeypad({
  usuario,
  pin,
  mostrarPin,
  errorPin,
  validando,
  pinEsperado,
  fromPath = '/',
  pinInputRef,
  onVolver,
  onToggleMostrarPin,
  onPinChange,
  onKeypadPress,
  onKeypadDelete,
  onLimpiar,
  onSubmit,
}: LoginPinKeypadProps) {
  const isVictor = usuario.slug === 'victor';

  return (
    <>
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cambiar de perfil</span>
        </button>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Acceso Seguro</span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 pt-1">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl"
          style={{
            backgroundColor: usuario.color || (isVictor ? '#2563eb' : '#ec4899'),
          }}
        >
          {isVictor ? (
            <User className="w-8 h-8 stroke-[2.2]" />
          ) : (
            <Heart className="w-8 h-8 stroke-[2.2]" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            Hola, {usuario.nombre}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ingresa tu PIN numérico personal de {pinEsperado} dígitos
          </p>
        </div>
      </div>

      {/* Indicadores de dígitos tipo PIN */}
      <div className="flex items-center justify-center gap-2.5 py-1">
        {Array.from({ length: pinEsperado }).map((_, idx) => {
          const filled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                filled
                  ? 'border-indigo-500 bg-indigo-500/10 text-foreground font-mono font-bold text-xl scale-105 shadow-xs'
                  : 'border-border/80 bg-secondary/30 text-muted-foreground'
              }`}
            >
              {filled ? (mostrarPin ? pin[idx] : '•') : ''}
            </div>
          );
        })}
      </div>

      {/* Formulario con input */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            ref={pinInputRef}
            type={mostrarPin ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ''))}
            placeholder={`PIN numérico (${pinEsperado} dígitos)`}
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-center font-mono tracking-widest text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={validando}
          />
          <button
            type="button"
            onClick={onToggleMostrarPin}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            {mostrarPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {errorPin && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            {errorPin}
          </div>
        )}

        <PinNumberPad
          pin={pin}
          validando={validando}
          onKeypadPress={onKeypadPress}
          onKeypadDelete={onKeypadDelete}
          onLimpiar={onLimpiar}
        />

        <button
          type="submit"
          disabled={validando || pin.length < 4}
          className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {validando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2">
          <GoogleSignInButton
            slug={usuario.slug}
            from={fromPath}
            label={`Vincular o ingresar con Google`}
          />
        </div>
      </form>
    </>
  );
}
