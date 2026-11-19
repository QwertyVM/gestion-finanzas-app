'use client';

import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export function InstructivoMinitagsTip() {
  return (
    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Tag className="w-3.5 h-3.5" />
        </div>
        <div>
          <h5 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <span>¿Por qué solo 3 categorías con #Minitags?</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </h5>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            Tener decenas de categorías desordena tus reportes y dificulta saber si gastas de más. Las 3 grandes categorías te dicen si tu presupuesto está sano (50/30/20), mientras que los <strong>#minitags</strong> te dan el detalle exacto sin crear caos.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/80 text-muted-foreground font-mono">
          #Supermercado
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/80 text-muted-foreground font-mono">
          #Streaming
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border/80 text-muted-foreground font-mono">
          #Vivienda
        </span>
      </div>
    </div>
  );
}
