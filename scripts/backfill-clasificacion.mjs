/**
 * Script de backfill: calcula y guarda la clasificación correcta
 * en todos los registros históricos de Gasto que aún tienen el default VARIABLE.
 *
 * Lógica:
 *  - totalCuotas > 1   → CUOTA
 *  - esItemRecurrente  → FIJO
 *  - resto             → VARIABLE  (default ya correcto, pero lo seteamos explícito)
 *
 * Los CostoFijo y Prestamo ya tienen su clasificación implícita en su propio modelo
 * (nunca pasan por la tabla Gasto), así que solo se tocan los Gastos.
 */

import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// ——— Replicamos esItemRecurrente desde utils.ts ———
function esItemRecurrente(concepto = '', categoria = '') {
  const cat = (categoria || '').toLowerCase();
  const c   = (concepto  || '').toLowerCase();

  if (cat.includes('suscripci') || cat.includes('streaming') || cat.includes('membres')) return true;

  const keywordsExactas = [
    'netflix','spotify','icloud','youtube','disney','prime video','amazon prime',
    'chatgpt','openai','natación','natacion','gimnasio','smart fit',
    'crunchyroll','deezer','paramount','star+','duolingo',
    'google storage','google one','dropbox',
    'apple tv','apple one','apple music','apple arcade','apple icloud',
    'hbo max','max streaming',
  ];

  const keywordsWordBoundary = ['gym','hbo','max','cloud','crunch'];

  if (keywordsExactas.some(kw => c.includes(kw))) return true;

  return keywordsWordBoundary.some(kw => {
    const regex = new RegExp(`(?<![a-záéíóúñ])${kw}(?![a-záéíóúñ])`, 'i');
    return regex.test(c);
  });
}

function calcularClasificacion(gasto) {
  if (gasto.totalCuotas > 1) return 'CUOTA';
  if (esItemRecurrente(gasto.concepto, gasto.categoria?.nombre)) return 'FIJO';
  return 'VARIABLE';
}

// ——— Backfill ———
const gastos = await p.gasto.findMany({
  include: { categoria: { select: { nombre: true } } },
});

console.log(`📦 Total gastos a procesar: ${gastos.length}`);

let updated = 0;
let skipped = 0;
const resumen = { FIJO: 0, CUOTA: 0, VARIABLE: 0 };

for (const g of gastos) {
  const clasificacion = calcularClasificacion(g);
  resumen[clasificacion]++;

  // Actualizamos todos para dejar los valores explícitos (aunque coincidan con el default)
  await p.gasto.update({
    where: { id: g.id },
    data:  { clasificacion },
  });
  updated++;
}

console.log(`\n✅ Backfill completado:`);
console.log(`   FIJO:     ${resumen.FIJO}`);
console.log(`   CUOTA:    ${resumen.CUOTA}`);
console.log(`   VARIABLE: ${resumen.VARIABLE}`);
console.log(`   Total:    ${updated}`);

// Muestra algunos ejemplos para verificar
const muestra = await p.gasto.findMany({
  take: 10,
  orderBy: { createdAt: 'desc' },
  select: { concepto: true, clasificacion: true, totalCuotas: true, monedaOriginal: true },
});
console.log('\n📋 Muestra reciente:');
muestra.forEach(g => console.log(`  [${g.clasificacion}] ${g.concepto} (cuotas: ${g.totalCuotas}, moneda: ${g.monedaOriginal})`));

await p.$disconnect();
