'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFinanzas, type UsuarioItem } from '@/context/FinanzasContext';
import {
  Wallet,
  Check,
  User,
  Heart,
  ArrowRight,
  ShieldCheck,
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Delete,
} from 'lucide-react';
import { toast } from 'sonner';

export function ModalSelectorUsuario() {
  const {
    usuarios,
    usuarioActual,
    cambiarUsuario,
    isSelectorUsuarioOpen,
    closeSelectorUsuario,
  } = useFinanzas();

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null);
  const [pin, setPin] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar selección inicial
  useEffect(() => {
    if (isSelectorUsuarioOpen) {
      setErrorPin(null);
      setPin('');
      setUsuarioSeleccionado(null);
    }
  }, [isSelectorUsuarioOpen]);

  // Enfocar input al seleccionar usuario
  useEffect(() => {
    if (usuarioSeleccionado) {
      setPin('');
      setErrorPin(null);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [usuarioSeleccionado]);

  if (!isSelectorUsuarioOpen && usuarioActual) {
    return null;
  }

  const handleSelectPerfil = (user: UsuarioItem) => {
    setUsuarioSeleccionado(user);
  };

  const handleVolverASeleccion = () => {
    setUsuarioSeleccionado(null);
    setPin('');
    setErrorPin(null);
  };

  const handleValidarPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usuarioSeleccionado) return;

    if (!pin.trim()) {
      setErrorPin('Por favor ingresa tu PIN');
      pinInputRef.current?.focus();
      return;
    }

    try {
      setValidando(true);
      setErrorPin(null);
      const exito = await cambiarUsuario(usuarioSeleccionado.id, pin.trim());
      if (!exito) {
        setErrorPin('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
        pinInputRef.current?.focus();
      } else {
        setUsuarioSeleccionado(null);
        setPin('');
      }
    } catch {
      setErrorPin('Error al validar credencial');
    } finally {
      setValidando(false);
    }
  };

  const pinEsperado = usuarioSeleccionado?.slug === 'victor' ? 6 : 4;

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const nuevo = pin + val;
      setPin(nuevo);
      setErrorPin(null);
      if (nuevo.length === pinEsperado && usuarioSeleccionado) {
        setTimeout(() => {
          validarPinDirecto(usuarioSeleccionado.id, nuevo);
        }, 80);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorPin(null);
  };

  const validarPinDirecto = async (userId: string, pinValue: string) => {
    try {
      setValidando(true);
      setErrorPin(null);
      const exito = await cambiarUsuario(userId, pinValue);
      if (!exito) {
        setErrorPin('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      } else {
        setUsuarioSeleccionado(null);
        setPin('');
      }
    } catch {
      setErrorPin('Error al validar credencial');
    } finally {
      setValidando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Botón cerrar sólo si ya hay una sesión activa */}
        {usuarioActual && (
          <button
            onClick={closeSelectorUsuario}
            className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            title="Cerrar"
            aria-label="Cerrar selector"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* VISTA 1: SELECCIONAR PERFIL */}
        {!usuarioSeleccionado ? (
          <>
            {/* Encabezado */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-foreground text-background shadow-md mb-1">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Acceso a Finanzas
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                Selecciona tu perfil e ingresa con tus credenciales personales para acceder a tus datos.
              </p>
            </div>

            {/* Lista de Usuarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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
                    {/* Badge de cuenta activa */}
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                        <Check className="w-2.5 h-2.5" /> Sesión activa
                      </span>
                    )}

                    {/* Avatar */}
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

                    {/* Nombre y Rol */}
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-indigo-400 transition-colors">
                        {u.nombre}
                      </h3>
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {isVictor ? 'Cuenta Principal' : 'Cuenta Personal'}
                      </span>
                    </div>

                    <div className="mt-3 w-full pt-2.5 border-t border-border/60 flex items-center justify-center gap-1 text-xs font-bold text-foreground/80 group-hover:text-foreground">
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Ingresar PIN</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-0.5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

            {/* Nota de Privacidad */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Acceso protegido con credenciales por usuario</span>
            </div>
          </>
        ) : (
          /* VISTA 2: INGRESO DE CREDENCIALES (PIN / CONTRASEÑA) */
          <form onSubmit={handleValidarPin} className="space-y-5 animate-in fade-in duration-150">
            {/* Header del usuario elegido */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleVolverASeleccion}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cambiar de perfil</span>
              </button>

              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Perfil protegido</span>
              </span>
            </div>

            {/* Tarjeta resumen del usuario */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-secondary/50 border border-border/80">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                style={{
                  backgroundColor: usuarioSeleccionado.color || '#2563eb',
                }}
              >
                {usuarioSeleccionado.slug === 'victor' ? (
                  <User className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <Heart className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-foreground truncate">
                  {usuarioSeleccionado.nombre}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Ingresa tu PIN de {pinEsperado} dígitos para acceder
                </p>
              </div>
            </div>

            {/* Input de PIN */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>PIN de Acceso:</span>
                <span className="text-[10px] text-muted-foreground">
                  PIN numérico personal
                </span>
              </label>

              <div className="relative">
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
                      validarPinDirecto(usuarioSeleccionado.id, val);
                    }
                  }}
                  placeholder="••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 rounded-2xl bg-background border text-foreground text-center font-mono text-xl tracking-[0.4em] outline-none transition shadow-xs ${
                    errorPin
                      ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-border focus:border-foreground'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setMostrarPin(!mostrarPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition"
                  title={mostrarPin ? 'Ocultar' : 'Mostrar'}
                >
                  {mostrarPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorPin && (
                <p className="text-xs text-rose-500 font-medium text-center animate-in fade-in">
                  {errorPin}
                </p>
              )}
            </div>

            {/* Teclado numérico táctil amigable */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKeypadPress(n)}
                  className="py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground font-mono font-bold text-lg active:scale-95 transition border border-border/50 shadow-2xs"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary text-muted-foreground text-xs font-semibold active:scale-95 transition border border-border/30"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground font-mono font-bold text-lg active:scale-95 transition border border-border/50 shadow-2xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadDelete}
                className="py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary text-muted-foreground flex items-center justify-center active:scale-95 transition border border-border/30"
                title="Borrar último"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Botón de Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={validando || pin.length === 0}
                className="w-full py-3 px-4 rounded-2xl bg-foreground text-background text-sm font-bold hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {validando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando credencial...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Ingresar como {usuarioSeleccionado.nombre}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
