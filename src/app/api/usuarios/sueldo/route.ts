import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const {
      nuevoSueldo,
      modo, // 'ACTUAL' | 'PROXIMO' | 'PERSONALIZADO'
      periodoActual, // ej: '2026-11'
      periodoPersonalizado, // ej: '2027-01'
    } = await request.json();

    const sueldoNum = parseFloat(nuevoSueldo);
    if (isNaN(sueldoNum) || sueldoNum <= 0) {
      return NextResponse.json({ error: 'Monto de sueldo inválido' }, { status: 400 });
    }

    // Calcular periodo desde el cual aplica
    let periodoDesde = periodoActual;
    if (modo === 'PROXIMO') {
      const [y, m] = (periodoActual || '').split('-').map(Number);
      const nextDate = new Date(y, m, 1);
      periodoDesde = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    } else if (modo === 'PERSONALIZADO') {
      if (!periodoPersonalizado || !/^\d{4}-\d{2}$/.test(periodoPersonalizado)) {
        return NextResponse.json({ error: 'Periodo personalizado inválido (debe ser YYYY-MM)' }, { status: 400 });
      }
      periodoDesde = periodoPersonalizado;
    }

    if (!periodoDesde || !/^\d{4}-\d{2}$/.test(periodoDesde)) {
      return NextResponse.json({ error: 'Periodo de inicio inválido' }, { status: 400 });
    }

    // 1. Actualizar el sueldo base del usuario (para futuros meses)
    await prisma.usuario.update({
      where: { id: user.id },
      data: { sueldoBaseMensual: sueldoNum },
    });

    // 2. Actualizar todos los ingresos de tipo SUELDO existentes desde periodoDesde en adelante
    // (Meses anteriores a periodoDesde quedan 100% intactos)
    await prisma.ingresoMes.updateMany({
      where: {
        usuarioId: user.id,
        tipo: 'SUELDO',
        periodo: { gte: periodoDesde },
      },
      data: {
        monto: sueldoNum,
      },
    });

    // 3. Si en periodoDesde no existe registro de SUELDO, crearlo de inmediato
    const sueldoPeriodoDesde = await prisma.ingresoMes.findFirst({
      where: {
        usuarioId: user.id,
        tipo: 'SUELDO',
        periodo: periodoDesde,
      },
    });

    if (!sueldoPeriodoDesde) {
      const dbUser = await prisma.usuario.findUnique({ where: { id: user.id } });
      const dia = dbUser?.diaPagoSueldo || 30;
      const [yr, mn] = periodoDesde.split('-').map(Number);
      const maxDia = new Date(yr, mn, 0).getDate();
      const diaEfectivo = Math.min(dia, maxDia);
      const fechaEsperada = new Date(Date.UTC(yr, mn - 1, diaEfectivo, 12, 0, 0));

      await prisma.ingresoMes.create({
        data: {
          usuarioId: user.id,
          periodo: periodoDesde,
          tipo: 'SUELDO',
          concepto: 'Sueldo Mensual Planilla',
          monto: sueldoNum,
          fechaEsperada,
          recibido: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      periodoDesde,
      nuevoSueldo: sueldoNum,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
