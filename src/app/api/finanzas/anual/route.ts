import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NOMBRES_MESES, getCurrentPeriodo } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth';

export type TipoMesProyeccion = 'PASADO_SIN_ACTIVIDAD' | 'HISTORICO' | 'ACTUAL' | 'PROYECTADO';

export interface MesProyeccion {
  periodo: string;
  mesNombre: string;
  anio: number;
  mesNumero: number;
  tipoMes: TipoMesProyeccion;
  ingresos: number;
  fijos: number;
  prestamos: number;
  gastos: number;
  totalEgresos: number;
  disponible: number;
  tasaAhorro: number;
  esGrati: boolean;
  esUtilidad: boolean;
}

export interface TotalesProyeccion {
  totalIngresos: number;
  totalFijos: number;
  totalPrestamos: number;
  totalGastos: number;
  totalEgresos: number;
  totalDisponible: number;
  tasaAhorroPromedio: number;
  cantidadMeses: number;
}

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
    const currentPeriodo = getCurrentPeriodo();
    const defaultAnio = parseInt(currentPeriodo.split('-')[0], 10) || 2026;
    const anio = parseInt(searchParams.get('anio') || String(defaultAnio), 10);
    const anioPrefijo = `${anio}-`;
    const uId = user.id;

    // 1. Obtener minPeriodo del usuario dinámicamente
    const [minIngreso, minGasto, minFijo, minCuota] = await Promise.all([
      prisma.ingresoMes.findFirst({
        where: { usuarioId: uId },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
      prisma.gasto.findFirst({
        where: { usuarioId: uId },
        orderBy: { periodoPago: 'asc' },
        select: { periodoPago: true },
      }),
      prisma.registroCostoFijoMes.findFirst({
        where: { costoFijo: { usuarioId: uId } },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
      prisma.cuotaPrestamo.findFirst({
        where: { prestamo: { usuarioId: uId } },
        orderBy: { periodo: 'asc' },
        select: { periodo: true },
      }),
    ]);
    const periodosExistentes = [
      minIngreso?.periodo,
      minGasto?.periodoPago,
      minFijo?.periodo,
      minCuota?.periodo,
    ].filter(Boolean) as string[];

    const minPeriodo = periodosExistentes.length > 0 ? periodosExistentes.sort()[0] : '2026-10';

    // 2. Cargar datos del año solicitado y configuración
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

    const sueldoBase = Number(user.sueldoBaseMensual ?? 0);
    const resultado: MesProyeccion[] = [];

    for (let mes = 1; mes <= 12; mes++) {
      const periodo = `${anio}-${String(mes).padStart(2, '0')}`;

      // Determinar la clasificación temporal del mes
      let tipoMes: TipoMesProyeccion = 'PROYECTADO';
      if (periodo < minPeriodo) {
        tipoMes = 'PASADO_SIN_ACTIVIDAD';
      } else if (periodo < currentPeriodo) {
        tipoMes = 'HISTORICO';
      } else if (periodo === currentPeriodo) {
        tipoMes = 'ACTUAL';
      }

      // Mes pasado anterior al inicio de registros (ej: Enero - Septiembre 2026)
      if (tipoMes === 'PASADO_SIN_ACTIVIDAD') {
        resultado.push({
          periodo,
          mesNombre: NOMBRES_MESES[mes - 1],
          anio,
          mesNumero: mes,
          tipoMes,
          ingresos: 0,
          fijos: 0,
          prestamos: 0,
          gastos: 0,
          totalEgresos: 0,
          disponible: 0,
          tasaAhorro: 0,
          esGrati: false,
          esUtilidad: false,
        });
        continue;
      }

      // Ingresos
      const ingresosMes = ingresosYear.filter((i) => i.periodo === periodo);
      let totalIngresos = ingresosMes.reduce((acc, curr) => acc + Number(curr.monto), 0);
      const tieneSueldo = ingresosMes.some((i) => i.tipo === 'SUELDO');
      const tieneGrati = ingresosMes.some((i) => i.tipo === 'GRATIFICACION');
      const tieneUtilidad = ingresosMes.some((i) => i.tipo === 'UTILIDADES');

      // Si es mes actual o proyectado y no tiene sueldo registrado explícitamente, proyectar sueldo base
      if (!tieneSueldo && (tipoMes === 'ACTUAL' || tipoMes === 'PROYECTADO') && sueldoBase > 0) {
        totalIngresos += sueldoBase;
      }

      // Préstamos (cuotas ya programadas para el periodo)
      const cuotasMes = cuotasYear.filter((c) => c.periodo === periodo);
      const totalPrestamos = cuotasMes.reduce((acc, c) => acc + Number(c.monto), 0);

      // Tarjetas / Compras diferidas en cuotas (gastos con vencimiento en periodo)
      const gastosMes = gastosYear.filter((g) => g.periodoPago === periodo);
      const totalGastos = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);

      // Costos fijos
      const fijosMes = registrosFijosYear.filter((r) => r.periodo === periodo);
      let totalFijosMes = 0;

      if (tipoMes === 'HISTORICO') {
        // En meses pasados cerrados, solo lo efectivamente registrado
        totalFijosMes = fijosMes.reduce((acc, r) => acc + Number(r.monto), 0);
      } else {
        // En mes actual y meses futuros proyectados:
        // Consolidar fijos activos vigentes según fecha inicio/fin + registros específicos
        const fijosMap = new Map<string, number>();
        costosFijosActivos.forEach((cf) => {
          const inicioValido = !cf.mesInicio || cf.mesInicio <= periodo;
          const finValido = !cf.mesFin || cf.mesFin >= periodo;
          if (inicioValido && finValido) {
            fijosMap.set(cf.id, Number(cf.monto));
          }
        });
        // Si hay registros específicos para ese mes (ej: variaciones o confirmados), prevalece el registro
        fijosMes.forEach((r) => {
          fijosMap.set(r.costoFijoId, Number(r.monto));
        });
        totalFijosMes = Array.from(fijosMap.values()).reduce((a, b) => a + b, 0);
      }

      // Considerar pagos adelantados
      const adelantoFijos = fijosMes.filter((r) => r.estado === 'ADELANTADO').reduce((acc, r) => acc + Number(r.monto), 0);
      const adelantoCuotas = cuotasMes.filter((c) => c.estado === 'ADELANTADO').reduce((acc, c) => acc + Number(c.monto), 0);
      const adelantoGastos = gastosMes.filter((g) => g.estado === 'ADELANTADO').reduce((acc, g) => acc + Number(g.monto), 0);
      const totalAdelantado = adelantoFijos + adelantoCuotas + adelantoGastos;

      const totalEgresos = totalFijosMes + totalPrestamos + totalGastos;
      const egresosSueldo = Math.max(0, totalEgresos - totalAdelantado);
      const disponible = totalIngresos - egresosSueldo;
      const tasaAhorro = totalIngresos > 0 ? (disponible / totalIngresos) * 100 : 0;

      resultado.push({
        periodo,
        mesNombre: NOMBRES_MESES[mes - 1],
        anio,
        mesNumero: mes,
        tipoMes,
        ingresos: totalIngresos,
        fijos: totalFijosMes,
        prestamos: totalPrestamos,
        gastos: totalGastos,
        totalEgresos,
        disponible,
        tasaAhorro,
        esGrati: tieneGrati,
        esUtilidad: tieneUtilidad,
      });
    }

    // 3. Totales de Lo Actual (Ejecutado a la fecha: HISTORICO + ACTUAL)
    const mesesActuales = resultado.filter(
      (m) => m.tipoMes === 'HISTORICO' || m.tipoMes === 'ACTUAL'
    );
    const totActIngresos = mesesActuales.reduce((acc, m) => acc + m.ingresos, 0);
    const totActFijos = mesesActuales.reduce((acc, m) => acc + m.fijos, 0);
    const totActPrestamos = mesesActuales.reduce((acc, m) => acc + m.prestamos, 0);
    const totActGastos = mesesActuales.reduce((acc, m) => acc + m.gastos, 0);
    const totActEgresos = mesesActuales.reduce((acc, m) => acc + m.totalEgresos, 0);
    const totActDisponible = mesesActuales.reduce((acc, m) => acc + m.disponible, 0);
    const totalesActual: TotalesProyeccion = {
      totalIngresos: totActIngresos,
      totalFijos: totActFijos,
      totalPrestamos: totActPrestamos,
      totalGastos: totActGastos,
      totalEgresos: totActEgresos,
      totalDisponible: totActDisponible,
      tasaAhorroPromedio: totActIngresos > 0 ? (totActDisponible / totActIngresos) * 100 : 0,
      cantidadMeses: mesesActuales.length,
    };

    // 4. Totales de Lo Proyectado Esperado (Año completo: HISTORICO + ACTUAL + PROYECTADO)
    const mesesProyectados = resultado.filter((m) => m.tipoMes !== 'PASADO_SIN_ACTIVIDAD');
    const totProyIngresos = mesesProyectados.reduce((acc, m) => acc + m.ingresos, 0);
    const totProyFijos = mesesProyectados.reduce((acc, m) => acc + m.fijos, 0);
    const totProyPrestamos = mesesProyectados.reduce((acc, m) => acc + m.prestamos, 0);
    const totProyGastos = mesesProyectados.reduce((acc, m) => acc + m.gastos, 0);
    const totProyEgresos = mesesProyectados.reduce((acc, m) => acc + m.totalEgresos, 0);
    const totProyDisponible = mesesProyectados.reduce((acc, m) => acc + m.disponible, 0);
    const totalesProyectado: TotalesProyeccion = {
      totalIngresos: totProyIngresos,
      totalFijos: totProyFijos,
      totalPrestamos: totProyPrestamos,
      totalGastos: totProyGastos,
      totalEgresos: totProyEgresos,
      totalDisponible: totProyDisponible,
      tasaAhorroPromedio: totProyIngresos > 0 ? (totProyDisponible / totProyIngresos) * 100 : 0,
      cantidadMeses: mesesProyectados.length,
    };

    return NextResponse.json({
      anio,
      currentPeriodo,
      minPeriodo,
      meses: resultado,
      totalesActual,
      totalesProyectado,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
