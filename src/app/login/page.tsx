'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas, UsuarioItem } from '@/context/FinanzasContext';
import {
  Wallet,
  Check,
  User,
  Heart,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Delete,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { usuarios, usuarioActual, cambiarUsuario } = useFinanzas();

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null);
  const [pin, setPin] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Focus input when user selected
  useEffect(() => {
    if (usuarioSeleccionado) {
      setPin('');
      setErrorPin(null);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [usuarioSeleccionado]);

  const handleSelectPerfil = (user: UsuarioItem) => {
    setUsuarioSeleccionado(user);
    setPin('');
    setErrorPin(null);
  };

  const handleVolverASeleccion = () => {
    setUsuarioSeleccionado(null);
    setPin('');
    setErrorPin(null);
  };

  const validarPin = async (userId: string, pinValue: string) => {
    try {
      setValidando(true);
      setErrorPin(null);
      const exito = await cambiarUsuario(userId, pinValue);
      if (!exito) {
        setErrorPin('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      } else {
        toast.success(`Bienvenido/a de nuevo`);
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const from = params.get('from') || '/';
          window.location.href = from;
        } else {
          router.push('/');
        }
      }
    } catch {
      setErrorPin('Error al validar credencial');
    } finally {
      setValidando(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    if (!pin.trim()) {
      setErrorPin('Por favor ingresa tu PIN');
      pinInputRef.current?.focus();
      return;
    }
    await validarPin(usuarioSeleccionado.id, pin.trim());
  };

  const pinEsperado = usuarioSeleccionado?.slug === 'victor' ? 6 : 4;

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const nuevo = pin + val;
      setPin(nuevo);
      setErrorPin(null);
      if (nuevo.length === pinEsperado && usuarioSeleccionado) {
        setTimeout(() => {
          validarPin(usuarioSeleccionado.id, nuevo);
        }, 80);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorPin(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {!usuarioSeleccionado ? (
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
                    onClick={() => handleSelectPerfil(u)}
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

            <div className="pt-2 text-center">
              <span className="text-[11px] text-muted-foreground">
                Selecciona tu perfil e ingresa tu PIN personal para acceder a tus finanzas.
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <button
                type="button"
                onClick={handleVolverASeleccion}
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
                  backgroundColor:
                    usuarioSeleccionado.color ||
                    (usuarioSeleccionado.slug === 'victor' ? '#2563eb' : '#ec4899'),
                }}
              >
                {usuarioSeleccionado.slug === 'victor' ? (
                  <User className="w-8 h-8 stroke-[2.2]" />
                ) : (
                  <Heart className="w-8 h-8 stroke-[2.2]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground">
                  Hola, {usuarioSeleccionado.nombre}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ingresa tu PIN numérico personal de {pinEsperado} dígitos
                </p>
              </div>
            </div>

            {/* Display dinámico de dígitos tipo PIN */}
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

            {/* Formulario con input oculto/visible */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    setErrorPin(null);
                    if (val.length === pinEsperado) {
                      validarPin(usuarioSeleccionado.id, val);
                    }
                  }}
                  placeholder={`PIN numérico (${pinEsperado} dígitos)`}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-center font-mono tracking-widest text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  disabled={validando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPin(!mostrarPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {mostrarPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorPin && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center animate-in shake">
                  {errorPin}
                </div>
              )}

              {/* Teclado numérico táctil */}
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleKeypadPress(n)}
                    disabled={validando}
                    className="h-12 rounded-xl bg-secondary/50 hover:bg-secondary active:scale-95 text-foreground font-mono font-bold text-lg border border-border/60 transition shadow-xs disabled:opacity-50"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPin('');
                    setErrorPin(null);
                  }}
                  disabled={validando || pin.length === 0}
                  className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary active:scale-95 text-muted-foreground hover:text-foreground font-semibold text-xs border border-border/40 transition disabled:opacity-40"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={validando}
                  className="h-12 rounded-xl bg-secondary/50 hover:bg-secondary active:scale-95 text-foreground font-mono font-bold text-lg border border-border/60 transition shadow-xs disabled:opacity-50"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  disabled={validando || pin.length === 0}
                  className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary active:scale-95 text-muted-foreground hover:text-foreground flex items-center justify-center border border-border/40 transition disabled:opacity-40"
                  title="Borrar dígito"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

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
            </form>
          </>
        )}
      </div>
    </div>
  );
}

