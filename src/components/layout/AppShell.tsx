'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { FloatingSumBar } from '../common/FloatingSumBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Barra Lateral Navegación */}
      <Sidebar />

      {/* Contenedor Principal adaptado al sidebar izquierdo */}
      <div className="md:pl-64 flex flex-col min-h-screen transition-all min-w-0">
        <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 min-w-0">
          {children}
        </main>
      </div>

      <FloatingSumBar />
    </div>
  );
}
