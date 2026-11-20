import {
  Utensils,
  Fuel,
  ShieldAlert,
  Coffee,
  ShoppingCart,
  Home,
  HeartPulse,
  Bus,
  Baby,
  Smartphone,
  Sparkles,
  DollarSign,
  Tv,
  Gift,
  Film,
  BookOpen,
  Scale,
  PartyPopper,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export const ICONOS_DISPONIBLES: Array<{ key: string; label: string; icon: LucideIcon }> = [
  { key: 'Utensils', label: 'Comida', icon: Utensils },
  { key: 'Fuel', label: 'Combustible', icon: Fuel },
  { key: 'ShieldAlert', label: 'Emergencias', icon: ShieldAlert },
  { key: 'Coffee', label: 'Café / Salidas', icon: Coffee },
  { key: 'ShoppingCart', label: 'Supermercado', icon: ShoppingCart },
  { key: 'Home', label: 'Hogar', icon: Home },
  { key: 'HeartPulse', label: 'Salud', icon: HeartPulse },
  { key: 'Bus', label: 'Transporte', icon: Bus },
  { key: 'Baby', label: 'Hijos / Familia', icon: Baby },
  { key: 'Smartphone', label: 'Servicios', icon: Smartphone },
  { key: 'Sparkles', label: 'Estilo de Vida', icon: Sparkles },
  { key: 'DollarSign', label: 'Ahorro', icon: DollarSign },
  { key: 'Tv', label: 'Streaming', icon: Tv },
  { key: 'Gift', label: 'Regalos', icon: Gift },
  { key: 'Film', label: 'Entretenimiento', icon: Film },
  { key: 'BookOpen', label: 'Educación', icon: BookOpen },
  { key: 'Scale', label: 'Equilibrio', icon: Scale },
  { key: 'PartyPopper', label: 'Festivo', icon: PartyPopper },
  { key: 'ShieldCheck', label: 'Protección', icon: ShieldCheck },
];

export const COLORES_SOBRES: string[] = [
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#2563eb', // Blue
  '#059669', // Emerald
  '#ca8a04', // Yellow
  '#9333ea', // Purple
  '#4f46e5', // Indigo
];

export function getPresupuestoIcon(iconKey: string): LucideIcon {
  const match = ICONOS_DISPONIBLES.find((i) => i.key === iconKey);
  return match ? match.icon : Utensils;
}
