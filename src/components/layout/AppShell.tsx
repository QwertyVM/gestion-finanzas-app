'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopNavbar } from './TopNavbar';
import { FloatingSumBar } from '../common/FloatingSumBar';
import { DynamicRecordModal } from '../modals/DynamicRecordModal';
import { MobileBottomNav } from './MobileBottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        <main className="min-h-screen flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background flex flex-col">
        {/* Barra de Navegación Horizontal Superior */}
        <TopNavbar />

          {/* Contenedor Principal Centrado y Panorámico */}
          <div className="flex-1 flex flex-col min-h-0 w-full">
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-32 min-w-0">
              {children}
            </main>
          </div>

          {/* Barra de Sumatoria Flotante */}
          <FloatingSumBar />

          {/* Barra de Navegación Inferior Móvil */}
          <MobileBottomNav />

          {/* Modal Dinámico Global (Desktop + Mobile Sheet) */}
          <DynamicRecordModal />
        </div>
        );
}
