'use client';

import React, { useState } from 'react';
import { InstructivoEjemplosCategorias } from './instructivo/InstructivoEjemplosCategorias';
import { InstructivoPasosRegistro } from './instructivo/InstructivoPasosRegistro';
import { InstructivoMinitagsTip } from './instructivo/InstructivoMinitagsTip';

interface InstructivoGuiaTabProps {
  onOpenRecordModal?: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function InstructivoGuiaTab({ onOpenRecordModal }: InstructivoGuiaTabProps) {
  const [subTab, setSubTab] = useState<'EJEMPLOS' | 'PASOS'>('EJEMPLOS');

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Guía Práctica: Registro y Metodología 50/30/20
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Aprende a clasificar gastos, cuotas y estructurar tus finanzas personales.
          </p>
        </div>

        <div className="inline-flex p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSubTab('EJEMPLOS')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
              subTab === 'EJEMPLOS'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🎯 Ejemplos 50/30/20
          </button>
          <button
            type="button"
            onClick={() => setSubTab('PASOS')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
              subTab === 'PASOS'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📝 Cómo Registrar
          </button>
        </div>
      </div>

      {subTab === 'EJEMPLOS' ? (
        <InstructivoEjemplosCategorias />
      ) : (
        <InstructivoPasosRegistro onOpenRecordModal={onOpenRecordModal} />
      )}

      <InstructivoMinitagsTip />
    </div>
  );
}
