import { ClasificacionEgreso } from '@/lib/utils';

export interface DetalleItemData {
  id: string;
  dbId: string;
  tipo: 'TARJETA' | 'DIRECTO' | 'FIJO' | 'PRESTAMO';
  clasificacion?: ClasificacionEgreso;
  concepto: string;
  categoria?: string;
  categoriaId?: string | null;
  categoriaColor?: string;
  categoriaIcono?: string;
  monto: number;
  monedaOriginal?: string;
  montoOriginal?: number | null;
  tipoCambio?: number;
  fechaGasto?: string;
  periodoPago?: string;
  diaVencimiento?: number;
  estado: 'PENDIENTE' | 'ADELANTADO' | 'PAGADO';
  fechaPagoReal?: string | null;
  subtexto?: string;
  notas?: string | null;
  metodoPago?: string;

  // Cuotas
  cuotaActual?: number;
  totalCuotas?: number;
  cuotasTotales?: number;

  // Tarjeta de crédito
  tarjetaId?: string | null;
  tarjetaNombre?: string | null;
  tarjetaBanco?: string | null;
  tarjetaUltimosCuatro?: string | null;
  tarjetaDiaCorte?: number;
  tarjetaDiaPago?: number;
  tarjetaColor?: string | null;

  // Préstamo
  banco?: string;
  nombrePrestamo?: string;
  montoTotal?: number;
  tasaInteresAnual?: number;
  prestamoId?: string;

  // Costo Fijo
  mesInicio?: string | null;
  mesFin?: string | null;
}

export interface ModalDetalleGastoProps {
  item: DetalleItemData | null;
  onClose: () => void;
  onCambiarEstado?: (item: DetalleItemData, nuevoEstado: string) => Promise<void>;
  onGuardarMonto?: (item: DetalleItemData, nuevoMonto: number) => Promise<void>;
  onEliminarGasto?: (item: DetalleItemData) => Promise<void>;
  onCambiarMetodoPago?: (
    item: DetalleItemData,
    nuevoMetodo: string,
    tarjetaId?: string | null,
    aplicarFuturos?: boolean
  ) => Promise<void>;
  onCambiarClasificacion?: (
    item: DetalleItemData,
    nuevaClasificacion: 'FIJO' | 'VARIABLE'
  ) => Promise<void>;
  onCambiarCategoria?: (
    item: DetalleItemData,
    nuevaCategoriaId: string,
    aplicarSerie?: boolean
  ) => Promise<void>;
  onGuardarConcepto?: (item: DetalleItemData, nuevoConcepto: string) => Promise<void>;
  onGuardarNotas?: (item: DetalleItemData, nuevasNotas: string) => Promise<void>;
  monedaSimbolo?: string;
  tarjetas?: Array<{
    id: string;
    nombre: string;
    banco: string;
    color: string;
    ultimosCuatro?: string | null;
    diaCorte?: number;
    diaPago?: number;
  }>;
}
