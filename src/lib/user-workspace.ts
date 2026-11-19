import prisma from './prisma';
import { CATEGORIAS_50_30_20 } from './categoria-service';

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
      sueldoBaseMensual: 0.0,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.4,
      metaAhorroMensual: 0.0,
      activo: true,
    },
  });

  // 2. Crear las 3 categorías canónicas 50/30/20 exclusivas para este usuario
  for (const cat of CATEGORIAS_50_30_20) {
    await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        color: cat.color,
        esFijo: cat.esFijo,
        icono: cat.icono,
        usuarioId: usuario.id,
      },
    });
  }

  return usuario;
}
