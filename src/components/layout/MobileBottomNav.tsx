'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Landmark,
  Plus,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openRecordModal } = useFinanzas();

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/finanzas-mes',
      label: 'Finanzas',
      icon: Receipt,
    },
    {
      href: '/gastos',
      label: 'Gastos',
      icon: Receipt,
    },
    {
      href: '/fijos-y-prestamos',
      label: 'Fijos',
      icon: Landmark,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg transition-all"
      aria-label="Navegación móvil inferior"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Primeros 2 links */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[56px] ${
                isActive
                  ? 'text-foreground font-semibold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-foreground/10' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Botón Central Destacado (+) */}
        <div className="flex items-center justify-center px-1">
          <button
            type="button"
            onClick={() => openRecordModal('GASTO')}
            className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:opacity-90 active:scale-90 transition-transform -mt-3.5 border-2 border-background"
            title="Registrar nuevo movimiento"
            aria-label="Registrar nuevo movimiento"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Últimos 2 links */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[56px] ${
                isActive
                  ? 'text-foreground font-semibold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-foreground/10' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
