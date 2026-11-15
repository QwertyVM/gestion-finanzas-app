'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

export interface TarjetaFormData {
  id?: string;
  nombre: string;
  banco: string;
  ultimosCuatro: string;
  color: string;
}

interface TarjetaFormProps {
  initialData?: TarjetaFormData | null;
  onSubmit: (data: TarjetaFormData) => Promise<void>;
  onCancel?: () => void;
  isSaving: boolean;
}

const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#dc2626', // Red
  '#d97706', // Amber
  '#0891b2', // Cyan
  '#475569', // Slate
  '#1e293b', // Dark
];

export function TarjetaForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
}: TarjetaFormProps) {
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('BCP');
  const [ultimosCuatro, setUltimosCuatro] = useState('');
  const [color, setColor] = useState('#2563eb');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setBanco(initialData.banco);
      setUltimosCuatro(initialData.ultimosCuatro || '');
      setColor(initialData.color || '#2563eb');
    } else {
      setNombre('');
      setBanco('BCP');
      setUltimosCuatro('');
      setColor('#2563eb');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await onSubmit({
      id: initialData?.id,
      nombre: nombre.trim(),
      banco: banco.trim(),
      ultimosCuatro: ultimosCuatro.trim(),
      color,
    });
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <span className="font-medium text-foreground text-xs">
            {initialData ? `Editar "${initialData.nombre}"` : 'Nueva Tarjeta'}
          </span>
          {initialData && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-muted-foreground">Nombre de la Tarjeta</label>
            <input
              type="text"
              required
              placeholder="ej. Visa Signature, Gold"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground">Banco / Entidad</label>
            <input
              type="text"
              required
              placeholder="ej. BCP, BBVA, Interbank"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground">Últimos 4 Dígitos (opcional)</label>
            <input
              type="text"
              maxLength={4}
              placeholder="ej. 4589"
              value={ultimosCuatro}
              onChange={(e) => setUltimosCuatro(e.target.value.replace(/\D/g, ''))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-foreground text-foreground font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-xs">Color identificador:</label>
            <div className="flex items-center gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border transition flex items-center justify-center ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'border-foreground scale-110'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-5 h-5 rounded border border-border cursor-pointer bg-transparent ml-1"
                title="Color personalizado"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="py-1.5 px-3.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? (
              'Guardando...'
            ) : initialData ? (
              'Actualizar Tarjeta'
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Tarjeta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
