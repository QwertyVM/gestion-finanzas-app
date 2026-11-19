import prisma from '../src/lib/prisma';

async function main() {
  const victor = await prisma.usuario.findFirst({ where: { slug: 'victor' } });
  if (!victor) {
    console.log('Victor no encontrado');
    return;
  }
  const cats = await prisma.categoria.findMany({
    where: { OR: [{ usuarioId: victor.id }, { usuarioId: null }] },
    select: { id: true, nombre: true, color: true },
  });
  console.log('Categorías disponibles para Victor:', cats);
}

main().finally(() => prisma.$disconnect());
