import { NextRequest, NextResponse } from 'next/server';
import { getResumenMensual } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con tu PIN.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || getCurrentPeriodo();

    const resumen = await getResumenMensual(periodo, user.id);

    return NextResponse.json({
      periodo,
      usuarioId: resumen.config.id,
      totales: resumen.totalesPorClasificacion,
      secciones: resumen.seccionesCompromisos,
      totalEgresosMes: resumen.totalEgresos,
    });
  } catch (error: any) {
    console.error('Error al obtener secciones de egresos:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener secciones de egresos' },
      { status: 500 }
    );
  }
}
