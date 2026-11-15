'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { TarjetasTable, TarjetaTableItem } from './TarjetasTable';
import { TarjetaForm, TarjetaFormData } from './TarjetaForm';

interface TarjetasConfigSectionProps {
  tarjetas: TarjetaTableItem[];
  moneda: string;
  refresh: () => Promise<void>;
}

export function TarjetasConfigSection({
  tarjetas,
  moneda,
  refresh,
}: TarjetasConfigSectionProps) {
  const [editandoTarjeta, setEditandoTarjeta] = useState<TarjetaFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (t: TarjetaTableItem) => {
    setEditandoTarjeta({
      id: t.id,
      nombre: t.nombre,
      banco: t.banco,
      ultimosCuatro: t.ultimosCuatro || '',
      color: t.color || '#2563eb',
    });
  };

  const handleCancelEdit = () => {
    setEditandoTarjeta(null);
  };

  const handleSubmit = async (formData: TarjetaFormData) => {
    try {
      setIsSaving(true);
      const isEditing = Boolean(formData.id);

      const res = await fetch('/api/tarjetas', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing ? { id: formData.id } : {}),
          nombre: formData.nombre,
          banco: formData.banco,
          ultimosCuatro: formData.ultimosCuatro || undefined,
          color: formData.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar tarjeta');
      }

      toast.success(isEditing ? 'Tarjeta actualizada' : 'Tarjeta agregada');
      setEditandoTarjeta(null);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la tarjeta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la tarjeta "${nombre}"?`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/tarjetas?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar la tarjeta');
      }

      toast.success(`Tarjeta "${nombre}" eliminada`);
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tarjetas de Crédito
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {tarjetas.length} {tarjetas.length === 1 ? 'tarjeta activa' : 'tarjetas activas'}
        </span>
      </div>

      <TarjetasTable
        tarjetas={tarjetas}
        moneda={moneda}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <TarjetaForm
        initialData={editandoTarjeta}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
        isSaving={isSaving}
      />
    </div>
  );
}
