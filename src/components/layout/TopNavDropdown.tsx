'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Gauge, CalendarDays, Calculator } from 'lucide-react';

interface TopNavDropdownProps {
  pathname: string;
}

const planificacionLinks = [
  {
    href: '/presupuesto-operativo',
    label: 'Dinero para Vivir',
    desc: 'Presupuesto operativo disponible',
    icon: Gauge,
  },
  {
    href: '/flujo-anual',
    label: 'Proyección Anual',
    desc: 'Flujo proyectado mes a mes',
    icon: CalendarDays,
  },
  {
    href: '/simulador-prestamos',
    label: 'Simulador Préstamos',
    desc: 'Amortización y cuotas bancarias',
    icon: Calculator,
  },
];

export function TopNavDropdown({ pathname }: TopNavDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPlanificacionActive = planificacionLinks.some((l) => pathname === l.href);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
                ? 'bg-background text-foreground font-semibold shadow-2xs border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50 font-medium'
            }`}
      >
        <span>Planificación</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
        open ? '-rotate-180' : ''
      }`}
        />
    </button>

      {
    open && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-card border border-border/80 shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {planificacionLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-xs">{link.label}</div>
                    <div className="text-[10px] text-muted-foreground/80 truncate">
                      {link.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
