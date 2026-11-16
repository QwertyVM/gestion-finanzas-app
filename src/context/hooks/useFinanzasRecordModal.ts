'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TipoRecordModal, RecordModalOptions } from '../finanzas-context-types';

export function useFinanzasRecordModal() {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalType, setRecordModalType] = useState<TipoRecordModal>('GASTO');
  const [recordModalOptions, setRecordModalOptions] = useState<RecordModalOptions | undefined>(undefined);

  const openRecordModal = useCallback((type: TipoRecordModal = 'GASTO', options?: RecordModalOptions) => {
    setRecordModalType(type);
    setRecordModalOptions(options);
    setIsRecordModalOpen(true);
  }, []);

  const closeRecordModal = useCallback(() => {
    setIsRecordModalOpen(false);
    setRecordModalOptions(undefined);
  }, []);

  // Atajos globales de teclado para registro rápido (Desktop: N o Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openRecordModal('GASTO');
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openRecordModal('GASTO');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openRecordModal]);

  return {
    isRecordModalOpen,
    recordModalType,
    recordModalOptions,
    openRecordModal,
    closeRecordModal,
  };
}
