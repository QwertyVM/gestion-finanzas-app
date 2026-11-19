'use client';

import React from 'react';
import { X } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { CategoriaAnalisisItem } from '@/lib/finanzas-service';
import { ExecutiveIconHelper } from './ExecutiveIconHelper';

interface ExecutiveCategoriaDetailProps {
  categoria: CategoriaAnalisisItem;
  onClose: () => void;
  moneda: string;
}

const CLASIF_STYLES: Record<string, { badge: string; dot: string }> = {
  FIJO: { badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60', dot: 'bg-sky-500' },
  PRESTAMO: { badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60', dot: 'bg-purple-500' },
  CUOTA: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60', dot: 'bg-indigo-500' },
  VARIABLE: { badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60', dot: 'bg-teal-500' },
};

export function ExecutiveCategoriaDetail({
  categoria,
  onClose,
  moneda,
}: ExecutiveCategoriaDetailProps) {
  const getStyle = (clasif: string) => CLASIF_STYLES[clasif] || CLASIF_STYLES.VARIABLE;

  return (
    <div className="mt-4 p-5 rounded-xl border border-primary/40 bg-card shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="p-2 rounded-xl text-white shadow-xs"
            style={{ backgroundColor: categoria.color }}
          >
            <ExecutiveIconHelper name={categoria.icono} className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Detalle de {categoria.nombre}</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {categoria.conteoItems} items
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Total:{' '}
              <span className="font-mono font-bold text-foreground">
                {formatMoney(categoria.totalMonto, moneda)}
              </span>{' '}
              · ({categoria.porcentaje}% del mes)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition self-start sm:self-auto cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cerrar filtro</span>
        </button>
      </div>

      {/* Resumen de Minitags */}
      {categoria.minitags && categoria.minitags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Minitags:</span>
          {categoria.minitags.map((m) => (
            <span
              key={m.tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-background border border-border/60 text-foreground"
            >
              <span>#{m.tag}</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ({formatMoney(m.totalMonto, moneda)})
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Móvil: Tarjetas táctiles */}
      <div className="md:hidden divide-y divide-border/40">
        {categoria.items.map((item) => (
          <div key={`mob-cat-item-${item.id}`} className="p-3 space-y-1.5 hover:bg-muted/20 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getStyle(item.clasificacion).badge}`}>
                    {item.badgeLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {item.tarjetaNombre ? `Tarjeta · ${item.tarjetaNombre}` : 'Fin de mes'}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-foreground truncate">{item.concepto}</h4>
                {item.subtexto && (
                  <div className="text-[11px] text-muted-foreground truncate">{item.subtexto}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
                  {formatMoney(item.monto, moneda)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium mt-1 ${
                    item.estado === 'PAGADO'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.estado === 'ADELANTADO'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Tabla estructurada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
            <tr>
              <th scope="col" className="py-2.5 px-3 font-medium">Clasificación</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Concepto</th>
              <th scope="col" className="py-2.5 px-3 font-medium">Detalle</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Monto</th>
              <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {categoria.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition">
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStyle(item.clasificacion).badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStyle(item.clasificacion).dot}`} />
                    {item.badgeLabel}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <span>{item.concepto}</span>
                    {item.tag && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/40 font-medium">
                        #{item.tag}
                      </span>
                    )}
                  </div>
                  {item.subtexto && (
                    <div className="text-[11px] text-muted-foreground">{item.subtexto}</div>
                  )}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                  {item.tarjetaNombre ? `Tarjeta · ${item.tarjetaNombre}` : 'Fin de mes'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                  {formatMoney(item.monto, moneda)}
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      item.estado === 'PAGADO'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : item.estado === 'ADELANTADO'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.estado === 'PAGADO'
                          ? 'bg-emerald-500'
                          : item.estado === 'ADELANTADO'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                      }`}
                    />
                    {item.estado === 'PAGADO' ? 'Pagado' : item.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
