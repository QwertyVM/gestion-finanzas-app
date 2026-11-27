'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface DistribucionItem {
  name: string;
  value: number;
  color: string;
  dot: string;
}

interface ExecutiveDonutDistribucionProps {
  distribucionEgresos: DistribucionItem[];
  totalEgresos: number;
  moneda: string;
  onSelectSlice?: (nombre: string) => void;
}

export function ExecutiveDonutDistribucion({
  distribucionEgresos,
  totalEgresos,
  moneda,
  onSelectSlice,
}: ExecutiveDonutDistribucionProps) {
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0];
    const porcentaje = totalEgresos > 0 ? Math.round((data.value / totalEgresos) * 100) : 0;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-2.5 text-xs min-w-[150px]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: data.payload.color || data.color }}
          />
          <span className="font-semibold text-foreground">{data.name}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2 text-[11px]">
          <span className="font-mono font-bold text-foreground">{formatMoney(data.value, moneda)}</span>
          <span className="text-muted-foreground font-medium">({porcentaje}%)</span>
        </div>
        {onSelectSlice && (
          <p className="text-[10px] text-muted-foreground/80 mt-1 border-t border-border/40 pt-1">
            Clic para explorar categorías
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Distribución de Egresos
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fijos, Préstamos, Cuotas y Compras Variables.
        </p>
      </div>

      <div className="h-60 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribucionEgresos}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              onClick={(entry) => onSelectSlice?.(entry.name)}
              className="cursor-pointer outline-none"
            >
              {distribucionEgresos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="transition-all hover:opacity-80 cursor-pointer" />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
            >
              Total
            </text>
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-xs font-semibold font-mono"
            >
              {formatMoney(totalEgresos, moneda)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/40">
        {distribucionEgresos.map((item) => {
          const porcentaje = totalEgresos > 0 ? Math.round((item.value / totalEgresos) * 100) : 0;
          return (
            <div
              key={item.name}
              onClick={() => onSelectSlice?.(item.name)}
              className={`p-2 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition active:scale-95 ${
                onSelectSlice ? 'cursor-pointer' : ''
              }`}
              title="Filtrar por esta clasificación"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                <span className="truncate font-medium text-foreground/80">{item.name}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-semibold text-foreground text-xs">
                  {formatMoney(item.value, moneda)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {porcentaje}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
