'use client';

import React from 'react';

interface ResumenDivisasDistribucionBarProps {
  porcentajeSoles: number;
  porcentajeDolares: number;
}

export function ResumenDivisasDistribucionBar({
  porcentajeSoles,
  porcentajeDolares,
}: ResumenDivisasDistribucionBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
        {porcentajeSoles > 0 && (
          <div
            style={{ width: `${porcentajeSoles}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`Soles: ${porcentajeSoles}%`}
          />
        )}
        {porcentajeDolares > 0 && (
          <div
            style={{ width: `${porcentajeDolares}%` }}
            className="bg-sky-500 h-full transition-all duration-300"
            title={`Dólares: ${porcentajeDolares}%`}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Soles ({porcentajeSoles}%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
          <span>Dólares ({porcentajeDolares}%)</span>
        </span>
      </div>
    </div>
  );
}

