'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleSignInButton } from '@/components/login/GoogleSignInButton';
import { Wallet, ShieldCheck, Sparkles, Lock, AlertCircle, Loader2 } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  google_config_missing:
    'Google OAuth aún no está configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.',
  google_cancelled: 'Inicio de sesión con Google cancelado.',
  google_no_code: 'No se recibió el código de autorización de Google.',
  google_token_exchange_failed: 'Error al verificar credenciales con Google.',
  google_userinfo_failed: 'No se pudo obtener el perfil de Google.',
  user_not_found: 'No se pudo inicializar la sesión para esta cuenta.',
  google_auth_exception: 'Ocurrió un error inesperado al conectar con Google.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/';
  const errorParam = searchParams.get('error');
  const oauthError = errorParam ? ERROR_MESSAGES[errorParam] || 'Error en la autenticación con Google.' : null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand & Título */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-foreground text-background shadow-md mb-1">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Finanzas Personales
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Control de gastos, proyección de ahorros y gestión inteligente de tus finanzas.
          </p>
        </div>

        {/* Alerta de error si ocurrió alguno */}
        {oauthError && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Aviso de Acceso</span>
              <span>{oauthError}</span>
            </div>
          </div>
        )}

        {/* Botón Principal de Google */}
        <div className="space-y-3 pt-1">
          <GoogleSignInButton
            from={fromPath}
            label="Continuar con Google"
            className="py-3 text-sm shadow-md hover:shadow-lg"
          />

          <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60 space-y-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Acceso seguro y cifrado con Google OAuth</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Instancia automática para nuevas cuentas</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Aislamiento estricto de registros personales</span>
            </div>
          </div>
        </div>

        <div className="pt-1 text-center">
          <span className="text-[10px] text-muted-foreground">
            Al continuar, accedes a tu espacio financiero personal cifrado.
          </span>
        </div>
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
