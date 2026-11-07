import { NextRequest, NextResponse } from 'next/server';
import { getResumenMensual } from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || getCurrentPeriodo();

    const data = await getResumenMensual(periodo);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error al obtener resumen financiero:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener resumen financiero' },
      { status: 500 }
    );
  }
}
