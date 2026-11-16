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

  const setPeriodo = useCallback((p: string) => {
    const target = resumen?.minPeriodo && p < resumen.minPeriodo ? resumen.minPeriodo : p;
    setPeriodoState(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('finanzapp_periodo', target);
    }
  }, [resumen?.minPeriodo]);

  const fetchResumen = useCallback(
    async (intentos: number = 2) => {
      if (!usuarioActual?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/finanzas?periodo=${periodo}`);
        if (!res.ok) {
          if (res.status === 401) {
            await cerrarSesion();
            return;
          }
          throw new Error('Error al cargar datos financieros');
        }
        const data: ResumenFinanciero = await res.json();
        setResumen(data);
      } catch (err: any) {
        if (intentos > 1) {
          await new Promise((r) => setTimeout(r, 600));
          return fetchResumen(intentos - 1);
        }
        console.error('Error al cargar resumen financiero:', err);
        toast.error('No se pudo cargar la información del periodo');
      } finally {
        setLoading(false);
      }
    },
    [periodo, usuarioActual?.id, cerrarSesion]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchResumen();
      setSelectedItems(new Map());
    }
  }, [fetchResumen, authLoading]);

  const irMesAnterior = () => {
    if (!puedeIrMesAnterior) return;
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes - 2, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (nuevoPeriodo < minPeriodo) return;
    setPeriodo(nuevoPeriodo);
  };

  const irMesSiguiente = () => {
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setPeriodo(nuevoPeriodo);
  };

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
        refresh: fetchResumen,
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
