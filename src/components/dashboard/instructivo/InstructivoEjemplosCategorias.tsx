'use client';

import React from 'react';

export function InstructivoEjemplosCategorias() {
  const categorias = [
    {
      titulo: 'Necesidades (50%)',
      meta: 'Meta máx. 50%',
      colorBadge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      bordeCard: 'border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/10',
      icono: '🟢',
      definicion: 'Gastos esenciales para vivir y trabajar. No se pueden postergar sin consecuencias graves.',
      ejemplos: [
        { concepto: 'Alquiler o Cuota Hipotecaria', tag: '#Vivienda' },
        { concepto: 'Luz, Agua, Gas e Internet', tag: '#Servicios Básicos' },
        { concepto: 'Compras de despensa y mercado', tag: '#Supermercado' },
        { concepto: 'Combustible, pasajes y SOAT', tag: '#Transporte' },
        { concepto: 'Medicinas y citas médicas', tag: '#Salud & Farmacia' },
        { concepto: 'Colegios, pensión académica', tag: '#Educación' },
      ],
    },
    {
      titulo: 'Deseos (30%)',
      meta: 'Meta máx. 30%',
      colorBadge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800',
      bordeCard: 'border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/10',
      icono: '🟣',
      definicion: 'Gastos de estilo de vida, confort y ocio. Mejoran tu vida pero podrías reducirlos si fuera necesario.',
      ejemplos: [
        { concepto: 'Cenas, bares y cafeterías', tag: '#Restaurantes & Cafés' },
        { concepto: 'Netflix, Spotify, YouTube', tag: '#Streaming & Apps' },
        { concepto: 'Cine, eventos y salidas fin de semana', tag: '#Salidas & Ocio' },
        { concepto: 'Ropa de moda y compras personales', tag: '#Compras & Ropa' },
        { concepto: 'Boletos de avión o escapadas', tag: '#Viajes' },
        { concepto: 'Membresías de ocio o hobbies', tag: '#Gimnasio & Deporte' },
      ],
    },
    {
      titulo: 'Ahorro / Inversión (20%)',
      meta: 'Meta mín. 20%',
      colorBadge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      bordeCard: 'border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/10',
      icono: '🔵',
      definicion: 'Dinero que construye tu tranquilidad futura, te protege de crisis y cancela deudas.',
      ejemplos: [
        { concepto: 'Colchón de 3-6 meses de gastos', tag: '#Fondo de Emergencia' },
        { concepto: 'Fondos mutuos, acciones, depósitos', tag: '#Inversiones' },
        { concepto: 'Amortización de préstamos a capital', tag: '#Amortización Deuda' },
        { concepto: 'Aportes voluntarios de jubilación', tag: '#Jubilación' },
        { concepto: 'Ahorro programado para metas', tag: '#Ahorro' },
        { concepto: 'Cursos o certificaciones de alto valor', tag: '#Educación' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {categorias.map((cat) => (
        <div
          key={cat.titulo}
          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${cat.bordeCard}`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{cat.icono}</span>
                <span>{cat.titulo}</span>
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.colorBadge}`}>
                {cat.meta}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {cat.definicion}
            </p>
          </div>

          <div className="pt-2 border-t border-border/40">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Ejemplos con #Minitags:
            </span>
            <ul className="space-y-1.5 text-xs">
              {cat.ejemplos.map((ej) => (
                <li key={ej.concepto} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-foreground/90 truncate">{ej.concepto}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-background/80 border border-border/60 text-muted-foreground shrink-0 font-medium">
                    {ej.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
