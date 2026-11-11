'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import { User, Heart, ChevronDown, Check, LogOut, RefreshCw, Sparkles } from 'lucide-react';

export function UserMenu() {
  const { usuarioActual, usuarios, cambiarUsuario, cerrarSesion, openSelectorUsuario } = useFinanzas();
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
      <button
        onClick={openSelectorUsuario}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition shadow-xs"
      >
        <User className="w-3.5 h-3.5" />
        <span>Iniciar sesión</span>
      </button>
    );
  }

  const isVictor = usuarioActual.slug === 'victor';
  const otroUsuario = usuarios.find((u) => u.id !== usuarioActual.id);

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
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
          style={{ backgroundColor: usuarioActual.color || (isVictor ? '#2563eb' : '#ec4899') }}
        >
          {isVictor ? <User className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
        </div>

        <span className="text-xs font-bold text-foreground tracking-tight">
          {usuarioActual.nombre}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Desplegable */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {/* Header con información de perfil */}
          <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
            <span className="text-[10px] font-semibold text-muted-foreground block">
              Perfil Activo
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-extrabold text-sm text-foreground">
                {usuarioActual.nombre}
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: usuarioActual.color || '#2563eb' }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Sueldo base: S/ {usuarioActual.sueldoBaseMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Cambio con credenciales al otro usuario */}
          {otroUsuario && (
            <button
              type="button"
              onClick={() => {
                openSelectorUsuario();
                setOpen(false);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-foreground hover:bg-secondary transition text-left group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                  style={{ backgroundColor: otroUsuario.color || '#ec4899' }}
                >
                  {otroUsuario.slug === 'victor' ? <User className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                </div>
                <span>Acceder como {otroUsuario.nombre}</span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground group-hover:rotate-180 transition-transform" />
            </button>
          )}

          {/* Abrir Selector de Perfil completo */}
          <button
            type="button"
            onClick={() => {
              openSelectorUsuario();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition text-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ver todos los perfiles</span>
          </button>

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

