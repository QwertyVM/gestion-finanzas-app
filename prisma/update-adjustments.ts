import { PrismaClient, EstadoPago, MetodoPago } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Aplicando los 4 ajustes requeridos por Víctor...');

  // 1. Seguro vehicular: 9 meses a partir de Noviembre 2026 (hasta Julio 2027)
  const seguro = await prisma.costoFijo.findFirst({
    where: { concepto: { contains: 'seguro vehicular', mode: 'insensitive' } },
  });

  const mesesSeguro = [
    '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06', '2027-07'
  ];

  if (seguro) {
    await prisma.costoFijo.update({
      where: { id: seguro.id },
      data: {
        mesInicio: '2026-11',
        mesFin: '2027-07',
        activo: true,
      },
    });

    for (const p of mesesSeguro) {
      await prisma.registroCostoFijoMes.upsert({
        where: {
          costoFijoId_periodo: {
            costoFijoId: seguro.id,
            periodo: p,
          },
        },
        update: {
          monto: 217.41,
        },
        create: {
          costoFijoId: seguro.id,
          periodo: p,
          monto: 217.41,
          estado: EstadoPago.PENDIENTE,
        },
      });
    }
    console.log('✔ Seguro vehicular configurado por los 9 meses restantes (2026-11 a 2027-07).');
  }

  // 2. Préstamo Tía: termina en diciembre con la gratificación
  const prestamoTia = await prisma.prestamo.findFirst({
    where: { concepto: { contains: 'Tía', mode: 'insensitive' } },
  });

  if (prestamoTia) {
    await prisma.prestamo.update({
      where: { id: prestamoTia.id },
      data: {
        cuotasTotales: 1,
        montoCuota: 3060.00,
        montoTotal: 3060.00,
        activo: true,
      },
    });

    // Asegurar que solo exista 1 cuota en Diciembre 2026
    await prisma.cuotaPrestamo.deleteMany({
      where: {
        prestamoId: prestamoTia.id,
        periodo: { not: '2026-12' },
      },
    });

    await prisma.cuotaPrestamo.upsert({
      where: {
        prestamoId_numeroCuota: {
          prestamoId: prestamoTia.id,
          numeroCuota: 1,
        },
      },
      update: {
        periodo: '2026-12',
        monto: 3060.00,
      },
      create: {
        prestamoId: prestamoTia.id,
        numeroCuota: 1,
        periodo: '2026-12',
        monto: 3060.00,
        estado: EstadoPago.PENDIENTE,
      },
    });
    console.log('✔ Préstamo Tía confirmado para liquidarse en Diciembre con la Gratificación.');
  }

  // 3. iPhone: 24 cuotas de S/ 268 empezando a finales de Noviembre (1 de 24)
  const tarjetaBcp = await prisma.tarjetaCredito.findFirst({
    where: { banco: 'BCP' },
  });

  const catCompras = await prisma.categoria.findFirst({
    where: { nombre: 'Compras Varias' },
  });

  // Eliminar cuotas previas del iPhone
  await prisma.gasto.deleteMany({
    where: { concepto: { contains: 'iPhone', mode: 'insensitive' } },
  });

  // Generar las 24 cuotas desde 2026-11 hasta 2028-10
  const padreId = crypto.randomUUID();
  const initDate = new Date(2026, 10, 1); // Noviembre 2026

  for (let i = 0; i < 24; i++) {
    const d = new Date(initDate.getFullYear(), initDate.getMonth() + i, 1);
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    await prisma.gasto.create({
      data: {
        id: i === 0 ? padreId : undefined,
        concepto: `iPhone (Cuota ${i + 1}/24)`,
        monto: 268.00,
        fechaGasto: new Date('2026-11-05'),
        periodoPago: p,
        metodoPago: MetodoPago.TARJETA_CREDITO,
        tarjetaId: tarjetaBcp?.id,
        cuotaActual: i + 1,
        totalCuotas: 24,
        categoriaId: catCompras?.id,
        estado: EstadoPago.PENDIENTE,
        gastoPadreId: i === 0 ? null : padreId,
      },
    });
  }
  console.log('✔ iPhone registrado en 24 cuotas de S/ 268.00 (desde 2026-11 cuota 1/24 hasta 2028-10).');

  // 4. Préstamo Personal: Cuota S/ 209, quedan 4 cuotas (21/24 a 24/24)
  const prestamoPersonal = await prisma.prestamo.findFirst({
    where: { concepto: { contains: 'Personal', mode: 'insensitive' } },
  });

  if (prestamoPersonal) {
    await prisma.prestamo.update({
      where: { id: prestamoPersonal.id },
      data: {
        concepto: 'Préstamo Personal (Quedan 4 cuotas)',
        montoCuota: 209.00,
        cuotasTotales: 24,
      },
    });

    // Eliminar cualquier cuota posterior a 2027-02 (después de Feb 2027 ya no hay deuda!)
    await prisma.cuotaPrestamo.deleteMany({
      where: {
        prestamoId: prestamoPersonal.id,
        periodo: { gte: '2027-03' },
      },
    });

    // Asegurar las 4 cuotas restantes: 21 (Nov), 22 (Dic), 23 (Ene 2027), 24 (Feb 2027)
    const cuotasRestantes = [
      { num: 21, periodo: '2026-11' },
      { num: 22, periodo: '2026-12' },
      { num: 23, periodo: '2027-01' },
      { num: 24, periodo: '2027-02' },
    ];

    for (const c of cuotasRestantes) {
      await prisma.cuotaPrestamo.upsert({
        where: {
          prestamoId_numeroCuota: {
            prestamoId: prestamoPersonal.id,
            numeroCuota: c.num,
          },
        },
        update: {
          monto: 209.00,
          periodo: c.periodo,
        },
        create: {
          prestamoId: prestamoPersonal.id,
          numeroCuota: c.num,
          periodo: c.periodo,
          monto: 209.00,
          estado: EstadoPago.PENDIENTE,
        },
      });
    }
    console.log('✔ Préstamo Personal actualizado a S/ 209.00 con exactamente 4 cuotas restantes (termina en Febrero 2027).');
  }

  console.log('¡Todos los ajustes se han completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
