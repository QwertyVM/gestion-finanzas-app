'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney } from '@/lib/utils';
import { Skeleton } from '@/components/common/Skeleton';
import {
  ArrowRight,
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

        {/* Controles de año */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg text-xs">
            {[2026, 2027, 2028].map((yr) => (
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
      ) : (
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
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
                        esMesActual ? 'bg-muted/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{m.mesNombre}</span>
                          <span className="text-xs text-muted-foreground">{m.anio}</span>
                          {esMesActual && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-foreground text-background">
                              Actual
                            </span>
                          )}
                          {m.esGrati && (
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              Gratificación
                            </span>
                          )}
                          {m.esUtilidad && (
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Utilidades
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                        {formatMoney(m.ingresos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">
                        {formatMoney(m.fijos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
                        {formatMoney(m.prestamos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm whitespace-nowrap">
                        {formatMoney(m.gastos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-muted-foreground text-sm whitespace-nowrap">
                        {formatMoney(m.totalEgresos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-sm sm:text-base whitespace-nowrap">
                        <span className={positivo ? 'text-foreground' : 'text-rose-600'}>
                          {formatMoney(m.disponible, moneda)}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          margen >= 20
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : margen > 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {margen.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setPeriodo(m.periodo);
                            router.push('/');
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                          title="Gestionar este mes"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/40 border-t border-border/80 font-medium text-xs">
                <tr>
                  <td className="py-3 px-3.5 text-foreground font-bold text-xs uppercase tracking-wider">
                    Total {anioSeleccionado}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(totalIngresos, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">
                    {formatMoney(totalFijos, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
                    {formatMoney(totalPrestamos, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-teal-600 dark:text-teal-400 text-sm whitespace-nowrap">
                    {formatMoney(totalGastos, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-muted-foreground text-sm whitespace-nowrap">
                    {formatMoney(totalEgresos, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(totalDisponible, moneda)}
                  </td>
                  <td className="py-3 px-3.5 text-center text-foreground font-bold whitespace-nowrap text-xs">
                    {tasaAhorroPromedio.toFixed(0)}%
                  </td>
                  <td className="py-3 px-3.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
