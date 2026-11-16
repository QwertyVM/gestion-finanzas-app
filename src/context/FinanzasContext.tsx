'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ResumenFinanciero } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth, UsuarioSesion } from './AuthContext';

export type { UsuarioSesion as UsuarioItem };

export type TipoRecordModal = 'GASTO' | 'INGRESO' | 'FIJO' | 'PRESTAMO';

export interface RecordModalOptions {
  metodoPago?: 'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA';
  totalCuotas?: number | string;
  tarjetaId?: string;
  categoriaId?: string;
  banco?: string;
}

interface CacheEntry {
  data: ResumenFinanciero;
  timestamp: number;
}

interface FinanzasContextType {
  periodo: string;
  setPeriodo: (p: string) => void;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  puedeIrMesAnterior: boolean;
  minPeriodo: string;
  resumen: ResumenFinanciero | null;
  loading: boolean;
  refresh: () => Promise<void>;
  prefetchPeriodo: (p: string) => Promise<void>;
  prefetchMesAnterior: () => void;
  prefetchMesSiguiente: () => void;
  // Usuario autenticado exclusivo de la instancia
  usuarioActual: UsuarioSesion | null;
  cerrarSesion: () => Promise<void>;
  // Selección interactiva para sumatorias automáticas
  selectedGastoIds: string[];
  toggleSelectGasto: (id: string, monto: number) => void;
  selectAllGastos: (items: Array<{ id: string; monto: number }>) => void;
  clearSelection: () => void;
  sumaSeleccionada: number;
  // Modal Dinámico de Registro Rápido
  isRecordModalOpen: boolean;
  recordModalType: TipoRecordModal;
  recordModalOptions?: RecordModalOptions;
  openRecordModal: (type?: TipoRecordModal, options?: RecordModalOptions) => void;
  closeRecordModal: () => void;
}

const FinanzasContext = createContext<FinanzasContextType | undefined>(undefined);

export function FinanzasProvider({ children }: { children: React.ReactNode }) {
  const { usuario: usuarioActual, cerrarSesion, loading: authLoading } = useAuth();
  const [periodo, setPeriodoState] = useState<string>(getCurrentPeriodo());
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Caché en memoria para transiciones instantáneas (0ms) entre periodos
  const cacheRef = React.useRef<Map<string, CacheEntry>>(new Map());
  const inFlightRef = React.useRef<Set<string>>(new Set());
  const activeRequestIdRef = React.useRef<number>(0);

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

          // Solo actualizar el resumen visible si la solicitud corresponde a la más reciente solicitada
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
        // Prefetch silencioso de fondo sin interrumpir la experiencia de usuario
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

      setSelectedItems(new Map());

      if (cached) {
        // ¡TRANSICIÓN INSTANTÁNEA (0ms)!
        setResumen(cached.data);
        setLoading(false);

        // Si el caché tiene más de 45 segundos, revalidar en segundo plano silenciosamente (SWR)
        if (Date.now() - cached.timestamp > 45_000) {
          fetchResumen(target, true);
        }
      } else {
        // Si no estaba en caché, cargar con indicador
        fetchResumen(target, false);
      }
    },
    [resumen?.minPeriodo, usuarioActual?.id, fetchResumen]
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
        setSelectedItems(new Map());
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

// Selección de items y sumatoria instantánea
const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

const toggleSelectGasto = (id: string, monto: number) => {
  setSelectedItems((prev) => {
    const next = new Map(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.set(id, monto);
    }
    return next;
  });
};

const selectAllGastos = (items: Array<{ id: string; monto: number }>) => {
  setSelectedItems((prev) => {
    const allSelected = items.every((item) => prev.has(item.id));
    if (allSelected) {
      return new Map();
    }
    const next = new Map();
    for (const item of items) {
      next.set(item.id, item.monto);
    }
    return next;
  });
};

const clearSelection = () => {
  setSelectedItems(new Map());
};

const selectedGastoIds = Array.from(selectedItems.keys());
const sumaSeleccionada = Array.from(selectedItems.values()).reduce((a, b) => a + b, 0);

// Modal Dinámico de Registro Unificado
const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
const [recordModalType, setRecordModalType] = useState<TipoRecordModal>('GASTO');
const [recordModalOptions, setRecordModalOptions] = useState<RecordModalOptions | undefined>(undefined);

const openRecordModal = useCallback((type: TipoRecordModal = 'GASTO', options?: RecordModalOptions) => {
  setRecordModalType(type);
  setRecordModalOptions(options);
  setIsRecordModalOpen(true);
}, []);

const closeRecordModal = useCallback(() => {
  setIsRecordModalOpen(false);
  setRecordModalOptions(undefined);
}, []);

// Atajos globales de teclado para registro rápido (Desktop: N o Cmd+K)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openRecordModal('GASTO');
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openRecordModal('GASTO');
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [openRecordModal]);

return (
  <FinanzasContext.Provider
    value={{
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
      usuarioActual,
      cerrarSesion,
      selectedGastoIds,
      toggleSelectGasto,
      selectAllGastos,
      clearSelection,
      sumaSeleccionada,
      isRecordModalOpen,
      recordModalType,
      recordModalOptions,
      openRecordModal,
      closeRecordModal,
    }}
  >
    {children}
  </FinanzasContext.Provider>
);
}

export function useFinanzas() {
  const context = useContext(FinanzasContext);
  if (!context) {
    throw new Error('useFinanzas debe usarse dentro de un FinanzasProvider');
  }
  return context;
}
