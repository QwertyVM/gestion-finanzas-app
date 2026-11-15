'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useFinanzas } from '@/context/FinanzasContext';
import { User, ChevronDown, LogOut, Settings, UserCheck } from 'lucide-react';
import Image from 'next/image';

export function UserMenu() {
  const { usuarioActual, cerrarSesion } = useFinanzas();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!usuarioActual) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition shadow-xs"
      >
        <User className="w-3.5 h-3.5" />
        <span>Iniciar sesión</span>
      </Link>
    );
  }

  const isImageAvatar = Boolean(
    usuarioActual.avatar &&
      (usuarioActual.avatar.startsWith('http://') || usuarioActual.avatar.startsWith('https://'))
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-border transition active:scale-98 shadow-2xs"
        title="Perfil activo"
        aria-label="Menú de usuario"
      >
        {/* Avatar Mini */}
        {isImageAvatar ? (
          <div className="w-6 h-6 rounded-lg overflow-hidden border border-indigo-500/40 shrink-0">
            <Image
              src={usuarioActual.avatar!}
              alt={usuarioActual.nombre}
              width={24}
              height={24}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
            style={{ backgroundColor: usuarioActual.color || '#2563eb' }}
          >
            <User className="w-3.5 h-3.5" />
          </div>
        )}

        <span className="text-xs font-bold text-foreground tracking-tight">
          {usuarioActual.nombre}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {/* Header con información de perfil */}
          <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
            <span className="text-[10px] font-semibold text-muted-foreground block">
              Cuenta Conectada
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-extrabold text-sm text-foreground truncate max-w-[170px]">
                {usuarioActual.nombre}
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: usuarioActual.color || '#2563eb' }}
              />
            </div>
            {usuarioActual.email && (
              <span className="text-[10px] text-muted-foreground block mt-0.5 truncate max-w-[180px]">
                {usuarioActual.email}
              </span>
            )}
          </div>

          {/* Enlace directo a Mi Perfil */}
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition text-left"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mi Perfil Financiero</span>
          </Link>

          {/* Enlace directo a Configuración */}
          <Link
            href="/configuracion"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition text-left"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Configuración General</span>
          </Link>

          <div className="h-px bg-border my-1" />

          {/* Cerrar Sesión */}
          <button
            type="button"
            onClick={() => {
              cerrarSesion();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
