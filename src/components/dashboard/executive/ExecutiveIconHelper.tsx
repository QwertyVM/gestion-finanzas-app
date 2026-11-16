'use client';

import React from 'react';
import {
  Home,
  Zap,
  ShoppingCart,
  Car,
  Tv,
  HeartPulse,
  Landmark,
  GraduationCap,
  Coffee,
  CreditCard,
  Layers,
  Banknote,
  Tag,
} from 'lucide-react';

export function renderExecutiveIcon(iconoNombre?: string | null, className = 'w-4 h-4') {
  switch (iconoNombre) {
    case 'Home':
      return <Home className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Banknote':
      return <Banknote className={className} />;
    default:
      return <Tag className={className} />;
  }
}

export function ExecutiveIconHelper({ name, className = 'w-4 h-4' }: { name?: string | null; className?: string }) {
  return renderExecutiveIcon(name, className);
}
