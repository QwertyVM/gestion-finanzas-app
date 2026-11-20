import { NextRequest, NextResponse } from 'next/server';
import { getPresupuestoOperativo } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con tu cuenta.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || getCurrentPeriodo();

    const data = await getPresupuestoOperativo(periodo, user);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error al obtener presupuesto operativo:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al calcular presupuesto operativo' },
      { status: 500 }
    );
  }
}
