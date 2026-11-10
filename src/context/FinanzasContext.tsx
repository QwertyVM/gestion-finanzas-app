'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ResumenFinanciero } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { toast } from 'sonner';

interface FinanzasContextType {
  periodo: string;
  setPeriodo: (p: string) => void;
  irMesAnterior: () => void;
  irMesSiguiente: () => void;
  resumen: ResumenFinanciero | null;
  loading: boolean;
  refresh: () => Promise<void>;
  // Selección interactiva para sumatorias automáticas
  selectedGastoIds: string[];
  toggleSelectGasto: (id: string, monto: number) => void;
  selectAllGastos: (items: Array<{ id: string; monto: number }>) => void;
  clearSelection: () => void;
  sumaSeleccionada: number;
  // Modal Dinámico de Registro Rápido
  isRecordModalOpen: boolean;
  recordModalType: 'GASTO' | 'INGRESO' | 'FIJO';
  openRecordModal: (type?: 'GASTO' | 'INGRESO' | 'FIJO') => void;
  closeRecordModal: () => void;
}

const FinanzasContext = createContext<FinanzasContextType | undefined>(undefined);

export function FinanzasProvider({ children }: { children: React.ReactNode }) {
  const [periodo, setPeriodoState] = useState<string>(getCurrentPeriodo());
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar periodo guardado al iniciar
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('finanzapp_periodo') : null;
    if (saved && /^\d{4}-\d{2}$/.test(saved)) {
      setPeriodoState(saved);
    }
  }, []);

  const setPeriodo = useCallback((p: string) => {
    setPeriodoState(p);
    if (typeof window !== 'undefined') {
      localStorage.setItem('finanzapp_periodo', p);
    }
  }, []);

  // Selección de items y sumatoria instantánea
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  // Modal Dinámico de Registro Unificado
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalType, setRecordModalType] = useState<'GASTO' | 'INGRESO' | 'FIJO'>('GASTO');

  const openRecordModal = useCallback((type: 'GASTO' | 'INGRESO' | 'FIJO' = 'GASTO') => {
    setRecordModalType(type);
    setIsRecordModalOpen(true);
  }, []);

  const closeRecordModal = useCallback(() => {
    setIsRecordModalOpen(false);
  }, []);

  // Atajo global de teclado para registro rápido (Desktop: N o Cmd+K)
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

  const fetchResumen = useCallback(async (intentos: number = 2) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/finanzas?periodo=${periodo}`);
      if (!res.ok) throw new Error('Error al cargar datos financieros');
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
  }, [periodo]);

  useEffect(() => {
    fetchResumen();
    // Limpiar selección al cambiar de mes
    setSelectedItems(new Map());
  }, [fetchResumen]);

  const irMesAnterior = () => {
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes - 2, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setPeriodo(nuevoPeriodo);
  };

  const irMesSiguiente = () => {
    const [anio, mes] = periodo.split('-').map(Number);
    const d = new Date(anio, mes, 1);
    const nuevoPeriodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setPeriodo(nuevoPeriodo);
  };

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

  return (
    <FinanzasContext.Provider
      value={{
        periodo,
        setPeriodo,
        irMesAnterior,
        irMesSiguiente,
        resumen,
        loading,
        refresh: fetchResumen,
        selectedGastoIds,
        toggleSelectGasto,
        selectAllGastos,
        clearSelection,
        sumaSeleccionada,
        isRecordModalOpen,
        recordModalType,
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
