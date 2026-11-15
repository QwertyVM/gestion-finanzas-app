import { PrismaClient, EstadoPago, MetodoPago, TipoIngreso, ClasificacionEgreso } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inyección de datos con soporte multiusuario (Víctor y Jamile)...');

  // 1. Usuarios: Víctor y Jamile
  const usuarioVictor = await prisma.usuario.upsert({
    where: { slug: 'victor' },
    update: {
      nombre: 'Víctor',
      color: '#2563eb',
      avatar: 'User',
      sueldoBaseMensual: 8200.00,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.40,
      metaAhorroMensual: 1000.00,
    },
    create: {
      nombre: 'Víctor',
      slug: 'victor',
      color: '#2563eb',
      avatar: 'User',
      sueldoBaseMensual: 8200.00,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.40,
      metaAhorroMensual: 1000.00,
    },
  });

  const usuarioJamile = await prisma.usuario.upsert({
    where: { slug: 'jamile' },
    update: {
      nombre: 'Jamile',
      color: '#ec4899',
      avatar: 'Heart',
      sueldoBaseMensual: 5000.00,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.40,
      metaAhorroMensual: 1000.00,
    },
    create: {
      nombre: 'Jamile',
      slug: 'jamile',
      color: '#ec4899',
      avatar: 'Heart',
      sueldoBaseMensual: 5000.00,
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.40,
      metaAhorroMensual: 1000.00,
    },
  });

  console.log(`✔ Usuarios creados: ${usuarioVictor.nombre} y ${usuarioJamile.nombre}`);

  // Configuración fallback
  await prisma.configuracionUsuario.deleteMany({});
  await prisma.configuracionUsuario.create({
    data: {
      nombre: 'Víctor',
      sueldoBaseMensual: 8200.00,
      monedaSimbolo: 'S/',
      diaPagoSueldo: 30,
      tipoCambioUSD: 3.40,
      metaAhorroMensual: 1000.00,
    },
  });

  // Limpiar datos anteriores de finanzas para re-inyección limpia
  await prisma.registroCostoFijoMes.deleteMany({});
  await prisma.costoFijo.deleteMany({});
  await prisma.cuotaPrestamo.deleteMany({});
  await prisma.prestamo.deleteMany({});
  await prisma.gasto.deleteMany({});
  await prisma.ingresoMes.deleteMany({});
  await prisma.tarjetaCredito.deleteMany({});
  await prisma.categoria.deleteMany({});

  // 2. Tarjetas de Crédito de Víctor
  const tarjetaBcp = await prisma.tarjetaCredito.create({
    data: {
      usuarioId: usuarioVictor.id,
      nombre: 'BCP Visa Signature',
      banco: 'BCP',
      diaCorte: 10,
      diaPago: 30,
      color: '#1d4ed8',
    },
  });

  const tarjetaCmr = await prisma.tarjetaCredito.create({
    data: {
      usuarioId: usuarioVictor.id,
      nombre: 'CMR PAPÁ',
      banco: 'Falabella',
      diaCorte: 10,
      diaPago: 30,
      color: '#dc2626',
    },
  });

  console.log('✔ Tarjetas de Víctor creadas.');

  // 3. Categorías de Víctor
  const categoriasVictor = [
    { nombre: 'Vivienda / Alquiler', icono: 'Home', color: '#10b981', esFijo: true },
    { nombre: 'Servicios Básicos (Luz/Agua/Net)', icono: 'Zap', color: '#3b82f6', esFijo: true },
    { nombre: 'Alimentación / Supermercado', icono: 'ShoppingCart', color: '#f59e0b', esFijo: true },
    { nombre: 'Transporte & Vehicular', icono: 'Car', color: '#64748b', esFijo: false },
    { nombre: 'Suscripciones / Streaming', icono: 'Tv', color: '#8b5cf6', esFijo: true },
    { nombre: 'Salud & Cuidado Personal', icono: 'HeartPulse', color: '#ec4899', esFijo: false },
    { nombre: 'Préstamos & Créditos', icono: 'Landmark', color: '#6366f1', esFijo: true },
    { nombre: 'Compras Varias', icono: 'ShoppingCart', color: '#64748b', esFijo: false },
    { nombre: 'Educación / Cursos', icono: 'GraduationCap', color: '#06b6d4', esFijo: false },
    { nombre: 'Salidas & Ocio', icono: 'Coffee', color: '#f97316', esFijo: false },
    { nombre: 'Familiar & Compromisos', icono: 'HeartPulse', color: '#f43f5e', esFijo: false },
    { nombre: 'Otros / Imprevistos', icono: 'HelpCircle', color: '#6b7280', esFijo: false },
  ];

  for (const cat of categoriasVictor) {
    await prisma.categoria.create({
      data: {
        ...cat,
        usuarioId: usuarioVictor.id,
      },
    });
  }

  // Categorías base para Jamile
  for (const cat of categoriasVictor) {
    await prisma.categoria.create({
      data: {
        ...cat,
        usuarioId: usuarioJamile.id,
      },
    });
  }
  console.log('✔ Categorías creadas para Víctor y Jamile.');

  const catVivienda = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Vivienda / Alquiler' } });
  const catServicios = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Servicios Básicos (Luz/Agua/Net)' } });
  const catAlimentacion = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Alimentación / Supermercado' } });
  const catTransporte = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Transporte & Vehicular' } });
  const catSuscripciones = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Suscripciones / Streaming' } });
  const catSalud = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Salud & Cuidado Personal' } });
  const catCompras = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Compras Varias' } });
  const catSalidas = await prisma.categoria.findFirst({ where: { usuarioId: usuarioVictor.id, nombre: 'Salidas & Ocio' } });

  // 4. Ingresos de Víctor
  const meses = ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];

  for (const p of meses) {
    await prisma.ingresoMes.create({
      data: {
        usuarioId: usuarioVictor.id,
        periodo: p,
        tipo: TipoIngreso.SUELDO,
        concepto: 'Sueldo Mensual Planilla',
        monto: 8200.00,
        fechaEsperada: new Date(`${p}-28`),
        recibido: p === '2026-10' || p === '2026-11',
      },
    });

    if (p === '2026-12') {
      await prisma.ingresoMes.create({
        data: {
          usuarioId: usuarioVictor.id,
          periodo: p,
          tipo: TipoIngreso.GRATIFICACION,
          concepto: 'Gratificación Diciembre (Navidad)',
          monto: 10500.00,
          fechaEsperada: new Date('2026-12-15'),
          recibido: false,
        },
      });
    }

    if (p === '2027-03') {
      await prisma.ingresoMes.create({
        data: {
          usuarioId: usuarioVictor.id,
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

  // 5. Costos fijos de Víctor (alineados al Sheet)
  const costosFijosDef = [
    { concepto: 'Alquiler (Casa la Molina)', monto: 1100.00, categoriaId: catVivienda?.id, dia: 30, activoEn2027: true, monto2027: 1100.00, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Luz y servicios (Casa la Molina)', monto: 75.00, categoriaId: catServicios?.id, dia: 20, activoEn2027: true, monto2027: 75.00, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Servicios (Casa SJM)', monto: 210.00, categoriaId: catServicios?.id, dia: 15, activoEn2027: true, monto2027: 244.00, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Teléfono (Casa SJM)', monto: 39.90, categoriaId: catServicios?.id, dia: 18, activoEn2027: false, monto2027: 0, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Seguro vehicular', monto: 217.41, categoriaId: catTransporte?.id, dia: 22, activoEn2027: false, monto2027: 0, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Natación', monto: 320.00, categoriaId: catSalud?.id, dia: 5, activoEn2027: false, monto2027: 0, metodo: MetodoPago.EFECTIVO_DEBITO, tarjetaId: null },
    { concepto: 'Netflix (BCP)', monto: 70.70, montoOctubre: 80.70, categoriaId: catSuscripciones?.id, dia: 15, activoEn2027: false, monto2027: 0, metodo: MetodoPago.TARJETA_CREDITO, tarjetaId: tarjetaBcp.id },
    { concepto: 'Comida mensual (BCP)', monto: 180.00, categoriaId: catAlimentacion?.id, dia: 30, activoEn2027: false, monto2027: 0, metodo: MetodoPago.TARJETA_CREDITO, tarjetaId: tarjetaBcp.id },
    { concepto: 'iCloud (BCP $3.96)', monto: 13.46, categoriaId: catSuscripciones?.id, dia: 10, activoEn2027: false, monto2027: 0, metodo: MetodoPago.TARJETA_CREDITO, tarjetaId: tarjetaBcp.id, notas: 'USD: $3.96 TC: S/ 3.40' },
    { concepto: 'YouTube Premium (BCP $6.60)', monto: 22.44, categoriaId: catSuscripciones?.id, dia: 12, activoEn2027: false, monto2027: 0, metodo: MetodoPago.TARJETA_CREDITO, tarjetaId: tarjetaBcp.id, notas: 'USD: $6.60 TC: S/ 3.40' },
  ];

  for (const cfd of costosFijosDef) {
    const cf = await prisma.costoFijo.create({
      data: {
        usuarioId: usuarioVictor.id,
        concepto: cfd.concepto,
        monto: cfd.monto,
        diaVencimiento: cfd.dia,
        categoriaId: cfd.categoriaId,
        metodoPago: cfd.metodo,
        tarjetaId: cfd.tarjetaId,
        mesFin: cfd.activoEn2027 ? null : '2026-12',
      },
    });

    for (const p of meses) {
      const es2027 = p.startsWith('2027');
      if (es2027 && !cfd.activoEn2027) continue;

      let montoMes = cfd.monto;
      if (es2027) {
        montoMes = cfd.monto2027;
      } else if (p === '2026-10' && cfd.montoOctubre !== undefined) {
        montoMes = cfd.montoOctubre;
      }

      const estado = p === '2026-10' ? EstadoPago.PAGADO : EstadoPago.PENDIENTE;

      await prisma.registroCostoFijoMes.create({
        data: {
          costoFijoId: cf.id,
          periodo: p,
          monto: montoMes,
          estado,
          metodoPago: cfd.metodo,
          tarjetaId: cfd.tarjetaId,
          notas: cfd.notas || null,
        },
      });
    }
  }

  // 6. Préstamos de Víctor (alineados al Sheet)
  const prestamoAuto = await prisma.prestamo.create({
    data: {
      usuarioId: usuarioVictor.id,
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

  const prestamoPersonal = await prisma.prestamo.create({
    data: {
      usuarioId: usuarioVictor.id,
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

  const prestamoSunat = await prisma.prestamo.create({
    data: {
      usuarioId: usuarioVictor.id,
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

  const prestamoTia = await prisma.prestamo.create({
    data: {
      usuarioId: usuarioVictor.id,
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

  // 7. Gastos de Víctor (todos los registros exactos del Sheet)
  // --- OCTUBRE 2026 (2026-10) ---
  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Apple TV (USD $15.33)',
      monto: 13.46,
      monedaOriginal: 'USD',
      montoOriginal: 3.96,
      tipoCambio: 3.40,
      fechaGasto: new Date('2026-10-15'),
      periodoPago: '2026-10',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSuscripciones?.id,
      clasificacion: ClasificacionEgreso.FIJO,
      estado: EstadoPago.PAGADO,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Apple TV (USD $14.36)',
      monto: 13.46,
      monedaOriginal: 'USD',
      montoOriginal: 3.96,
      tipoCambio: 3.40,
      fechaGasto: new Date('2026-10-15'),
      periodoPago: '2026-10',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSuscripciones?.id,
      clasificacion: ClasificacionEgreso.FIJO,
      estado: EstadoPago.PAGADO,
    },
  });

  // --- NOVIEMBRE 2026 (2026-11) ---
  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Psicóloga',
      monto: 690.00,
      fechaGasto: new Date('2026-11-04'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSalud?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'TikTok Promoción',
      monto: 40.50,
      fechaGasto: new Date('2026-11-06'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Material pared',
      monto: 310.00,
      fechaGasto: new Date('2026-11-05'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catVivienda?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  const gastoIphone1 = await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'iPhone (Cuota 1/2)',
      monto: 268.00,
      fechaGasto: new Date('2026-11-02'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      cuotaActual: 1,
      totalCuotas: 2,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.CUOTA,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Polos',
      monto: 200.00,
      fechaGasto: new Date('2026-11-08'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'hs',
      monto: 209.00,
      fechaGasto: new Date('2026-11-10'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'agua',
      monto: 14.00,
      fechaGasto: new Date('2026-11-12'),
      periodoPago: '2026-11',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catServicios?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  // --- DICIEMBRE 2026 (2026-12) ---
  // Compra en cuotas del iPhone (Segunda cuota)
  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'iPhone (Cuota 2/2)',
      monto: 268.00,
      fechaGasto: new Date('2026-11-02'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      cuotaActual: 2,
      totalCuotas: 2,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.CUOTA,
      estado: EstadoPago.PENDIENTE,
      gastoPadreId: gastoIphone1.id,
    },
  });

  // Gastos presupuestados / liquidados con Gratificación de Diciembre
  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Apple TV (USD $15.33)',
      monto: 52.12,
      monedaOriginal: 'USD',
      montoOriginal: 15.33,
      tipoCambio: 3.40,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSuscripciones?.id,
      clasificacion: ClasificacionEgreso.FIJO,
      estado: EstadoPago.PENDIENTE,
      notas: 'Liquidado con Gratificación Diciembre ($15.33 USD a TC 3.40)',
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Ugreen',
      monto: 325.00,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
      notas: 'Compra liquidada con Gratificación Diciembre',
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Proteggo',
      monto: 78.00,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catCompras?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
      notas: 'Compra liquidada con Gratificación Diciembre',
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Butano',
      monto: 48.51,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catServicios?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
      notas: 'Compra liquidada con Gratificación Diciembre',
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Apple TV (USD $14.36)',
      monto: 48.82,
      monedaOriginal: 'USD',
      montoOriginal: 14.36,
      tipoCambio: 3.40,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSuscripciones?.id,
      clasificacion: ClasificacionEgreso.FIJO,
      estado: EstadoPago.PENDIENTE,
      notas: 'Liquidado con Gratificación Diciembre ($14.36 USD a TC 3.40)',
    },
  });

  await prisma.gasto.create({
    data: {
      usuarioId: usuarioVictor.id,
      concepto: 'Libro dnd',
      monto: 240.00,
      fechaGasto: new Date('2026-12-05'),
      periodoPago: '2026-12',
      metodoPago: MetodoPago.TARJETA_CREDITO,
      tarjetaId: tarjetaBcp.id,
      categoriaId: catSalidas?.id,
      clasificacion: ClasificacionEgreso.VARIABLE,
      estado: EstadoPago.PENDIENTE,
      notas: 'Libro D&D liquidado con Gratificación Diciembre',
    },
  });

  console.log('✔ Todos los datos del Google Sheet inyectados exitosamente para Víctor.');
  console.log('✔ Perfil de Jamile creado, limpio e independiente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
