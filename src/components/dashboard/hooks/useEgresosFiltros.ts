'use client';

import { useState, useMemo } from 'react';
import { Home, Landmark, Layers, ShoppingBag } from 'lucide-react';
import type { EgresoItemConClasificacion } from './useEgresosDragDrop';

export type FiltroEstado = 'PENDIENTE' | 'ADELANTADO' | 'PAGADO' | 'TODOS';
export type FiltroEgreso = 'TODOS' | 'FIJOS' | 'PRESTAMOS' | 'CUOTAS' | 'VARIABLES';

interface UseEgresosFiltrosProps {
  listaActivaEgresos: EgresoItemConClasificacion[];
  sueldoPrincipal?: any;
}

export function useEgresosFiltros({
  listaActivaEgresos,
  sueldoPrincipal,
}: UseEgresosFiltrosProps) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('PENDIENTE');
  const [filtroEgreso, setFiltroEgreso] = useState<FiltroEgreso>('TODOS');
  const [filtroFuenteIngreso, setFiltroFuenteIngreso] = useState<string>('TODOS');
  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});

  const toggleColapsarSeccion = (seccionId: string) => {
    setSeccionesColapsadas((prev) => ({
      ...prev,
      [seccionId]: !prev[seccionId],
    }));
  };

  // Filtrado reactivo por Clasificación
  const egresosPorClasificacion = useMemo(() => {
    return listaActivaEgresos.filter((item) => {
      if (filtroEgreso === 'FIJOS') return item.clasificacion === 'FIJO';
      if (filtroEgreso === 'PRESTAMOS') return item.clasificacion === 'PRESTAMO';
      if (filtroEgreso === 'CUOTAS') return item.clasificacion === 'CUOTA';
      if (filtroEgreso === 'VARIABLES') return item.clasificacion === 'VARIABLE';
      return true;
    });
  }, [listaActivaEgresos, filtroEgreso]);

  // Filtrado reactivo por Estado y Fuente de Ingreso
  const egresosFiltrados = useMemo(() => {
    return egresosPorClasificacion.filter((item) => {
      if (filtroEstado !== 'TODOS' && item.estado !== filtroEstado) return false;

      if (filtroFuenteIngreso !== 'TODOS') {
        const esFiltroSueldo = filtroFuenteIngreso === sueldoPrincipal?.id || filtroFuenteIngreso === 'SUELDO';
        if (esFiltroSueldo) {
          return item.ingresoId === sueldoPrincipal?.id || !item.ingresoId;
        } else {
          return item.ingresoId === filtroFuenteIngreso;
        }
      }

      return true;
    });
  }, [egresosPorClasificacion, filtroEstado, filtroFuenteIngreso, sueldoPrincipal]);

  // Secciones estructuradas sincronizadas con backend
  const seccionesCompromisos = useMemo(() => {
    const config = [
      {
        id: 'FIJOS',
        clasificacion: 'FIJO',
        titulo: 'Compras fijas',
        descripcion: 'Gastos recurrentes y servicios regulares',
        icono: Home,
        headerBg: 'bg-sky-500/10 dark:bg-sky-950/40',
        iconBg: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200/80 dark:border-sky-800/60',
        colorKey: 'sky',
      },
      {
        id: 'PRESTAMOS',
        clasificacion: 'PRESTAMO',
        titulo: 'Préstamos bancarios',
        descripcion: 'Cuotas mensuales de financiamiento y créditos',
        icono: Landmark,
        headerBg: 'bg-purple-500/10 dark:bg-purple-950/40',
        iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200/80 dark:border-purple-800/60',
        colorKey: 'purple',
      },
      {
        id: 'CUOTAS',
        clasificacion: 'CUOTA',
        titulo: 'Compras a cuotas',
        descripcion: 'Compras en cuotas con tarjeta de crédito',
        icono: Layers,
        headerBg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
        iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
        colorKey: 'indigo',
      },
      {
        id: 'VARIABLES',
        clasificacion: 'VARIABLE',
        titulo: 'Otras compras / Gastos variables',
        descripcion: 'Compras directas del mes y consumos variables',
        icono: ShoppingBag,
        headerBg: 'bg-teal-500/10 dark:bg-teal-950/40',
        iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200/80 dark:border-teal-800/60',
        colorKey: 'teal',
      },
    ];

    return config
      .map((conf) => {
        const items = egresosFiltrados.filter(
          (e) => e.clasificacion === conf.clasificacion || e.clasificacion === conf.id
        );
        const subtotal = items.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        return {
          ...conf,
          itemsFiltrados: items,
          items,
          subtotal,
          total: subtotal,
          filteredCount: items.length,
          colapsada: !!seccionesColapsadas[conf.id],
        };
      })
      .filter((sec) => {
        if (filtroEgreso === 'TODOS') {
          return sec.filteredCount > 0;
        }
        return filtroEgreso === sec.id;
      });
  }, [egresosFiltrados, filtroEgreso, seccionesColapsadas]);

  return {
    filtroEstado,
    setFiltroEstado,
    filtroEgreso,
    setFiltroEgreso,
    filtroFuenteIngreso,
    setFiltroFuenteIngreso,
    seccionesColapsadas,
    toggleColapsarSeccion,
    egresosFiltrados,
    seccionesCompromisos,
  };
}
