'use client';

import React from 'react';
import { ICONOS_DISPONIBLES, COLORES_SOBRES } from './iconHelper';

interface IconoYColorPickerProps {
  icono: string;
  color: string;
  onChangeIcono: (icono: string) => void;
  onChangeColor: (color: string) => void;
}

export function IconoYColorPicker({
  icono,
  color,
  onChangeIcono,
  onChangeColor,
}: IconoYColorPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
          Ícono Representativo
        </label>
        <div className="grid grid-cols-6 gap-1.5 p-2 rounded-lg bg-muted/30 border border-border/60 max-h-24 overflow-y-auto">
          {ICONOS_DISPONIBLES.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = icono === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChangeIcono(item.key)}
                title={item.label}
                className={`p-1.5 rounded-md flex items-center justify-center transition cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background shadow-xs'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <ItemIcon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
          Color Distintivo
        </label>
        <div className="flex items-center gap-2 flex-wrap p-2 rounded-lg bg-muted/30 border border-border/60">
          {COLORES_SOBRES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeColor(c)}
              className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                color === c ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-card' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
