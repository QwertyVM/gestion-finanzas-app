'use client';

import React, { useEffect, useState } from 'react';
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
  const { setPeriodo, resumen } = useFinanzas();
  const [datosAnio, setDatosAnio] = useState<MesProyeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState(2027);

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

        {/* Selector de año */}
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl border border-border">
          {[2026, 2027].map((yr) => (
            <button
              key={yr}
              onClick={() => setAnioSeleccionado(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                anioSeleccionado === yr
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Año {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de 12 Meses */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
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
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Gastos Fijos:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatMoney(m.fijos, moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Préstamos & Deudas:</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(m.prestamos, moneda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tarjetas & Otros:</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(m.gastos, moneda)}
                    </span>
                  </div>
                </div>

                {/* Botón Ir a este mes */}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setPeriodo(m.periodo);
                      window.location.href = '/';
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Ver detalle en Dashboard</span>
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
