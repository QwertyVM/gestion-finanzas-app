import { NextResponse } from 'next/server';
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
