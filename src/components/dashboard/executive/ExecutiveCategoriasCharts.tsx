'use client';

import React from 'react';
import { formatMoney } from '@/lib/utils';
import type { CategoriaAnalisisItem } from '@/lib/finanzas-service';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface ExecutiveCategoriasChartsProps {
  todasCategorias: CategoriaAnalisisItem[];
  categoriaSeleccionadaId: string | null;
  onSelectCategoria: (id: string | null) => void;
  moneda: string;
}

export function ExecutiveCategoriasCharts({
  todasCategorias,
  categoriaSeleccionadaId,
  onSelectCategoria,
  moneda,
}: ExecutiveCategoriasChartsProps) {
  const CustomCategoryBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as CategoriaAnalisisItem;
    return (
      <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-3 text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-foreground text-xs">{data.nombre}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Total presupuestado:</span>
          <span className="font-mono font-bold text-foreground">{formatMoney(data.totalMonto, moneda)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Proporción del mes:</span>
          <span className="font-semibold text-foreground">{data.porcentaje}%</span>
        </div>
        <div className="pt-1 border-t border-border/40 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
          <span>Pagado: {data.porcentajePagado}%</span>
          <span className="text-right">{data.conteoItems} registros</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* RANKING HORIZONTAL DE CATEGORÍAS */}
      <div className="lg:col-span-7 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ranking de Egresos por Categoría
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              De mayor a menor gasto presupuestado en este periodo.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {todasCategorias.length} categorías
          </span>
        </div>

        <div className="w-full pt-1" style={{ minHeight: `${Math.max(260, todasCategorias.length * 36)}px` }}>
          <ResponsiveContainer width="100%" height={Math.max(260, todasCategorias.length * 36)}>
            <BarChart
              layout="vertical"
              data={todasCategorias}
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={130}
                tick={{ fontSize: 11, fill: 'var(--foreground)' }}
              />
              <Tooltip content={<CustomCategoryBarTooltip />} />
              <Bar dataKey="totalMonto" radius={[0, 4, 4, 0]}>
                {todasCategorias.map((entry, index) => (
                  <Cell key={`cat-bar-${index}`} fill={entry.color || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DISTRIBUCIÓN DONUT POR CATEGORÍA */}
      <div className="lg:col-span-5 bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Participación Presupuestaria
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proporción porcentual de cada categoría en el total.
          </p>
        </div>

        <div className="h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={todasCategorias}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="totalMonto"
                nameKey="nombre"
              >
                {todasCategorias.map((entry, index) => (
                  <Cell key={`cat-pie-${index}`} fill={entry.color || '#64748b'} />
                ))}
              </Pie>
              <Tooltip content={<CustomCategoryBarTooltip />} />
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
              >
                Categorías
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-semibold font-mono"
              >
                {todasCategorias.length} activas
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/40">
          {todasCategorias.slice(0, 4).map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCategoria(c.id === categoriaSeleccionadaId ? null : c.id)}
              className="p-2 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/80 transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate font-medium">{c.nombre}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-medium text-foreground text-xs">
                  {formatMoney(c.totalMonto, moneda)}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {c.porcentaje}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
