'use client';

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface DetalleMetricCardProps {
  label: string;
  valueDisplay: string;
  initialInputValue: string;
  isNumber?: boolean;
  step?: string;
  min?: string;
  canEdit?: boolean;
  onSave: (val: string) => Promise<void>;
}

export function DetalleMetricCard({
  label,
  valueDisplay,
  initialInputValue,
  isNumber = true,
  step,
  min,
  canEdit = true,
  onSave,
}: DetalleMetricCardProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initialInputValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(val);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => {
              setVal(initialInputValue);
              setEditing(true);
            }}
            className="p-0.5 text-muted-foreground hover:text-foreground"
            title={`Modificar ${label}`}
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {!editing ? (
        <span className="font-bold text-foreground text-sm mt-0.5 block truncate">
          {valueDisplay}
        </span>
      ) : (
        <div className="flex items-center gap-1 mt-1">
          <input
            type={isNumber ? 'number' : 'text'}
            step={step}
            min={min}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            disabled={saving}
            className="w-full px-1.5 py-0.5 rounded bg-background border border-border text-xs font-mono font-bold outline-none"
            autoFocus
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="p-1 rounded bg-foreground text-background"
          >
            <Check className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setEditing(false)}
            className="p-1 rounded text-muted-foreground"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
