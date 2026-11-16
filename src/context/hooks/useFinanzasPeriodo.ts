'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResumenFinanciero } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { toast } from 'sonner';
import type { UsuarioSesion } from '../AuthContext';
import type { CacheEntry } from '../finanzas-context-types';

interface UseFinanzasPeriodoProps {
  usuarioActual: UsuarioSesion | null;
  authLoading: boolean;
  cerrarSesion: () => Promise<void>;
  onPeriodoChange?: () => void;
}

export function useFinanzasPeriodo({
  usuarioActual,
  authLoading,
  cerrarSesion,
  onPeriodoChange,
}: UseFinanzasPeriodoProps) {
  const [periodo, setPeriodoState] = useState<string>(getCurrentPeriodo());
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Caché en memoria para transiciones instantáneas (0ms) entre periodos
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inFlightRef = useRef<Set<string>>(new Set());
  const activeRequestIdRef = useRef<number>(0);

  // Limpiar caché cuando cambia el usuario autenticado
  useEffect(() => {
    cacheRef.current.clear();
    inFlightRef.current.clear();
  }, [usuarioActual?.id]);

  // Cargar periodo guardado al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finanzapp_periodo');
      if (saved && /^\d{4}-\d{2}$/.test(saved)) {
        setPeriodoState(saved);
      }
    }
  }, []);

  const minPeriodo = resumen?.minPeriodo || '2026-10';
  const puedeIrMesAnterior = periodo > minPeriodo;

  const fetchResumen = useCallback(
    async (targetPeriodo: string, silent: boolean = false, intentos: number = 2) => {
      if (!usuarioActual?.id) {
        setLoading(false);
        return;
      }

      const uId = usuarioActual.id;
      const cacheKey = `${uId}_${targetPeriodo}`;
      const requestId = ++activeRequestIdRef.current;

      if (!silent) {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/finanzas?periodo=${targetPeriodo}`);
        if (!res.ok) {
          if (res.status === 401) {
            await cerrarSesion();
            return;
          }
          throw new Error('Error al cargar datos financieros');
        }
        const data: ResumenFinanciero = await res.json();

        // Almacenar en caché en memoria
        cacheRef.current.set(cacheKey, { data, timestamp: Date.now() });

        // Solo actualizar el resumen si la solicitud es la más reciente
        if (requestId === activeRequestIdRef.current) {
          setResumen(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (intentos > 1) {
          await new Promise((r) => setTimeout(r, 600));
          return fetchResumen(targetPeriodo, silent, intentos - 1);
        }
        if (!silent) {
          console.error('Error al cargar resumen financiero:', err);
          toast.error('No se pudo cargar la información del periodo');
          setLoading(false);
        }
      }
    },
    [usuarioActual?.id, cerrarSesion]
  );

  const prefetchPeriodo = useCallback(
    async (p: string) => {
      const uId = usuarioActual?.id;
      if (!uId || !p) return;
      const cacheKey = `${uId}_${p}`;
      if (cacheRef.current.has(cacheKey) || inFlightRef.current.has(cacheKey)) return;

      inFlightRef.current.add(cacheKey);
      try {
        const res = await fetch(`/api/finanzas?periodo=${p}`);
        if (res.ok) {
          const data: ResumenFinanciero = await res.json();
          cacheRef.current.set(cacheKey, { data, timestamp: Date.now() });
        }
      } catch {
        // Prefetch silencioso en segundo plano
      } finally {
        inFlightRef.current.delete(cacheKey);
      }
    },
    [usuarioActual?.id]
  );

  const setPeriodo = useCallback(
    (p: string) => {
      const target = resumen?.minPeriodo && p < resumen.minPeriodo ? resumen.minPeriodo : p;
      setPeriodoState(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('finanzapp_periodo', target);
      }

      const uId = usuarioActual?.id || 'anon';
      const cacheKey = `${uId}_${target}`;
      const cached = cacheRef.current.get(cacheKey);

      onPeriodoChange?.();

      if (cached) {
        // Transición instantánea (0ms)
        setResumen(cached.data);
        setLoading(false);

        // Si el caché tiene más de 45 segundos, revalidar silenciosamente (SWR)
        if (Date.now() - cached.timestamp > 45_000) {
          fetchResumen(target, true);
        }
      } else {
        fetchResumen(target, false);
      }
    },
    [resumen?.minPeriodo, usuarioActual?.id, onPeriodoChange, fetchResumen]
  );

  // Carga inicial al autenticar
  useEffect(() => {
    if (!authLoading && usuarioActual?.id) {
      const uId = usuarioActual.id;
      const cacheKey = `${uId}_${periodo}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setResumen(cached.data);
        setLoading(false);
      } else {
        fetchResumen(periodo, false);
      }
      onPeriodoChange?.();
    } else if (!authLoading && !usuarioActual?.id) {
      setLoading(false);
    }
  }, [authLoading, usuarioActual?.id]);

  // Prefetch proactivo de meses adyacentes (anterior y siguiente)
  useEffect(() => {
    if (!periodo || !usuarioActual?.id || authLoading) return;

    const [anio, mes] = periodo.split('-').map(Number);
    const dAnt = new Date(anio, mes - 2, 1);
    const pAnt = `${dAnt.getFullYear()}-${String(dAnt.getMonth() + 1).padStart(2, '0')}`;
    const dSig = new Date(anio, mes, 1);
    const pSig = `${dSig.getFullYear()}-${String(dSig.getMonth() + 1).padStart(2, '0')}`;

    const timer = setTimeout(() => {
      const minP = resumen?.minPeriodo || '2026-10';
      if (pAnt >= minP) {
        prefetchPeriodo(pAnt);
      }
      prefetchPeriodo(pSig);
    }, 200);

    return () => clearTimeout(timer);
  }, [periodo, usuarioActual?.id, authLoading, resumen?.minPeriodo, prefetchPeriodo]);

  const prefetchMesAnterior = useCallback(() => {
    if (!puedeIrMesAnterior) return;
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes - 2, 1);
    const pAnt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (pAnt >= minPeriodo) {
      prefetchPeriodo(pAnt);
    }
  }, [periodo, puedeIrMesAnterior, minPeriodo, prefetchPeriodo]);

  const prefetchMesSiguiente = useCallback(() => {
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes, 1);
    const pSig = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    prefetchPeriodo(pSig);
  }, [periodo, prefetchPeriodo]);

  const irMesAnterior = useCallback(() => {
    if (!puedeIrMesAnterior) return;
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes - 2, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (nuevoPeriodo < minPeriodo) return;
    setPeriodo(nuevoPeriodo);
  }, [periodo, puedeIrMesAnterior, minPeriodo, setPeriodo]);

  const irMesSiguiente = useCallback(() => {
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setPeriodo(nuevoPeriodo);
  }, [periodo, setPeriodo]);

  const refresh = useCallback(async () => {
    const uId = usuarioActual?.id;
    if (uId) {
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(`${uId}_`)) {
          cacheRef.current.delete(key);
        }
      }
    }
    await fetchResumen(periodo, false);
  }, [usuarioActual?.id, periodo, fetchResumen]);

  return {
    periodo,
    setPeriodo,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    minPeriodo,
    resumen,
    loading: loading || authLoading,
    refresh,
    prefetchPeriodo,
    prefetchMesAnterior,
    prefetchMesSiguiente,
  };
}
