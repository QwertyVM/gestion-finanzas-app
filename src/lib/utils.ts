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
// CLASIFICACIÓN VISUAL DE EGRESOS DEL MES
// ==========================================

export type ClasificacionEgreso = 'FIJO' | 'PRESTAMO_CUOTA' | 'RECURRENTE' | 'VARIABLE';

export interface EstiloClasificacion {
  key: ClasificacionEgreso;
  label: string;
  badgeLabel: string;
  borderColor: string;
  bgCardHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const ESTILOS_CLASIFICACION: Record<ClasificacionEgreso, EstiloClasificacion> = {
  FIJO: {
    key: 'FIJO',
    label: 'Fijos',
    badgeLabel: 'Fijo',
    borderColor: 'border-l-sky-500 dark:border-l-sky-400',
    bgCardHover: 'hover:border-sky-300 dark:hover:border-sky-700',
    badgeBg: 'bg-sky-50 dark:bg-sky-500/15',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200/80 dark:border-sky-500/30',
    dotColor: 'bg-sky-500',
  },
  PRESTAMO_CUOTA: {
    key: 'PRESTAMO_CUOTA',
    label: 'Préstamos & Cuotas',
    badgeLabel: 'Préstamo / Cuota',
    borderColor: 'border-l-purple-500 dark:border-l-purple-400',
    bgCardHover: 'hover:border-purple-300 dark:hover:border-purple-700',
    badgeBg: 'bg-purple-50 dark:bg-purple-500/15',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200/80 dark:border-purple-500/30',
    dotColor: 'bg-purple-500',
  },
  RECURRENTE: {
    key: 'RECURRENTE',
    label: 'Recurrentes',
    badgeLabel: 'Recurrente',
    borderColor: 'border-l-pink-500 dark:border-l-pink-400',
    bgCardHover: 'hover:border-pink-300 dark:hover:border-pink-700',
    badgeBg: 'bg-pink-50 dark:bg-pink-500/15',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-200/80 dark:border-pink-500/30',
    dotColor: 'bg-pink-500',
  },
  VARIABLE: {
    key: 'VARIABLE',
    label: 'Compras & Variables',
    badgeLabel: 'Compra',
    borderColor: 'border-l-slate-400 dark:border-l-slate-600',
    bgCardHover: 'hover:border-slate-300 dark:hover:border-slate-700',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-600 dark:text-slate-300',
    badgeBorder: 'border-slate-200/60 dark:border-slate-700',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
  },
};

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
 * Determina la clasificación visual de cualquier egreso o compromiso del mes.
 */
export function obtenerClasificacionEgreso(item: {
  tipo: string;
  concepto: string;
  categoria?: string;
  totalCuotas?: number;
}): ClasificacionEgreso {
  // Préstamos formales o compras diferidas en varias cuotas
  if (item.tipo === 'PRESTAMO' || (item.totalCuotas !== undefined && item.totalCuotas > 1)) {
    return 'PRESTAMO_CUOTA';
  }

  // Costo Fijo -> chequear si es recurrente (suscripción) o fijo esencial
  if (item.tipo === 'FIJO') {
    if (esItemRecurrente(item.concepto, item.categoria)) {
      return 'RECURRENTE';
    }
    return 'FIJO';
  }

  // Compras de tarjeta o directos -> chequear si son suscripciones recurrentes
  if (esItemRecurrente(item.concepto, item.categoria)) {
    return 'RECURRENTE';
  }

  return 'VARIABLE';
}
