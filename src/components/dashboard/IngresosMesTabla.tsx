'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { IngresoCardMobile, type IngresoItem } from './IngresoCardMobile';
import { IngresoFilaDesktop } from './IngresoFilaDesktop';

interface IngresosMesTablaProps {
  ingresos: IngresoItem[];
  totalIngresos: number;
  moneda: string;
  openRecordModal: (tipo: 'INGRESO') => void;
  onToggleRecibido: (ingreso: IngresoItem) => void;
  onEliminarIngreso: (id: string) => void;
  onEditarSueldo?: (montoActual: number) => void;
}

export function IngresosMesTabla({
  ingresos,
  moneda,
  openRecordModal,
  onToggleRecibido,
  onEliminarIngreso,
  onEditarSueldo,
}: IngresosMesTablaProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Ingresos del Mes
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              {ingresos.length} {ingresos.length === 1 ? 'fuente' : 'fuentes'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sueldo, gratificaciones y entradas adicionales programadas.
          </p>
        </div>

        <button
          onClick={() => openRecordModal('INGRESO')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition active:scale-98 self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Ingreso</span>
        </button>
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
        {ingresos.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No tienes ingresos registrados para este periodo.
          </div>
        ) : (
          <>
            {/* Vista Móvil: Tarjetas táctiles */}
            <div className="md:hidden divide-y divide-border/40">
              {ingresos.map((ing) => (
                <IngresoCardMobile
                  key={`m-${ing.id}`}
                  ingreso={ing}
                  moneda={moneda}
                  onToggleRecibido={onToggleRecibido}
                  onEliminarIngreso={onEliminarIngreso}
                  onEditarSueldo={onEditarSueldo}
                />
              ))}
            </div>

            {/* Vista Desktop: Tabla completa */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] font-semibold border-b border-border/60 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Concepto</th>
                    <th scope="col" className="py-2.5 px-3 text-foreground font-semibold">Tipo / Origen</th>
                    <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Fecha</th>
                    <th scope="col" className="py-2.5 px-3 text-center text-foreground font-semibold">Estado</th>
                    <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Monto</th>
                    <th scope="col" className="py-2.5 px-3 text-right text-foreground font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ingresos.map((ing) => (
                    <IngresoFilaDesktop
                      key={ing.id}
                      ing={ing}
                      moneda={moneda}
                      onToggleRecibido={onToggleRecibido}
                      onEliminarIngreso={onEliminarIngreso}
                      onEditarSueldo={onEditarSueldo}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
