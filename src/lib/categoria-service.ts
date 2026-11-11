import prisma from './prisma';

export interface CategoriaDef {
  nombre: string;
  icono: string;
  color: string;
  esFijo: boolean;
  descripcion?: string;
}

/**
 * Catálogo canónico de categorías generalizadas (Tags)
 * Unifica etiquetas redundantes y reemplaza tags ultra específicos de inmuebles/lugares
 * por categorías estándar de finanzas personales.
 */
export const CATEGORIAS_GENERALIZADAS: CategoriaDef[] = [
  {
    nombre: 'Vivienda / Alquiler',
    icono: 'Home',
    color: '#10b981', // Verde esmeralda
    esFijo: true,
    descripcion: 'Alquiler, hipoteca, mantenimiento de inmuebles y reparaciones del hogar.',
  },
  {
    nombre: 'Servicios Básicos (Luz/Agua/Net)',
    icono: 'Zap',
    color: '#3b82f6', // Azul
    esFijo: true,
    descripcion: 'Luz, agua, gas, internet hogar, telefonía móvil y arbitrios.',
  },
  {
    nombre: 'Alimentación / Supermercado',
    icono: 'ShoppingCart',
    color: '#f59e0b', // Ámbar / Dorado
    esFijo: true,
    descripcion: 'Supermercado, mercado, víveres del mes y alimentación esencial.',
  },
  {
    nombre: 'Transporte & Vehicular',
    icono: 'Car',
    color: '#64748b', // Slate
    esFijo: false,
    descripcion: 'Seguro vehicular, combustible, mantenimiento, peajes, taxi y transporte público.',
  },
  {
    nombre: 'Suscripciones / Streaming',
    icono: 'Tv',
    color: '#8b5cf6', // Violeta / Púrpura
    esFijo: true,
    descripcion: 'Streaming (Netflix, Spotify, etc.), almacenamiento en la nube y membresías.',
  },
  {
    nombre: 'Salud & Cuidado Personal',
    icono: 'HeartPulse',
    color: '#ec4899', // Rosa
    esFijo: false,
    descripcion: 'Consultas médicas, psicología, farmacia, deporte (natación/gym) y cuidado personal.',
  },
  {
    nombre: 'Préstamos & Créditos',
    icono: 'Landmark',
    color: '#6366f1', // Índigo
    esFijo: true,
    descripcion: 'Cuotas de préstamos personales, créditos vehiculares y amortización de deudas.',
  },
  {
    nombre: 'Educación / Cursos',
    icono: 'GraduationCap',
    color: '#06b6d4', // Cian
    esFijo: false,
    descripcion: 'Cursos, capacitaciones, libros, certificaciones y materiales de estudio.',
  },
  {
    nombre: 'Salidas & Ocio',
    icono: 'Coffee',
    color: '#f97316', // Naranja
    esFijo: false,
    descripcion: 'Restaurantes, delivery recreativo, salidas con amigos, cine y eventos.',
  },
  {
    nombre: 'Compras Varias',
    icono: 'ShoppingCart',
    color: '#64748b', // Gris azulado
    esFijo: false,
    descripcion: 'Ropa, tecnología, gadgets, equipamiento y compras de consumo.',
  },
  {
    nombre: 'Familiar & Compromisos',
    icono: 'HeartPulse',
    color: '#f43f5e', // Rosa intenso
    esFijo: false,
    descripcion: 'Apoyo familiar, regalos, compromisos y celebraciones.',
  },
  {
    nombre: 'Otros / Imprevistos',
    icono: 'HelpCircle',
    color: '#6b7280', // Gris neutro
    esFijo: false,
    descripcion: 'Trámites, imprevistos o gastos no clasificados en otra categoría.',
  },
];

export interface ResultadoGeneralizacion {
  success: boolean;
  message: string;
  totalCategoriasEstandar: number;
  migraciones: {
    categoriaOrigen: string;
    categoriaDestino: string;
    costosFijosMigrados: number;
    gastosMigrados: number;
  }[];
  categoriasEliminadas: string[];
  detalles: string[];
}

