import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NOMBRES_MESES } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anio = parseInt(searchParams.get('anio') || '2026', 10);
    const anioPrefijo = `${anio}-`;

    const [
      config,
      ingresosYear,
      costosFijosActivos,
      registrosFijosYear,
      cuotasYear,
      gastosYear,
    ] = await Promise.all([
      prisma.configuracionUsuario.findFirst(),
      prisma.ingresoMes.findMany({
        where: { periodo: { startsWith: anioPrefijo } },
      }),
      prisma.costoFijo.findMany({
        where: { activo: true },
      }),
      prisma.registroCostoFijoMes.findMany({
        where: { periodo: { startsWith: anioPrefijo } },
      }),
      prisma.cuotaPrestamo.findMany({
        where: { periodo: { startsWith: anioPrefijo } },
      }),
      prisma.gasto.findMany({
        where: { periodoPago: { startsWith: anioPrefijo } },
        select: { monto: true, periodoPago: true },
      }),
    ]);

    const sueldoBase = Number(config?.sueldoBaseMensual || 8200);
    const resultado = [];

    for (let mes = 1; mes <= 12; mes++) {
      const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
      const esGrati = mes === 7 || mes === 12;
      const esUtilidad = mes === 3;

      // Ingresos del mes
      const ingresosMes = ingresosYear.filter((i) => i.periodo === periodo);
      let totalIngresos = ingresosMes.reduce((acc, curr) => acc + Number(curr.monto), 0);
      if (totalIngresos === 0) {
        totalIngresos += sueldoBase;
        if (esGrati) totalIngresos += sueldoBase * 1.09;
        if (esUtilidad) totalIngresos += sueldoBase * 1.5;
      }

      // Costos fijos
      const fijosMes = registrosFijosYear.filter((r) => r.periodo === periodo);
      let totalFijosMes = fijosMes.reduce((acc, r) => acc + Number(r.monto), 0);
      if (totalFijosMes === 0) {
        const vigentes = costosFijosActivos.filter((f) => {
          const inicioValido = !f.mesInicio || f.mesInicio <= periodo;
          const finValido = !f.mesFin || f.mesFin >= periodo;
          return inicioValido && finValido;
        });
        totalFijosMes = vigentes.reduce((acc, f) => acc + Number(f.monto), 0);
      }

      // Cuotas de préstamos
      const cuotasMes = cuotasYear.filter((c) => c.periodo === periodo);
      const totalPrestamos = cuotasMes.reduce((acc, c) => acc + Number(c.monto), 0);

      // Gastos
      const gastosMes = gastosYear.filter((g) => g.periodoPago === periodo);
      const totalGastos = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);

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
