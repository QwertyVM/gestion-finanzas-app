'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Landmark,
  CalendarDays,
  Calculator,
  Settings,
  UserCheck,
  Gauge,
} from 'lucide-react';

interface SidebarNavLinksProps {
  pathname: string;
  onLinkClick: () => void;
}

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
        href: '/presupuesto-operativo',
        label: 'Dinero para Vivir',
        icon: Gauge,
      },
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
        href: '/perfil',
        label: 'Mi Perfil',
        icon: UserCheck,
      },
      {
        href: '/configuracion',
        label: 'Configuración',
        icon: Settings,
      },
    ],
  },
];

export function SidebarNavLinks({ pathname, onLinkClick }: SidebarNavLinksProps) {
  return (
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
                  onClick={onLinkClick}
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
  );
}
