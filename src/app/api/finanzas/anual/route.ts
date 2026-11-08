import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NOMBRES_MESES } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anio = parseInt(searchParams.get('anio') || '2026', 10);

    const config = await prisma.configuracionUsuario.findFirst();
    const sueldoBase = Number(config?.sueldoBaseMensual || 8200);

    const resultado = [];

    for (let mes = 1; mes <= 12; mes++) {
      const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
      const esGrati = mes === 7 || mes === 12;
      const esUtilidad = mes === 3;

      // Ingresos
      const ingresosDb = await prisma.ingresoMes.findMany({ where: { periodo } });
      let totalIngresos = ingresosDb.reduce((acc, curr) => acc + Number(curr.monto), 0);

      if (totalIngresos === 0) {
        totalIngresos += sueldoBase;
        if (esGrati) totalIngresos += sueldoBase * 1.09;
        if (esUtilidad) totalIngresos += sueldoBase * 1.5;
      }

      // Costos fijos vigentes para este periodo
      const fijosRegistrados = await prisma.registroCostoFijoMes.findMany({
        where: { periodo },
      });
      let totalFijosMes = fijosRegistrados.reduce((acc, r) => acc + Number(r.monto), 0);
      if (totalFijosMes === 0) {
        const fijosVigentes = await prisma.costoFijo.findMany({
          where: {
            activo: true,
            OR: [{ mesFin: null }, { mesFin: { gte: periodo } }],
            AND: [{ OR: [{ mesInicio: null }, { mesInicio: { lte: periodo } }] }],
          },
        });
        totalFijosMes = fijosVigentes.reduce((acc, f) => acc + Number(f.monto), 0);
      }

      // Cuotas de préstamos
      const prestamosCuotas = await prisma.cuotaPrestamo.aggregate({
        where: { periodo },
        _sum: { monto: true },
      });
      const totalPrestamos = Number(prestamosCuotas._sum.monto || 0);

      // Gastos imputados al periodo
      const gastosMes = await prisma.gasto.aggregate({
        where: { periodoPago: periodo },
        _sum: { monto: true },
      });
      const totalGastos = Number(gastosMes._sum.monto || 0);

      const totalEgresos = totalFijosMes + totalPrestamos + totalGastos;
      const disponible = totalIngresos - totalEgresos;

      resultado.push({
        periodo,
        mesNombre: NOMBRES_MESES[mes - 1],
        anio,
        mesNumero: mes,
        ingresos: totalIngresos,
        fijos: totalFijosMes,
        prestamos: totalPrestamos,
        gastos: totalGastos,
        totalEgresos,
        disponible,
        esGrati,
        esUtilidad,
      });
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
