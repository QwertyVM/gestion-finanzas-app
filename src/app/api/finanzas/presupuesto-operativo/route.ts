import { NextRequest, NextResponse } from 'next/server';
import {
  getPresupuestoOperativo,
  guardarPresupuestoOperativo,
  restablecerPresupuestoOperativo,
} from '@/lib/finanzas-service';
import { getCurrentPeriodo } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con tu cuenta.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || getCurrentPeriodo();

    const data = await getPresupuestoOperativo(periodo, user);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error al obtener presupuesto operativo:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al calcular presupuesto operativo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con tu cuenta.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || !body.periodoDestino || !Array.isArray(body.sobres)) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (periodoDestino, sobres)' },
        { status: 400 }
      );
    }

    const resultado = await guardarPresupuestoOperativo(body, user);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al guardar presupuesto operativo:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar presupuesto operativo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con tu cuenta.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let periodoDestino = searchParams.get('periodoDestino');

    if (!periodoDestino) {
      const body = await request.json().catch(() => ({}));
      periodoDestino = body?.periodoDestino;
    }

    if (!periodoDestino) {
      return NextResponse.json(
        { error: 'Debe especificar el periodoDestino a restablecer' },
        { status: 400 }
      );
    }

    const resultado = await restablecerPresupuestoOperativo(periodoDestino, user);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error al restablecer presupuesto operativo:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al restablecer presupuesto operativo' },
      { status: 500 }
    );
  }
}
