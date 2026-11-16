'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Pencil } from 'lucide-react';
import { formatPeriodoLabel } from '@/lib/utils';
import { DetalleFechaPeriodoEditor } from './DetalleFechaPeriodoEditor';

interface DetalleFechaPeriodoBoxProps {
  fechaGasto?: string;
  periodoPago?: string;
  tarjetaDiaCorte?: number;
  esTarjeta?: boolean;
  tieneCuotas?: boolean;
  onGuardar?: (nuevaFecha: string, nuevoPeriodo: string, aplicarSerie?: boolean) => Promise<void>;
  permitirEditar?: boolean;
}

function parseToDateInput(val?: string | null): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (typeof val === 'string' && val.includes('T')) {
    return val.split('T')[0];
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DetalleFechaPeriodoBox({
  fechaGasto,
  periodoPago,
  tarjetaDiaCorte = 10,
  esTarjeta = false,
  tieneCuotas = false,
  onGuardar,
  permitirEditar = true,
}: DetalleFechaPeriodoBoxProps) {
  const [editando, setEditando] = useState(false);
  const [fechaInput, setFechaInput] = useState(() => parseToDateInput(fechaGasto));
  const [periodoInput, setPeriodoInput] = useState(periodoPago || '');
  const [aplicarSerie, setAplicarSerie] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFechaInput(parseToDateInput(fechaGasto));
    setPeriodoInput(periodoPago || '');
  }, [fechaGasto, periodoPago]);

  const opcionesMeses = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const baseDate = new Date();
    const baseYear = baseDate.getFullYear();
    for (let y = baseYear - 1; y <= baseYear + 2; y++) {
      for (let m = 1; m <= 12; m++) {
        const val = `${y}-${String(m).padStart(2, '0')}`;
        options.push({ value: val, label: formatPeriodoLabel(val) });
      }
    }
    return options;
  }, []);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFechaInput(val);
    if (!val || !val.includes('-')) return;

    const parts = val.split('-');
    if (parts.length === 3) {
      const [yStr, mStr, dStr] = parts;
      const dia = parseInt(dStr, 10);
      const mNum = parseInt(mStr, 10);
      const yNum = parseInt(yStr, 10);

      if (esTarjeta) {
        if (dia <= tarjetaDiaCorte) {
          setPeriodoInput(`${yStr}-${mStr}`);
        } else {
          let nextM = mNum + 1;
          let nextY = yNum;
          if (nextM > 12) {
            nextM = 1;
            nextY += 1;
          }
          setPeriodoInput(`${nextY}-${String(nextM).padStart(2, '0')}`);
        }
      } else {
        setPeriodoInput(`${yStr}-${mStr}`);
      }
    }
  };

  const handleSave = async () => {
    if (!onGuardar || saving) return;
    try {
      setSaving(true);
      await onGuardar(fechaInput, periodoInput, aplicarSerie);
      setEditando(false);
    } finally {
      setSaving(false);
    }
  };

  const fechaFormatted = fechaGasto
    ? new Date(fechaGasto).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : null;

  if (editando) {
    return (
      <DetalleFechaPeriodoEditor
        fechaInput={fechaInput}
        periodoInput={periodoInput}
        tarjetaDiaCorte={tarjetaDiaCorte}
        esTarjeta={esTarjeta}
        tieneCuotas={tieneCuotas}
        aplicarSerie={aplicarSerie}
        saving={saving}
        opcionesMeses={opcionesMeses}
        onChangeFecha={handleFechaChange}
        onChangePeriodo={setPeriodoInput}
        onChangeAplicarSerie={setAplicarSerie}
        onSave={handleSave}
        onCancel={() => setEditando(false)}
      />
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Asignación Temporal
        </span>
        {permitirEditar && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-card border border-border/70">
          <span className="text-[10px] text-muted-foreground block mb-0.5">Fecha de Compra</span>
          <span className="font-medium text-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>{fechaFormatted || 'Sin fecha'}</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-card border border-border/70">
          <span className="text-[10px] text-muted-foreground block mb-0.5">Periodo Imputado</span>
          <span className="font-medium text-foreground">
            {periodoPago ? formatPeriodoLabel(periodoPago) : 'Sin periodo'}
          </span>
        </div>
      </div>
    </div>
  );
}
