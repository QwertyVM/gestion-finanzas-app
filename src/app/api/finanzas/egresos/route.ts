import { NextRequest, NextResponse } from 'next/server';
import { getResumenMensual } from '@/lib/finanzas-service';
import { getCurrentPeriodo, ESTILOS_CLASIFICACION } from '@/lib/utils';
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
    const clasificacion = searchParams.get('clasificacion'); // 'FIJO' | 'PRESTAMO' | 'CUOTA' | 'VARIABLE' | 'PRESTAMOS_CUOTAS'

    const resumen = await getResumenMensual(periodo, user.id);

    let egresos = resumen.egresosConsolidados;

    if (clasificacion && clasificacion !== 'TODOS') {
      if (clasificacion === 'PRESTAMOS_CUOTAS') {
        egresos = egresos.filter(
          (e) => e.clasificacion === 'PRESTAMO' || e.clasificacion === 'CUOTA'
        );
      } else {
        egresos = egresos.filter((e) => e.clasificacion === clasificacion);
      }
    }

    return NextResponse.json({
      periodo,
      usuarioId: resumen.config.id,
      totales: resumen.totalesPorClasificacion,
      estilos: ESTILOS_CLASIFICACION,
      egresos,
      secciones: resumen.seccionesCompromisos,
      totalEgresosMes: resumen.totalEgresos,
    });
  } catch (error: any) {
    console.error('Error al obtener egresos consolidados:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener egresos clasificados' },
      { status: 500 }
    );
  }
}
