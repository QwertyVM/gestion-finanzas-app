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
    const categoriaId = searchParams.get('categoriaId');

    const resumen = await getResumenMensual(periodo, user.id);
    const analisis = resumen.analisisCategorias;

    let categorias = analisis.categorias;
    if (categoriaId) {
      categorias = categorias.filter(
        (c) => c.id === categoriaId || c.nombre.toLowerCase() === categoriaId.toLowerCase()
      );
    }

    return NextResponse.json({
      periodo: resumen.periodo,
      usuarioId: resumen.config.id,
      totalEgresos: resumen.totalEgresos,
      totalesPorClasificacion: resumen.totalesPorClasificacion,
      metricasMacro: analisis.metricasMacro,
      categorias,
      clasificaciones: analisis.clasificaciones,
      metodosPago: analisis.metodosPago,
      tarjetas: analisis.tarjetas,
    });
  } catch (error: any) {
    console.error('Error al obtener análisis de categorías y tags:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener análisis de categorías' },
      { status: 500 }
    );
  }
}
