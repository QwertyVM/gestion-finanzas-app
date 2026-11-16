'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { useTheme } from 'next-themes';
import { Wallet, Sun, Moon, X, Plus, LogOut } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { SidebarNavLinks } from './SidebarNavLinks';
import { SidebarPeriodSelector } from './SidebarPeriodSelector';
import { SidebarMobileHeader } from './SidebarMobileHeader';

export function Sidebar() {
  const pathname = usePathname();
  const {
    periodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    prefetchMesAnterior,
    prefetchMesSiguiente,
    openRecordModal,
    usuarioActual,
    cerrarSesion,
  } = useFinanzas();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = 'Gratificación';
  if (mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  const handleLinkClick = () => setMobileOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-foreground block leading-none">
                Finanzas
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Control Personal
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Botón de Registro Rápido */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            openRecordModal('GASTO');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-foreground text-background font-semibold text-xs shadow-sm hover:opacity-90 active:scale-98 transition group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-background/20 text-background flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Nuevo Registro</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-background/20 rounded font-mono font-normal">
            N
          </kbd>
        </button>

        {/* Selector de Periodo */}
        <SidebarPeriodSelector
          periodo={periodo}
          puedeIrMesAnterior={puedeIrMesAnterior}
          irMesAnterior={irMesAnterior}
          irMesSiguiente={irMesSiguiente}
          prefetchMesAnterior={prefetchMesAnterior}
          prefetchMesSiguiente={prefetchMesSiguiente}
          esMesEspecial={esMesEspecial}
          labelEspecial={labelEspecial}
        />

        {/* Navegación por Secciones */}
        <SidebarNavLinks pathname={pathname} onLinkClick={handleLinkClick} />
      </div>

      {/* Pie: Perfil & Toggle Tema */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-1.5 px-1">
        <UserMenu />

        <div className="flex items-center gap-1">
          {usuarioActual && (
            <button
              onClick={cerrarSesion}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition shrink-0 cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0 cursor-pointer"
            title="Cambiar tema"
            aria-label="Cambiar tema"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SidebarMobileHeader
        onOpenMenu={() => setMobileOpen(true)}
        openRecordModal={openRecordModal}
        usuarioActual={usuarioActual}
        cerrarSesion={cerrarSesion}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Sidebar Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col border-r border-border/60 bg-background/95 backdrop-blur-md z-30">
        <SidebarContent />
      </aside>

      {/* Drawer Móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 max-w-[80vw] bg-background border-r border-border h-full shadow-lg z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
