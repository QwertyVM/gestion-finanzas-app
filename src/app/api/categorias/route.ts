import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const where: any = {};
    if (user) {
      where.OR = [{ usuarioId: user.id }, { usuarioId: null }];
    }

    const categorias = await prisma.categoria.findMany({
      where,
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
    const { id, nombre, icono, color, esFijo } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Comprobar si tiene registros asociados
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

    if (!cat) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Desvincular de fijos y gastos si los tuviera antes de eliminar (SetNull)
    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
