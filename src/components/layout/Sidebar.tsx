'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatPeriodoLabel } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  Wallet,
  LayoutDashboard,
  PieChart,
  Receipt,
  Landmark,
  CalendarDays,
  Calculator,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { periodo, irMesAnterior, irMesSiguiente, openRecordModal } = useFinanzas();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = 'Gratificación';
  if (mesActual === 12) labelEspecial = 'Gratificación';
  if (mesActual === 3) labelEspecial = 'Utilidades';

  const navSections = [
    {
      title: 'General',
      links: [
        {
          href: '/',
          label: 'Finanzas del Mes',
          icon: LayoutDashboard,
        },
        {
          href: '/dashboard',
          label: 'Dashboard & KPIs',
          icon: PieChart,
        },
        {
          href: '/gastos',
          label: 'Gastos & Compras',
          icon: Receipt,
        },
        {
          href: '/fijos-y-prestamos',
          label: 'Fijos y Préstamos',
          icon: Landmark,
        },
      ],
    },
    {
      title: 'Planificación',
      links: [
        {
          href: '/flujo-anual',
          label: 'Proyección Anual',
          icon: CalendarDays,
        },
        {
          href: '/simulador-prestamos',
          label: 'Simulador Préstamos',
          icon: Calculator,
        },
      ],
    },
    {
      title: 'Ajustes',
      links: [
        {
          href: '/configuracion',
          label: 'Configuración',
          icon: Settings,
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group"
          >
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
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Botón de Registro Rápido Dinámico */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            openRecordModal('GASTO');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-foreground text-background font-semibold text-xs shadow-sm hover:opacity-90 active:scale-98 transition group"
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

        {/* Period Selector Minimalist */}
        <div className="bg-muted/40 p-1.5 rounded-xl border border-border/60">
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={irMesAnterior}
              className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="text-center truncate px-1">
              <span className="text-xs font-semibold text-foreground capitalize tracking-tight block">
                {formatPeriodoLabel(periodo)}
              </span>
              {esMesEspecial && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
                  {labelEspecial}
                </span>
              )}
            </div>

            <button
              onClick={irMesSiguiente}
              className="p-1.5 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/70">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Minimal Profile & Theme Switch */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between px-1">
        <div className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">Víctor</span>
          <span className="mx-1.5 opacity-40">·</span>
          <span>TC S/ 4.00</span>
        </div>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          title="Cambiar tema"
          aria-label="Cambiar tema"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Bar for Mobile */}
      <header className="sticky top-0 z-40 w-full md:hidden border-b border-border/80 bg-background/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-foreground hover:bg-muted transition"
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
          <button
            onClick={() => openRecordModal('GASTO')}
            className="p-1.5 rounded-lg bg-foreground text-background hover:opacity-90 active:scale-95 transition"
            title="Nuevo Registro"
            aria-label="Nuevo Registro"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {formatPeriodoLabel(periodo)}
          </span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Cambiar tema"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </header>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col border-r border-border/60 bg-background/95 backdrop-blur-md z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
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
