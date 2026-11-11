import { NextRequest, NextResponse } from 'next/server';
import { generalizarCategorias, CATEGORIAS_GENERALIZADAS } from '@/lib/categoria-service';

export async function GET() {
  return NextResponse.json({
    descripcion: 'Catálogo de categorías canónicas y servicio de generalización de tags',
    categoriasEstandar: CATEGORIAS_GENERALIZADAS,
  });
}

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const usuarioId =
      body?.usuarioId ||
      request.headers.get('x-usuario-id') ||
      request.cookies.get('finanzapp_usuario_id')?.value;

    const resultado = await generalizarCategorias(usuarioId);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al generalizar categorías:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al ejecutar la generalización de tags' },
      { status: 500 }
    );
  }
}

