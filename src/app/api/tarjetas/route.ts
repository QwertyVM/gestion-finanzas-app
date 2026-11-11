import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tarjetas = await prisma.tarjetaCredito.findMany({
      where: { usuarioId: user.id },
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(tarjetas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();

    const tarjeta = await prisma.tarjetaCredito.create({
      data: {
        usuarioId: user.id,
        nombre: body.nombre,
        banco: body.banco,
        ultimosCuatro: body.ultimosCuatro || null,
        diaCorte: parseInt(body.diaCorte || '10', 10),
        diaPago: parseInt(body.diaPago || '30', 10),
        color: body.color || '#2563eb',
      },
    });
    return NextResponse.json(tarjeta);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { id, nombre, banco, ultimosCuatro, diaCorte, diaPago, color } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const tarjeta = await prisma.tarjetaCredito.updateMany({
      where: { id, usuarioId: user.id },
      data: {
        ...(nombre && { nombre }),
        ...(banco && { banco }),
        ...(ultimosCuatro !== undefined && { ultimosCuatro }),
        ...(diaCorte !== undefined && { diaCorte: parseInt(diaCorte, 10) }),
        ...(diaPago !== undefined && { diaPago: parseInt(diaPago, 10) }),
        ...(color && { color }),
      },
    });
    return NextResponse.json({ success: true, count: tarjeta.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'ID de tarjeta requerido' }, { status: 400 });
    }

    // Desvincular gastos asociados solo del usuario
    await prisma.gasto.updateMany({
      where: { tarjetaId: id, usuarioId: user.id },
      data: { tarjetaId: null },
    });

    const res = await prisma.tarjetaCredito.deleteMany({
      where: { id, usuarioId: user.id },
    });

    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    console.error('Error al eliminar tarjeta:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
