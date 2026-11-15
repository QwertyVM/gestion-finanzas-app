'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  slug: string;
  email: string | null;
  googleId: string | null;
  avatar?: string | null;
  color: string;
  monedaSimbolo: string;
  sueldoBaseMensual: number;
  diaPagoSueldo: number;
  tipoCambioUSD: number;
  metaAhorroMensual: number;
}

interface AuthContextType {
  usuario: UsuarioSesion | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUsuario: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/usuarios/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.usuario) {
          setUsuario(data.usuario);
          return;
        }
      }
      setUsuario(null);
    } catch (err) {
      console.error('Error al verificar sesión de usuario:', err);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const cerrarSesion = useCallback(async () => {
    try {
      await fetch('/api/usuarios/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUsuario(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finanzapp_usuario_id');
      localStorage.setItem('finanzapp_logged_out', 'true');
      document.cookie = 'finanzapp_logged_out=true; Path=/; max-age=2592000; SameSite=Lax';
      window.location.href = '/login';
    }
    toast.info('Sesión cerrada.');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        isAuthenticated: Boolean(usuario),
        refreshUsuario: fetchCurrentUser,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
