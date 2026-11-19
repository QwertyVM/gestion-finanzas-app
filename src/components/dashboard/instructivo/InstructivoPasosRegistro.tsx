'use client';

import React from 'react';
import { PlusCircle, Layers, Tag, CheckCircle2, ArrowRight } from 'lucide-react';

interface InstructivoPasosRegistroProps {
  onOpenRecordModal?: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function InstructivoPasosRegistro({ onOpenRecordModal }: InstructivoPasosRegistroProps) {
  const pasos = [
    {
      numero: '1',
      titulo: 'Inicia el Registro',
      icono: PlusCircle,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
      descripcion: 'Haz clic en el botón "+ Gasto" superior o en el botón "+" de la sección que corresponda a tu compromiso.',
    },
    {
      numero: '2',
      titulo: 'Elige la Clasificación',
      icono: Layers,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
      descripcion: 'Elige si es Costo Fijo, Préstamo, Tarjeta de Crédito (cuotas) o Gasto Variable. Esto organiza tu flujo operativo.',
    },
    {
      numero: '3',
      titulo: 'Categoría 50/30/20 y #Minitag',
      icono: Tag,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
      descripcion: 'Asigna una de las 3 grandes categorías (Necesidad, Deseo o Ahorro) y añade un #minitag (ej. #Supermercado).',
    },
    {
      numero: '4',
      titulo: 'Monitorea el Pago',
      icono: CheckCircle2,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50',
      descripcion: 'Márcalo como Pagado cuando lo liquides o déjalo en Pendiente para controlar lo que te falta pagar este mes.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pasos.map((paso) => {
          const Icon = paso.icono;
          return (
            <div
              key={paso.numero}
              className="p-3.5 rounded-xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between space-y-2.5 transition hover:border-border"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${paso.color}`}>
                    {paso.numero}
                  </span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <h4 className="text-xs font-semibold text-foreground tracking-tight">
                  {paso.titulo}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {paso.descripcion}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {onOpenRecordModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
          <p className="text-muted-foreground text-[11px]">
            💡 <strong className="text-foreground font-semibold">Consejo:</strong> Si compras en cuotas con tarjeta, ingresa el monto total o de la cuota y el sistema calculará la serie mensual automáticamente.
          </p>
          <button
            type="button"
            onClick={() => onOpenRecordModal('GASTO')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition shrink-0 cursor-pointer shadow-xs"
          >
            <span>Registrar un Gasto Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
