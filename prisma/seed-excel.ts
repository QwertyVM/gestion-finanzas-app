import { PrismaClient, EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inyección de datos desde el Excel de Víctor...');

  // 1. Configuración de Usuario con sueldo real
  const config = await prisma.configuracionUsuario.findFirst();
  if (config) {
    await prisma.configuracionUsuario.update({
      where: { id: config.id },
      data: {
        nombre: 'Víctor',
        sueldoBaseMensual: 8200.00,
        monedaSimbolo: 'S/',
        diaPagoSueldo: 30,
        tipoCambioUSD: 4.00,
        metaAhorroMensual: 1000.00,
      },
    });
  } else {
    await prisma.configuracionUsuario.create({
      data: {
        nombre: 'Víctor',
        sueldoBaseMensual: 8200.00,
        monedaSimbolo: 'S/',
        diaPagoSueldo: 30,
        tipoCambioUSD: 4.00,
        metaAhorroMensual: 1000.00,
      },
    });
  }
  console.log('✔ Sueldo base actualizado a S/ 8,200.00.');

  // 2. Tarjetas de Crédito del Excel (BCP y CMR PAPÁ)
  let tarjetaBcp = await prisma.tarjetaCredito.findFirst({
    where: { banco: 'BCP' },
  });
  if (!tarjetaBcp) {
    tarjetaBcp = await prisma.tarjetaCredito.create({
      data: {
        nombre: 'BCP Visa Signature',
        banco: 'BCP',
        diaCorte: 10,
        diaPago: 30,
        color: '#1d4ed8',
      },
    });
  }

  let tarjetaCmr = await prisma.tarjetaCredito.findFirst({
    where: { nombre: 'CMR PAPÁ' },
  });
  if (!tarjetaCmr) {
    tarjetaCmr = await prisma.tarjetaCredito.create({
      data: {
        nombre: 'CMR PAPÁ',
        banco: 'Falabella',
        diaCorte: 10,
        diaPago: 30,
        color: '#dc2626',
      },
    });
  }
  console.log('✔ Tarjetas BCP y CMR PAPÁ listas.');

  // 3. Categorías
  const categorias = [
    { nombre: 'Casa la Molina', icono: 'Home', color: '#10b981', esFijo: true },
    { nombre: 'Casa SJM', icono: 'Home', color: '#06b6d4', esFijo: true },
    { nombre: 'Personal & Salud', icono: 'HeartPulse', color: '#ec4899', esFijo: true },
    { nombre: 'Vehicular', icono: 'Car', color: '#f59e0b', esFijo: true },
    { nombre: 'Suscripciones', icono: 'Tv', color: '#8b5cf6', esFijo: true },
    { nombre: 'Préstamos & Créditos', icono: 'Landmark', color: '#6366f1', esFijo: true },
    { nombre: 'Alimentación', icono: 'Utensils', color: '#eab308', esFijo: true },
    { nombre: 'Compras Varias', icono: 'ShoppingCart', color: '#64748b', esFijo: false },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }
  const catLaMolina = await prisma.categoria.findUnique({ where: { nombre: 'Casa la Molina' } });
  const catSjm = await prisma.categoria.findUnique({ where: { nombre: 'Casa SJM' } });
  const catPersonal = await prisma.categoria.findUnique({ where: { nombre: 'Personal & Salud' } });
  const catVehicular = await prisma.categoria.findUnique({ where: { nombre: 'Vehicular' } });
  const catSuscrip = await prisma.categoria.findUnique({ where: { nombre: 'Suscripciones' } });
  const catComida = await prisma.categoria.findUnique({ where: { nombre: 'Alimentación' } });
  const catCompras = await prisma.categoria.findUnique({ where: { nombre: 'Compras Varias' } });

  // 4. Limpiar registros anteriores para insertar los del Excel con total fidelidad
  await prisma.registroCostoFijoMes.deleteMany({});
  await prisma.costoFijo.deleteMany({});
  await prisma.cuotaPrestamo.deleteMany({});
  await prisma.prestamo.deleteMany({});
  await prisma.gasto.deleteMany({});
  await prisma.ingresoMes.deleteMany({});

  const meses = ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];

  // 5. Ingresos Mensuales
  for (const p of meses) {
    // Sueldo regular: S/ 8,200.00
    await prisma.ingresoMes.create({
      data: {
        periodo: p,
        tipo: TipoIngreso.SUELDO,
        concepto: 'Sueldo Mensual Planilla',
        monto: 8200.00,
        fechaEsperada: new Date(`${p}-28`),
        recibido: p === '2026-10' || p === '2026-11',
      },
    });

    // Gratificación Diciembre: S/ 10,500.00
    if (p === '2026-12') {
      await prisma.ingresoMes.create({
        data: {
          periodo: p,
          tipo: TipoIngreso.GRATIFICACION,
          concepto: 'Gratificación Diciembre (Navidad)',
          monto: 10500.00,
          fechaEsperada: new Date('2026-12-15'),
          recibido: false,
        },
      });
    }

    // Utilidades Marzo: Estimado S/ 12,300.00 (1.5 sueldos)
    if (p === '2027-03') {
      await prisma.ingresoMes.create({
        data: {
          periodo: p,
          tipo: TipoIngreso.UTILIDADES,
          concepto: 'Utilidades Anuales',
          monto: 12300.00,
          fechaEsperada: new Date('2027-03-25'),
          recibido: false,
        },
      });
    }
  }
  console.log('✔ Ingresos mensuales y gratificación inyectados.');

  // 6. Costos Fijos
  const costosFijosDef = [
    // Casa la Molina
    { concepto: 'Alquiler (Casa la Molina)', monto: 1100.00, categoriaId: catLaMolina?.id, dia: 30, activoEn2027: true, monto2027: 1100.00 },
    { concepto: 'Luz y servicios (Casa la Molina)', monto: 75.00, categoriaId: catLaMolina?.id, dia: 20, activoEn2027: true, monto2027: 75.00 },
    // Casa SJM
    { concepto: 'Servicios (Casa SJM)', monto: 210.00, categoriaId: catSjm?.id, dia: 15, activoEn2027: true, monto2027: 244.00 },
    { concepto: 'Teléfono (Casa SJM)', monto: 39.90, categoriaId: catSjm?.id, dia: 18, activoEn2027: false, monto2027: 0 },
    // Vehicular
    { concepto: 'Seguro vehicular', monto: 217.41, categoriaId: catVehicular?.id, dia: 22, activoEn2027: false, monto2027: 0 },
    // Personal & Suscripciones
    { concepto: 'Natación', monto: 320.00, categoriaId: catPersonal?.id, dia: 5, activoEn2027: false, monto2027: 0 },
    { concepto: 'Netflix (BCP)', monto: 70.70, categoriaId: catSuscrip?.id, dia: 15, activoEn2027: false, monto2027: 0 },
    { concepto: 'Comida mensual (BCP)', monto: 180.00, categoriaId: catComida?.id, dia: 30, activoEn2027: false, monto2027: 0 },
    { concepto: 'iCloud (BCP $3.96)', monto: 13.46, categoriaId: catSuscrip?.id, dia: 10, activoEn2027: false, monto2027: 0 },
    { concepto: 'YouTube Premium (BCP $6.60)', monto: 22.44, categoriaId: catSuscrip?.id, dia: 12, activoEn2027: false, monto2027: 0 },
  ];

  for (const cfd of costosFijosDef) {
    const cf = await prisma.costoFijo.create({
      data: {
        concepto: cfd.concepto,
        monto: cfd.monto,
        diaVencimiento: cfd.dia,
        categoriaId: cfd.categoriaId,
      },
    });

    for (const p of meses) {
      const es2027 = p.startsWith('2027');
      if (es2027 && !cfd.activoEn2027) continue;

      const montoMes = es2027 ? cfd.monto2027 : cfd.monto;
      const estado = p === '2026-10' ? EstadoPago.PAGADO : EstadoPago.PENDIENTE;

      await prisma.registroCostoFijoMes.create({
        data: {
          costoFijoId: cf.id,
          periodo: p,
          monto: montoMes,
          estado,
        },
      });
    }
  }
  console.log('✔ Costos fijos inyectados para Casa la Molina, SJM y servicios.');

  // 7. Préstamos Bancarios y Deudas
  // 7.1 Crédito Auto (S/ 2,065.21 en 2026, S/ 2,308.70 en 2027)
  const prestamoAuto = await prisma.prestamo.create({
    data: {
      banco: 'BCP',
      concepto: 'Crédito Auto',
      montoTotal: 65000.00,
      montoCuota: 2065.21,
      cuotasTotales: 36,
      diaPago: 25,
      tasaInteresAnual: 12.50,
      fechaInicio: new Date('2025-01-01'),
    },
  });

  for (let i = 0; i < meses.length; i++) {
    const p = meses[i];
    const es2027 = p.startsWith('2027');
    await prisma.cuotaPrestamo.create({
      data: {
        prestamoId: prestamoAuto.id,
        numeroCuota: 22 + i,
        periodo: p,
        monto: es2027 ? 2308.70 : 2065.21,
        estado: p === '2026-10' ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
      },
    });
  }

  // 7.2 Préstamo Personal - 24 cuotas (S/ 205.40/mes)
  const prestamoPersonal = await prisma.prestamo.create({
    data: {
      banco: 'BCP',
      concepto: 'Préstamo Personal (LG, Tarjeta, Tributario)',
      montoTotal: 4930.00,
      montoCuota: 205.40,
      cuotasTotales: 24,
      diaPago: 25,
      tasaInteresAnual: 14.50,
      fechaInicio: new Date('2026-01-01'),
    },
  });

  for (let i = 0; i < meses.length; i++) {
    const p = meses[i];
    await prisma.cuotaPrestamo.create({
      data: {
        prestamoId: prestamoPersonal.id,
        numeroCuota: 10 + i,
        periodo: p,
        monto: 205.40,
        estado: p === '2026-10' ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
      },
    });
  }

  // 7.3 SUNAT Regularización - 36 meses (S/ 283.00/mes)
  const prestamoSunat = await prisma.prestamo.create({
    data: {
      banco: 'SUNAT',
      concepto: 'SUNAT Regularización',
      montoTotal: 10188.00,
      montoCuota: 283.00,
      cuotasTotales: 36,
      diaPago: 28,
      tasaInteresAnual: 0.00,
      fechaInicio: new Date('2026-05-01'),
    },
  });

  for (let i = 0; i < 3; i++) {
    const p = ['2026-10', '2026-11', '2026-12'][i];
    await prisma.cuotaPrestamo.create({
      data: {
        prestamoId: prestamoSunat.id,
        numeroCuota: 6 + i,
        periodo: p,
        monto: 283.00,
        estado: p === '2026-10' ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
      },
    });
  }

  // 7.4 Préstamo Tía (Pagadero con Gratificación en Diciembre)
  const prestamoTia = await prisma.prestamo.create({
    data: {
      banco: 'Familiar',
      concepto: 'Préstamo Tía ($900.00 USD)',
      montoTotal: 3060.00,
      montoCuota: 3060.00,
      cuotasTotales: 1,
      diaPago: 15,
      tasaInteresAnual: 0.00,
      fechaInicio: new Date('2026-11-01'),
    },
  });

  await prisma.cuotaPrestamo.create({
    data: {
      prestamoId: prestamoTia.id,
      numeroCuota: 1,
      periodo: '2026-12',
      monto: 3060.00,
      estado: EstadoPago.PENDIENTE,
    },
  });
  console.log('✔ Préstamos (Auto, Personal, SUNAT y Tía) inyectados.');

  // 8. Gastos Específicos del Excel en Noviembre y Diciembre
  // 8.1 Psicóloga: S/ 690.00 (BCP, Noviembre)
  await prisma.gasto.create({
    data: {
      concepto: 'Psicóloga',
      monto: 690.00,
      fechaGasto: new Date('2026-11-04'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catPersonal?.id,
      estado: EstadoPago.PENDIENTE,
    },
  });

  // 8.2 TikTok: S/ 40.50 (BCP, Noviembre)
  await prisma.gasto.create({
    data: {
      concepto: 'TikTok Promoción',
      monto: 40.50,
      fechaGasto: new Date('2026-11-06'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      estado: EstadoPago.PENDIENTE,
    },
  });

  // 8.3 Material pared: S/ 310.00 (CMR PAPÁ, Noviembre)
  await prisma.gasto.create({
    data: {
      concepto: 'Material pared',
      monto: 310.00,
      fechaGasto: new Date('2026-11-05'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaCmr.id,
      categoriaId: catLaMolina?.id,
      estado: EstadoPago.PENDIENTE,
    },
  });

  // 8.4 iPhone: S/ 268.00 (BCP, Cuotas en Noviembre y Diciembre)
  await prisma.gasto.create({
    data: {
      concepto: 'iPhone (Cuota 1/2)',
      monto: 268.00,
      fechaGasto: new Date('2026-11-02'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      cuotaActual: 1,
      totalCuotas: 2,
      categoriaId: catCompras?.id,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      concepto: 'iPhone (Cuota 2/2)',
      monto: 268.00,
      fechaGasto: new Date('2026-11-02'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      cuotaActual: 2,
      totalCuotas: 2,
      categoriaId: catCompras?.id,
      estado: EstadoPago.PENDIENTE,
    },
  });
  console.log('✔ Gastos de Psicóloga, TikTok, Material pared y iPhone inyectados.');

  console.log('¡Inyección completa! Todos los datos del Google Sheet están sincronizados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
