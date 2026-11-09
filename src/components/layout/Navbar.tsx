'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatPeriodoLabel } from '@/lib/utils';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  PieChart,
  Receipt,
  Landmark,
  CalendarDays,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const pathname = usePathname();
  const { periodo, irMesAnterior, irMesSiguiente } = useFinanzas();
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: PieChart },
    { href: '/', label: 'Finanzas Mes', icon: LayoutDashboard },
    { href: '/gastos', label: 'Gastos', icon: Receipt },
    { href: '/fijos-y-prestamos', label: 'Fijos & Préstamos', icon: Landmark },
    { href: '/flujo-anual', label: 'Flujo Anual', icon: CalendarDays },
    { href: '/simulador-prestamos', label: 'Simulador', icon: Calculator },
    { href: '/configuracion', label: 'Ajustes', icon: Settings },
  ];

  const mesActual = parseInt(periodo.split('-')[1], 10);
  const esMesEspecial = mesActual === 7 || mesActual === 12 || mesActual === 3;
  let labelEspecial = '';
  if (mesActual === 7) labelEspecial = '🎁 Gratificación';
  if (mesActual === 12) labelEspecial = '🎄 Gratificación';
  if (mesActual === 3) labelEspecial = '💼 Utilidades';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Minimalista */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              Finanz<span className="text-sky-500">App</span>
            </span>
          </Link>

          {/* Navegador de Meses Simple y Limpio */}
          <div className="flex items-center gap-1 bg-secondary/80 px-2 py-1 rounded-xl border border-border shadow-inner">
            <button
              onClick={irMesAnterior}
              className="p-1 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2 py-0.5 text-center min-w-[130px]">
              <div className="text-xs font-bold text-foreground capitalize tracking-wide flex items-center justify-center gap-1.5">
                <span>{formatPeriodoLabel(periodo)}</span>
                {esMesEspecial && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> Extra
                  </span>
                )}
              </div>
              {esMesEspecial && (
                <div className="text-[9px] font-semibold text-amber-500 truncate">
                  {labelEspecial}
                </div>
              )}
            </div>

            <button
              onClick={irMesSiguiente}
              className="p-1 hover:bg-background text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Enlaces de Navegación Minimalistas */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-secondary text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Alternar Tema */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              title="Tema"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="flex md:hidden overflow-x-auto border-t border-border px-3 py-1.5 gap-1.5 no-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                isActive
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
