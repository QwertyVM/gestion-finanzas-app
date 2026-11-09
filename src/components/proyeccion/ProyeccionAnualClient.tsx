'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanzas } from '@/context/FinanzasContext';
import { formatMoney, formatPeriodoLabel, NOMBRES_MESES } from '@/lib/utils';
import {
  CalendarDays,
  Sparkles,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Gift,
  Briefcase,
  Table,
  LayoutGrid,
  ExternalLink,
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

  const initialYear = periodo ? parseInt(periodo.split('-')[0], 10) : 2026;
  const [anioSeleccionado, setAnioSeleccionado] = useState(initialYear || 2026);

  const moneda = resumen?.config?.monedaSimbolo || 'S/';

  useEffect(() => {
    // Generar proyección de los 12 meses del año seleccionado
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

  // Totales acumulados anuales
  const totalIngresos = datosAnio.reduce((acc, m) => acc + (m.ingresos || 0), 0);
  const totalFijos = datosAnio.reduce((acc, m) => acc + (m.fijos || 0), 0);
  const totalPrestamos = datosAnio.reduce((acc, m) => acc + (m.prestamos || 0), 0);
  const totalGastos = datosAnio.reduce((acc, m) => acc + (m.gastos || 0), 0);
  const totalEgresos = datosAnio.reduce((acc, m) => acc + (m.totalEgresos || 0), 0);
  const totalDisponible = datosAnio.reduce((acc, m) => acc + (m.disponible || 0), 0);
  const tasaAhorroPromedio = totalIngresos > 0 ? (totalDisponible / totalIngresos) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-500" />
            <span>Proyección Anual & Flujo de Caja</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Previsión mes a mes de liquidez disponible considerando Gratificaciones (Jul/Dic) y Utilidades (Mar).
          </p>
        </div>

        {/* Controles de vista y año */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setModoVista('TABLA')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                modoVista === 'TABLA'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Ver como Tabla"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVista('TARJETAS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                modoVista === 'TARJETAS'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Ver como Tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>

          {/* Selector de año */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl border border-border/80">
            {[2026, 2027, 2028].map((yr) => (
              <button
                key={yr}
                onClick={() => setAnioSeleccionado(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  anioSeleccionado === yr
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-border/60'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Año {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid o Tabla de 12 Meses */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : modoVista === 'TABLA' ? (
        /* ======================================================== */
        /* TABLA DE PROYECCIÓN ANUAL (12 MESES)                     */
        /* ======================================================== */
        <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-border/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Mes / Periodo</th>
                  <th className="py-3 px-3 text-right">Ingresos</th>
                  <th className="py-3 px-3 text-right">Costos Fijos</th>
                  <th className="py-3 px-3 text-right">Préstamos</th>
                  <th className="py-3 px-3 text-right">Tarjetas & Var</th>
                  <th className="py-3 px-3 text-right">Total Egresos</th>
                  <th className="py-3 px-3.5 text-right font-bold">Dinero Libre</th>
                  <th className="py-3 px-3 text-center">% Ahorro</th>
                  <th className="py-3 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-800">
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
                      className={`hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition cursor-pointer ${
                        esMesActual ? 'bg-sky-50/30 dark:bg-sky-950/15' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 border-l-4 border-l-sky-500">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs">{m.mesNombre}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">{m.anio}</span>
                          {esMesActual && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                              Mes Actual
                            </span>
                          )}
                          {m.esGrati && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Gift className="w-2.5 h-2.5" /> Grati
                            </span>
                          )}
                          {m.esUtilidad && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <Briefcase className="w-2.5 h-2.5" /> Utilidades
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatMoney(m.ingresos, moneda)}
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                        {formatMoney(m.fijos, moneda)}
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                        {formatMoney(m.prestamos, moneda)}
                      </td>

                      <td className="py-3 px-3 text-right text-muted-foreground font-semibold whitespace-nowrap">
                        {formatMoney(m.gastos, moneda)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-rose-500 dark:text-rose-400 whitespace-nowrap">
                        {formatMoney(m.totalEgresos, moneda)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-black whitespace-nowrap">
                        <span className={positivo ? 'text-sky-500 dark:text-sky-400 text-sm' : 'text-rose-500 text-sm'}>
                          {formatMoney(m.disponible, moneda)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-bold ${
                            margen >= 20
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : margen > 0
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {margen.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setPeriodo(m.periodo);
                            router.push('/');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-bold text-[11px] transition"
                          title="Gestionar este mes"
                        >
                          <span>Ir al mes</span>
                          <ArrowRight className="w-3 h-3 text-sky-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 border-t-2 border-border font-bold text-xs">
                <tr>
                  <td className="py-3.5 px-3.5 text-foreground uppercase tracking-wider font-extrabold">
                    Total Anual {anioSeleccionado}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-extrabold whitespace-nowrap">
                    {formatMoney(totalIngresos, moneda)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-sky-600 dark:text-sky-400 font-extrabold whitespace-nowrap">
                    {formatMoney(totalFijos, moneda)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-purple-600 dark:text-purple-400 font-extrabold whitespace-nowrap">
                    {formatMoney(totalPrestamos, moneda)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-muted-foreground font-extrabold whitespace-nowrap">
                    {formatMoney(totalGastos, moneda)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-rose-500 dark:text-rose-400 font-extrabold whitespace-nowrap">
                    {formatMoney(totalEgresos, moneda)}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-black text-sm whitespace-nowrap">
                    <span className={totalDisponible >= 0 ? 'text-sky-500 dark:text-sky-400' : 'text-rose-500'}>
                      {formatMoney(totalDisponible, moneda)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {tasaAhorroPromedio.toFixed(0)}% global
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center text-muted-foreground font-medium text-[11px]">
                    12 Meses
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {datosAnio.map((m) => {
            const positivo = m.disponible >= 0;

            return (
              <div
                key={m.periodo}
                className={`bg-card border rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  m.esGrati
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/5 to-card'
                    : m.esUtilidad
                    ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/5 to-card'
                    : 'border-border'
                }`}
              >
                {/* Header del Mes */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <span>{m.mesNombre}</span>
                      <span className="text-xs text-muted-foreground font-normal">{m.anio}</span>
                    </h3>
                  </div>

                  {m.esGrati && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Gift className="w-3 h-3" /> Gratificación
                    </span>
                  )}
                  {m.esUtilidad && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Briefcase className="w-3 h-3" /> Utilidades
                    </span>
                  )}
                </div>

                {/* Dinero Disponible Destacado */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Dinero Disponible Estimado:
                  </span>
                  <div
                    className={`text-xl font-extrabold tracking-tight ${
                      positivo ? 'text-sky-500 dark:text-sky-400' : 'text-rose-500'
                    }`}
                  >
                    {formatMoney(m.disponible, moneda)}
                  </div>
                </div>

                {/* Desglose de Números */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Ingresos:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(m.ingresos, moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" /> Costos Fijos:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(m.fijos, moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Préstamos & Cuotas:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(m.prestamos, moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Tarjetas & Variables:
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(m.gastos, moneda)}
                    </span>
                  </div>
                </div>

                {/* Botón Ir a este mes */}
                <div className="pt-2 border-t border-border/80">
                  <button
                    onClick={() => {
                      setPeriodo(m.periodo);
                      router.push('/');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs border border-border/60"
                  >
                    <span>Ver detalle en Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
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
