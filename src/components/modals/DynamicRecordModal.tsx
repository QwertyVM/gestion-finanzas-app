'use client';

import React from 'react';
import { useDynamicRecordModal } from './hooks/useDynamicRecordModal';
import { RecordTypeSelector } from './record/RecordTypeSelector';
import { RecordAmountSection } from './record/RecordAmountSection';
import { RecordPaymentDetails } from './record/RecordPaymentDetails';
import { RecordIngresoAsignadoSelector } from './record/RecordIngresoAsignadoSelector';
import { RecordCategoryChips } from './record/RecordCategoryChips';
import { RecordDateAndStatus } from './record/RecordDateAndStatus';
import { RecordNotesAndFooter } from './record/RecordNotesAndFooter';

export function DynamicRecordModal() {
  const {
    isRecordModalOpen,
    tipoActivo,
    setTipoActivo,
    concepto,
    setConcepto,
    montoInput,
    setMontoInput,
    moneda,
    setMoneda,
    tipoCambioInput,
    setTipoCambioInput,
    fecha,
    setFecha,
    metodoPago,
    setMetodoPago,
    tarjetas,
    tarjetaId,
    setTarjetaId,
    totalCuotas,
    setTotalCuotas,
    categoriaId,
    categorias,
    tag,
    setTag,
    bancoPrestamo,
    setBancoPrestamo,
    cuotasTotalesPrestamo,
    setCuotasTotalesPrestamo,
    cuotaInicialPrestamo,
    setCuotaInicialPrestamo,
    teaPrestamo,
    setTeaPrestamo,
    estadoGasto,
    setEstadoGasto,
    ingresoId,
    setIngresoId,
    ingresos,
    tipoIngreso,
    setTipoIngreso,
    ingresoRecibido,
    setIngresoRecibido,
    notas,
    setNotas,
    seguirRegistrando,
    setSeguirRegistrando,
    submitting,
    showNotes,
    setShowNotes,
    amountInputRef,
    montoSoles,
    previewTarjeta,
    handleAddAmount,
    handleClearAmount,
    setQuickDate,
    handleSelectCategoria,
    handleSubmit,
    closeRecordModal,
  } = useDynamicRecordModal();

  if (!isRecordModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dynamic-record-title"
      >
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        <RecordTypeSelector
          tipoActivo={tipoActivo}
          onTipoChange={setTipoActivo}
          onClose={closeRecordModal}
        />

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <RecordAmountSection
            moneda={moneda}
            setMoneda={setMoneda}
            montoInput={montoInput}
            setMontoInput={setMontoInput}
            tipoCambioInput={tipoCambioInput}
            setTipoCambioInput={setTipoCambioInput}
            montoSoles={montoSoles}
            amountInputRef={amountInputRef}
            handleAddAmount={handleAddAmount}
            handleClearAmount={handleClearAmount}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Descripción / Concepto:</span>
              <span className="text-[10px] text-muted-foreground">Requerido</span>
            </label>
            <input
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder={
                tipoActivo === 'GASTO'
                  ? 'Ej: Supermercado Wong, Almuerzo, Uber, Ropa'
                  : tipoActivo === 'INGRESO'
                    ? 'Ej: Sueldo fin de mes, Venta, Bono Freelance'
                    : tipoActivo === 'FIJO'
                      ? 'Ej: Alquiler, Internet Fibra, Netflix, Gimnasio'
                      : 'Ej: Préstamo Personal, Crédito Vehicular, Préstamo Efectivo'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-foreground transition placeholder:text-muted-foreground/60 shadow-xs"
            />
          </div>

          <RecordPaymentDetails
            tipoActivo={tipoActivo}
            tipoIngreso={tipoIngreso}
            setTipoIngreso={setTipoIngreso}
            bancoPrestamo={bancoPrestamo}
            setBancoPrestamo={setBancoPrestamo}
            cuotasTotalesPrestamo={cuotasTotalesPrestamo}
            setCuotasTotalesPrestamo={setCuotasTotalesPrestamo}
            cuotaInicialPrestamo={cuotaInicialPrestamo}
            setCuotaInicialPrestamo={setCuotaInicialPrestamo}
            teaPrestamo={teaPrestamo}
            setTeaPrestamo={setTeaPrestamo}
            montoSoles={montoSoles}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            tarjetas={tarjetas}
            tarjetaId={tarjetaId}
            setTarjetaId={setTarjetaId}
            totalCuotas={totalCuotas}
            setTotalCuotas={setTotalCuotas}
            previewTarjeta={previewTarjeta}
          />

          {tipoActivo !== 'INGRESO' && (
            <RecordIngresoAsignadoSelector
              ingresos={ingresos}
              ingresoId={ingresoId}
              onSelectIngreso={setIngresoId}
              moneda={moneda === 'PEN' ? 'S/' : '$'}
            />
          )}

          <RecordCategoryChips
            categorias={categorias}
            categoriaId={categoriaId}
            onSelectCategoria={handleSelectCategoria}
            tag={tag}
            onSelectTag={setTag}
          />

          <RecordDateAndStatus
            tipoActivo={tipoActivo}
            fecha={fecha}
            setFecha={setFecha}
            setQuickDate={setQuickDate}
            ingresoRecibido={ingresoRecibido}
            setIngresoRecibido={setIngresoRecibido}
            estadoGasto={estadoGasto}
            setEstadoGasto={setEstadoGasto}
          />

          <RecordNotesAndFooter
            tipoActivo={tipoActivo}
            notas={notas}
            setNotas={setNotas}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            seguirRegistrando={seguirRegistrando}
            setSeguirRegistrando={setSeguirRegistrando}
            submitting={submitting}
            onClose={closeRecordModal}
          />
        </form>
      </div>
    </div>
  );
}
