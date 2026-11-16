'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useAuth, UsuarioSesion } from './AuthContext';
import type {
  TipoRecordModal,
  RecordModalOptions,
  FinanzasContextType,
} from './finanzas-context-types';
import { useFinanzasSelection } from './hooks/useFinanzasSelection';
import { useFinanzasRecordModal } from './hooks/useFinanzasRecordModal';
import { useFinanzasPeriodo } from './hooks/useFinanzasPeriodo';

export type { UsuarioSesion as UsuarioItem };
export type { TipoRecordModal, RecordModalOptions, FinanzasContextType };

const FinanzasContext = createContext<FinanzasContextType | undefined>(undefined);

export function FinanzasProvider({ children }: { children: React.ReactNode }) {
  const { usuario: usuarioActual, cerrarSesion, loading: authLoading } = useAuth();

  // Sub-hooks modulares
  const selection = useFinanzasSelection();
  const modal = useFinanzasRecordModal();

  const handlePeriodoReset = useCallback(() => {
    selection.setSelectedItems(new Map());
  }, [selection]);

  const periodoState = useFinanzasPeriodo({
    usuarioActual,
    authLoading,
    cerrarSesion,
    onPeriodoChange: handlePeriodoReset,
  });

  return (
    <FinanzasContext.Provider
      value={{
        ...periodoState,
        usuarioActual,
        cerrarSesion,
        selectedGastoIds: selection.selectedGastoIds,
        toggleSelectGasto: selection.toggleSelectGasto,
        selectAllGastos: selection.selectAllGastos,
        clearSelection: selection.clearSelection,
        sumaSeleccionada: selection.sumaSeleccionada,
        isRecordModalOpen: modal.isRecordModalOpen,
        recordModalType: modal.recordModalType,
        recordModalOptions: modal.recordModalOptions,
        openRecordModal: modal.openRecordModal,
        closeRecordModal: modal.closeRecordModal,
      }}
    >
      {children}
    </FinanzasContext.Provider>
  );
}

export function useFinanzas() {
  const context = useContext(FinanzasContext);
  if (!context) {
    throw new Error('useFinanzas debe usarse dentro de un FinanzasProvider');
  }
  return context;
}
