'use client';

import React, { Suspense } from 'react';
import { useLoginFlow } from '@/components/login/useLoginFlow';
import { LoginTabsHeader } from '@/components/login/LoginTabsHeader';
import { LoginProfileSelector } from '@/components/login/LoginProfileSelector';
import { LoginPinKeypad } from '@/components/login/LoginPinKeypad';
import { AlertaCuentasSinAsociar } from '@/components/login/AlertaCuentasSinAsociar';
import { CrearPerfilForm } from '@/components/login/CrearPerfilForm';
import { AsociarCuentaModal } from '@/components/login/AsociarCuentaModal';
import { AlertCircle, Loader2 } from 'lucide-react';

function LoginContent() {
  const {
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
  } = useLoginFlow();

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        {oauthError && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Aviso de Autenticación</span>
              <span>{oauthError}</span>
            </div>
          </div>
        )}

        {/* Pestañas de Modo: Cuenta Existente / Crear Cuenta Nueva */}
        {!usuarioSeleccionado && (
          <LoginTabsHeader
            mode={tabMode}
            onSelectMode={(m) => {
              setTabMode(m);
              setUsuarioSeleccionado(null);
            }}
            cuentasSinAsociarCount={cuentasSinAsociar.length}
          />
        )}

        {/* Contenido según pestaña */}
        {tabMode === 'NUEVA' ? (
          cuentasSinAsociar.length > 0 ? (
            <AlertaCuentasSinAsociar
              cuentasSinAsociar={cuentasSinAsociar}
              onIrACuentaExistente={(u) => {
                setTabMode('EXISTENTE');
                if (u) setUsuarioSeleccionado(u);
              }}
            />
          ) : (
            <CrearPerfilForm onPerfilCreado={() => setTabMode('EXISTENTE')} />
          )
        ) : mostrarModalAsociar && usuarioSeleccionado ? (
          <AsociarCuentaModal
            usuario={usuarioSeleccionado}
            pinUsado={pinUsado}
            fromPath={fromPath}
            onExito={() => {
              window.location.href = fromPath;
            }}
            onOmitir={() => {
              window.location.href = fromPath;
            }}
          />
        ) : !usuarioSeleccionado ? (
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
            onKeypadDelete={() => setPin((prev) => prev.slice(0, -1))}
            onLimpiar={() => setPin('')}
            onSubmit={(e) => {
              e.preventDefault();
              if (usuarioSeleccionado && pin.trim()) {
                validarPin(usuarioSeleccionado.id, pin.trim());
              }
            }}
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
