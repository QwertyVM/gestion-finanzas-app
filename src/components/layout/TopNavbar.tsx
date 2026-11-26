'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { useTheme } from 'next-themes';
import {
  Wallet,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  PieChart,
  Receipt,
  Landmark,
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { TopNavDropdown } from './TopNavDropdown';
import { SidebarNavLinks } from './SidebarNavLinks';
import { SidebarPeriodSelector } from './SidebarPeriodSelector';

const mainNavLinks = [
  { href: '/', label: 'Finanzas del Mes', icon: LayoutDashboard },
  { href: '/dashboard', label: 'Dashboard & KPIs', icon: PieChart },
  { href: '/gastos', label: 'Gastos & Compras', icon: Receipt },
  { href: '/fijos-y-prestamos', label: 'Fijos y Préstamos', icon: Landmark },
];

export function TopNavbar() {
  const pathname = usePathname();
  const {
    openRecordModal,
    periodo,
    puedeIrMesAnterior,
    irMesAnterior,
    irMesSiguiente,
    prefetchMesAnterior,
    prefetchMesSiguiente,
  } = useFinanzas();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7 || mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-colors">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* 1. Izquierda: Brand + Enlaces Principales */}
          <div className="flex items-center gap-6 min-w-0">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-105 shadow-2xs">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm tracking-tight text-foreground block leading-none">
                  Finanzas
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Control Personal
                </span>
              </div>
            </Link>

            {/* Enlaces de Navegación Horizontal (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-background font-semibold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Menú Dropdown de Planificación */}
              <TopNavDropdown pathname={pathname} />
            </nav>
          </div>

          {/* 2. Derecha: Botón Registro + Tema + Perfil + Hamburger móvil */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Botón Nuevo Registro Rápido */}
            <button
              type="button"
              onClick={() => openRecordModal('GASTO')}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 active:scale-95 transition shadow-2xs cursor-pointer"
              title="Registrar nuevo gasto (Tecla N)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Nuevo Registro</span>
              <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] bg-background/20 rounded font-mono font-normal">
                N
              </kbd>
            </button>

            {/* Selector de Tema Claro / Oscuro */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
              title="Cambiar tema"
              aria-label="Cambiar tema"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {/* Menú de Usuario */}
            <UserMenu />

            {/* Botón Hamburger para Móvil / Tablet */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-foreground hover:bg-muted transition cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Móvil / Tablet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-background border-r border-border h-full shadow-xl z-10 p-4 space-y-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-foreground">Finanzas</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1">
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
              <SidebarNavLinks pathname={pathname} onLinkClick={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
