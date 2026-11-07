import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FinanzasProvider } from '@/context/FinanzasContext';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'FinanzApp - Control Financiero Personal',
  description: 'Gestión de finanzas personales, costos fijos, préstamos bancarios, facturación de tarjetas y flujo mensual.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FinanzasProvider>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="top-right" />
          </FinanzasProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
