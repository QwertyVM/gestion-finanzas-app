'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ResumenFinanciero } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { toast } from 'sonner';

export interface UsuarioItem {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  avatar?: string | null;
  monedaSimbolo: string;
  sueldoBaseMensual: number;
  diaPagoSueldo: number;
  tipoCambioUSD?: number;
  metaAhorroMensual?: number;
}

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
  resumen: ResumenFinanciero | null;
  loading: boolean;
  refresh: () => Promise<void>;
  // Multiusuario / Perfiles
  usuarioActual: UsuarioItem | null;
  usuarios: UsuarioItem[];
  cambiarUsuario: (usuarioId: string, pin?: string) => Promise<boolean>;
  cerrarSesion: () => void;
  isSelectorUsuarioOpen: boolean;
  openSelectorUsuario: () => void;
  closeSelectorUsuario: () => void;
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
  const [periodo, setPeriodoState] = useState<string>(getCurrentPeriodo());
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Multiusuario
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<UsuarioItem | null>(null);
  const [isSelectorUsuarioOpen, setIsSelectorUsuarioOpen] = useState<boolean>(false);

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

  const fetchResumen = useCallback(async (intentos: number = 2) => {
    if (!usuarioActual?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const uParam = `&usuarioId=${usuarioActual.id}`;
      const res = await fetch(`/api/finanzas?periodo=${periodo}${uParam}`, {
        headers: { 'x-usuario-id': usuarioActual.id },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setUsuarioActual(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
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
  }, [periodo, usuarioActual?.id]);

  // Cargar lista de usuarios al inicio y restaurar sesión activa desde el backend
  useEffect(() => {
    async function loadUsuarios() {
      try {
        const [usersRes, meRes] = await Promise.all([
          fetch('/api/usuarios'),
          fetch('/api/usuarios/me'),
        ]);

        let list: UsuarioItem[] = [];
        if (usersRes.ok) {
          list = await usersRes.json();
          setUsuarios(list);
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated && meData.usuario) {
            setUsuarioActual(meData.usuario);
            if (typeof window !== 'undefined') {
              localStorage.setItem('finanzapp_usuario_id', meData.usuario.id);
              localStorage.removeItem('finanzapp_logged_out');
            }
            return;
          }
        }

        // Si el usuario cerró sesión explícitamente en el navegador
        const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('finanzapp_logged_out') === 'true';
        if (isLoggedOut) {
          setUsuarioActual(null);
          return;
        }

        // Si no ha cerrado sesión explícitamente (ej: desarrollo local o reinicio), auto-activar usuario principal (Víctor)
        const victor = list.find((u) => u.slug === 'victor') || list[0];
        if (victor) {
          setUsuarioActual(victor);
          if (typeof window !== 'undefined') {
            localStorage.setItem('finanzapp_usuario_id', victor.id);
            document.cookie = `finanzapp_usuario_id=${victor.id}; Path=/; max-age=31536000; SameSite=Lax`;
          }
        } else {
          setUsuarioActual(null);
        }
      } catch (err) {
        console.error('Error al inicializar sesión de usuario:', err);
      }
    }
    loadUsuarios();
  }, []);

  const cambiarUsuario = useCallback(async (usuarioId: string, pin?: string): Promise<boolean> => {
    const user = usuarios.find((u) => u.id === usuarioId);
    if (!user) return false;

    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.id, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Credenciales incorrectas');
        return false;
      }

      setUsuarioActual(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('finanzapp_usuario_id', user.id);
        localStorage.removeItem('finanzapp_logged_out');
        document.cookie = `finanzapp_usuario_id=${user.id}; Path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `finanzapp_logged_out=; Path=/; max-age=0; SameSite=Lax`;
      }
      setIsSelectorUsuarioOpen(false);
      toast.success(`Sesión iniciada: ${user.nombre}`);
      await fetchResumen();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al autenticar');
      return false;
    }
  }, [usuarios, fetchResumen]);

  const cerrarSesion = useCallback(async () => {
    try {
      await fetch('/api/usuarios/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUsuarioActual(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finanzapp_usuario_id');
      localStorage.setItem('finanzapp_logged_out', 'true');
      document.cookie = `finanzapp_usuario_id=; Path=/; max-age=0; SameSite=Lax`;
      document.cookie = `finanzapp_logged_out=true; Path=/; max-age=2592000; SameSite=Lax`;
      window.location.href = '/login';
    }
    toast.info('Sesión cerrada.');
  }, []);

  const openSelectorUsuario = useCallback(() => setIsSelectorUsuarioOpen(true), []);
  const closeSelectorUsuario = useCallback(() => {
    if (usuarioActual) setIsSelectorUsuarioOpen(false);
  }, [usuarioActual]);

  // Selección de items y sumatoria instantánea
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

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

  useEffect(() => {
    fetchResumen();
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
        usuarioActual,
        usuarios,
        cambiarUsuario,
        cerrarSesion,
        isSelectorUsuarioOpen,
        openSelectorUsuario,
        closeSelectorUsuario,
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
