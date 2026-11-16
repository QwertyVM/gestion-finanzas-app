import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NOMBRES_MESES, getCurrentPeriodo } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const anio = parseInt(searchParams.get('anio') || '2026', 10);
    const anioPrefijo = `${anio}-`;
    const uId = user.id;
    const usuario = user;
    const currentPeriodo = getCurrentPeriodo();

    const [
      ingresosYear,
      costosFijosActivos,
      registrosFijosYear,
      cuotasYear,
      gastosYear,
    ] = await Promise.all([
      prisma.ingresoMes.findMany({
        where: { periodo: { startsWith: anioPrefijo }, usuarioId: uId },
      }),
      prisma.costoFijo.findMany({
        where: { activo: true, usuarioId: uId },
      }),
      prisma.registroCostoFijoMes.findMany({
        where: { periodo: { startsWith: anioPrefijo }, costoFijo: { usuarioId: uId } },
      }),
      prisma.cuotaPrestamo.findMany({
        where: { periodo: { startsWith: anioPrefijo }, prestamo: { usuarioId: uId } },
      }),
      prisma.gasto.findMany({
        where: { periodoPago: { startsWith: anioPrefijo }, usuarioId: uId },
        select: { monto: true, periodoPago: true, estado: true },
      }),
    ]);

    const sueldoBase = Number(usuario?.sueldoBaseMensual ?? 0);
    const resultado = [];

    for (let mes = 1; mes <= 12; mes++) {
      const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
      const esMesPasado = periodo < currentPeriodo;

      // Ingresos del mes
      const ingresosMes = ingresosYear.filter((i) => i.periodo === periodo);
      let totalIngresos = ingresosMes.reduce((acc, curr) => acc + Number(curr.monto), 0);
      const tieneGrati = ingresosMes.some((i) => i.tipo === 'GRATIFICACION');
      const tieneUtilidad = ingresosMes.some((i) => i.tipo === 'UTILIDADES');

      // Cuotas de préstamos
      const cuotasMes = cuotasYear.filter((c) => c.periodo === periodo);
      const totalPrestamos = cuotasMes.reduce((acc, c) => acc + Number(c.monto), 0);

      // Gastos
      const gastosMes = gastosYear.filter((g) => g.periodoPago === periodo);
      const totalGastos = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);

      // Costos fijos
      const fijosMes = registrosFijosYear.filter((r) => r.periodo === periodo);
      let totalFijosMes = fijosMes.reduce((acc, r) => acc + Number(r.monto), 0);

      // Determinar si hay datos registrados explícitamente en este periodo
      const tieneDataRegistrada =
        ingresosMes.length > 0 ||
        fijosMes.length > 0 ||
        cuotasMes.length > 0 ||
        gastosMes.length > 0;

      // Si no hay actividad registrada, no proyectar valores estimados
      if (!tieneDataRegistrada) {
        resultado.push({
          periodo,
          mesNombre: NOMBRES_MESES[mes - 1],
          anio,
          mesNumero: mes,
          ingresos: 0,
          fijos: 0,
          prestamos: 0,
          gastos: 0,
          totalEgresos: 0,
          disponible: 0,
          esGrati: false,
          esUtilidad: false,
        });
        continue;
      }

      const adelantoFijos = fijosMes.filter((r) => r.estado === 'ADELANTADO').reduce((acc, r) => acc + Number(r.monto), 0);
      const adelantoCuotas = cuotasMes.filter((c) => c.estado === 'ADELANTADO').reduce((acc, c) => acc + Number(c.monto), 0);
      const adelantoGastos = gastosMes.filter((g) => g.estado === 'ADELANTADO').reduce((acc, g) => acc + Number(g.monto), 0);
      const totalAdelantado = adelantoFijos + adelantoCuotas + adelantoGastos;

      const totalEgresos = totalFijosMes + totalPrestamos + totalGastos;
      const egresosSueldo = Math.max(0, totalEgresos - totalAdelantado);
      const disponible = totalIngresos - egresosSueldo;

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
        esGrati: tieneGrati,
        esUtilidad: tieneUtilidad,
      });
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
