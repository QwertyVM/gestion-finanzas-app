'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { Skeleton } from '@/components/common/Skeleton';
import { Settings, Sparkles } from 'lucide-react';
import { ProyeccionMesFila, MesProyeccion } from './ProyeccionMesFila';
import { ProyeccionTotalesFooter } from './ProyeccionTotalesFooter';
import { ProyeccionMesCardMobile } from './ProyeccionMesCardMobile';

export function ProyeccionAnualClient() {
  const router = useRouter();
  const { periodo, setPeriodo, resumen } = useFinanzas();
  const [datosAnio, setDatosAnio] = useState<MesProyeccion[]>([]);
  const [loading, setLoading] = useState(true);

  const initialYear = periodo ? parseInt(periodo.split('-')[0], 10) : 2026;
  const [anioSeleccionado, setAnioSeleccionado] = useState(initialYear || 2026);

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  useEffect(() => {
    async function loadAnio() {
      setLoading(true);
      try {
        const res = await fetch(`/api/finanzas/anual?anio=${anioSeleccionado}`);
        if (!res.ok) throw new Error('Error al cargar datos anuales');
        const data = await res.json();
        setDatosAnio(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnio();
  }, [anioSeleccionado]);

  // Solo sumar los meses que tienen registro explícito hasta el periodo actual
  const currentPeriodoStr = periodo || '2026-11';
  const mesesConRegistro = datosAnio.filter(
    (m) => m.periodo <= currentPeriodoStr && (m.ingresos > 0 || m.totalEgresos > 0)
  );

  const totalIngresos = mesesConRegistro.reduce((acc, m) => acc + (m.ingresos || 0), 0);
  const totalFijos = mesesConRegistro.reduce((acc, m) => acc + (m.fijos || 0), 0);
  const totalPrestamos = mesesConRegistro.reduce((acc, m) => acc + (m.prestamos || 0), 0);
  const totalGastos = mesesConRegistro.reduce((acc, m) => acc + (m.gastos || 0), 0);
  const totalEgresos = mesesConRegistro.reduce((acc, m) => acc + (m.totalEgresos || 0), 0);
  const totalDisponible = mesesConRegistro.reduce((acc, m) => acc + (m.disponible || 0), 0);
  const tasaAhorroPromedio = totalIngresos > 0 ? (totalDisponible / totalIngresos) * 100 : 0;

  const handleSelectMes = (mesPeriodo: string) => {
    setPeriodo(mesPeriodo);
    router.push('/');
  };

  const estaEnCero = !loading && totalIngresos === 0 && totalEgresos === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Proyección Anual & Flujo de Caja
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Previsión de liquidez considerando Gratificaciones (Jul/Dic) y Utilidades (Mar).
          </p>
        </div>

        {/* Año activo */}
        <div className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground self-start sm:self-auto">
          <span>Año {anioSeleccionado}</span>
        </div>
      </div>

      {/* Banner de inicio en cero si aún no ha configurado sueldo ni egresos */}
      {estaEnCero && (
        <div className="bg-muted/30 border border-border/70 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Proyección anual inicializada en {moneda} 0.00
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configura tu sueldo base en tu perfil para proyectar tus ingresos, gratificaciones y márgenes de ahorro.
              </p>
            </div>
          </div>
          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar en Mi Perfil
          </Link>
        </div>
      )}

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
                esMesActual={m.periodo === periodo}
                onSelectMes={handleSelectMes}
              />
            ))}
          </div>

          {/* Vista desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border/60">
                <tr>
                  <th scope="col" className="py-3 px-3.5 font-semibold text-foreground">Mes</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Ingresos</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-sky-600 dark:text-sky-400">Fijos</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-purple-600 dark:text-purple-400">Préstamos</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-teal-600 dark:text-teal-400">Tarjetas & Var</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Egresos</th>
                  <th scope="col" className="py-3 px-3.5 text-right font-semibold text-foreground">Disponible</th>
                  <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground">% Ahorro</th>
                  <th scope="col" className="py-3 px-3.5 text-center font-semibold text-foreground"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {datosAnio.map((m) => (
                  <ProyeccionMesFila
                    key={m.periodo}
                    mes={m}
                    periodoActual={periodo}
                    moneda={moneda}
                    onSelectMes={handleSelectMes}
                  />
                ))}
              </tbody>
              <ProyeccionTotalesFooter
                anio={anioSeleccionado}
                totalIngresos={totalIngresos}
                totalFijos={totalFijos}
                totalPrestamos={totalPrestamos}
                totalGastos={totalGastos}
                totalEgresos={totalEgresos}
                totalDisponible={totalDisponible}
                tasaAhorroPromedio={tasaAhorroPromedio}
                moneda={moneda}
              />
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
