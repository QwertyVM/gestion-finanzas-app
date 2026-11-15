import prisma from './prisma';

/**
 * Elimina la cuenta de Jamile si existe y no contiene transacciones ni datos financieros.
 */
export async function eliminarJamileSiVacio(): Promise<boolean> {
  try {
    const jamile = await prisma.usuario.findUnique({
      where: { slug: 'jamile' },
      include: {
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
            prestamos: true,
            tarjetas: true,
            ingresos: true,
          },
        },
      },
    });

    if (
      jamile &&
      jamile._count.gastos === 0 &&
      jamile._count.costosFijos === 0 &&
      jamile._count.prestamos === 0 &&
      jamile._count.ingresos === 0
    ) {
      // Eliminar dependencias vacías (categorías y sesiones)
      await prisma.categoria.deleteMany({ where: { usuarioId: jamile.id } });
      await prisma.sesion.deleteMany({ where: { usuarioId: jamile.id } });
      await prisma.usuario.delete({ where: { id: jamile.id } });
      return true;
    }
  } catch (error) {
    console.error('Error al eliminar cuenta de Jamile:', error);
  }
  return false;
}
