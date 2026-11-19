import prisma from './prisma';

export interface CategoriaDef {
  nombre: string;
  icono: string;
  color: string;
  esFijo: boolean;
  descripcion?: string;
  porcentajeObjetivo?: number;
}

/**
 * Catálogo canónico de las 3 grandes categorías basadas en el modelo 50/30/20.
 * Este es el único conjunto de categorías macro que deben existir en el sistema.
 */
export const CATEGORIAS_50_30_20: CategoriaDef[] = [
  {
    nombre: 'Necesidades (50%)',
    icono: 'ShieldCheck',
    color: '#10b981', // Verde esmeralda
    esFijo: true,
    porcentajeObjetivo: 50,
    descripcion: 'Gastos esenciales e imprescindibles: vivienda, servicios, alimentación básica, salud, transporte y educación.',
  },
  {
    nombre: 'Deseos (30%)',
    icono: 'Sparkles',
    color: '#f59e0b', // Ámbar / Dorado
    esFijo: false,
    porcentajeObjetivo: 30,
    descripcion: 'Estilo de vida, gustos y ocio: restaurantes, streaming, entretenimiento, delivery y compras personales.',
  },
  {
    nombre: 'Ahorro / Inversión (20%)',
    icono: 'PiggyBank',
    color: '#3b82f6', // Azul / Índigo
    esFijo: true,
    porcentajeObjetivo: 20,
    descripcion: 'Ahorro a futuro, fondo de emergencia, inversiones y amortización de deudas o créditos.',
  },
];

// Alias para retrocompatibilidad
export const CATEGORIAS_GENERALIZADAS = CATEGORIAS_50_30_20;

/**
 * Minitags sugeridos por cada una de las 3 grandes categorías.
 * Los minitags permiten granularidad sin fragmentar las 3 macro categorías.
 */
export const MINITAGS_POR_CATEGORIA: Record<string, string[]> = {
  'Necesidades (50%)': [
    'Vivienda',
    'Servicios Básicos',
    'Supermercado',
    'Salud & Farmacia',
    'Transporte',
    'Educación',
    'Hogar & Mantenimiento',
  ],
  'Deseos (30%)': [
    'Restaurantes',
    'Delivery',
    'Streaming & Apps',
    'Salidas & Ocio',
    'Compras & Ropa',
    'Tecnología & Gadgets',
    'Viajes & Paseos',
    'Cuidado Personal',
    'Hobbies & Regalos',
  ],
  'Ahorro / Inversión (20%)': [
    'Ahorro Mensual',
    'Fondo de Emergencia',
    'Inversión',
    'Préstamos & Créditos',
    'Amortización Deuda',
  ],
};

export const TODOS_LOS_MINITAGS_SUGERIDOS = [
  'Vivienda',
  'Servicios Básicos',
  'Supermercado',
  'Salud & Farmacia',
  'Transporte',
  'Educación',
  'Hogar & Mantenimiento',
  'Restaurantes',
  'Delivery',
  'Streaming & Apps',
  'Salidas & Ocio',
  'Compras & Ropa',
  'Tecnología & Gadgets',
  'Viajes & Paseos',
  'Cuidado Personal',
  'Hobbies & Regalos',
  'Ahorro Mensual',
  'Fondo de Emergencia',
  'Inversión',
  'Préstamos & Créditos',
  'Amortización Deuda',
];

/**
 * Mapea una categoría antigua o concepto al nuevo modelo de 3 categorías + minitag específico
 */
