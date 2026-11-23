'use client';

import React from 'react';
import { usePresupuestoOperativo } from '@/components/presupuesto-operativo/hooks/usePresupuestoOperativo';
import { PresupuestoOperativoHeader } from '@/components/presupuesto-operativo/PresupuestoOperativoHeader';
import { BridgeCashFlowCard } from '@/components/presupuesto-operativo/BridgeCashFlowCard';
import { RunwayVelocimetroCard } from '@/components/presupuesto-operativo/RunwayVelocimetroCard';
import { SobresGastosGrid } from '@/components/presupuesto-operativo/SobresGastosGrid';
import { Loader2 } from 'lucide-react';

export default function PresupuestoOperativoPage() {
  const {
    data,
    loading,
    moneda,
    sobresLocales,
    sobreBolsillo,
    runwayBolsilloActivo,
    diaPagoSueldo,
    sumaPorcentajes,
    sumaMontos,
    descuadrePorcentaje,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    actualizarPorcentajeSobre,
    actualizarMontoSobre,
    autoCuadrar100,
    guardarSobre,
    eliminarSobre,
    toggleBloqueo,
    cambiarDiaPago,
    recargar,
  } = usePresupuestoOperativo();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Calculando puente y distribución de gastos...</p>
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
      {/* Header con Periodo Origen y Destino */}
      <PresupuestoOperativoHeader
        nombreMesOrigen={data.nombreMesOrigen}
        nombreMesDestino={data.nombreMesDestino}
        irMesAnterior={irMesAnterior}
        irMesSiguiente={irMesSiguiente}
        puedeIrMesAnterior={puedeIrMesAnterior}
        onRecargar={recargar}
      />

      {/* BLOQUE 1: Saldo Disponible (Ingresos - Egresos = Dinero para Vivir) */}
      <section aria-label="Saldo Disponible">
        <BridgeCashFlowCard
          nombreMesOrigen={data.nombreMesOrigen}
          nombreMesDestino={data.nombreMesDestino}
          ingresosCierre={data.ingresosCierreOrigen}
          compromisosCierre={data.compromisosCierreOrigen}
          capitalOperativo={data.capitalOperativoParaVivir}
          estadoSalud={data.estadoSaludCapital}
          moneda={moneda}
        />
      </section>

      {/* BLOQUE 2: Tus Sobres de Gasto Personalizados */}
      <section aria-label="Tus Sobres de Gasto" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Tus Sobres de Gasto
              </h2>
                <p className="text-xs text-muted-foreground">
                  Asigna el 100% de tu dinero disponible a tus categorías personalizadas.
                </p>
              </div>
          </div>

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
            onToggleBloqueo={toggleBloqueo}
          />
      </section>

      {/* BLOQUE 3: Runway de Ocio & Semanas hasta el Próximo Cobro */}
      <section aria-label="Runway de Ocio Personal">
        <RunwayVelocimetroCard
          nombreMesDestino={data.nombreMesDestino}
          diasTotales={runwayBolsilloActivo?.diasTotales ?? data.runway.diasTotales}
          semanasCompletas={runwayBolsilloActivo?.semanasCompletas}
          diasRemanentes={runwayBolsilloActivo?.diasRemanentes}
          textoPeriodo={runwayBolsilloActivo?.textoPeriodo}
          limiteDiario={runwayBolsilloActivo?.limiteDiario ?? 0}
          limiteSemanal={runwayBolsilloActivo?.limiteSemanal ?? 0}
          desgloseSemanas={runwayBolsilloActivo?.desgloseSemanas ?? []}
          moneda={moneda}
          diaPagoSueldo={diaPagoSueldo}
          nombreSobre={sobreBolsillo?.nombre ?? 'Bolsillo Personal & Ocio Flexible'}
          montoAsignado={sobreBolsillo?.monto ?? 0}
          porcentajeAsignado={sobreBolsillo?.porcentaje ?? 0}
          onCambiarDiaPago={cambiarDiaPago}
        />
      </section>
    </div>
  );
}
