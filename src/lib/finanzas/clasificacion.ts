import { esItemRecurrente } from '../utils';
import { ClasificacionEgreso } from '@prisma/client';
import { EgresoConsolidado } from './types';

export function obtenerColorCategoriaBackend(nombre?: string | null): { color: string; icono: string } {
  if (!nombre) return { color: '#64748b', icono: 'Tag' };
  const n = nombre.toLowerCase();

  // 1. Modelo 50/30/20 canónico
  if (n.includes('necesidad') || n.includes('50')) {
    return { color: '#0284c7', icono: 'ShieldCheck' };
  }
  if (n.includes('estilo') || n.includes('vida') || n.includes('deseo') || n.includes('30')) {
    return { color: '#0d9488', icono: 'Sparkles' };
  }
  if (n.includes('ahorro') || n.includes('deuda') || n.includes('invers') || n.includes('20')) {
    return { color: '#7c3aed', icono: 'PiggyBank' };
  }

  // Fallbacks de compatibilidad
  if (n.includes('vivienda') || n.includes('alquiler') || n.includes('depa')) {
    return { color: '#10b981', icono: 'Home' };
  }
  if (n.includes('servicio') || n.includes('luz') || n.includes('agua') || n.includes('net') || n.includes('gas')) {
    return { color: '#3b82f6', icono: 'Zap' };
  }
  if (n.includes('alimen') || n.includes('super') || n.includes('mercado') || n.includes('comida')) {
    return { color: '#f59e0b', icono: 'ShoppingCart' };
  }
  if (n.includes('transporte') || n.includes('vehic') || n.includes('auto') || n.includes('gasolina')) {
    return { color: '#64748b', icono: 'Car' };
  }
  if (n.includes('suscrip') || n.includes('stream') || n.includes('netflix') || n.includes('spotify')) {
    return { color: '#8b5cf6', icono: 'Tv' };
  }
  if (n.includes('salud') || n.includes('médic') || n.includes('medic') || n.includes('gym') || n.includes('personal')) {
    return { color: '#ec4899', icono: 'HeartPulse' };
  }
  if (n.includes('préstamo') || n.includes('prestamo') || n.includes('crédito') || n.includes('banco') || n.includes('deuda')) {
    return { color: '#6366f1', icono: 'Landmark' };
  }
  if (n.includes('educa') || n.includes('curso') || n.includes('estudio')) {
    return { color: '#06b6d4', icono: 'GraduationCap' };
  }
  if (n.includes('salida') || n.includes('ocio') || n.includes('restauran') || n.includes('bar')) {
    return { color: '#f97316', icono: 'Coffee' };
  }
  if (n.includes('familiar') || n.includes('compromiso') || n.includes('regalo')) {
    return { color: '#f43f5e', icono: 'HeartPulse' };
  }
  return { color: '#64748b', icono: 'Tag' };
}

export function clasificarItemBackend(item: {
  tipo: 'FIJO' | 'PRESTAMO' | 'TARJETA' | 'DIRECTO';
  concepto?: string;
  categoria?: string;
  totalCuotas?: number;
  /** Clasificación persistida en BD — tiene prioridad sobre el cálculo en runtime */
  clasificacionBD?: ClasificacionEgreso | null;
}): {
  clasificacion: 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  badgeLabel: string;
  tipoLabel: string;
  colorHex: string;
  colorKey: 'sky' | 'purple' | 'indigo' | 'teal';
  icono: string;
} {
  // Los préstamos siempre son PRESTAMO (provienen de su propio modelo, no de Gasto)
  if (item.tipo === 'PRESTAMO') {
    return {
      clasificacion: 'PRESTAMO',
      badgeLabel: 'Préstamo',
      tipoLabel: 'Préstamo Bancario',
      colorHex: '#7c3aed',
      colorKey: 'purple',
      icono: 'Landmark',
    };
  }

  // Los CostoFijo siempre son FIJO (provienen de su propio modelo, no de Gasto)
  if (item.tipo === 'FIJO') {
    return {
      clasificacion: 'FIJO',
      badgeLabel: 'Fijo',
      tipoLabel: 'Costo Fijo',
      colorHex: '#0284c7',
      colorKey: 'sky',
      icono: 'Home',
    };
  }

  // Si tiene cuotas (> 1) o está marcado como CUOTA, siempre es COMPRA A CUOTAS
  if ((item.totalCuotas && item.totalCuotas > 1) || item.clasificacionBD === 'CUOTA') {
    return {
      clasificacion: 'CUOTA',
      badgeLabel: 'Cuota',
      tipoLabel: 'Compra en Cuotas',
      colorHex: '#4f46e5',
      colorKey: 'indigo',
      icono: 'Layers',
    };
  }

  // Para gastos de 1 cuota (TARJETA o DIRECTO): usar la clasificación persistida en BD como fuente de verdad
  const clasificacion: 'FIJO' | 'PRESTAMO' | 'VARIABLE' =
    (item.clasificacionBD === 'FIJO' || item.clasificacionBD === 'PRESTAMO' || item.clasificacionBD === 'VARIABLE')
      ? item.clasificacionBD
      : (esItemRecurrente(item.concepto || '', item.categoria || '') ? 'FIJO' : 'VARIABLE');

  if (clasificacion === 'FIJO') {
    return {
      clasificacion: 'FIJO',
      badgeLabel: 'Fijo',
      tipoLabel: 'Costo Fijo',
      colorHex: '#0284c7',
      colorKey: 'sky',
      icono: 'Home',
    };
  }

  return {
    clasificacion: 'VARIABLE',
    badgeLabel: 'Variable',
    tipoLabel: 'Compra / Variable',
    colorHex: '#0d9488',
    colorKey: 'teal',
    icono: 'Banknote',
  };
}
