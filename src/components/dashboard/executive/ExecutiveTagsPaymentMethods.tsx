'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';

export interface MetodoPagoStats {
  metodo: string;
  label: string;
  total: number;
  porcentaje: number;
  conteo: number;
  color: string;
}

export interface TarjetaStats {
  id: string;
  nombre: string;
  banco: string;
  color: string;
  total: number;
  porcentaje: number;
}

interface ExecutiveTagsPaymentMethodsProps {
  metodosPago: MetodoPagoStats[];
  tarjetas: TarjetaStats[];
  moneda: string;
}

export function ExecutiveTagsPaymentMethods({
  metodosPago,
  tarjetas,
  moneda,
}: ExecutiveTagsPaymentMethodsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* CANALES / MÉTODOS DE PAGO */}
      <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Egresos por Medio de Pago
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tarjeta de Crédito vs Efectivo / Débito vs Transferencias.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {metodosPago.map((mp) => (
            <div key={mp.metodo} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mp.color }} />
                  <span className="text-xs font-semibold text-foreground">{mp.label}</span>
                </div>
                <div className="text-xs font-mono font-bold text-foreground">
                  {formatMoney(mp.total, moneda)}{' '}
                  <span className="text-muted-foreground font-normal text-[11px]">({mp.porcentaje}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: mp.color, width: `${mp.porcentaje}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground text-right">
                {mp.conteo} transacciones
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TARJETAS DE CRÉDITO ACTIVAS */}
      <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Consumo por Tarjeta de Crédito
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Facturación del mes desglosada por cada plástico activo.
          </p>
        </div>

        {tarjetas.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No hay gastos con tarjeta de crédito en este periodo.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {tarjetas.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: t.color }}
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">{t.nombre}</div>
                      <div className="text-[10px] text-muted-foreground">{t.banco}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-foreground">
                      {formatMoney(t.total, moneda)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {t.porcentaje}% de los egresos
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: t.color, width: `${t.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