/**
 * Ejecuta la generalización completa de categorías en la base de datos:
 * 1. Asegura la existencia de las categorías estándar canónicas.
 * 2. Reubica costos fijos y gastos asociados a categorías redundantes o específicas (Casa La Molina, Casa SJM, Alimentación, etc.).
 * 3. Elimina las categorías obsoletas que hayan quedado sin registros asociados.
 */
export async function generalizarCategorias(targetUsuarioId?: string | null): Promise<ResultadoGeneralizacion> {
  const detalles: string[] = [];
  const migraciones: ResultadoGeneralizacion['migraciones'] = [];
  const categoriasEliminadas: string[] = [];

  let effectiveUserId = targetUsuarioId;
  if (effectiveUserId === undefined) {
    const defaultUser = await prisma.usuario.findFirst({ where: { slug: 'victor' } });
    effectiveUserId = defaultUser?.id || null;
  }

  // 1. Asegurar la creación/actualización de todas las categorías estándar
  const categoriasMap = new Map<string, string>(); // nombre -> id

  for (const catDef of CATEGORIAS_GENERALIZADAS) {
    const upserted = await prisma.categoria.upsert({
      where: {
        usuarioId_nombre: {
          usuarioId: effectiveUserId as any,
          nombre: catDef.nombre,
        },
      },
      update: {
        icono: catDef.icono,
        color: catDef.color,
        esFijo: catDef.esFijo,
      },
      create: {
        usuarioId: effectiveUserId,
        nombre: catDef.nombre,
        icono: catDef.icono,
        color: catDef.color,
        esFijo: catDef.esFijo,
      },
    });
    categoriasMap.set(catDef.nombre, upserted.id);
  }

  const idVivienda = categoriasMap.get('Vivienda / Alquiler')!;
  const idServicios = categoriasMap.get('Servicios Básicos (Luz/Agua/Net)')!;
  const idAlimentacion = categoriasMap.get('Alimentación / Supermercado')!;
  const idTransporte = categoriasMap.get('Transporte & Vehicular')!;
  const idSuscripciones = categoriasMap.get('Suscripciones / Streaming')!;
  const idSalud = categoriasMap.get('Salud & Cuidado Personal')!;

  // 2. Obtener todas las categorías actuales para detectar las que deben ser migradas
  const whereFilter: any = {};
  if (effectiveUserId) {
    whereFilter.OR = [{ usuarioId: effectiveUserId }, { usuarioId: null }];
  }
  const todasLasCategorias = await prisma.categoria.findMany({
    where: whereFilter,
    include: {
      costosFijos: true,
      gastos: true,
    },
  });

  const REGEX_SERVICIOS = /luz|agua|servicio|tel[eé]fono|internet|net|cable|gas/i;

  for (const cat of todasLasCategorias) {
    const nombre = cat.nombre.trim();

    // Caso 2.1: Casa la Molina & Casa SJM (Tags específicos de ubicación)
    if (nombre === 'Casa la Molina' || nombre === 'Casa SJM') {
      let fijosMigrados = 0;
      let gastosMigrados = 0;

      for (const cf of cat.costosFijos) {
        const destinoId = REGEX_SERVICIOS.test(cf.concepto) ? idServicios : idVivienda;
        await prisma.costoFijo.update({
          where: { id: cf.id },
          data: { categoriaId: destinoId },
        });
        fijosMigrados++;
      }

      for (const g of cat.gastos) {
        const destinoId = REGEX_SERVICIOS.test(g.concepto) ? idServicios : idVivienda;
        await prisma.gasto.update({
          where: { id: g.id },
          data: { categoriaId: destinoId },
        });
        gastosMigrados++;
      }

      migraciones.push({
        categoriaOrigen: nombre,
        categoriaDestino: 'Vivienda / Alquiler & Servicios Básicos',
        costosFijosMigrados: fijosMigrados,
        gastosMigrados,
      });

      // Eliminar categoría obsoleta
      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(nombre);
      detalles.push(`Categoría '${nombre}' migrada (${fijosMigrados} fijos, ${gastosMigrados} gastos) y eliminada.`);
      continue;
    }

    // Caso 2.2: Alimentación (duplicado de Alimentación / Supermercado)
    if (nombre === 'Alimentación' && cat.id !== idAlimentacion) {
      const fijosCount = cat.costosFijos.length;
      const gastosCount = cat.gastos.length;

      if (fijosCount > 0) {
        await prisma.costoFijo.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idAlimentacion },
        });
      }
      if (gastosCount > 0) {
        await prisma.gasto.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idAlimentacion },
        });
      }

      migraciones.push({
        categoriaOrigen: nombre,
        categoriaDestino: 'Alimentación / Supermercado',
        costosFijosMigrados: fijosCount,
        gastosMigrados: gastosCount,
      });

      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(nombre);
      detalles.push(`Categoría '${nombre}' unificada con 'Alimentación / Supermercado' y eliminada.`);
      continue;
    }

    // Caso 2.3: Personal & Salud (duplicado de Salud & Cuidado Personal)
    if (nombre === 'Personal & Salud' && cat.id !== idSalud) {
      const fijosCount = cat.costosFijos.length;
      const gastosCount = cat.gastos.length;

      if (fijosCount > 0) {
        await prisma.costoFijo.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idSalud },
        });
      }
      if (gastosCount > 0) {
        await prisma.gasto.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idSalud },
        });
      }

      migraciones.push({
        categoriaOrigen: nombre,
        categoriaDestino: 'Salud & Cuidado Personal',
        costosFijosMigrados: fijosCount,
        gastosMigrados: gastosCount,
      });

      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(nombre);
      detalles.push(`Categoría '${nombre}' unificada con 'Salud & Cuidado Personal' y eliminada.`);
      continue;
    }

    // Caso 2.4: Suscripciones (duplicado de Suscripciones / Streaming)
    if (nombre === 'Suscripciones' && cat.id !== idSuscripciones) {
      const fijosCount = cat.costosFijos.length;
      const gastosCount = cat.gastos.length;

      if (fijosCount > 0) {
        await prisma.costoFijo.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idSuscripciones },
        });
      }
      if (gastosCount > 0) {
        await prisma.gasto.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idSuscripciones },
        });
      }

      migraciones.push({
        categoriaOrigen: nombre,
        categoriaDestino: 'Suscripciones / Streaming',
        costosFijosMigrados: fijosCount,
        gastosMigrados: gastosCount,
      });

      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(nombre);
      detalles.push(`Categoría '${nombre}' unificada con 'Suscripciones / Streaming' y eliminada.`);
      continue;
    }

    // Caso 2.5: Vehicular o Transporte & Movilidad (unificar en Transporte & Vehicular)
    if ((nombre === 'Vehicular' || nombre === 'Transporte & Movilidad') && cat.id !== idTransporte) {
      const fijosCount = cat.costosFijos.length;
      const gastosCount = cat.gastos.length;

      if (fijosCount > 0) {
        await prisma.costoFijo.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idTransporte },
        });
      }
      if (gastosCount > 0) {
        await prisma.gasto.updateMany({
          where: { categoriaId: cat.id },
          data: { categoriaId: idTransporte },
        });
      }

      migraciones.push({
        categoriaOrigen: nombre,
        categoriaDestino: 'Transporte & Vehicular',
        costosFijosMigrados: fijosCount,
        gastosMigrados: gastosCount,
      });

      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(nombre);
      detalles.push(`Categoría '${nombre}' unificada con 'Transporte & Vehicular' y eliminada.`);
      continue;
    }
  }

  return {
    success: true,
    message: `Generalización completada: ${categoriasEliminadas.length} categorías obsoletas eliminadas y registros consolidados.`,
    totalCategoriasEstandar: CATEGORIAS_GENERALIZADAS.length,
    migraciones,
    categoriasEliminadas,
    detalles,
  };
}

