// Test de esItemRecurrente con los casos problemáticos

// Simulamos la función corregida
function esItemRecurrente(concepto = '', categoria = '') {
  const cat = (categoria || '').toLowerCase();
  const c = (concepto || '').toLowerCase();

  if (cat.includes('suscripci') || cat.includes('streaming') || cat.includes('membres')) {
    return true;
  }

  const keywordsExactas = [
    'netflix', 'spotify', 'icloud', 'youtube', 'disney', 'prime video', 'amazon prime',
    'chatgpt', 'openai', 'natación', 'natacion', 'gimnasio', 'smart fit',
    'crunchyroll', 'deezer', 'paramount', 'star+', 'duolingo',
    'google storage', 'google one', 'dropbox',
    'apple tv', 'apple one', 'apple music', 'apple arcade', 'apple icloud',
    'hbo max', 'max streaming',
  ];

  const keywordsWordBoundary = [
    'gym', 'hbo', 'max', 'fit', 'cloud', 'crunch',
  ];

  if (keywordsExactas.some((kw) => c.includes(kw))) return true;

  return keywordsWordBoundary.some((kw) => {
    const regex = new RegExp(`(?<![a-záéíóúñ])${kw}(?![a-záéíóúñ])`, 'i');
    return regex.test(c);
  });
}

const casos = [
  // ❌ Falsos positivos (deben dar FALSE ahora)
  { concepto: 'Applecar', esperado: false },
  { concepto: 'Maxfit gym wear', esperado: true },   // "gym" como palabra es recurrente ✅
  { concepto: 'Crunchbase suscripcion', esperado: false }, // "crunch" pero no es suscripción de streaming
  { concepto: 'Cloudflare pago puntual', esperado: false },
  { concepto: 'Smart Perfect Fit shoes', esperado: false },
  // ✅ Verdaderos positivos (deben dar TRUE)
  { concepto: 'Apple TV+ mensual', esperado: true },
  { concepto: 'Apple One suscripcion', esperado: true },
  { concepto: 'Netflix mensual', esperado: true },
  { concepto: 'Spotify premium', esperado: true },
  { concepto: 'Smart Fit mensualidad', esperado: true },
  { concepto: 'Mi gym mensual', esperado: true },
  { concepto: 'HBO Max streaming', esperado: true },
  { concepto: 'Dropbox plan anual', esperado: true },
  { concepto: 'Google One 100GB', esperado: true },
  { concepto: 'ChatGPT Plus', esperado: true },
  // Categoría
  { concepto: 'Cargo mensual', categoria: 'Suscripciones', esperado: true },
];

let passed = 0;
let failed = 0;
casos.forEach(({ concepto, categoria = '', esperado }) => {
  const resultado = esItemRecurrente(concepto, categoria);
  const ok = resultado === esperado;
  console.log(`${ok ? '✅' : '❌'} "${concepto}" (cat: "${categoria}") => ${resultado} (esperado: ${esperado})`);
  if (ok) passed++; else failed++;
});

console.log(`\n${passed}/${passed + failed} tests pasaron`);
