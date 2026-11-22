'use client';

import React, { useState } from 'react';
import { BarraCuadreSobres } from './BarraCuadreSobres';
import { SobreGastoCard } from './SobreGastoCard';
import { ModalEditarSobre } from './ModalEditarSobre';
import type { SobreGastoOperativo } from '@/lib/finanzas-service';

interface SobresGastosGridProps {
  sobres: SobreGastoOperativo[];
  moneda: string;
  capitalTotal: number;
  sumaPorcentajes: number;
  sumaMontos: number;
  descuadrePorcentaje: number;
  onActualizarPorcentaje: (sobreId: string, nuevoPct: number) => void;
  onActualizarMonto: (sobreId: string, nuevoMonto: number) => void;
  onAutoCuadrar: () => void;
  onGuardarSobre: (datos: {
    id?: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    porcentaje: number;
  }) => void;
  onEliminarSobre: (id: string) => void;
  onToggleBloqueo?: (sobreId: string) => void;
}

export function SobresGastosGrid({
  sobres,
  moneda,
  capitalTotal,
  sumaPorcentajes,
  sumaMontos,
  descuadrePorcentaje,
  onActualizarPorcentaje,
  onActualizarMonto,
  onAutoCuadrar,
  onGuardarSobre,
  onEliminarSobre,
  onToggleBloqueo,
}: SobresGastosGridProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [sobreSeleccionado, setSobreSeleccionado] = useState<SobreGastoOperativo | null>(null);

    const handleAbrirCrear = () => {
      setSobreSeleccionado(null);
      setModalOpen(true);
    };

    const handleAbrirEditar = (sobre: SobreGastoOperativo) => {
      setSobreSeleccionado(sobre);
      setModalOpen(true);
    };

    return (
      <div className="space-y-3">
          {/* Barra de Validación de Cuadre y Acciones */}
          <BarraCuadreSobres
            sumaPorcentajes={sumaPorcentajes}
            sumaMontos={sumaMontos}
            capitalTotal={capitalTotal}
            moneda={moneda}
            descuadrePorcentaje={descuadrePorcentaje}
            onAutoCuadrar={onAutoCuadrar}
            onAgregarSobre={handleAbrirCrear}
          />

          {/* Grid de Sobres Parametrizables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sobres.map((s) => (
              <SobreGastoCard
                key={s.id}
                sobre={s}
                moneda={moneda}
                capitalTotal={capitalTotal}
                onActualizarPorcentaje={onActualizarPorcentaje}
                onActualizarMonto={onActualizarMonto}
                onEditar={handleAbrirEditar}
                onToggleBloqueo={onToggleBloqueo}
              />
            ))}
          </div>

          {/* Modal para Crear / Editar Sobre */}
          <ModalEditarSobre
            open={modalOpen}
            sobreParaEditar={sobreSeleccionado}
            puedeEliminar={sobres.length > 1}
            onClose={() => setModalOpen(false)}
            onGuardar={onGuardarSobre}
            onEliminar={onEliminarSobre}
          />
        </div>
        );
}
