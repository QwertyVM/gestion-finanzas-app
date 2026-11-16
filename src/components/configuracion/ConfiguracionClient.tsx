'use client';

import React from 'react';
import { TarjetasConfigSection } from './TarjetasConfigSection';
import { useConfiguracionManager } from './hooks/useConfiguracionManager';
import { ConfigParametrosSection } from './ConfigParametrosSection';
import { ConfigSeguridadSection } from './ConfigSeguridadSection';
import { ConfigCategoriasSection } from './ConfigCategoriasSection';

export function ConfiguracionClient() {
  const {
    periodo,
    resumen,
    refresh,
    usuarioActual,
    sueldoBase,
    setSueldoBase,
    modoSueldoVigencia,
    setModoSueldoVigencia,
    periodoPersonalizado,
    setPeriodoPersonalizado,
    tipoCambio,
    setTipoCambio,
    metaAhorro,
    setMetaAhorro,
    diaPago,
    setDiaPago,
    savingConfig,
    pinActual,
    setPinActual,
    nuevoPin,
    setNuevoPin,
    confirmarNuevoPin,
    setConfirmarNuevoPin,
    savingPin,
    categorias,
    loadingCategorias,
    nombreCat,
    setNombreCat,
    colorCat,
    setColorCat,
    esFijoCat,
    setEsFijoCat,
    savingCat,
    deletingCatId,
    editandoCat,
    handleGuardarConfig,
    handleCambiarPin,
    handleEditarCategoria,
    handleCancelarEdicionCat,
    handleGuardarCategoria,
    handleEliminarCategoria,
  } = useConfiguracionManager();

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Configuración del Sistema
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sueldo base, tipo de cambio USD, meta de ahorro y tarjetas.
        </p>
      </div>

      <ConfigParametrosSection
        sueldoBase={sueldoBase}
        setSueldoBase={setSueldoBase}
        modoSueldoVigencia={modoSueldoVigencia}
        setModoSueldoVigencia={setModoSueldoVigencia}
        periodoPersonalizado={periodoPersonalizado}
        setPeriodoPersonalizado={setPeriodoPersonalizado}
        tipoCambio={tipoCambio}
        setTipoCambio={setTipoCambio}
        metaAhorro={metaAhorro}
        setMetaAhorro={setMetaAhorro}
        diaPago={diaPago}
        setDiaPago={setDiaPago}
        savingConfig={savingConfig}
        onSubmit={handleGuardarConfig}
        periodo={periodo}
      />

      <ConfigSeguridadSection
        usuarioNombre={usuarioActual?.nombre}
        pinActual={pinActual}
        setPinActual={setPinActual}
        nuevoPin={nuevoPin}
        setNuevoPin={setNuevoPin}
        confirmarNuevoPin={confirmarNuevoPin}
        setConfirmarNuevoPin={setConfirmarNuevoPin}
        savingPin={savingPin}
        onSubmit={handleCambiarPin}
      />

      <TarjetasConfigSection
        tarjetas={resumen?.tarjetasCredito || []}
        moneda={resumen?.config?.monedaSimbolo || 'S/'}
        refresh={refresh}
      />

      <ConfigCategoriasSection
        categorias={categorias}
        loadingCategorias={loadingCategorias}
        deletingCatId={deletingCatId}
        editandoCat={editandoCat}
        nombreCat={nombreCat}
        setNombreCat={setNombreCat}
        colorCat={colorCat}
        setColorCat={setColorCat}
        esFijoCat={esFijoCat}
        setEsFijoCat={setEsFijoCat}
        savingCat={savingCat}
        onEditarCategoria={handleEditarCategoria}
        onCancelarEdicionCat={handleCancelarEdicionCat}
        onGuardarCategoria={handleGuardarCategoria}
        onEliminarCategoria={handleEliminarCategoria}
      />
    </div>
  );
}
