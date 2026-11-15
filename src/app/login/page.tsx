'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas, UsuarioItem } from '@/context/FinanzasContext';
import { toast } from 'sonner';
import { LoginProfileSelector } from '@/components/login/LoginProfileSelector';
import { LoginPinKeypad } from '@/components/login/LoginPinKeypad';

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

  const pinEsperado = usuarioSeleccionado?.slug === 'victor' ? 6 : 4;

  const handlePinChange = (val: string) => {
    setPin(val);
    setErrorPin(null);
    if (val.length === pinEsperado && usuarioSeleccionado) {
      validarPin(usuarioSeleccionado.id, val);
    }
  };

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

  const handleLimpiar = () => {
    setPin('');
    setErrorPin(null);
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {!usuarioSeleccionado ? (
          <LoginProfileSelector
            usuarios={usuarios}
            usuarioActual={usuarioActual}
            onSelectPerfil={handleSelectPerfil}
          />
        ) : (
          <LoginPinKeypad
            usuario={usuarioSeleccionado}
            pin={pin}
            mostrarPin={mostrarPin}
            errorPin={errorPin}
            validando={validando}
            pinEsperado={pinEsperado}
            pinInputRef={pinInputRef}
            onVolver={handleVolverASeleccion}
            onToggleMostrarPin={() => setMostrarPin((prev) => !prev)}
            onPinChange={handlePinChange}
            onKeypadPress={handleKeypadPress}
            onKeypadDelete={handleKeypadDelete}
            onLimpiar={handleLimpiar}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
}
