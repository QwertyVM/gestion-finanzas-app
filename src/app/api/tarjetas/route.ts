import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tarjetas = await prisma.tarjetaCredito.findMany({
      where: { usuarioId: user.id },
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

    const resultado = tarjetas.map((t) => ({
      ...t,
      totalRegistros: (t._count?.gastos || 0) + (t._count?.costosFijos || 0),
      cantidadGastos: t._count?.gastos || 0,
      cantidadCostosFijos: t._count?.costosFijos || 0,
    }));

    return NextResponse.json(resultado);
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

    // Verificar si tiene registros asociados (gastos o costos fijos)
    const [gastosCount, costosFijosCount] = await Promise.all([
      prisma.gasto.count({ where: { tarjetaId: id, usuarioId: user.id } }),
      prisma.costoFijo.count({ where: { tarjetaId: id, usuarioId: user.id } }),
    ]);

    const totalAsociados = gastosCount + costosFijosCount;
    if (totalAsociados > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la tarjeta porque tiene ${totalAsociados} registro(s) asociado(s) (${gastosCount} compras/gastos y ${costosFijosCount} costos fijos). Reasigna o elimina los registros antes de borrarla.`,
        },
        { status: 400 }
      );
    }

    const res = await prisma.tarjetaCredito.deleteMany({
      where: { id, usuarioId: user.id },
    });

    return NextResponse.json({ success: true, count: res.count });
  } catch (error: any) {
    console.error('Error al eliminar tarjeta:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
