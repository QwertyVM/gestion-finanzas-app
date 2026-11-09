import { ExecutiveDashboardClient } from '@/components/dashboard/ExecutiveDashboardClient';

export const metadata = {
  title: 'Dashboard Ejecutivo | FinanzApp',
  description: 'Análisis visual, gráficos de distribución y métricas clave de tus finanzas personales.',
};

export default function DashboardPage() {
  return <ExecutiveDashboardClient />;
}
