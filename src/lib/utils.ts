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
