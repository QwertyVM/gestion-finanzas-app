'use client';

import React, { useState, useMemo } from 'react';
import type { MetricasMacroCategorias } from '@/lib/finanzas-service';
import { ExecutiveTagsHeroCards, type ClasificacionStats } from './ExecutiveTagsHeroCards';
import { ExecutiveTagsFlexibility } from './ExecutiveTagsFlexibility';
import { ExecutiveTagsPaymentMethods, type MetodoPagoStats, type TarjetaStats } from './ExecutiveTagsPaymentMethods';
import { ExecutiveTagsExplorer, type EgresoItemTag } from './ExecutiveTagsExplorer';
import { Copy, Check, Hash, Sparkles } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';

interface ExecutiveTabTagsProps {
  clasificaciones: ClasificacionStats[];
  filtroTagActivo: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE';
  onFiltroTagChange: (tag: 'TODOS' | 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE') => void;
  metricasMacro: MetricasMacroCategorias | null | undefined;
  metodosPago: MetodoPagoStats[];
  tarjetas: TarjetaStats[];
  egresosFiltradosPorTag: EgresoItemTag[];
  totalEgresosCount: number;
  moneda: string;
}

export function ExecutiveTabTags({
  clasificaciones,
  filtroTagActivo,
  onFiltroTagChange,
  metricasMacro,
  metodosPago,
  tarjetas,
  egresosFiltradosPorTag,
  totalEgresosCount,
  moneda,
}: ExecutiveTabTagsProps) {
  const [copiado, setCopiado] = useState(false);
  const [tarjetaFiltroId, setTarjetaFiltroId] = useState<string | null>(null);

  // Filtrado compuesto por clasificación/tag y tarjeta seleccionada
  const egresosFinales = useMemo(() => {
    if (!tarjetaFiltroId) return egresosFiltradosPorTag;
    return egresosFiltradosPorTag.filter((e) => e.tarjetaId === tarjetaFiltroId);
  }, [egresosFiltradosPorTag, tarjetaFiltroId]);

  // Nube de Tags con sumatoria proporcional
  const tagsAgrupados = useMemo(() => {
    const map = new Map<string, { tag: string; count: number; total: number }>();
    egresosFinales.forEach((e) => {
      const rawTag = e.tag?.replace(/^#+/, '').trim();
      if (!rawTag) return;
      const key = rawTag.toLowerCase();
      const current = map.get(key) || { tag: rawTag, count: 0, total: 0 };
      map.set(key, {
        tag: current.tag,
        count: current.count + 1,
        total: current.total + (e.monto || 0),
      });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [egresosFinales]);

  const handleCopiarResumen = () => {
    try {
      const lineas: string[] = ['*RESUMEN EJECUTIVO DE GASTOS POR CLASIFICACIÓN Y TAGS*'];
      clasificaciones.forEach((c) => {
        lineas.push(`• ${c.label}: ${formatMoney(c.total, moneda)} (${c.porcentaje}%) - ${c.count} transacciones`);
      });
      if (tagsAgrupados.length > 0) {
        lineas.push('\n*TOP ETIQUETAS (#TAGS):*');
        tagsAgrupados.slice(0, 8).forEach((t) => {
          lineas.push(`• #${t.tag}: ${formatMoney(t.total, moneda)} (${t.count} items)`);
        });
      }
      navigator.clipboard.writeText(lineas.join('\n'));
      setCopiado(true);
      toast.success('Resumen copiado al portapapeles');
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error('No se pudo copiar el resumen');
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón superior de Copiar Resumen Ejecutivo */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Auditoría de Compromisos, Etiquetas y Bancos
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopiarResumen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
          title="Copiar desglose para Notion, Excel o WhatsApp"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiado ? 'Copiado' : 'Copiar Resumen'}</span>
        </button>
      </div>

      <ExecutiveTagsHeroCards
        clasificaciones={clasificaciones}
        filtroTagActivo={filtroTagActivo}
        onFiltroTagChange={onFiltroTagChange}
        moneda={moneda}
      />

      {/* Micro-Nube Visual de #Tags Proporcionales */}
      {tagsAgrupados.length > 0 && (
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Nube Visual de Etiquetas (#tags del mes)
            </span>
            <span>{tagsAgrupados.length} etiquetas activas</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tagsAgrupados.map((item, idx) => {
              const esTop = idx < 3;
              return (
                <span
                  key={item.tag}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition ${
                    esTop
                      ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 border-indigo-200/80 font-bold'
                      : 'bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/70'
                  }`}
                  title={`${item.count} gastos · Total: ${formatMoney(item.total, moneda)}`}
                >
                  <span>#{item.tag}</span>
                  <span className="text-[10px] opacity-70">({formatMoney(item.total, moneda)})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <ExecutiveTagsFlexibility
        metricasMacro={metricasMacro}
        moneda={moneda}
      />

      <ExecutiveTagsPaymentMethods
        metodosPago={metodosPago}
        tarjetas={tarjetas}
        moneda={moneda}
        selectedTarjetaId={tarjetaFiltroId}
        onSelectTarjeta={setTarjetaFiltroId}
      />

      <ExecutiveTagsExplorer
        egresos={egresosFinales}
        filtroTagActivo={filtroTagActivo}
        onFiltroTagChange={onFiltroTagChange}
        totalEgresosCount={totalEgresosCount}
        moneda={moneda}
      />
    </div>
  );
}
