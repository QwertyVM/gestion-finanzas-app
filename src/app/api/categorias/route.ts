import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categorias = await prisma.categoria.findMany({
      where: {
        OR: [{ usuarioId: user.id }, { usuarioId: null }],
      },
      include: {
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(categorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { nombre, icono, color, esFijo } = body;
    const usuarioId = user.id;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const categoria = await prisma.categoria.upsert({
      where: {
        usuarioId_nombre: {
          usuarioId: usuarioId as any,
          nombre: nombre.trim(),
        },
      },
      update: {
        icono: icono || null,
        color: color || '#2563eb',
        esFijo: !!esFijo,
      },
      create: {
        usuarioId,
        nombre: nombre.trim(),
        icono: icono || 'Tag',
        color: color || '#2563eb',
        esFijo: !!esFijo,
      },
      include: {
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: categoria });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id, nombre, icono, color, esFijo } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const catExistente = await prisma.categoria.findUnique({ where: { id } });
    if (!catExistente || (catExistente.usuarioId && catExistente.usuarioId !== user.id)) {
      return NextResponse.json({ error: 'Categoría no encontrada o no autorizada' }, { status: 403 });
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: nombre ? nombre.trim() : undefined,
        icono: icono !== undefined ? icono : undefined,
        color: color || undefined,
        esFijo: typeof esFijo === 'boolean' ? esFijo : undefined,
      },
      include: {
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: categoria });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const cat = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            gastos: true,
            costosFijos: true,
          },
        },
      },
    });

    if (!cat || (cat.usuarioId && cat.usuarioId !== user.id)) {
      return NextResponse.json({ error: 'Categoría no encontrada o no autorizada' }, { status: 404 });
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
