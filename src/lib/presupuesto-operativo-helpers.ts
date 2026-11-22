export interface ItemPorcentaje {
  id: string;
  porcentaje: number;
  [key: string]: any;
}

/**
 * Calcula el monto diario y semanal de un sobre o límite.
 * Una semana son estrictamente 7 días del ritmo diario, garantizando
 * coherencia exacta: montoSemanal = montoDiario * 7.
 */
export function calcularMetricasSobre(
  monto: number,
  diasTotales: number
): { montoDiario: number; montoSemanal: number } {
  const montoDiario = diasTotales > 0 ? Number((monto / diasTotales).toFixed(2)) : 0;
  const montoSemanal = Number((montoDiario * 7).toFixed(2));
  return { montoDiario, montoSemanal };
}

/**
 * Normaliza cualquier lista de porcentajes para que sumen exactamente 100%
 * usando el método del resto mayor (Hare-Niemeyer).
 */
export function normalizarSuma100<T extends ItemPorcentaje>(sobres: T[]): T[] {
  if (sobres.length === 0) return sobres;
  if (sobres.length === 1) {
    return [{ ...sobres[0], porcentaje: 100 }];
  }

  const suma = sobres.reduce((acc, s) => acc + (s.porcentaje || 0), 0);
  if (suma === 100) return sobres;

  const items = sobres.map((s, index) => {
    const ideal = suma > 0 ? (s.porcentaje / suma) * 100 : 100 / sobres.length;
    const baseFloor = Math.floor(ideal);
    const remainder = ideal - baseFloor;
    return { id: s.id, baseFloor, remainder, originalIndex: index, sobre: s };
  });

  const sumaBase = items.reduce((acc, item) => acc + item.baseFloor, 0);
  const diff = 100 - sumaBase;

  const ordenados = [...items].sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 0.000001) {
      return b.remainder - a.remainder;
    }
    return a.originalIndex - b.originalIndex;
  });

  const idsConBonus = new Set<string>();
  for (let i = 0; i < diff; i++) {
    idsConBonus.add(ordenados[i].id);
  }

  return items.map((item) => ({
    ...item.sobre,
    porcentaje: item.baseFloor + (idsConBonus.has(item.id) ? 1 : 0),
  }));
}

/**
 * Redistribuye los porcentajes cuando se modifica uno específico,
 * asegurando que todos los indicadores SIEMPRE sumen exactamente 100%.
 * Si se sube o baja uno, la diferencia se redistribuye proporcionalmente
 * entre los demás mediante el método del resto mayor (Hare-Niemeyer).
 */
export function redistribuirPorcentajes<T extends ItemPorcentaje>(
  sobres: T[],
  idModificado: string,
  nuevoPorcentaje: number
): T[] {
  if (sobres.length === 0) return sobres;
  if (sobres.length === 1) {
    return [{ ...sobres[0], porcentaje: 100 }];
  }

  // Clampear entre 0 y 100
  const targetPct = Math.max(0, Math.min(100, Math.round(nuevoPorcentaje)));
  const restante = 100 - targetPct;

  const otrosSobres = sobres.filter((s) => s.id !== idModificado);
  const sumaOtros = otrosSobres.reduce((acc, s) => acc + (s.porcentaje || 0), 0);

  const items = otrosSobres.map((s, index) => {
    let ideal: number;
    if (sumaOtros > 0) {
      ideal = (s.porcentaje / sumaOtros) * restante;
    } else {
      ideal = restante / otrosSobres.length;
    }
    const baseFloor = Math.floor(ideal);
    const remainder = ideal - baseFloor;
    return {
      id: s.id,
      baseFloor,
      remainder,
      originalIndex: index,
      sobre: s,
    };
  });

  const sumaBase = items.reduce((acc, item) => acc + item.baseFloor, 0);
  const diff = restante - sumaBase;

  const ordenados = [...items].sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 0.000001) {
      return b.remainder - a.remainder;
    }
    return a.originalIndex - b.originalIndex;
  });

  const idsConBonus = new Set<string>();
  for (let i = 0; i < diff; i++) {
    idsConBonus.add(ordenados[i].id);
  }

  const mapaNuevosPct = new Map<string, number>();
  for (const item of items) {
    mapaNuevosPct.set(item.id, item.baseFloor + (idsConBonus.has(item.id) ? 1 : 0));
  }

  return sobres.map((s) => {
    if (s.id === idModificado) {
      return { ...s, porcentaje: targetPct };
    }
    return { ...s, porcentaje: mapaNuevosPct.get(s.id) ?? 0 };
  });
}

/**
 * Redistribuye los porcentajes tras eliminar un sobre para mantener el 100%.
 */
export function redistribuirAlEliminar<T extends ItemPorcentaje>(
  sobres: T[],
  idAEliminar: string
): T[] {
  const restantes = sobres.filter((s) => s.id !== idAEliminar);
  return normalizarSuma100(restantes);
}

/**
 * Calcula los montos en moneda local (total, semanal y diario) para cada sobre,
 * ajustando posibles diferencias de céntimos por redondeo para que la suma cuadre exacta.
 */
export function calcularMontosSobres<T extends ItemPorcentaje>(
  sobres: T[],
  capitalOperativo: number,
  diasTotales: number
): Array<T & { monto: number; montoSemanal: number; montoDiario: number }> {
  if (sobres.length === 0) return [];

  const resultado = sobres.map((s) => {
    const pct = Math.max(0, Math.min(100, Math.round(s.porcentaje)));
    const monto = Number(((capitalOperativo * pct) / 100).toFixed(2));
    const { montoDiario, montoSemanal } = calcularMetricasSobre(monto, diasTotales);
    return {
      ...s,
      porcentaje: pct,
      monto,
      montoSemanal,
      montoDiario,
    };
  });

  // Si la suma de porcentajes es 100%, ajustar discrepancias de redondeo al sobre con mayor peso
  const sumaPorcentajes = resultado.reduce((acc, s) => acc + s.porcentaje, 0);
  if (sumaPorcentajes === 100 && capitalOperativo > 0) {
    const sumaMontos = Number(resultado.reduce((acc, s) => acc + s.monto, 0).toFixed(2));
    const diffCents = Number((capitalOperativo - sumaMontos).toFixed(2));
    if (diffCents !== 0 && Math.abs(diffCents) <= 0.05) {
      let maxIdx = 0;
      for (let i = 1; i < resultado.length; i++) {
        if (resultado[i].porcentaje > resultado[maxIdx].porcentaje) {
          maxIdx = i;
        }
      }
      const nuevoMonto = Number((resultado[maxIdx].monto + diffCents).toFixed(2));
      const { montoDiario, montoSemanal } = calcularMetricasSobre(nuevoMonto, diasTotales);
      resultado[maxIdx] = {
        ...resultado[maxIdx],
        monto: nuevoMonto,
        montoDiario,
        montoSemanal,
      };
    }
  }

  return resultado;
}
