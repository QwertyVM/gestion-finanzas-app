'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { COLORES_SOBRES, getPresupuestoIcon } from './iconHelper';
import { IconoYColorPicker } from './IconoYColorPicker';
import type { SobreGastoOperativo } from '@/lib/finanzas-service';

interface ModalEditarSobreProps {
  open: boolean;
  sobreParaEditar: SobreGastoOperativo | null;
  puedeEliminar: boolean;
  onClose: () => void;
  onGuardar: (datos: {
    id?: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    porcentaje: number;
  }) => void;
  onEliminar?: (id: string) => void;
}

export function ModalEditarSobre({
  open,
  sobreParaEditar,
  puedeEliminar,
  onClose,
  onGuardar,
  onEliminar,
}: ModalEditarSobreProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [icono, setIcono] = useState('Utensils');
  const [color, setColor] = useState('#0284c7');
  const [porcentaje, setPorcentaje] = useState(15);

  useEffect(() => {
    if (sobreParaEditar) {
      setNombre(sobreParaEditar.nombre);
      setDescripcion(sobreParaEditar.descripcion || '');
      setIcono(sobreParaEditar.icono || 'Utensils');
      setColor(sobreParaEditar.color || '#0284c7');
      setPorcentaje(sobreParaEditar.porcentaje || 10);
    } else {
      setNombre('');
      setDescripcion('');
      setIcono('ShoppingCart');
      setColor(COLORES_SOBRES[Math.floor(Math.random() * COLORES_SOBRES.length)]);
      setPorcentaje(10);
    }
  }, [sobreParaEditar, open]);

  if (!open) return null;

  const esEdicion = Boolean(sobreParaEditar);
  const IconoSeleccionado = getPresupuestoIcon(icono);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onGuardar({
      id: sobreParaEditar?.id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      icono,
      color,
      porcentaje: Math.max(0, Math.min(100, Number(porcentaje))),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <IconoSeleccionado className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {esEdicion ? 'Editar Sobre de Gasto' : 'Crear Nuevo Sobre'}
              </h3>
              <p className="text-[11px] text-muted-foreground">Personaliza nombre, ícono y color</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej: Salidas, Ropa, Gimnasio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Ej: Almuerzos de oficina y salidas de fin de semana"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <IconoYColorPicker
            icono={icono}
            color={color}
            onChangeIcono={setIcono}
            onChangeColor={setColor}
          />

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            {esEdicion && puedeEliminar && onEliminar ? (
              <button
                type="button"
                onClick={() => {
                  if (sobreParaEditar?.id) onEliminar(sobreParaEditar.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!nombre.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{esEdicion ? 'Actualizar' : 'Crear Sobre'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
