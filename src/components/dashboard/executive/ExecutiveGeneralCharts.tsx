'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ExecutiveDonutDistribucion, type DistribucionItem } from './ExecutiveDonutDistribucion';

export type { DistribucionItem };

export interface FlujoAnualItem {
  mes: string;
  periodo: string;
  Ingresos: number;
  Egresos: number;
  Disponible: number;
}

interface ExecutiveGeneralChartsProps {
  distribucionEgresos: DistribucionItem[];
  datosFlujoAnual: FlujoAnualItem[];
  totalEgresos: number;
  moneda: string;
}

export function ExecutiveGeneralCharts({
  distribucionEgresos,
  datosFlujoAnual,
  totalEgresos,
  moneda,
}: ExecutiveGeneralChartsProps) {
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-3 text-xs space-y-1.5 min-w-[170px]">
        <p className="font-semibold text-foreground border-b border-border/60 pb-1 text-xs">
          {label}
        </p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-medium text-foreground text-[11px]">
              {formatMoney(entry.value, moneda)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <ExecutiveDonutDistribucion
        distribucionEgresos={distribucionEgresos}
        totalEgresos={totalEgresos}
        moneda={moneda}
      />

      {/* FLUJO DE CAJA ANUAL */}
      <div className="lg:col-span-7 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Evolución Anual Proyectada
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingresos vs Egresos en los próximos 12 meses.
            </p>
          </div>
          <Link
            href="/flujo-anual"
            className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
          >
            <span>Ver tabla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-72 w-full pt-2">
          {datosFlujoAnual.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No hay datos de proyección disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFlujoAnual} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                  width={38}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Egresos" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Disponible" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
