'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import type { PresupuestoOperativoData, SobreGastoOperativo } from '@/lib/finanzas-service';
import { toast } from 'sonner';

export function usePresupuestoOperativo() {
  const { periodo, irMesAnterior, irMesSiguiente, puedeIrMesAnterior } = useFinanzas();
  const [data, setData] = useState<PresupuestoOperativoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [escenarioActivo, setEscenarioActivo] = useState<string>('EQUILIBRADO');
  const [sobresLocales, setSobresLocales] = useState<SobreGastoOperativo[]>([]);

  const moneda = data?.moneda || 'S/';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/finanzas/presupuesto-operativo?periodo=${periodo}`);
      if (!res.ok) throw new Error('Error al cargar presupuesto operativo');
      const json: PresupuestoOperativoData = await res.json();
      setData(json);
      setSobresLocales(json.sobres);
      setEscenarioActivo('EQUILIBRADO');
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo cargar el presupuesto operativo');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const aplicarEscenario = (escenarioId: string) => {
    if (!data) return;
    const esc = data.escenarios.find((e) => e.id === escenarioId);
    if (!esc) return;

    setEscenarioActivo(escenarioId);
    const capital = data.capitalOperativoParaVivir;
    const dias = data.runway.diasTotales;
    const semanas = data.runway.semanasTotales;

    const actualizados = data.sobres.map((s) => {
      const match = esc.distribucion.find((d) => d.sobreId === s.id);
      const pct = match ? match.porcentaje : s.porcentaje;
      const monto = Number(((capital * pct) / 100).toFixed(2));
      return {
        ...s,
        porcentaje: pct,
        monto,
        montoSemanal: semanas > 0 ? Number((monto / semanas).toFixed(2)) : 0,
        montoDiario: dias > 0 ? Number((monto / dias).toFixed(2)) : 0,
      };
    });

    setSobresLocales(actualizados);
    toast.success(`Escenario ${esc.nombre} aplicado`);
  };

  const actualizarPorcentajeSobre = (sobreId: string, nuevoPct: number) => {
    if (!data) return;
    const capital = data.capitalOperativoParaVivir;
    const dias = data.runway.diasTotales;
    const semanas = data.runway.semanasTotales;

    setSobresLocales((prev) =>
      prev.map((s) => {
        if (s.id !== sobreId) return s;
        const pct = Math.max(0, Math.min(100, Math.round(nuevoPct)));
        const monto = Number(((capital * pct) / 100).toFixed(2));
        return {
          ...s,
          porcentaje: pct,
          monto,
          montoSemanal: semanas > 0 ? Number((monto / semanas).toFixed(2)) : 0,
          montoDiario: dias > 0 ? Number((monto / dias).toFixed(2)) : 0,
        };
      })
    );
    setEscenarioActivo('PERSONALIZADO');
  };

  const sumaPorcentajes = sobresLocales.reduce((acc, s) => acc + s.porcentaje, 0);
  const sumaMontos = Number(sobresLocales.reduce((acc, s) => acc + s.monto, 0).toFixed(2));
  const descuadrePorcentaje = 100 - sumaPorcentajes;

  const resetearASugerido = () => {
    if (!data) return;
    setSobresLocales(data.sobres);
    setEscenarioActivo('EQUILIBRADO');
    toast.info('Sobres restablecidos a valores recomendados');
  };

  return {
    periodo,
    moneda,
    data,
    loading,
    escenarioActivo,
    sobresLocales,
    sumaPorcentajes,
    sumaMontos,
    descuadrePorcentaje,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    aplicarEscenario,
    actualizarPorcentajeSobre,
    resetearASugerido,
    recargar: fetchData,
  };
}
