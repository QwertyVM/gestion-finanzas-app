import { PrismaClient, EstadoPago, MetodoPago, TipoIngreso } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Configuración de usuario
  const existingConfig = await prisma.configuracionUsuario.findFirst();
  if (!existingConfig) {
    await prisma.configuracionUsuario.create({
      data: {
        nombre: 'Víctor',
        monedaSimbolo: 'S/',
        sueldoBaseMensual: 6000.00,
        diaPagoSueldo: 30,
      },
    });
    console.log('✔ Configuración de usuario creada.');
  }

  // 2. Tarjetas de crédito
  const countTarjetas = await prisma.tarjetaCredito.count();
  let tarjetaBcp;
  if (countTarjetas === 0) {
    tarjetaBcp = await prisma.tarjetaCredito.create({
      data: {
        nombre: 'BCP Visa Signature',
        banco: 'BCP',
        ultimosCuatro: '4589',
        diaCorte: 10,
        diaPago: 30,
        color: '#1d4ed8', // Azul
      },
    });

    await prisma.tarjetaCredito.create({
      data: {
        nombre: 'BBVA Mastercard',
        banco: 'BBVA',
        ultimosCuatro: '7821',
        diaCorte: 10,
        diaPago: 30,
        color: '#0284c7', // Celeste
      },
    });
    console.log('✔ Tarjetas creadas.');
  } else {
    tarjetaBcp = await prisma.tarjetaCredito.findFirst();
  }

  // 3. Categorías
  const categoriasBase = [
    { nombre: 'Vivienda / Alquiler', icono: 'Home', color: '#10b981', esFijo: true },
    { nombre: 'Alimentación / Supermercado', icono: 'ShoppingCart', color: '#f59e0b', esFijo: true },
    { nombre: 'Suscripciones / Streaming', icono: 'Tv', color: '#ec4899', esFijo: true },
    { nombre: 'Servicios Básicos (Luz/Agua/Net)', icono: 'Zap', color: '#3b82f6', esFijo: true },
    { nombre: 'Préstamos & Créditos', icono: 'Landmark', color: '#8b5cf6', esFijo: true },
    { nombre: 'Salidas & Ocio', icono: 'Coffee', color: '#f97316', esFijo: false },
    { nombre: 'Transporte & Movilidad', icono: 'Car', color: '#64748b', esFijo: false },
    { nombre: 'Salud & Cuidado Personal', icono: 'HeartPulse', color: '#ef4444', esFijo: false },
    { nombre: 'Educación / Cursos', icono: 'GraduationCap', color: '#06b6d4', esFijo: false },
    { nombre: 'Otros / Imprevistos', icono: 'HelpCircle', color: '#6b7280', esFijo: false },
  ];

  for (const cat of categoriasBase) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }
  console.log('✔ Categorías inicializadas.');

  const catVivienda = await prisma.categoria.findUnique({ where: { nombre: 'Vivienda / Alquiler' } });
  const catComida = await prisma.categoria.findUnique({ where: { nombre: 'Alimentación / Supermercado' } });
  const catSuscripciones = await prisma.categoria.findUnique({ where: { nombre: 'Suscripciones / Streaming' } });

  // 4. Costos Fijos Iniciales (Casa, Comida, Netflix)
  const countFijos = await prisma.costoFijo.count();
  if (countFijos === 0) {
    await prisma.costoFijo.create({
      data: {
        concepto: 'Pago de la Casa / Alquiler',
        monto: 1500.00,
        diaVencimiento: 30,
        categoriaId: catVivienda?.id,
        registrosMes: {
          create: [
            { periodo: '2026-11', monto: 1500.00, estado: EstadoPago.PENDIENTE },
            { periodo: '2026-12', monto: 1500.00, estado: EstadoPago.PENDIENTE },
            { periodo: '2027-01', monto: 1500.00, estado: EstadoPago.PENDIENTE },
          ],
        },
      },
    });

    await prisma.costoFijo.create({
      data: {
        concepto: 'Comida / Supermercado mensual',
        monto: 1000.00,
        diaVencimiento: 30,
        categoriaId: catComida?.id,
        registrosMes: {
          create: [
            { periodo: '2026-11', monto: 1000.00, estado: EstadoPago.PENDIENTE },
            { periodo: '2026-12', monto: 1000.00, estado: EstadoPago.PENDIENTE },
            { periodo: '2027-01', monto: 1000.00, estado: EstadoPago.PENDIENTE },
          ],
        },
      },
    });

    await prisma.costoFijo.create({
      data: {
        concepto: 'Netflix',
        monto: 45.00,
        diaVencimiento: 15,
        categoriaId: catSuscripciones?.id,
        registrosMes: {
          create: [
            { periodo: '2026-11', monto: 45.00, estado: EstadoPago.PAGADO, fechaPagoReal: new Date('2026-11-01') },
            { periodo: '2026-12', monto: 45.00, estado: EstadoPago.PENDIENTE },
            { periodo: '2027-01', monto: 45.00, estado: EstadoPago.PENDIENTE },
          ],
        },
      },
    });
    console.log('✔ Costos fijos base creados.');
  }

  // 5. Préstamo de ejemplo
  const countPrestamos = await prisma.prestamo.count();
  if (countPrestamos === 0) {
    const prestamo = await prisma.prestamo.create({
      data: {
        banco: 'BCP',
        concepto: 'Préstamo Consumo Banco BCP',
        montoTotal: 12000.00,
        montoCuota: 650.00,
        cuotasTotales: 24,
        diaPago: 25,
        fechaInicio: new Date('2026-08-01'),
      },
    });

    // Generar cuotas de ejemplo
    const meses = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];
    for (let i = 0; i < meses.length; i++) {
      const cuotaNum = i + 1;
      let estado: EstadoPago = EstadoPago.PENDIENTE;
      let fechaPago: Date | null = null;

      if (cuotaNum < 4) {
        estado = EstadoPago.PAGADO;
        fechaPago = new Date(`${meses[i]}-25`);
      } else if (cuotaNum === 4) { // Noviembre (cuota 4)
        estado = EstadoPago.PENDIENTE;
      }

      await prisma.cuotaPrestamo.create({
        data: {
          prestamoId: prestamo.id,
          numeroCuota: cuotaNum,
          periodo: meses[i],
          monto: 650.00,
          estado,
          fechaPagoReal: fechaPago,
        },
      });
    }
    console.log('✔ Préstamo bancario con cuotas creado.');
  }

  // 6. Ingresos de ejemplo (Sueldos, Gratificaciones y Utilidades)
  const mesesProyeccion = [
    { periodo: '2026-11', esGrati: false, esUtilidad: false },
    { periodo: '2026-12', esGrati: true, esUtilidad: false }, // Gratificación Diciembre
    { periodo: '2027-01', esGrati: false, esUtilidad: false },
    { periodo: '2027-02', esGrati: false, esUtilidad: false },
    { periodo: '2027-03', esGrati: false, esUtilidad: true },  // Utilidades Marzo
    { periodo: '2027-04', esGrati: false, esUtilidad: false },
    { periodo: '2027-05', esGrati: false, esUtilidad: false },
    { periodo: '2027-06', esGrati: false, esUtilidad: false },
    { periodo: '2027-07', esGrati: true, esUtilidad: false },  // Gratificación Julio
  ];

  for (const m of mesesProyeccion) {
    // Sueldo mensual
    await prisma.ingresoMes.upsert({
      where: {
        periodo_tipo_concepto: {
          periodo: m.periodo,
          tipo: TipoIngreso.SUELDO,
          concepto: 'Sueldo Mensual Planilla',
        },
      },
      update: {},
      create: {
        periodo: m.periodo,
        tipo: TipoIngreso.SUELDO,
        concepto: 'Sueldo Mensual Planilla',
        monto: 6000.00,
        fechaEsperada: new Date(`${m.periodo}-28`),
      },
    });

    // Gratificación
    if (m.esGrati) {
      await prisma.ingresoMes.upsert({
        where: {
          periodo_tipo_concepto: {
            periodo: m.periodo,
            tipo: TipoIngreso.GRATIFICACION,
            concepto: `Gratificación Ley (${m.periodo})`,
          },
        },
        update: {},
        create: {
          periodo: m.periodo,
          tipo: TipoIngreso.GRATIFICACION,
          concepto: `Gratificación Ley (${m.periodo})`,
          monto: 6540.00, // Sueldo + 9% bono EsSalud
          fechaEsperada: new Date(`${m.periodo}-15`),
        },
      });
    }

    // Utilidades
    if (m.esUtilidad) {
      await prisma.ingresoMes.upsert({
        where: {
          periodo_tipo_concepto: {
            periodo: m.periodo,
            tipo: TipoIngreso.UTILIDADES,
            concepto: `Utilidades Empresa (${m.periodo})`,
          },
        },
        update: {},
        create: {
          periodo: m.periodo,
          tipo: TipoIngreso.UTILIDADES,
          concepto: `Utilidades Empresa (${m.periodo})`,
          monto: 8500.00,
          fechaEsperada: new Date(`${m.periodo}-25`),
        },
      });
    }
  }
  console.log('✔ Ingresos mensuales, gratificaciones y utilidades configurados.');

  // 7. Gastos con tarjeta ilustrando la regla de corte (día 10)
  const countGastos = await prisma.gasto.count();
  if (countGastos === 0 && tarjetaBcp) {
    // Compra antes del 10 de Noviembre (ej. 05 Nov) -> Paga a fin de Noviembre (2026-11)
    await prisma.gasto.create({
      data: {
        concepto: 'Compra supermercado Wong (antes del 10)',
        monto: 280.50,
        fechaGasto: new Date('2026-11-05'),
        periodoPago: '2026-11',
        metodoPago: MetodoPago.TARJETA_CREDITO,
        tarjetaId: tarjetaBcp.id,
        estado: EstadoPago.PENDIENTE,
      },
    });

    // Compra después del 10 de Noviembre (ej. 15 Nov) -> Paga a fin de Diciembre (2026-12)
    await prisma.gasto.create({
      data: {
        concepto: 'Cena restaurante & cine (después del 10)',
        monto: 195.00,
        fechaGasto: new Date('2026-11-15'),
        periodoPago: '2026-12',
        metodoPago: MetodoPago.TARJETA_CREDITO,
        tarjetaId: tarjetaBcp.id,
        estado: EstadoPago.PENDIENTE,
      },
    });

    // Gasto ya adelantado
    await prisma.gasto.create({
      data: {
        concepto: 'Mantenimiento del auto (Adelantado)',
        monto: 350.00,
        fechaGasto: new Date('2026-11-02'),
        periodoPago: '2026-11',
        metodoPago: MetodoPago.EFECTIVO_DEBITO,
        estado: EstadoPago.ADELANTADO,
        fechaPagoReal: new Date('2026-11-02'),
      },
    });
    console.log('✔ Gastos de ejemplo creados demostrando regla del día 10.');
  }

  console.log('¡Base de datos sembrada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
