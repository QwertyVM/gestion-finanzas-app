import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | string | null | undefined, symbol: string = "S/"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  return `${symbol} ${Number.isNaN(num) ? "0.00" : num.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

export function formatPeriodoLabel(periodo: string): string {
  const [yearStr, monthStr] = periodo.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  const mesNombre = NOMBRES_MESES[monthIdx] || monthStr;
  return `${mesNombre} ${yearStr}`;
}

export function getCurrentPeriodo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// ==========================================
// CLASIFICACIÓN VISUAL Y DE NEGOCIO DE EGRESOS
// ==========================================

export type ClasificacionEgreso = 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'PRESTAMO_CUOTA' | 'VARIABLE';

export interface EstiloClasificacion {
  key: ClasificacionEgreso;
  label: string;
  badgeLabel: string;
  hexColor: string;
  borderColor: string;
  bgCardHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  accentText: string;
  pillActiveBg: string;
  lightBg: string;
}

export const ESTILOS_CLASIFICACION: Record<ClasificacionEgreso, EstiloClasificacion> = {
  FIJO: {
    key: 'FIJO',
    label: 'Costos Fijos',
    badgeLabel: 'Fijo',
    hexColor: '#0284c7', // Sky-600
    borderColor: 'border-l-sky-500 dark:border-l-sky-400',
    bgCardHover: 'hover:border-sky-300 dark:hover:border-sky-700/60',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200/80 dark:border-sky-800/60',
    dotColor: 'bg-sky-500',
    accentText: 'text-sky-600 dark:text-sky-400',
    pillActiveBg: 'bg-sky-600 text-white dark:bg-sky-500',
    lightBg: 'bg-sky-500/10 dark:bg-sky-500/20',
  },
  PRESTAMO: {
    key: 'PRESTAMO',
    label: 'Préstamos Bancarios',
    badgeLabel: 'Préstamo',
    hexColor: '#7c3aed', // Purple-600
    borderColor: 'border-l-purple-500 dark:border-l-purple-400',
    bgCardHover: 'hover:border-purple-300 dark:hover:border-purple-700/60',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200/80 dark:border-purple-800/60',
    dotColor: 'bg-purple-500',
    accentText: 'text-purple-600 dark:text-purple-400',
    pillActiveBg: 'bg-purple-600 text-white dark:bg-purple-500',
    lightBg: 'bg-purple-500/10 dark:bg-purple-500/20',
  },
  CUOTA: {
    key: 'CUOTA',
    label: 'Cuotas de Tarjeta',
    badgeLabel: 'Cuota',
    hexColor: '#4f46e5', // Indigo-600
    borderColor: 'border-l-indigo-500 dark:border-l-indigo-400',
    bgCardHover: 'hover:border-indigo-300 dark:hover:border-indigo-700/60',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
    dotColor: 'bg-indigo-500',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    pillActiveBg: 'bg-indigo-600 text-white dark:bg-indigo-500',
    lightBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
  },
  PRESTAMO_CUOTA: {
    key: 'PRESTAMO_CUOTA',
    label: 'Préstamos & Cuotas',
    badgeLabel: 'Préstamo / Cuota',
    hexColor: '#8b5cf6', // Violet-500
    borderColor: 'border-l-violet-500 dark:border-l-violet-400',
    bgCardHover: 'hover:border-violet-300 dark:hover:border-violet-700/60',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/50',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200/80 dark:border-violet-800/60',
    dotColor: 'bg-violet-500',
    accentText: 'text-violet-600 dark:text-violet-400',
    pillActiveBg: 'bg-violet-600 text-white dark:bg-violet-500',
    lightBg: 'bg-violet-500/10 dark:bg-violet-500/20',
  },
  VARIABLE: {
    key: 'VARIABLE',
    label: 'Compras & Variables',
    badgeLabel: 'Variable',
    hexColor: '#0d9488', // Teal-600
    borderColor: 'border-l-teal-500 dark:border-l-teal-400',
    bgCardHover: 'hover:border-teal-300 dark:hover:border-teal-700/60',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgeBorder: 'border-teal-200/80 dark:border-teal-800/60',
    dotColor: 'bg-teal-500',
    accentText: 'text-teal-600 dark:text-teal-400',
    pillActiveBg: 'bg-teal-600 text-white dark:bg-teal-500',
    lightBg: 'bg-teal-500/10 dark:bg-teal-500/20',
  },
};

export function getEstiloClasificacion(clasificacion?: string | null): EstiloClasificacion {
  if (!clasificacion) return ESTILOS_CLASIFICACION.VARIABLE;
  if (clasificacion === 'PRESTAMO_CUOTA') return ESTILOS_CLASIFICACION.PRESTAMO_CUOTA;
  if (clasificacion === 'PRESTAMO') return ESTILOS_CLASIFICACION.PRESTAMO;
  if (clasificacion === 'CUOTA') return ESTILOS_CLASIFICACION.CUOTA;
  if (clasificacion === 'FIJO') return ESTILOS_CLASIFICACION.FIJO;
  if (clasificacion === 'VARIABLE') return ESTILOS_CLASIFICACION.VARIABLE;
  return ESTILOS_CLASIFICACION.VARIABLE;
}

/**
 * Detecta si un concepto o categoría corresponde a una suscripción o servicio recurrente.
 */
export function esItemRecurrente(concepto: string = '', categoria: string = ''): boolean {
  const cat = (categoria || '').toLowerCase();
  const c = (concepto || '').toLowerCase();

  if (cat.includes('suscripci') || cat.includes('streaming') || cat.includes('membres')) {
    return true;
  }

  const keywords = [
    'netflix', 'spotify', 'icloud', 'youtube', 'disney', 'prime video', 'amazon prime',
    'apple', 'chatgpt', 'openai', 'natación', 'natacion', 'gym', 'gimnasio', 'smart fit',
    'fit', 'crunch', 'hbo', 'max', 'crunchyroll', 'deezer', 'paramount', 'star+', 'duolingo',
    'cloud', 'google storage', 'google one', 'dropbox'
  ];

  return keywords.some((kw) => c.includes(kw));
}

/**
 * Determina la clasificación de cualquier egreso o compromiso del mes.
 */
export function obtenerClasificacionEgreso(item: {
  tipo?: string;
  concepto?: string;
  categoria?: string;
  totalCuotas?: number;
}): ClasificacionEgreso {
  // Préstamos formales bancarios
  if (item.tipo === 'PRESTAMO') {
    return 'PRESTAMO';
  }

  // Compras diferidas en cuotas de tarjeta
  if (item.totalCuotas !== undefined && item.totalCuotas > 1) {
    return 'CUOTA';
  }

  // Costo Fijo (incluye suscripciones y gastos recurrentes mensuales)
  if (item.tipo === 'FIJO') {
    return 'FIJO';
  }

  // Compras de tarjeta o directos recurrentes (ej: streaming, suscripciones) se consideran fijos mensuales
  if (esItemRecurrente(item.concepto, item.categoria)) {
    return 'FIJO';
  }

  return 'VARIABLE';
}
