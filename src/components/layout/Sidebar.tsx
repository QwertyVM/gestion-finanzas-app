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
  Receipt,
  Landmark,
  CalendarDays,
  Calculator,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { periodo, irMesAnterior, irMesSiguiente, resumen } = useFinanzas();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = '🎁 Gratificación';
  if (mesActual === 12) labelEspecial = '🎄 Gratificación';
  if (mesActual === 3) labelEspecial = '💼 Utilidades';

  const navSections = [
    {
      title: 'GESTIÓN DIARIA',
      links: [
        {
          href: '/',
          label: 'Finanzas (Dashboard)',
          icon: LayoutDashboard,
          description: 'Resumen mensual y pendientes',
        },
        {
          href: '/gastos',
          label: 'Gastos & Compras',
          icon: Receipt,
          description: 'Historial y registro diario',
        },
        {
          href: '/fijos-y-prestamos',
          label: 'Fijos y Préstamos',
          icon: Landmark,
          description: 'Agregar y editar compromisos',
          badge: 'Gestión',
        },
      ],
    },
    {
      title: 'PLANIFICACIÓN',
      links: [
        {
          href: '/flujo-anual',
          label: 'Proyección Anual',
          icon: CalendarDays,
          description: 'Flujo 12 meses y extras',
        },
        {
          href: '/simulador-prestamos',
          label: 'Simulador Préstamos',
          icon: Calculator,
          description: 'Cronogramas y cuotas',
        },
      ],
    },
    {
      title: 'SISTEMA',
      links: [
        {
          href: '/configuracion',
          label: 'Ajustes',
          icon: Settings,
          description: 'Sueldo, TC y metas',
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Top Part: Brand + Navigator + Navigation Links */}
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1">
                Finanz<span>App</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Control Personal
              </p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mes Activo / Selector Rápido */}
        <div className="bg-secondary/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              Periodo en vista
            </span>
            {esMesEspecial && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" /> Extra
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 bg-background px-2 py-1.5 rounded-xl border border-border/80 shadow-inner">
            <button
              onClick={irMesAnterior}
              className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center truncate px-1">
              <div className="text-xs font-bold text-foreground capitalize tracking-wide">
                {formatPeriodoLabel(periodo)}
              </div>
              {esMesEspecial && (
                <div className="text-[10px] font-semibold text-amber-500 truncate">
                  {labelEspecial}
                </div>
              )}
            </div>

            <button
              onClick={irMesSiguiente}
              className="p-1 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grupos de Enlaces */}
        <div className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80">
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
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-slate-900 dark:text-white' : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        />
                        <span className="truncate">{link.label}</span>
                      </div>

                      {link.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-slate-200/90 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Info & Theme Toggle */}
      <div className="pt-4 border-t border-border space-y-3">
        {/* Quick User / Balance Info */}
        <div className="bg-secondary/40 dark:bg-slate-900/40 p-2.5 rounded-xl border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-foreground">Víctor</p>
            <p className="text-[10px] text-muted-foreground">TC: S/ 4.00 · Sueldo: S/ 8.2k</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition relative"
            title="Cambiar tema día/noche"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2 left-2 w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Bar for Mobile Screens */}
      <header className="sticky top-0 z-40 w-full md:hidden border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition"
            aria-label="Abrir barra lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              Finanz<span>App</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-[11px] font-bold text-foreground bg-secondary/80 px-2 sm:px-2.5 py-1 rounded-lg border border-border capitalize truncate max-w-[105px] sm:max-w-none">
            {formatPeriodoLabel(periodo)}
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            title="Tema"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </header>

      {/* Desktop Persistent Sidebar (Fixed on Left) */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r border-border bg-card/95 backdrop-blur-md z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Menu */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-card border-r border-border h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
