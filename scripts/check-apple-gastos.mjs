import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const gastos = await p.gasto.findMany({
  where: { concepto: { contains: 'apple', mode: 'insensitive' } },
  select: {
    id: true,
    concepto: true,
    monto: true,
    monedaOriginal: true,
    metodoPago: true,
    totalCuotas: true,
    periodoPago: true,
  }
});

console.log(JSON.stringify(gastos, null, 2));
await p.$disconnect();
