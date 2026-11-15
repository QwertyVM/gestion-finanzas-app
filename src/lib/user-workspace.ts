import prisma from './prisma';

const CATEGORIAS_DEFAULT = [
  { nombre: 'Alimentación / Supermercado', color: '#f59e0b', esFijo: true },
  { nombre: 'Servicios Básicos (Luz/Agua/Net)', color: '#3b82f6', esFijo: true },
  { nombre: 'Salud & Cuidado Personal', color: '#ec4899', esFijo: true },
  { nombre: 'Suscripciones / Streaming', color: '#8b5cf6', esFijo: true },
  { nombre: 'Transporte & Vehicular', color: '#64748b', esFijo: false },
  { nombre: 'Restaurantes & Salidas', color: '#f97316', esFijo: false },
  { nombre: 'Compras Varias', color: '#10b981', esFijo: false },
  { nombre: 'Educación & Cursos', color: '#06b6d4', esFijo: false },
];

/**
 * Crea una nueva instancia de usuario con categorías y configuración inicial totalmente aislada.
 */
export async function provisionNewUserInstance({
  nombre,
  email,
  googleId,
  avatar,
}: {
  nombre: string;
  email: string | null;
  googleId: string;
  avatar?: string | null;
}) {
  const rawSlug = nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 18);
  const uniqueSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Crear el usuario
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      slug: uniqueSlug,
      email,
      googleId,
      avatar: avatar || 'User',
      color: '#2563eb',
      monedaSimbolo: 'S/',
      sueldoBaseMensual: 5000.0,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.4,
      metaAhorroMensual: 1000.0,
      activo: true,
    },
  });

  // 2. Crear categorías iniciales exclusivas para este usuario
  for (const cat of CATEGORIAS_DEFAULT) {
    await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        color: cat.color,
        esFijo: cat.esFijo,
        usuarioId: usuario.id,
      },
    });
  }

  return usuario;
}
