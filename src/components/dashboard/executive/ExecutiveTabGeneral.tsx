'use client';

import React from 'react';
import type { ResumenFinanciero } from '@/lib/finanzas-service';
import { ResumenDivisasCard } from '@/components/dashboard/ResumenDivisasCard';
import { SaludFinancieraScorecard } from '@/components/dashboard/SaludFinancieraScorecard';
import { Regla503020Card } from '@/components/dashboard/Regla503020Card';
import { ExecutiveGeneralKpis } from './ExecutiveGeneralKpis';
import { ExecutiveGeneralCharts } from './ExecutiveGeneralCharts';
import { ExecutiveLoansSection } from './ExecutiveLoansSection';

interface ExecutiveTabGeneralProps {
  resumen: ResumenFinanciero;
  moneda: string;
  sueldoBase: number;
  totalIngresos: number;
  totalEgresos: number;
  disponibleNeto: number;
  disponibleEsPositivo: boolean;
  deudaTotalConsolidada: number;
  prestamosActivos: any[];
  distribucionEgresos: any[];
  datosFlujoAnual: any[];
}

export function ExecutiveTabGeneral({
  resumen,
  moneda,
  sueldoBase,
  totalIngresos,
  totalEgresos,
  disponibleNeto,
  disponibleEsPositivo,
  deudaTotalConsolidada,
  prestamosActivos,
  distribucionEgresos,
  datosFlujoAnual,
}: ExecutiveTabGeneralProps) {
  return (
    <div className="space-y-6">
      {/* 1. KPIS PRINCIPALES */}
      <ExecutiveGeneralKpis
        totalIngresos={totalIngresos}
        sueldoBase={sueldoBase}
        totalEgresos={totalEgresos}
        totalPendiente={resumen.totalPendiente}
        totalAdelantado={resumen.totalAdelantado}
        disponibleNeto={disponibleNeto}
        disponibleEsPositivo={disponibleEsPositivo}
        deudaTotalConsolidada={deudaTotalConsolidada}
        prestamosActivosCount={prestamosActivos.length}
        moneda={moneda}
      />

      {/* 2. RESUMEN DIVISAS */}
      {resumen.resumenDivisas?.tieneMultiplesMonedas && (
        <ResumenDivisasCard divisas={resumen.resumenDivisas} moneda={moneda} />
      )}

      {/* 3. DIAGNÓSTICO SALUD FINANCIERA */}
      <SaludFinancieraScorecard salud={resumen.saludFinanciera} moneda={moneda} />

      {/* 4. GRÁFICOS */}
      <ExecutiveGeneralCharts
        distribucionEgresos={distribucionEgresos}
        datosFlujoAnual={datosFlujoAnual}
        totalEgresos={totalEgresos}
        moneda={moneda}
      />

      {/* 5. REGLA 50 / 30 / 20 */}
      <Regla503020Card regla={resumen.saludFinanciera?.regla503020} moneda={moneda} />

      {/* 6. TABLA PRÉSTAMOS ACTIVOS */}
      <ExecutiveLoansSection prestamosActivos={prestamosActivos} moneda={moneda} />
    </div>
  );
}
