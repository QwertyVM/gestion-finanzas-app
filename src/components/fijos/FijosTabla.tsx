'use client';

import React from 'react';
import { formatMoney, ClasificacionEgreso } from '@/lib/utils';
import { DetalleItemData } from '@/components/modals/ModalDetalleGasto';
import { Pencil, Trash2, ChevronDown } from 'lucide-react';

interface FijosTablaProps {
  costosFijos: any[];
  tarjetas: any[];
  moneda: string;
  loadingAction: string | null;
  onSelect: (item: DetalleItemData) => void;
  onToggleEstado: (id: string, nuevoEstado: string) => void;
  onCambiarMetodoPago: (costoFijoId: string, nuevoMetodo: string, tarjetaId: string | null) => void;
  onEditarBase: (cf: any) => void;
  onEliminar: (id: string, concepto: string) => void;
}

export function FijosTabla({
  costosFijos,
  tarjetas,
  moneda,
  loadingAction,
  onSelect,
  onToggleEstado,
  onCambiarMetodoPago,
  onEditarBase,
  onEliminar,
}: FijosTablaProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
            <tr>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Concepto</th>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Categoría</th>
              <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Monto</th>
              <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Forma de Pago</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Estado</th>
              <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {costosFijos.map((cf) => {
              const clasificacion: ClasificacionEgreso = 'FIJO';
              const isLoading = loadingAction === `fijo-${cf.id}`;

              return (
                <tr
                  key={cf.id}
                  onClick={() =>
                    onSelect({
                      id: `fijo-${cf.id}`,
                      dbId: cf.id,
                      tipo: 'FIJO',
                      clasificacion,
                      concepto: cf.concepto,
                      categoria: cf.categoria,
                      monto: cf.monto,
                      diaVencimiento: cf.diaVencimiento,
                      estado: cf.estado,
                      fechaPagoReal: cf.fechaPagoReal,
                      mesInicio: cf.mesInicio,
                      mesFin: cf.mesFin,
                      notas: cf.notas,
                      monedaOriginal: cf.monedaOriginal,
                      montoOriginal: cf.montoOriginal,
                      tipoCambio: cf.tipoCambio,
                      metodoPago: cf.metodoPago,
                      tarjetaId: cf.tarjetaId,
                      tarjetaNombre: cf.tarjetaNombre,
                      tarjetaBanco: cf.tarjetaBanco,
                      tarjetaColor: cf.tarjetaColor,
                      tarjetaUltimosCuatro: cf.tarjetaUltimosCuatro,
                    })
                  }
                  className="hover:bg-muted/30 transition cursor-pointer border-l-[3px] border-l-sky-500"
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{cf.concepto}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        Fijo
                      </span>
                    </div>
                    {cf.monedaOriginal === 'USD' && cf.montoOriginal && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-normal">
                        ${cf.montoOriginal.toFixed(2)} USD
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-muted-foreground whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: (cf as any).categoriaColor || '#64748b' }}
                      />
                      <span className="font-medium text-foreground/90">{cf.categoria || 'General'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(cf.monto, moneda)}
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center">
                      <select
                        value={
                          cf.metodoPago === 'TARJETA_CREDITO'
                            ? `TARJETA:${cf.tarjetaId || ''}`
                            : cf.metodoPago || 'EFECTIVO_DEBITO'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('TARJETA:')) {
                            const tId = val.replace('TARJETA:', '');
                            onCambiarMetodoPago(cf.id, 'TARJETA_CREDITO', tId || null);
                          } else {
                            onCambiarMetodoPago(cf.id, val, null);
                          }
                        }}
                        disabled={isLoading}
                        className={`text-xs font-medium py-1.5 pl-2.5 pr-7 rounded-lg border appearance-none cursor-pointer outline-none transition bg-background ${
                          cf.metodoPago === 'TARJETA_CREDITO'
                            ? 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold'
                            : cf.metodoPago === 'TRANSFERENCIA'
                              ? 'text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 font-semibold'
                              : 'text-muted-foreground border-border hover:text-foreground'
                        }`}
                        title="Cambiar forma de pago para este mes"
                      >
                        <option value="EFECTIVO_DEBITO">💵 Efectivo / Débito</option>
                        <option value="TRANSFERENCIA">🏦 Transferencia</option>
                        {tarjetas.map((t) => (
                          <option key={t.id} value={`TARJETA:${t.id}`}>
                            💳 {t.nombre}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 pointer-events-none text-muted-foreground" />
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        cf.estado === 'ADELANTADO'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : cf.estado === 'PAGADO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cf.estado === 'ADELANTADO'
                            ? 'bg-indigo-500'
                            : cf.estado === 'PAGADO'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      {cf.estado === 'ADELANTADO' ? 'Adelantado' : cf.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          onToggleEstado(
                            cf.id,
                            cf.estado === 'ADELANTADO' ? 'PENDIENTE' : 'ADELANTADO'
                          )
                        }
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition font-medium"
                        title="Alternar Adelantado"
                      >
                        Adelantar
                      </button>

                      <button
                        onClick={() =>
                          onToggleEstado(
                            cf.id,
                            cf.estado === 'PAGADO' ? 'PENDIENTE' : 'PAGADO'
                          )
                        }
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                          cf.estado === 'PAGADO'
                            ? 'text-muted-foreground hover:bg-muted'
                            : 'bg-foreground text-background hover:opacity-90'
                        }`}
                        title="Alternar Pagado"
                      >
                        {cf.estado === 'PAGADO' ? 'Pagado' : 'Pagar'}
                      </button>

                      <button
                        onClick={() => onEditarBase(cf)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition ml-1"
                        title="Editar costo fijo base"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEliminar(cf.id, cf.concepto)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Eliminar costo fijo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
