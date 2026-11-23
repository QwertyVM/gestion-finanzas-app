export interface ItemPorcentaje {
  id: string;
  porcentaje: number;
  bloqueado?: boolean;
  monto?: number;
  montoSemanal?: number;
  montoDiario?: number;
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
 * usando el método del resto mayor (Hare-Niemeyer), respetando los sobres bloqueados.
 */
export function normalizarSuma100<T extends ItemPorcentaje>(sobres: T[]): T[] {
  if (sobres.length === 0) return sobres;
  if (sobres.length === 1) {
    return [{ ...sobres[0], porcentaje: 100 }];
  }

  const suma = sobres.reduce((acc, s) => acc + (s.porcentaje || 0), 0);
  if (Math.round(suma) === 100) return sobres;

  const bloqueados = sobres.filter((s) => s.bloqueado);
  const variables = sobres.filter((s) => !s.bloqueado);

  if (variables.length === 0) {
    return distribuirHareNiemeyer(sobres, 100);
  }

  const sumaBloqueados = bloqueados.reduce((acc, s) => acc + (s.porcentaje || 0), 0);
  const presupuestoParaVariables = Math.max(0, 100 - sumaBloqueados);

  const variablesNormalizadas = distribuirHareNiemeyer(variables, presupuestoParaVariables);
  const mapaVariables = new Map<string, number>(variablesNormalizadas.map((v) => [v.id, v.porcentaje]));

return sobres.map((s) => {
  if (s.bloqueado) return s;
  return { ...s, porcentaje: mapaVariables.get(s.id) ?? 0 };
});
}

/**
 * Distribuye un total meta entre un conjunto de items usando Hare-Niemeyer
 */
function distribuirHareNiemeyer<T extends ItemPorcentaje>(items: T[], totalMeta: number): T[] {
    if (items.length === 0) return items;
    if (items.length === 1) {
      return [{ ...items[0], porcentaje: totalMeta }];
    }

    const sumaActual = items.reduce((acc, s) => acc + (s.porcentaje || 0), 0);
    const calculados = items.map((s, index) => {
      const ideal = sumaActual > 0 ? (s.porcentaje / sumaActual) * totalMeta : totalMeta / items.length;
      const baseFloor = Math.floor(ideal);
      const remainder = ideal - baseFloor;
      return { id: s.id, baseFloor, remainder, originalIndex: index, item: s };
    });

    const sumaBase = calculados.reduce((acc, c) => acc + c.baseFloor, 0);
    const diff = totalMeta - sumaBase;

    const ordenados = [...calculados].sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 0.000001) {
        return b.remainder - a.remainder;
      }
      return a.originalIndex - b.originalIndex;
    });

    const idsConBonus = new Set<string>();
    for (let i = 0; i < diff; i++) {
      idsConBonus.add(ordenados[i].id);
    }

    return calculados.map((c) => ({
      ...c.item,
      porcentaje: c.baseFloor + (idsConBonus.has(c.id) ? 1 : 0),
    }));
  }

  /**
   * Redistribuye los montos cuando el usuario especifica un monto monetario exacto (ej. S/ 400, S/ 600).
   * Respeta estrictamente los montos fijados con candado y asigna el remanente a los sobres flexibles/variables.
   */
  export function redistribuirPorMonto<T extends { id: string; monto: number; porcentaje: number; bloqueado?: boolean;[key: string]: any }>(
    sobres: T[],
    idModificado: string,
    nuevoMonto: number,
    capitalTotal: number,
    diasTotales: number
  ): T[] {
    if (sobres.length === 0) return sobres;

    const otrosSobres = sobres.filter((s) => s.id !== idModificado);
    const otrosBloqueados = otrosSobres.filter((s) => s.bloqueado);
    const otrosVariables = otrosSobres.filter((s) => !s.bloqueado);

    const sumaBloqueadosMonto = Number(otrosBloqueados.reduce((acc, s) => acc + (s.monto || 0), 0).toFixed(2));
    const maxDisponible = Math.max(0, Number((capitalTotal - sumaBloqueadosMonto).toFixed(2)));

    let targetMonto = Math.max(0, Math.min(maxDisponible, Number(nuevoMonto.toFixed(2))));

    // Si no hay otros variables, el modificado debe asumir exactamente todo el remanente disponible
    if (otrosVariables.length === 0) {
      targetMonto = maxDisponible;
    }

    const restanteParaVariables = Math.max(0, Number((maxDisponible - targetMonto).toFixed(2)));

    // Distribuir restanteParaVariables entre otrosVariables
    const mapaMontosVariables = new Map<string, number>();

    if (otrosVariables.length === 1) {
      // Si solo hay un sobre flexible (ej: Bolsillo Personal & Ocio Flexible), se lleva EXACTAMENTE todo el remanente
      mapaMontosVariables.set(otrosVariables[0].id, restanteParaVariables);
    } else if (otrosVariables.length > 1) {
      const restanteCents = Math.round(restanteParaVariables * 100);
      const sumaVariablesMonto = otrosVariables.reduce((acc, s) => acc + (s.monto || 0), 0);

      const calculados = otrosVariables.map((s, index) => {
        const idealCents = sumaVariablesMonto > 0 ? (s.monto / sumaVariablesMonto) * restanteCents : restanteCents / otrosVariables.length;
        const baseFloor = Math.floor(idealCents);
        const remainder = idealCents - baseFloor;
        return { id: s.id, baseFloor, remainder, originalIndex: index };
      });

      const diff = restanteCents - calculados.reduce((acc, c) => acc + c.baseFloor, 0);
      const ordenados = [...calculados].sort((a, b) => {
        if (Math.abs(b.remainder - a.remainder) > 0.000001) {
          return b.remainder - a.remainder;
        }
        return a.originalIndex - b.originalIndex;
      });

      const idsConBonus = new Set<string>();
      for (let i = 0; i < diff; i++) {
        idsConBonus.add(ordenados[i].id);
      }

      for (const c of calculados) {
        const cents = c.baseFloor + (idsConBonus.has(c.id) ? 1 : 0);
        mapaMontosVariables.set(c.id, Number((cents / 100).toFixed(2)));
      }
    }

    return sobres.map((s) => {
      let finalMonto = s.monto;
      if (s.id === idModificado) {
        finalMonto = targetMonto;
      } else if (s.bloqueado) {
        finalMonto = s.monto;
      } else {
        finalMonto = mapaMontosVariables.get(s.id) ?? 0;
      }

      finalMonto = Number(finalMonto.toFixed(2));
      const porcentaje = capitalTotal > 0 ? Number(((finalMonto / capitalTotal) * 100).toFixed(1)) : 0;
      const { montoDiario, montoSemanal } = calcularMetricasSobre(finalMonto, diasTotales);

    return {
      ...s,
      monto: finalMonto,
      porcentaje,
      montoDiario,
      montoSemanal,
    };
  });
}

