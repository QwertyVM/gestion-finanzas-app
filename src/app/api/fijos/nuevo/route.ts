import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const {
      concepto,
      monto,
      // diaVencimiento ignorado — siempre fin de mes (30)
      periodo,
      mesInicio,
      mesFin,
      categoriaId,
      notas,
      metodoPago,
      tarjetaId,
    } = body;
    const usuarioId = user.id;

    const startPeriodo = mesInicio || periodo || '2026-11';
    const montoFloat = parseFloat(monto);
    const finalMetodoPago = (metodoPago as MetodoPago) || MetodoPago.EFECTIVO_DEBITO;
    const finalTarjetaId = finalMetodoPago === MetodoPago.TARJETA_CREDITO ? (tarjetaId || null) : null;

    const costoFijo = await prisma.costoFijo.create({
      data: {
        usuarioId: usuarioId || undefined,
        concepto,
        monto: montoFloat,
        diaVencimiento: 30,
        mesInicio: startPeriodo,
        mesFin: mesFin || null,
        categoriaId: categoriaId || null,
        metodoPago: finalMetodoPago,
        tarjetaId: finalTarjetaId,
        registrosMes: {
          create: {
            periodo: startPeriodo,
            monto: montoFloat,
            estado: EstadoPago.PENDIENTE,
            metodoPago: finalMetodoPago,
            tarjetaId: finalTarjetaId,
            notas: notas || null,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: costoFijo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
