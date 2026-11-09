import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(categorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, icono, color, esFijo } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const categoria = await prisma.categoria.upsert({
      where: { nombre: nombre.trim() },
      update: {
        icono: icono || null,
        color: color || '#2563eb',
        esFijo: !!esFijo,
      },
      create: {
        nombre: nombre.trim(),
        icono: icono || 'Tag',
        color: color || '#2563eb',
        esFijo: !!esFijo,
      },
    });

    return NextResponse.json({ success: true, data: categoria });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