/**
 * Conmuta el estado de fijación / candado de un sobre.
 */
  export function toggleBloqueoSobre<T extends ItemPorcentaje>(
    sobres: T[],
    id: string
  ): T[] {
    return sobres.map((s) =>
      s.id === id ? { ...s, bloqueado: !s.bloqueado } : s
    );
  }

  /**
   * Redistribuye los porcentajes tras eliminar un sobre para mantener el 100%.
   */
  export function redistribuirAlEliminar<T extends { id: string; monto: number; porcentaje: number; bloqueado?: boolean;[key: string]: any }>(
    sobres: T[],
    idAEliminar: string,
    capitalTotal: number,
    diasTotales: number
  ): T[] {
    const restantes = sobres.filter((s) => s.id !== idAEliminar);
    if (restantes.length === 0) return [];
    const primerVariable = restantes.find((s) => !s.bloqueado) || restantes[0];
    return sincronizarSobresConCapital(restantes, capitalTotal, diasTotales);
  }

  /**
   * Sincroniza los sobres con el capital total disponible.
   * Preserva estrictamente los montos de los sobres bloqueados con candado
   * y reparte el saldo restante entre los sobres flexibles (variables).
   */
  export function sincronizarSobresConCapital<T extends { id: string; monto?: number; porcentaje: number; bloqueado?: boolean;[key: string]: any }>(
    sobres: T[],
    capitalTotal: number,
    diasTotales: number
  ): Array<T & { monto: number; montoSemanal: number; montoDiario: number; porcentaje: number }> {
    if (sobres.length === 0) return [];

    // Identificar los sobres que tienen candado y un monto válido
    const bloqueados = sobres.filter((s) => s.bloqueado && s.monto !== undefined && s.monto > 0);
    const variables = sobres.filter((s) => !s.bloqueado || s.monto === undefined || s.monto <= 0);

    const sumaBloqueadosMonto = Number(bloqueados.reduce((acc, s) => acc + (s.monto || 0), 0).toFixed(2));
    const remanenteVariables = Math.max(0, Number((capitalTotal - sumaBloqueadosMonto).toFixed(2)));

    const mapaMontos = new Map<string, number>();
    for (const b of bloqueados) {
      mapaMontos.set(b.id, Number((b.monto || 0).toFixed(2)));
    }

  if (variables.length === 1) {
    // Si solo hay un sobre flexible, absorbe exactamente todo el remanente
    mapaMontos.set(variables[0].id, remanenteVariables);
  } else if (variables.length > 1) {
    const sumaPesos = variables.reduce((acc, s) => acc + (s.monto && s.monto > 0 ? s.monto : s.porcentaje || 0), 0);
    const remanenteCents = Math.round(remanenteVariables * 100);

    const calculados = variables.map((s, index) => {
      const peso = s.monto && s.monto > 0 ? s.monto : s.porcentaje || 0;
      const idealCents = sumaPesos > 0 ? (peso / sumaPesos) * remanenteCents : remanenteCents / variables.length;
      const baseFloor = Math.floor(idealCents);
      const remainder = idealCents - baseFloor;
      return { id: s.id, baseFloor, remainder, originalIndex: index };
    });

    const diff = remanenteCents - calculados.reduce((acc, c) => acc + c.baseFloor, 0);
    const ordenados = [...calculados].sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 0.000001) {
        return b.remainder - a.remainder;
      }
      return a.originalIndex - b.originalIndex;
    });

      const idsConBonus = new Set<string>();
      for (let i = 0; i < diff; i++) {
        idsConBonus.add(ordenados[i].id);
      }

      for (const c of calculados) {
        const cents = c.baseFloor + (idsConBonus.has(c.id) ? 1 : 0);
        mapaMontos.set(c.id, Number((cents / 100).toFixed(2)));
      }
    }

  return sobres.map((s) => {
    const finalMonto = mapaMontos.get(s.id) ?? Number((((capitalTotal * (s.porcentaje || 0)) / 100)).toFixed(2));
    const porcentaje = capitalTotal > 0 ? Number(((finalMonto / capitalTotal) * 100).toFixed(1)) : 0;
    const { montoDiario, montoSemanal } = calcularMetricasSobre(finalMonto, diasTotales);
    return {
      ...s,
      monto: finalMonto,
      porcentaje,
      montoDiario,
      montoSemanal,
    };
  });
}
