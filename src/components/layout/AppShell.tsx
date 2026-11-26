'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      {/* Barra Lateral Navegación Desktop */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="md:pl-60 flex flex-col min-h-screen transition-all min-w-0">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-32 min-w-0">
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
