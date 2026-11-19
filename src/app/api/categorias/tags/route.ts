import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { MINITAGS_POR_CATEGORIA, TODOS_LOS_MINITAGS_SUGERIDOS } from '@/lib/categoria-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener los tags ya utilizados por el usuario en gastos y costos fijos
    const [gastosTags, fijosTags] = await Promise.all([
      prisma.gasto.findMany({
        where: { usuarioId: user.id, tag: { not: null } },
        select: { tag: true },
        distinct: ['tag'],
      }),
      prisma.costoFijo.findMany({
        where: { usuarioId: user.id, tag: { not: null } },
        select: { tag: true },
        distinct: ['tag'],
      }),
    ]);

    const tagsUsuarioSet = new Set<string>();
    gastosTags.forEach((g) => g.tag && tagsUsuarioSet.add(g.tag));
    fijosTags.forEach((f) => f.tag && tagsUsuarioSet.add(f.tag));

    return NextResponse.json({
      porCategoria: MINITAGS_POR_CATEGORIA,
      sugeridos: TODOS_LOS_MINITAGS_SUGERIDOS,
      usuarioTags: Array.from(tagsUsuarioSet),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
