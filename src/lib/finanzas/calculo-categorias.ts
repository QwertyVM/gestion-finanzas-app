import { EstadoPago } from '@prisma/client';
import { EgresoConsolidado, AnalisisCategoriasResumen, CategoriaAnalisisItem, TagClasificacionItem, MetodoPagoAnalisisItem, TarjetaAnalisisItem } from './types';
import { obtenerColorCategoriaBackend } from './clasificacion';

export function calcularAnalisisCategoriasYTags(
  egresosConsolidados: EgresoConsolidado[],
  totalEgresos: number
): AnalisisCategoriasResumen {
  const mapCategorias = new Map<
    string,
    {
      id: string;
      nombre: string;
      color: string;
      icono: string;
      totalMonto: number;
      conteoItems: number;
      desgloseClasificacion: { fijo: number; prestamos: number; cuotas: number; variables: number };
      desgloseEstado: { pagado: number; adelantado: number; pendiente: number };
      items: EgresoConsolidado[];
    }
  >();

  for (const item of egresosConsolidados) {
    const catNombre = item.categoria || 'General';
    let entry = mapCategorias.get(catNombre);
    if (!entry) {
      entry = {
        id: catNombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        nombre: catNombre,
        color: item.categoriaColor || obtenerColorCategoriaBackend(catNombre).color,
        icono: item.categoriaIcono || obtenerColorCategoriaBackend(catNombre).icono,
        totalMonto: 0,
        conteoItems: 0,
        desgloseClasificacion: { fijo: 0, prestamos: 0, cuotas: 0, variables: 0 },
        desgloseEstado: { pagado: 0, adelantado: 0, pendiente: 0 },
        items: [],
      };
      mapCategorias.set(catNombre, entry);
    }

    entry.totalMonto += item.monto;
    entry.conteoItems++;
    entry.items.push(item);

    if (item.clasificacion === 'FIJO') {
      entry.desgloseClasificacion.fijo += item.monto;
    } else if (item.clasificacion === 'PRESTAMO') {
      entry.desgloseClasificacion.prestamos += item.monto;
    } else if (item.clasificacion === 'CUOTA') {
      entry.desgloseClasificacion.cuotas += item.monto;
    } else {
      entry.desgloseClasificacion.variables += item.monto;
    }

    if (item.estado === EstadoPago.PAGADO) {
      entry.desgloseEstado.pagado += item.monto;
    } else if (item.estado === EstadoPago.ADELANTADO) {
      entry.desgloseEstado.adelantado += item.monto;
    } else {
      entry.desgloseEstado.pendiente += item.monto;
    }
  }

  const categorias: CategoriaAnalisisItem[] = Array.from(mapCategorias.values())
    .map((c) => {
      const totalM = Number(c.totalMonto.toFixed(2));
      const pagadoTot = c.desgloseEstado.pagado + c.desgloseEstado.adelantado;

      // Minitags agrupados
      const mapMinitags = new Map<string, { tag: string; totalMonto: number; conteo: number }>();
      for (const it of c.items) {
        const tagName = it.tag || 'Sin minitag';
        const tagEntry = mapMinitags.get(tagName) || { tag: tagName, totalMonto: 0, conteo: 0 };
        tagEntry.totalMonto += it.monto;
        tagEntry.conteo++;
        mapMinitags.set(tagName, tagEntry);
      }
      const minitags = Array.from(mapMinitags.values())
        .map((t) => ({ ...t, totalMonto: Number(t.totalMonto.toFixed(2)) }))
        .sort((a, b) => b.totalMonto - a.totalMonto);

      return {
        id: c.id,
        nombre: c.nombre,
        color: c.color,
        icono: c.icono,
        totalMonto: totalM,
        porcentaje: totalEgresos > 0 ? Number(((totalM / totalEgresos) * 100).toFixed(1)) : 0,
        conteoItems: c.conteoItems,
        minitags,
        desgloseClasificacion: {
          fijo: Number(c.desgloseClasificacion.fijo.toFixed(2)),
          prestamos: Number(c.desgloseClasificacion.prestamos.toFixed(2)),
          cuotas: Number(c.desgloseClasificacion.cuotas.toFixed(2)),
          variables: Number(c.desgloseClasificacion.variables.toFixed(2)),
        },
        desgloseEstado: {
          pagado: Number(c.desgloseEstado.pagado.toFixed(2)),
          adelantado: Number(c.desgloseEstado.adelantado.toFixed(2)),
          pendiente: Number(c.desgloseEstado.pendiente.toFixed(2)),
        },
        porcentajePagado: totalM > 0 ? Number(((pagadoTot / totalM) * 100).toFixed(1)) : 0,
        items: c.items,
      };
    })
    .sort((a, b) => b.totalMonto - a.totalMonto);

  const totalCategoriasActivas = categorias.length;
  const categoriaMayorGasto = categorias.length > 0 ? {
    nombre: categorias[0].nombre,
    monto: categorias[0].totalMonto,
    porcentaje: categorias[0].porcentaje,
    color: categorias[0].color,
    icono: categorias[0].icono,
  } : null;

  const promedioGastoPorCategoria = totalCategoriasActivas > 0
    ? Number((totalEgresos / totalCategoriasActivas).toFixed(2))
    : 0;

  let totalComprometido = 0;
  let totalFlexible = 0;
  for (const item of egresosConsolidados) {
    if (item.clasificacion === 'VARIABLE') {
      totalFlexible += item.monto;
    } else {
      totalComprometido += item.monto;
    }
  }

  const porcentajeComprometido = totalEgresos > 0 ? Number(((totalComprometido / totalEgresos) * 100).toFixed(1)) : 0;
  const porcentajeFlexible = totalEgresos > 0 ? Number(((totalFlexible / totalEgresos) * 100).toFixed(1)) : 0;

  let nivelCompromiso: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO' = 'BAJO';
  if (porcentajeComprometido >= 80) nivelCompromiso = 'CRITICO';
  else if (porcentajeComprometido >= 65) nivelCompromiso = 'ALTO';
  else if (porcentajeComprometido >= 45) nivelCompromiso = 'MODERADO';

  const top5Categorias = categorias.slice(0, 5).map((c) => ({
    nombre: c.nombre,
    monto: c.totalMonto,
    porcentaje: c.porcentaje,
    color: c.color,
    icono: c.icono,
  }));

  const configClasif = [
    { id: 'FIJO' as const, nombre: 'Costos Fijos', badgeLabel: 'Fijo', tipoLabel: 'Costo Fijo', colorHex: '#0284c7', colorKey: 'sky' as const, icono: 'Home' },
    { id: 'PRESTAMO' as const, nombre: 'Préstamos Bancarios', badgeLabel: 'Préstamo', tipoLabel: 'Préstamo Bancario', colorHex: '#7c3aed', colorKey: 'purple' as const, icono: 'Landmark' },
    { id: 'CUOTA' as const, nombre: 'Compras en Cuotas', badgeLabel: 'Cuota', tipoLabel: 'Compra en Cuotas', colorHex: '#4f46e5', colorKey: 'indigo' as const, icono: 'Layers' },
    { id: 'VARIABLE' as const, nombre: 'Compras Variables', badgeLabel: 'Variable', tipoLabel: 'Compra / Variable', colorHex: '#0d9488', colorKey: 'teal' as const, icono: 'Banknote' },
  ];

  const clasificaciones: TagClasificacionItem[] = configClasif.map((cfg) => {
    const items = egresosConsolidados.filter((e) => e.clasificacion === cfg.id);
    const total = Number(items.reduce((acc, e) => acc + e.monto, 0).toFixed(2));
    const pagado = Number(items.filter((e) => e.estado === EstadoPago.PAGADO || e.estado === EstadoPago.ADELANTADO).reduce((acc, e) => acc + e.monto, 0).toFixed(2));
    const pendiente = Number((total - pagado).toFixed(2));
    const conteo = items.length;
    const ticketPromedio = conteo > 0 ? Number((total / conteo).toFixed(2)) : 0;
    const porcentaje = totalEgresos > 0 ? Number(((total / totalEgresos) * 100).toFixed(1)) : 0;

    return {
      id: cfg.id,
      nombre: cfg.nombre,
      badgeLabel: cfg.badgeLabel,
      tipoLabel: cfg.tipoLabel,
      colorHex: cfg.colorHex,
      colorKey: cfg.colorKey,
      icono: cfg.icono,
      total,
      porcentaje,
      conteo,
      totalPagado: pagado,
      totalPendiente: pendiente,
      ticketPromedio,
    };
  });

  const metodosMap = new Map<string, { total: number; conteo: number }>();
  for (const item of egresosConsolidados) {
    const m = (item.metodoPago as string) || 'EFECTIVO_DEBITO';
    const curr = metodosMap.get(m) || { total: 0, conteo: 0 };
    curr.total += item.monto;
    curr.conteo++;
    metodosMap.set(m, curr);
  }

  const metodosConfig: Record<string, { label: string; color: string }> = {
    TARJETA_CREDITO: { label: 'Tarjeta de Crédito', color: '#6366f1' },
    EFECTIVO_DEBITO: { label: 'Efectivo / Débito', color: '#10b981' },
    TRANSFERENCIA: { label: 'Transferencia Directa', color: '#0ea5e9' },
  };

  const metodosPago: MetodoPagoAnalisisItem[] = Array.from(metodosMap.entries()).map(([metodo, data]) => {
    const cfg = metodosConfig[metodo] || { label: metodo, color: '#64748b' };
    const tot = Number(data.total.toFixed(2));
    return {
      metodo,
      label: cfg.label,
      total: tot,
      porcentaje: totalEgresos > 0 ? Number(((tot / totalEgresos) * 100).toFixed(1)) : 0,
      conteo: data.conteo,
      color: cfg.color,
    };
  }).sort((a, b) => b.total - a.total);

  const tarjetasMap = new Map<string, { id: string; nombre: string; banco: string; color: string; total: number; conteo: number }>();
  for (const item of egresosConsolidados) {
    if (item.tarjetaId && item.tarjetaNombre) {
      let tEntry = tarjetasMap.get(item.tarjetaId);
      if (!tEntry) {
        tEntry = {
          id: item.tarjetaId,
          nombre: item.tarjetaNombre,
          banco: item.tarjetaBanco || 'Banco',
          color: item.tarjetaColor || '#2563eb',
          total: 0,
          conteo: 0,
        };
        tarjetasMap.set(item.tarjetaId, tEntry);
      }
      tEntry.total += item.monto;
      tEntry.conteo++;
    }
  }

  const tarjetas: TarjetaAnalisisItem[] = Array.from(tarjetasMap.values()).map((t) => {
    const tot = Number(t.total.toFixed(2));
    return {
      id: t.id,
      nombre: t.nombre,
      banco: t.banco,
      color: t.color,
      total: tot,
      porcentaje: totalEgresos > 0 ? Number(((tot / totalEgresos) * 100).toFixed(1)) : 0,
      conteo: t.conteo,
    };
  }).sort((a, b) => b.total - a.total);

  return {
    categorias,
    metricasMacro: {
      totalCategoriasActivas,
      categoriaMayorGasto,
      promedioGastoPorCategoria,
      totalGastoComprometido: Number(totalComprometido.toFixed(2)),
      porcentajeComprometido,
      totalGastoFlexible: Number(totalFlexible.toFixed(2)),
      porcentajeFlexible,
      nivelCompromiso,
      top5Categorias,
    },
    clasificaciones,
    metodosPago,
    tarjetas,
  };
}
