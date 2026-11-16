'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, Menu, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface SidebarMobileHeaderProps {
  onOpenMenu: () => void;
  openRecordModal: (tipo: 'GASTO') => void;
  usuarioActual: any;
  cerrarSesion: () => void;
  theme?: string;
  setTheme: (t: string) => void;
}

export function SidebarMobileHeader({
  onOpenMenu,
  openRecordModal,
  usuarioActual,
  cerrarSesion,
  theme,
  setTheme,
}: SidebarMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full md:hidden border-b border-border/80 bg-background/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          className="p-1.5 rounded-lg text-foreground hover:bg-muted transition cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Finanzas
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <UserMenu />
        {usuarioActual && (
          <button
            onClick={cerrarSesion}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => openRecordModal('GASTO')}
          className="hidden min-[400px]:inline-flex p-1.5 rounded-lg bg-foreground text-background hover:opacity-90 active:scale-95 transition cursor-pointer"
          title="Nuevo Registro"
          aria-label="Nuevo Registro"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          title="Cambiar tema"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </header>
  );
}
