'use client';

import React from 'react';
import { usePresupuestoOperativo } from '@/components/presupuesto-operativo/hooks/usePresupuestoOperativo';
import { PresupuestoOperativoHeader } from '@/components/presupuesto-operativo/PresupuestoOperativoHeader';
import { BridgeCashFlowCard } from '@/components/presupuesto-operativo/BridgeCashFlowCard';
import { RunwayVelocimetroCard } from '@/components/presupuesto-operativo/RunwayVelocimetroCard';
import { EscenariosSelectorBar } from '@/components/presupuesto-operativo/EscenariosSelectorBar';
import { SobresGastosGrid } from '@/components/presupuesto-operativo/SobresGastosGrid';
import { PresupuestoConsejoBanner } from '@/components/presupuesto-operativo/PresupuestoConsejoBanner';
import { Loader2 } from 'lucide-react';

export default function PresupuestoOperativoPage() {
  const {
    data,
    loading,
    moneda,
    escenarioActivo,
    sobresLocales,
    diaPagoSueldo,
    sumaPorcentajes,
    sumaMontos,
    descuadrePorcentaje,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    aplicarEscenario,
    actualizarPorcentajeSobre,
    actualizarMontoSobre,
    autoCuadrar100,
    guardarSobre,
    eliminarSobre,
    guardarNuevoEscenario,
    eliminarEscenario,
    cambiarDiaPago,
    resetearDeFabrica,
    recargar,
  } = usePresupuestoOperativo();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Calculando puente y presupuesto operativo...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-border/80 rounded-xl space-y-2">
        <p>No se pudo calcular el presupuesto operativo para este periodo.</p>
        <button
          type="button"
          onClick={recargar}
          className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* 1. Header con Periodo Origen y Destino */}
      <PresupuestoOperativoHeader
        nombreMesOrigen={data.nombreMesOrigen}
        nombreMesDestino={data.nombreMesDestino}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        puedeIrMesAnterior={puedeIrMesAnterior}
        onRecargar={recargar}
      />

      {/* 2. Puente Financiero Cierre -> Dinero para Vivir */}
      <BridgeCashFlowCard
        nombreMesOrigen={data.nombreMesOrigen}
        nombreMesDestino={data.nombreMesDestino}
        ingresosCierre={data.ingresosCierreOrigen}
        compromisosCierre={data.compromisosCierreOrigen}
        capitalOperativo={data.capitalOperativoParaVivir}
        estadoSalud={data.estadoSaludCapital}
        moneda={moneda}
      />

      {/* 3. Ritmo de Vida & Runway Diario/Semanal con selector de día de cobro */}
      <RunwayVelocimetroCard
        nombreMesDestino={data.nombreMesDestino}
        diasTotales={data.runway.diasTotales}
        semanasTotales={data.runway.semanasTotales}
        limiteDiario={data.runway.limiteDiario}
        limiteSemanal={data.runway.limiteSemanal}
        desgloseSemanas={data.runway.desgloseSemanas}
        moneda={moneda}
        diaPagoSueldo={diaPagoSueldo}
        onCambiarDiaPago={cambiarDiaPago}
      />

      {/* 4. Selector de Escenarios con 1 clic y presets guardables */}
      <EscenariosSelectorBar
        escenarios={data.escenarios}
        escenarioActivo={escenarioActivo}
        onSeleccionarEscenario={aplicarEscenario}
        onGuardarNuevoEscenario={guardarNuevoEscenario}
        onEliminarEscenario={eliminarEscenario}
        onResetear={resetearDeFabrica}
      />

      {/* 5. Grid de Sobres de Subsistencia Parametrizables (Edición bidireccional S/ y %) */}
      <SobresGastosGrid
        sobres={sobresLocales}
        moneda={moneda}
        sumaPorcentajes={sumaPorcentajes}
        sumaMontos={sumaMontos}
        capitalTotal={data.capitalOperativoParaVivir}
        descuadrePorcentaje={descuadrePorcentaje}
        onActualizarPorcentaje={actualizarPorcentajeSobre}
        onActualizarMonto={actualizarMontoSobre}
        onAutoCuadrar={autoCuadrar100}
        onGuardarSobre={guardarSobre}
        onEliminarSobre={eliminarSobre}
      />

      {/* 6. Consejo Consultor y Benchmark Histórico */}
      <PresupuestoConsejoBanner
        consejoConsultor={data.consejoConsultor}
        benchmarkHistorico={data.benchmarkHistorico}
      />
    </div>
  );
}
