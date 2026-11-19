import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { migrarACategorias503020 } from '@/lib/categoria-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resultado = await migrarACategorias503020(user.id);
    return NextResponse.json({
      success: true,
      mensaje: 'Migración a categorías 50/30/20 completada para el usuario.',
      resultado,
    });
  } catch (error: any) {
    console.error('Error en migración 50/30/20:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