export function mapearCategoriaANuevoModelo(
  nombreCatAntigua?: string | null,
  concepto?: string | null
): { categoriaDestino: string; tagSugerido: string } {
  const n = (nombreCatAntigua || '').toLowerCase();
  const c = (concepto || '').toLowerCase();

  // 1. Ahorro / Inversión (20%)
  if (
    n.includes('préstamo') ||
    n.includes('prestamo') ||
    n.includes('crédito') ||
    n.includes('credito') ||
    n.includes('ahorro') ||
    n.includes('invers') ||
    n.includes('deuda') ||
    c.includes('préstamo') ||
    c.includes('prestamo') ||
    c.includes('crédito')
  ) {
    return {
      categoriaDestino: 'Ahorro / Inversión (20%)',
      tagSugerido:
        n.includes('préstamo') || n.includes('prestamo') || c.includes('préstamo')
          ? 'Préstamos & Créditos'
          : 'Ahorro Mensual',
    };
  }

  // 2. Necesidades (50%)
  if (
    n.includes('vivienda') ||
    n.includes('alquiler') ||
    c.includes('alquiler') ||
    n.includes('servicio') ||
    n.includes('luz') ||
    n.includes('agua') ||
    n.includes('net') ||
    n.includes('gas') ||
    c.includes('luz') ||
    c.includes('agua') ||
    c.includes('internet') ||
    n.includes('aliment') ||
    n.includes('super') ||
    n.includes('mercado') ||
    c.includes('super') ||
    c.includes('mercado') ||
    n.includes('salud') ||
    n.includes('medic') ||
    c.includes('farmacia') ||
    c.includes('médic') ||
    n.includes('transporte') ||
    n.includes('vehic') ||
    c.includes('gasolina') ||
    n.includes('educa') ||
    n.includes('curso')
  ) {
    let tag = 'Vivienda';
    if (n.includes('vivienda') || n.includes('alquiler') || c.includes('alquiler')) tag = 'Vivienda';
    else if (n.includes('servicio') || n.includes('luz') || n.includes('agua') || n.includes('net') || n.includes('gas')) tag = 'Servicios Básicos';
    else if (n.includes('aliment') || n.includes('super') || n.includes('mercado')) tag = 'Supermercado';
    else if (n.includes('salud') || n.includes('medic')) tag = 'Salud & Farmacia';
    else if (n.includes('transporte') || n.includes('vehic')) tag = 'Transporte';
    else if (n.includes('educa')) tag = 'Educación';
    return {
      categoriaDestino: 'Necesidades (50%)',
      tagSugerido: tag,
    };
  }

  // 3. Deseos (30%)
  let tag = 'Compras & Ropa';
  if (n.includes('suscrip') || n.includes('stream') || c.includes('netflix') || c.includes('spotify') || c.includes('youtube')) tag = 'Streaming & Apps';
  else if (n.includes('salida') || n.includes('ocio') || c.includes('restauran') || c.includes('bar')) tag = 'Salidas & Ocio';
  else if (n.includes('familiar') || n.includes('compromiso')) tag = 'Hobbies & Regalos';
  else if (n.includes('otro') || n.includes('imprevisto')) tag = 'Compras & Ropa';

  return {
    categoriaDestino: 'Deseos (30%)',
    tagSugerido: tag,
  };
}

export interface ResultadoMigracion503020 {
  success: boolean;
  message: string;
  totalCategoriasEstandar: number;
  migraciones: {
    categoriaOrigen: string;
    categoriaDestino: string;
    tagAsignado: string;
    costosFijosMigrados: number;
    gastosMigrados: number;
  }[];
  categoriasEliminadas: string[];
  detalles: string[];
}

/**
 * Migra todas las categorías existentes al modelo exclusivo de 3 macro categorías 50/30/20.
 * Guarda la categoría previa en el campo 'tag' (minitag) de cada gasto y costo fijo,
 * y elimina las categorías antiguas de la base de datos para que SOLO existan las 3 grandes.
 */
