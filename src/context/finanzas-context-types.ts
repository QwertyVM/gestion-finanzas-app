import type { ResumenFinanciero } from '@/lib/finanzas-service';
import type { UsuarioSesion } from './AuthContext';

export type TipoRecordModal = 'GASTO' | 'INGRESO' | 'FIJO' | 'PRESTAMO';

export interface RecordModalOptions {
  metodoPago?: 'TARJETA_CREDITO' | 'EFECTIVO_DEBITO' | 'TRANSFERENCIA';
  totalCuotas?: number | string;
  tarjetaId?: string;
  categoriaId?: string;
  banco?: string;
}

export interface CacheEntry {
  data: ResumenFinanciero;
  timestamp: number;
}

export interface FinanzasContextType {
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
