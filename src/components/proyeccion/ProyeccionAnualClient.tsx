'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { Skeleton } from '@/components/common/Skeleton';
import { MesProyeccion } from './ProyeccionMesFila';
import { ProyeccionMesCardMobile } from './ProyeccionMesCardMobile';
import { ProyeccionKpisResumen } from './ProyeccionKpisResumen';
import { ProyeccionTablaDesktop } from './ProyeccionTablaDesktop';
import { ProyeccionBannerEmpty } from './ProyeccionBannerEmpty';
import { getCurrentPeriodo, NOMBRES_MESES } from '@/lib/utils';
import type { TotalesProyeccion } from '@/app/api/finanzas/anual/route';

export function ProyeccionAnualClient() {
  const router = useRouter();
  const { setPeriodo, resumen } = useFinanzas();
  const [datosAnio, setDatosAnio] = useState<MesProyeccion[]>([]);
  const [totalesActual, setTotalesActual] = useState<TotalesProyeccion | undefined>(undefined);
  const [totalesProyectado, setTotalesProyectado] = useState<TotalesProyeccion | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const realCurrentPeriodo = getCurrentPeriodo();
  const initialYear = realCurrentPeriodo ? parseInt(realCurrentPeriodo.split('-')[0], 10) : 2026;
  const [anioSeleccionado, setAnioSeleccionado] = useState(initialYear || 2026);
  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  useEffect(() => {
    async function loadAnio() {
      setLoading(true);
      try {
        const res = await fetch(`/api/finanzas/anual?anio=${anioSeleccionado}`);
        if (!res.ok) throw new Error('Error al cargar datos anuales');
        const data = await res.json();

        if (Array.isArray(data)) {
          setDatosAnio(data);
        } else {
          setDatosAnio(data.meses || []);
          setTotalesActual(data.totalesActual);
          setTotalesProyectado(data.totalesProyectado);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnio();
  }, [anioSeleccionado]);

  const fallbackTotales = useMemo(() => {
    const meses = datosAnio.filter((m) => m.tipoMes !== 'PASADO_SIN_ACTIVIDAD' && (m.ingresos > 0 || m.totalEgresos > 0));
    const totalIngresos = meses.reduce((acc, m) => acc + (m.ingresos || 0), 0);
    const totalFijos = meses.reduce((acc, m) => acc + (m.fijos || 0), 0);
    const totalPrestamos = meses.reduce((acc, m) => acc + (m.prestamos || 0), 0);
    const totalGastos = meses.reduce((acc, m) => acc + (m.gastos || 0), 0);
    const totalEgresos = meses.reduce((acc, m) => acc + (m.totalEgresos || 0), 0);
    const totalDisponible = meses.reduce((acc, m) => acc + (m.disponible || 0), 0);
    return {
      totalIngresos,
      totalFijos,
      totalPrestamos,
      totalGastos,
      totalEgresos,
      totalDisponible,
      tasaAhorroPromedio: totalIngresos > 0 ? (totalDisponible / totalIngresos) * 100 : 0,
      cantidadMeses: meses.length,
    };
  }, [datosAnio]);

  const totProyectadoFinal = totalesProyectado || fallbackTotales;
  const mesActualIdx = parseInt(realCurrentPeriodo.split('-')[1], 10) - 1;
  const mesActualNombre = NOMBRES_MESES[mesActualIdx] || 'Noviembre';

  const handleSelectMes = (mesPeriodo: string) => {
    setPeriodo(mesPeriodo);
    router.push('/');
  };

  const estaEnCero = !loading && totProyectadoFinal.totalIngresos === 0 && totProyectadoFinal.totalEgresos === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Proyección Anual & Flujo de Caja
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Previsión de liquidez y compromisos futuros vs real ejecutado a la fecha.
          </p>
        </div>

        {/* Selector de año (2026 y 2027) */}
        <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          {[2026, 2027].map((yr) => (
            <button
              key={yr}
              onClick={() => setAnioSeleccionado(yr)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                anioSeleccionado === yr
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI de Comparación Actual vs Esperado */}
      {!loading && !estaEnCero && (
        <ProyeccionKpisResumen
          anio={anioSeleccionado}
          totalesActual={totalesActual}
          totalesProyectado={totProyectadoFinal}
          mesActualNombre={mesActualNombre}
          moneda={moneda}
        />
      )}

      {/* Banner si aún no hay datos configurados */}
      {estaEnCero && <ProyeccionBannerEmpty moneda={moneda} />}

      {loading ? (
        <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3">
          <div className="flex justify-between pb-3 border-b border-border/60">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          {/* Vista móvil */}
          <div className="md:hidden divide-y divide-border/40">
            {datosAnio.map((m) => (
              <ProyeccionMesCardMobile
                key={m.periodo}
                mes={m}
                moneda={moneda}
                esMesActual={m.periodo === realCurrentPeriodo}
                onSelectMes={handleSelectMes}
              />
            ))}
          </div>

          {/* Vista desktop estructurada */}
          <ProyeccionTablaDesktop
            datosAnio={datosAnio}
            realCurrentPeriodo={realCurrentPeriodo}
            moneda={moneda}
            onSelectMes={handleSelectMes}
            anio={anioSeleccionado}
            totalesActual={totalesActual}
            totalesProyectado={totProyectadoFinal}
            mesActualNombre={mesActualNombre}
          />
        </div>
      )}
    </div>
  );
}
