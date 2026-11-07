import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.configuracionUsuario.findFirst();
    if (!config) {
      config = await prisma.configuracionUsuario.create({
        data: {
          nombre: 'Víctor',
          monedaSimbolo: 'S/',
          sueldoBaseMensual: 6000.00,
          diaPagoSueldo: 30,
          tipoCambioUSD: 4.00,
          metaAhorroMensual: 1000.00,
        },
      });
    }
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let config = await prisma.configuracionUsuario.findFirst();
    if (config) {
      config = await prisma.configuracionUsuario.update({
        where: { id: config.id },
        data: {
          nombre: body.nombre || config.nombre,
          monedaSimbolo: body.monedaSimbolo || config.monedaSimbolo,
          sueldoBaseMensual: body.sueldoBaseMensual !== undefined ? parseFloat(body.sueldoBaseMensual) : config.sueldoBaseMensual,
          diaPagoSueldo: body.diaPagoSueldo ? parseInt(body.diaPagoSueldo, 10) : config.diaPagoSueldo,
          tipoCambioUSD: body.tipoCambioUSD !== undefined ? parseFloat(body.tipoCambioUSD) : config.tipoCambioUSD,
          metaAhorroMensual: body.metaAhorroMensual !== undefined ? parseFloat(body.metaAhorroMensual) : config.metaAhorroMensual,
        },
      });
    } else {
      config = await prisma.configuracionUsuario.create({
        data: {
          nombre: body.nombre || 'Víctor',
          monedaSimbolo: body.monedaSimbolo || 'S/',
          sueldoBaseMensual: body.sueldoBaseMensual ? parseFloat(body.sueldoBaseMensual) : 6000.00,
          diaPagoSueldo: body.diaPagoSueldo ? parseInt(body.diaPagoSueldo, 10) : 30,
          tipoCambioUSD: body.tipoCambioUSD ? parseFloat(body.tipoCambioUSD) : 4.00,
          metaAhorroMensual: body.metaAhorroMensual ? parseFloat(body.metaAhorroMensual) : 1000.00,
        },
      });
    }
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
