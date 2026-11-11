'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { Skeleton } from '@/components/common/Skeleton';
import {
  ArrowRight,
  Table,
  LayoutGrid,
} from 'lucide-react';

interface MesProyeccion {
  periodo: string;
  mesNombre: string;
  anio: number;
  mesNumero: number;
  ingresos: number;
  fijos: number;
  prestamos: number;
  gastos: number;
  totalEgresos: number;
  disponible: number;
  esGrati: boolean;
  esUtilidad: boolean;
}

export function ProyeccionAnualClient() {
  const router = useRouter();
  const { periodo, setPeriodo, resumen } = useFinanzas();
  const [datosAnio, setDatosAnio] = useState<MesProyeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modoVista, setModoVista] = useState<'TABLA' | 'TARJETAS'>('TABLA');

  useEffect(() => {
    const saved = localStorage.getItem('finanzapp_modoVista_proyeccion');
    if (saved === 'TABLA' || saved === 'TARJETAS') {
      setModoVista(saved);
    }
  }, []);

  const handleCambiarModoVista = (modo: 'TABLA' | 'TARJETAS') => {
    setModoVista(modo);
    localStorage.setItem('finanzapp_modoVista_proyeccion', modo);
  };

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

  const totalIngresos = datosAnio.reduce((acc, m) => acc + (m.ingresos || 0), 0);
  const totalFijos = datosAnio.reduce((acc, m) => acc + (m.fijos || 0), 0);
  const totalPrestamos = datosAnio.reduce((acc, m) => acc + (m.prestamos || 0), 0);
  const totalGastos = datosAnio.reduce((acc, m) => acc + (m.gastos || 0), 0);
  const totalEgresos = datosAnio.reduce((acc, m) => acc + (m.totalEgresos || 0), 0);
  const totalDisponible = datosAnio.reduce((acc, m) => acc + (m.disponible || 0), 0);
  const tasaAhorroPromedio = totalIngresos > 0 ? (totalDisponible / totalIngresos) * 100 : 0;

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

        {/* Controles de vista y año */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => handleCambiarModoVista('TABLA')}
              className={`p-1 rounded transition ${
                modoVista === 'TABLA' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Ver como Tabla"
              aria-label="Ver proyección anual como tabla"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleCambiarModoVista('TARJETAS')}
              className={`p-1 rounded transition ${
                modoVista === 'TARJETAS' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
              title="Ver como Tarjetas"
              aria-label="Ver proyección anual como tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg text-xs">
            {[2026, 2027, 2028].map((yr) => (
              <button
                key={yr}
                onClick={() => setAnioSeleccionado(yr)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
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
      </div>

      {loading ? (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs p-4 space-y-3">
          <div className="flex justify-between pb-3 border-b border-border/60">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : modoVista === 'TABLA' ? (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Mes</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Ingresos</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-semibold text-sky-600 dark:text-sky-400">Fijos</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-semibold text-purple-600 dark:text-purple-400">Préstamos</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">Tarjetas & Var</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Egresos</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Disponible</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">% Ahorro</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {datosAnio.map((m) => {
                  const positivo = m.disponible >= 0;
                  const margen = m.ingresos > 0 ? (m.disponible / m.ingresos) * 100 : 0;
                  const esMesActual = m.periodo === periodo;

                  return (
                    <tr
                      key={m.periodo}
                      onClick={() => {
                        setPeriodo(m.periodo);
                        router.push('/');
                      }}
                      className={`hover:bg-muted/30 transition cursor-pointer ${
                        esMesActual ? 'bg-muted/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-foreground text-xs">{m.mesNombre}</span>
                          <span className="text-[10px] text-muted-foreground">{m.anio}</span>
                          {esMesActual && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-medium bg-foreground text-background">
                              Actual
                            </span>
                          )}
                          {m.esGrati && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              Gratificación
                            </span>
                          )}
                          {m.esUtilidad && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Utilidades
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                        {formatMoney(m.ingresos, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-sky-600 dark:text-sky-400 whitespace-nowrap">
                        {formatMoney(m.fijos, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap">
                        {formatMoney(m.prestamos, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-teal-600 dark:text-teal-400 whitespace-nowrap">
                        {formatMoney(m.gastos, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {formatMoney(m.totalEgresos, moneda)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium whitespace-nowrap">
                        <span className={positivo ? 'text-foreground' : 'text-rose-600'}>
                          {formatMoney(m.disponible, moneda)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="text-[11px] text-muted-foreground">
                          {margen.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setPeriodo(m.periodo);
                            router.push('/');
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                          title="Gestionar este mes"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/40 border-t border-border/80 font-medium text-xs">
                <tr>
                  <td className="py-2.5 px-3 text-foreground font-semibold">
                    Total {anioSeleccionado}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatMoney(totalIngresos, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatMoney(totalFijos, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatMoney(totalPrestamos, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatMoney(totalGastos, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatMoney(totalEgresos, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatMoney(totalDisponible, moneda)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                    {tasaAhorroPromedio.toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {datosAnio.map((m) => {
            const positivo = m.disponible >= 0;

            return (
              <div
                key={m.periodo}
                className="bg-card border border-border/80 rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground text-xs">{m.mesNombre}</span>
                    <span className="text-[11px] text-muted-foreground">{m.anio}</span>
                  </div>

                  {m.esGrati && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      Gratificación
                    </span>
                  )}
                  {m.esUtilidad && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Utilidades
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">
                    Dinero Libre Estimado
                  </span>
                  <div
                    className={`text-lg font-semibold font-mono tracking-tight ${
                      positivo ? 'text-foreground' : 'text-rose-600'
                    }`}
                  >
                    {formatMoney(m.disponible, moneda)}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span>Ingresos</span>
                    <span className="font-mono font-medium text-foreground">{formatMoney(m.ingresos, moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Fijos</span>
                    <span className="font-mono font-medium">{formatMoney(m.fijos, moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Préstamos</span>
                    <span className="font-mono font-medium">{formatMoney(m.prestamos, moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Tarjetas & Var</span>
                    <span className="font-mono font-medium">{formatMoney(m.gastos, moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 font-medium text-foreground">
                    <span>Total Egresos</span>
                    <span className="font-mono">{formatMoney(m.totalEgresos, moneda)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <button
                    onClick={() => {
                      setPeriodo(m.periodo);
                      router.push('/');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-medium text-xs flex items-center justify-center gap-1 transition"
                  >
                    <span>Ver mes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
