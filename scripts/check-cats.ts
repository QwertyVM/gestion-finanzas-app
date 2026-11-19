import prisma from '../src/lib/prisma';

async function main() {
  const victor = await prisma.usuario.findFirst({ where: { slug: 'victor' } });
  if (!victor) return;

  const ingsDic = await prisma.ingresoMes.findMany({ where: { usuarioId: victor.id, periodo: '2026-12' } });
  console.log('Ingresos Dic:', ingsDic.map(i => ({ id: i.id, concepto: i.concepto })));

  const gratificacion = ingsDic.find(i => i.concepto.includes('Gratificación'));
  if (!gratificacion) return;

  // Buscar un gasto en dic 2026
  const gastoDic = await prisma.gasto.findFirst({
    where: { usuarioId: victor.id, periodoPago: '2026-12' }
  });
  console.log('Gasto Dic encontrado:', gastoDic?.concepto, 'ingresoId actual:', gastoDic?.ingresoId);

  if (gastoDic) {
    // Probar actualizar ingresoId
    const updated = await prisma.gasto.update({
      where: { id: gastoDic.id },
      data: { ingresoId: gratificacion.id },
      include: { ingreso: true }
    });
    console.log('Asignado con éxito a:', updated.ingreso?.concepto);

    // Restaurar a null
    await prisma.gasto.update({
      where: { id: gastoDic.id },
      data: { ingresoId: null }
    });
    console.log('Restaurado a null');
  }
}

main().finally(() => prisma.$disconnect());
