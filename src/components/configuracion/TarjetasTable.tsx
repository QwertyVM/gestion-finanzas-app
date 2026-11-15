'use client';

import React from 'react';
import { Pencil, Trash2, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

export interface TarjetaTableItem {
  id: string;
  nombre: string;
  banco: string;
  ultimosCuatro?: string | null;
  diaCorte?: number;
  diaPago?: number;
  color: string;
  totalPeriodo?: number;
  totalSiguientePeriodo?: number;
  totalRegistros?: number;
  cantidadGastos?: number;
  cantidadCostosFijos?: number;
}

interface TarjetasTableProps {
  tarjetas: TarjetaTableItem[];
  moneda: string;
  onEdit: (t: TarjetaTableItem) => void;
  onDelete: (id: string, nombre: string) => void;
  deletingId?: string | null;
}

export function TarjetasTable({
  tarjetas,
  moneda,
  onEdit,
  onDelete,
  deletingId,
}: TarjetasTableProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">Tarjeta</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Dígitos</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Registros Asociados</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Total Este Mes</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {tarjetas && tarjetas.length > 0 ? (
              tarjetas.map((t) => {
                const totalRegistros = t.totalRegistros ?? 0;
                const tieneRegistros = totalRegistros > 0;
                const compras = t.cantidadGastos ?? 0;
                const fijos = t.cantidadCostosFijos ?? 0;

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10 shadow-xs"
                          style={{ backgroundColor: t.color || '#2563eb' }}
                        />
                        <div>
                          <div className="font-medium text-foreground">{t.nombre}</div>
                          <div className="text-[11px] text-muted-foreground">{t.banco}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                      {t.ultimosCuatro ? `•••• ${t.ultimosCuatro}` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {tieneRegistros ? (
                        <div
                          className="inline-flex flex-col items-center gap-0.5"
                          title={`${compras} compras/gastos y ${fijos} costos fijos vinculados`}
                        >
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Layers className="w-3 h-3" />
                            {totalRegistros} {totalRegistros === 1 ? 'registro' : 'registros'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {compras} compras · {fijos} fijos
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-muted-foreground bg-muted/60 border border-border/40">
                          Sin registros
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="font-semibold text-foreground">
                        {formatMoney(t.totalPeriodo || 0, moneda)}
                      </div>
                      {(t.totalSiguientePeriodo || 0) > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          Próx: {formatMoney(t.totalSiguientePeriodo || 0, moneda)}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Activa
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                          title="Editar tarjeta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {tieneRegistros ? (
                          <div
                            className="p-1 text-muted-foreground/35 cursor-not-allowed inline-flex items-center"
                            title={`No se puede eliminar: tiene ${totalRegistros} registro(s) asociado(s). Reasigna o elimina los registros primero.`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDelete(t.id, t.nombre)}
                            disabled={deletingId === t.id}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 transition disabled:opacity-40"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                  No hay tarjetas configuradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
