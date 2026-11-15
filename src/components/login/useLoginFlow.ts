'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFinanzas, UsuarioItem } from '@/context/FinanzasContext';
import { toast } from 'sonner';
import type { LoginTabMode } from './LoginTabsHeader';

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

export function useLoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuarios, usuarioActual } = useFinanzas();

  const [tabMode, setTabMode] = useState<LoginTabMode>('EXISTENTE');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null);
  const [pin, setPin] = useState('');
  const [pinUsado, setPinUsado] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [mostrarModalAsociar, setMostrarModalAsociar] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const fromPath = searchParams.get('from') || '/';
  const errorParam = searchParams.get('error');

  const cuentasSinAsociar = usuarios.filter((u) => !u.email && !u.googleId);

  useEffect(() => {
    if (errorParam) {
      const msg = ERROR_MESSAGES[errorParam] || 'Error en la autenticación con Google.';
      setOauthError(msg);
      toast.error(msg);
    }
  }, [errorParam]);

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
    setMostrarModalAsociar(false);
  };

  const handleVolverASeleccion = () => {
    setUsuarioSeleccionado(null);
    setPin('');
    setErrorPin(null);
    setMostrarModalAsociar(false);
  };

  const validarPin = async (userId: string, pinValue: string) => {
    try {
      setValidando(true);
      setErrorPin(null);
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId, pin: pinValue }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorPin(data.error || 'PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
        return;
      }

      setPinUsado(pinValue);

      if (data.usuario?.requiereAsociacion || (!data.usuario?.email && !data.usuario?.googleId)) {
        setMostrarModalAsociar(true);
        toast.info('PIN verificado. Asocia tu cuenta a un correo para mayor seguridad.');
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

  return {
    usuarios,
    usuarioActual,
    tabMode,
    setTabMode,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    pin,
    setPin,
    pinUsado,
    mostrarPin,
    setMostrarPin,
    errorPin,
    validando,
    mostrarModalAsociar,
    oauthError,
    pinInputRef,
    fromPath,
    cuentasSinAsociar,
    pinEsperado,
    handleSelectPerfil,
    handleVolverASeleccion,
    validarPin,
    handlePinChange,
    handleKeypadPress,
  };
}
