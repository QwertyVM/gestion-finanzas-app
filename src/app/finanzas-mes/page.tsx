import { FinanzasMesClient } from '@/components/dashboard/FinanzasMesClient';

export const metadata = {
  title: 'Finanzas del Mes | FinanzApp',
  description: 'Registro y gestión de ingresos y egresos por categorías.',
};

export default function FinanzasMesPage() {
  return <FinanzasMesClient />;
}
