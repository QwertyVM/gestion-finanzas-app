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

export type ClasificacionEgreso = 'FIJO' | 'PRESTAMO_CUOTA' | 'VARIABLE';

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
    label: 'Costos Fijos',
    badgeLabel: 'Fijo',
    borderColor: 'border-l-sky-500/70 dark:border-l-sky-400/70',
    bgCardHover: 'hover:border-zinc-300 dark:hover:border-zinc-700',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200/60 dark:border-sky-800/50',
    dotColor: 'bg-sky-500',
  },
  PRESTAMO_CUOTA: {
    key: 'PRESTAMO_CUOTA',
    label: 'Préstamos & Cuotas',
    badgeLabel: 'Préstamo',
    borderColor: 'border-l-violet-500/70 dark:border-l-violet-400/70',
    bgCardHover: 'hover:border-zinc-300 dark:hover:border-zinc-700',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200/60 dark:border-violet-800/50',
    dotColor: 'bg-violet-500',
  },
  VARIABLE: {
    key: 'VARIABLE',
    label: 'Compras & Variables',
    badgeLabel: 'Variable',
    borderColor: 'border-l-zinc-300 dark:border-l-zinc-700',
    bgCardHover: 'hover:border-zinc-300 dark:hover:border-zinc-700',
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800/60',
    badgeText: 'text-zinc-600 dark:text-zinc-400',
    badgeBorder: 'border-zinc-200 dark:border-zinc-700/60',
    dotColor: 'bg-zinc-400 dark:bg-zinc-500',
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