export async function migrarACategorias503020(targetUsuarioId?: string | null): Promise<ResultadoMigracion503020> {
  const detalles: string[] = [];
  const migraciones: ResultadoMigracion503020['migraciones'] = [];
  const categoriasEliminadas: string[] = [];

  // Obtener usuarios a procesar
  const usuarios = targetUsuarioId
    ? await prisma.usuario.findMany({ where: { id: targetUsuarioId } })
    : await prisma.usuario.findMany();

  for (const user of usuarios) {
    const uId = user.id;

    // 1. Asegurar la existencia de las 3 categorías canónicas para este usuario
    const categoriasMap = new Map<string, string>(); // nombre -> id

    for (const catDef of CATEGORIAS_50_30_20) {
      const upserted = await prisma.categoria.upsert({
        where: {
          usuarioId_nombre: {
            usuarioId: uId,
            nombre: catDef.nombre,
          },
        },
        update: {
          icono: catDef.icono,
          color: catDef.color,
          esFijo: catDef.esFijo,
        },
        create: {
          usuarioId: uId,
          nombre: catDef.nombre,
          icono: catDef.icono,
          color: catDef.color,
          esFijo: catDef.esFijo,
        },
      });
      categoriasMap.set(catDef.nombre, upserted.id);
    }

    const idNecesidades = categoriasMap.get('Necesidades (50%)')!;
    const idDeseos = categoriasMap.get('Deseos (30%)')!;
    const idAhorro = categoriasMap.get('Ahorro / Inversión (20%)')!;

    // 1.1 Asegurar que registros sin categoría también se asignen
    const fijosSinCat = await prisma.costoFijo.findMany({
      where: { usuarioId: uId, categoriaId: null },
    });
    for (const cf of fijosSinCat) {
      const { categoriaDestino, tagSugerido } = mapearCategoriaANuevoModelo(null, cf.concepto);
      const destinoId =
        categoriaDestino === 'Necesidades (50%)'
          ? idNecesidades
          : categoriaDestino === 'Ahorro / Inversión (20%)'
          ? idAhorro
          : idDeseos;
      await prisma.costoFijo.update({
        where: { id: cf.id },
        data: {
          categoriaId: destinoId,
          tag: cf.tag || tagSugerido,
        },
      });
    }

    const gastosSinCat = await prisma.gasto.findMany({
      where: { usuarioId: uId, categoriaId: null },
    });
    for (const g of gastosSinCat) {
      const { categoriaDestino, tagSugerido } = mapearCategoriaANuevoModelo(null, g.concepto);
      const destinoId =
        categoriaDestino === 'Necesidades (50%)'
          ? idNecesidades
          : categoriaDestino === 'Ahorro / Inversión (20%)'
          ? idAhorro
          : idDeseos;
      await prisma.gasto.update({
        where: { id: g.id },
        data: {
          categoriaId: destinoId,
          tag: g.tag || tagSugerido,
        },
      });
    }

    // 2. Obtener todas las categorías actuales del usuario
    const categoriasActuales = await prisma.categoria.findMany({
      where: { usuarioId: uId },
      include: {
        costosFijos: true,
        gastos: true,
      },
    });

    const nombresCanonicos = ['Necesidades (50%)', 'Deseos (30%)', 'Ahorro / Inversión (20%)'];

    for (const cat of categoriasActuales) {
      if (nombresCanonicos.includes(cat.nombre)) {
        // Para registros ya vinculados a las categorías canónicas, si no tienen tag, asignamos uno por concepto
        for (const cf of cat.costosFijos) {
          if (!cf.tag) {
            const { tagSugerido } = mapearCategoriaANuevoModelo(cat.nombre, cf.concepto);
            await prisma.costoFijo.update({
              where: { id: cf.id },
              data: { tag: tagSugerido },
            });
          }
        }
        for (const g of cat.gastos) {
          if (!g.tag) {
            const { tagSugerido } = mapearCategoriaANuevoModelo(cat.nombre, g.concepto);
            await prisma.gasto.update({
              where: { id: g.id },
              data: { tag: tagSugerido },
            });
          }
        }
        continue;
      }

      // Esta categoría NO es una de las 3 grandes: migrar sus costos fijos y gastos
      let fijosMigrados = 0;
      let gastosMigrados = 0;
      let tagEjemplo = '';

      for (const cf of cat.costosFijos) {
        const { categoriaDestino, tagSugerido } = mapearCategoriaANuevoModelo(cat.nombre, cf.concepto);
        const destinoId =
          categoriaDestino === 'Necesidades (50%)'
            ? idNecesidades
            : categoriaDestino === 'Ahorro / Inversión (20%)'
            ? idAhorro
            : idDeseos;

        const nuevoTag = cf.tag || tagSugerido;
        tagEjemplo = nuevoTag;

        await prisma.costoFijo.update({
          where: { id: cf.id },
          data: {
            categoriaId: destinoId,
            tag: nuevoTag,
          },
        });
        fijosMigrados++;
      }

      for (const g of cat.gastos) {
        const { categoriaDestino, tagSugerido } = mapearCategoriaANuevoModelo(cat.nombre, g.concepto);
        const destinoId =
          categoriaDestino === 'Necesidades (50%)'
            ? idNecesidades
            : categoriaDestino === 'Ahorro / Inversión (20%)'
            ? idAhorro
            : idDeseos;

        const nuevoTag = g.tag || tagSugerido;
        tagEjemplo = nuevoTag;

        await prisma.gasto.update({
          where: { id: g.id },
          data: {
            categoriaId: destinoId,
            tag: nuevoTag,
          },
        });
        gastosMigrados++;
      }

      const { categoriaDestino } = mapearCategoriaANuevoModelo(cat.nombre);

      migraciones.push({
        categoriaOrigen: cat.nombre,
        categoriaDestino,
        tagAsignado: tagEjemplo || cat.nombre,
        costosFijosMigrados: fijosMigrados,
        gastosMigrados,
      });

      // Eliminar categoría antigua
      await prisma.categoria.delete({ where: { id: cat.id } });
      categoriasEliminadas.push(cat.nombre);
      detalles.push(`[${user.nombre}] '${cat.nombre}' migrada a '${categoriaDestino}' (tag: ${tagEjemplo}) y eliminada.`);
    }
  }

  return {
    success: true,
    message: `Migración 50/30/20 completada: se consolidaron los registros en las 3 macro categorías y se guardaron los minitags.`,
    totalCategoriasEstandar: CATEGORIAS_50_30_20.length,
    migraciones,
    categoriasEliminadas,
    detalles,
  };
}

// Alias para compatibilidad con endpoints existentes
export const generalizarCategorias = migrarACategorias503020;
