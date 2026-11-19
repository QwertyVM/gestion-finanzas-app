'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { InstructivoPasosRegistro } from './InstructivoPasosRegistro';
import { InstructivoEjemplosCategorias } from './InstructivoEjemplosCategorias';
import { InstructivoMinitagsTip } from './InstructivoMinitagsTip';

interface InstructivoGuia503020Props {
  onOpenRecordModal?: (tipo: 'INGRESO' | 'GASTO') => void;
}

export function InstructivoGuia503020({ onOpenRecordModal }: InstructivoGuia503020Props) {
  const [abierto, setAbierto] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<'EJEMPLOS' | 'PASOS'>('EJEMPLOS');

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('finanzas_instructivo_abierto');
      if (guardado !== null) {
        setAbierto(guardado === 'true');
      }
    } catch {
      // Ignorar errores de localStorage en entornos restringidos
    }
  }, []);

  const toggleAbierto = () => {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    try {
      localStorage.setItem('finanzas_instructivo_abierto', String(nuevoEstado));
    } catch {
      // Silencioso
    }
  };

  // Versión colapsada compacta
  if (!abierto) {
    return (
      <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-foreground">
            Instructivo de Registro &amp; Modelo 50/30/20
          </span>
          <span className="hidden sm:inline text-muted-foreground/60">·</span>
          <span className="hidden sm:inline text-muted-foreground text-[11px]">
            Aprende a clasificar gastos, cuotas y usar #minitags
          </span>
        </div>

        <button
          type="button"
          onClick={toggleAbierto}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-[11px] transition cursor-pointer shrink-0"
        >
          <span>Ver guía</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      {/* Cabecera con selector de Tabs y botón colapsar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Instructivo: Registro de Gastos y Modelo 50/30/20
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                Guía Rápida
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Descubre cómo estructurar tus egresos para mantener equilibrio financiero.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Tabs */}
          <div className="inline-flex p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTabActiva('EJEMPLOS')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                tabActiva === 'EJEMPLOS'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎯 Ejemplos 50/30/20
            </button>
            <button
              type="button"
              onClick={() => setTabActiva('PASOS')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                tabActiva === 'PASOS'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📝 Cómo Registrar
            </button>
          </div>

          <button
            type="button"
            onClick={toggleAbierto}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Ocultar guía"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido según Tab activa */}
      {tabActiva === 'EJEMPLOS' ? (
        <InstructivoEjemplosCategorias />
      ) : (
        <InstructivoPasosRegistro onOpenRecordModal={onOpenRecordModal} />
      )}

      {/* Tip de Minitags siempre visible como pie */}
      <InstructivoMinitagsTip />
    </div>
  );
}
