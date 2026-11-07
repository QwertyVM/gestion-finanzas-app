'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { FloatingSumBar } from '../common/FloatingSumBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-24">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <FloatingSumBar />
    </div>
  );
}
