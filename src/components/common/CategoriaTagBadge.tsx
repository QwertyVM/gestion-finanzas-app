import React from 'react';

interface CategoriaTagBadgeProps {
  categoria?: string | null;
  tag?: string | null;
  categoriaColor?: string | null;
}

export function CategoriaTagBadge({
  categoria,
  tag,
  categoriaColor,
}: CategoriaTagBadgeProps) {
  const cat = categoria || 'Sin categoría';
  const is50 = cat.includes('50');
  const is30 = cat.includes('30');
  const is20 = cat.includes('20');

  const badgeStyle = is50
    ? 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
    : is30
      ? 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60'
      : is20
        ? 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
        : 'bg-muted text-muted-foreground border-border/60';

  const dotColor =
    categoriaColor || (is50 ? '#0284c7' : is30 ? '#0d9488' : is20 ? '#7c3aed' : '#64748b');

  const cleanTag = tag ? tag.replace(/^#+/, '').trim() : null;

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${badgeStyle}`}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        <span>{cat}</span>
      </span>
      {cleanTag && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted/80 text-foreground/80 border border-border/60 shrink-0">
          #{cleanTag}
        </span>
      )}
    </span>
  );
}
