'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinanzas, UsuarioItem } from '@/context/FinanzasContext';
import { toast } from 'sonner';
import { LoginProfileSelector } from '@/components/login/LoginProfileSelector';
import { LoginPinKeypad } from '@/components/login/LoginPinKeypad';
import { AlertCircle, Loader2 } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  google_config_missing:
    'Google OAuth aún no está configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.',
  google_cancelled: 'Inicio de sesión con Google cancelado.',
  google_no_code: 'No se recibió el código de autorización de Google.',
  google_token_exchange_failed: 'Error al verificar credenciales con Google.',
  google_userinfo_failed: 'No se pudo obtener el perfil de Google.',
  user_not_found: 'No se encontró un usuario activo para asociar esta cuenta.',
  google_auth_exception: 'Ocurrió un error inesperado al conectar con Google.',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuarios, usuarioActual, cambiarUsuario } = useFinanzas();

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null);
  const [pin, setPin] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const fromPath = searchParams.get('from') || '/';
  const errorParam = searchParams.get('error');

  // Capturar errores de retorno de OAuth
  useEffect(() => {
    if (errorParam) {
      const msg = ERROR_MESSAGES[errorParam] || 'Error en la autenticación con Google.';
      setOauthError(msg);
      toast.error(msg);
    }
  }, [errorParam]);

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
          window.location.href = fromPath;
        } else {
          router.push(fromPath);
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
        {oauthError && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Aviso de Autenticación</span>
              <span>{oauthError}</span>
            </div>
          </div>
        )}

        {!usuarioSeleccionado ? (
          <LoginProfileSelector
            usuarios={usuarios}
            usuarioActual={usuarioActual}
            fromPath={fromPath}
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
            fromPath={fromPath}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
