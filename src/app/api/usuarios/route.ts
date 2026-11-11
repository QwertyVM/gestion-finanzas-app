import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'asc' },
    });

    // Si aún no existen usuarios, creamos automáticamente a Víctor y Jamile
    if (usuarios.length === 0) {
      const victor = await prisma.usuario.create({
        data: {
          nombre: 'Víctor',
          slug: 'victor',
          color: '#2563eb',
          avatar: 'User',
          sueldoBaseMensual: 8200.00,
          diaPagoSueldo: 30,
          tipoCambioUSD: 4.00,
          metaAhorroMensual: 1000.00,
        },
      });

      const jamile = await prisma.usuario.create({
        data: {
          nombre: 'Jamile',
          slug: 'jamile',
          color: '#ec4899',
          avatar: 'Heart',
          sueldoBaseMensual: 5000.00,
          diaPagoSueldo: 30,
          tipoCambioUSD: 4.00,
          metaAhorroMensual: 1000.00,
        },
      });

      usuarios = [victor, jamile];
    }

    return NextResponse.json(usuarios);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, slug, color, avatar, sueldoBaseMensual, diaPagoSueldo, metaAhorroMensual, pin } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const finalSlug = slug || nombre.toLowerCase().trim().replace(/\s+/g, '-');

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        slug: finalSlug,
        color: color || '#2563eb',
        avatar: avatar || 'User',
        pin: pin || null,
        sueldoBaseMensual: sueldoBaseMensual ? parseFloat(sueldoBaseMensual) : 5000.00,
        diaPagoSueldo: diaPagoSueldo ? parseInt(diaPagoSueldo, 10) : 30,
        metaAhorroMensual: metaAhorroMensual ? parseFloat(metaAhorroMensual) : 1000.00,
      },
    });

    return NextResponse.json({ success: true, data: usuario });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, nuevoPin, nombre, color, avatar, sueldoBaseMensual, diaPagoSueldo, metaAhorroMensual } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si se desea cambiar el PIN, validar el PIN actual si ya tenía uno
    if (nuevoPin !== undefined) {
      if (usuario.pin && pin && usuario.pin.trim() !== String(pin).trim()) {
        return NextResponse.json({ error: 'El PIN actual no coincide' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (nuevoPin !== undefined) updateData.pin = nuevoPin ? String(nuevoPin).trim() : null;
    if (nombre) updateData.nombre = nombre.trim();
    if (color) updateData.color = color;
    if (avatar) updateData.avatar = avatar;
    if (sueldoBaseMensual !== undefined) updateData.sueldoBaseMensual = parseFloat(sueldoBaseMensual);
    if (diaPagoSueldo !== undefined) updateData.diaPagoSueldo = parseInt(diaPagoSueldo, 10);
    if (metaAhorroMensual !== undefined) updateData.metaAhorroMensual = parseFloat(metaAhorroMensual);

    const updated = await prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, usuario: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

