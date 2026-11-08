import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      banco,
      concepto,
      montoTotal,
      montoCuota,
      cuotasTotales,
      cuotaInicial = 1,
      diaPago = 25,
      tasaInteresAnual = 14.50,
      periodoInicio = '2026-11',
    } = body;

    const totalCuotasNum = parseInt(cuotasTotales, 10);
    const cuotaIniNum = parseInt(cuotaInicial, 10);
    const montoCuotaFloat = parseFloat(montoCuota);
    const montoTotalFloat = parseFloat(montoTotal);

    // 1. Crear Préstamo
    const prestamo = await prisma.prestamo.create({
      data: {
        banco: banco.trim(),
        concepto: concepto.trim(),
        montoTotal: montoTotalFloat,
        montoCuota: montoCuotaFloat,
        cuotasTotales: totalCuotasNum,
        diaPago: parseInt(diaPago, 10),
        tasaInteresAnual: parseFloat(tasaInteresAnual),
        fechaInicio: new Date(`${periodoInicio}-01`),
        activo: true,
      },
    });

    // 2. Generar las cuotas desde periodoInicio
    const [anioInit, mesInit] = periodoInicio.split('-').map(Number);
    const cuotasPorGenerar = totalCuotasNum - cuotaIniNum + 1;

    for (let i = 0; i < cuotasPorGenerar; i++) {
      const d = new Date(anioInit, mesInit - 1 + i, 1);
      const pAnio = d.getFullYear();
      const pMes = String(d.getMonth() + 1).padStart(2, '0');
      const periodoCuota = `${pAnio}-${pMes}`;
      const numeroCuota = cuotaIniNum + i;

      await prisma.cuotaPrestamo.create({
        data: {
          prestamoId: prestamo.id,
          numeroCuota,
          periodo: periodoCuota,
          monto: montoCuotaFloat,
          estado: EstadoPago.PENDIENTE,
        },
      });
    }

    return NextResponse.json({ success: true, data: prestamo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
