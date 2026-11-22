export interface ItemPorcentaje {
  id: string;
  porcentaje: number;
  bloqueado?: boolean;
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
  if (suma === 100) return sobres;

    const bloqueados = sobres.filter((s) => s.bloqueado);
    const variables = sobres.filter((s) => !s.bloqueado);

    // Si todos están bloqueados o no hay variables, normalizar proporcionalmente entre todos
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
 * Redistribuye los porcentajes cuando se modifica uno específico,
 * asegurando que todos los indicadores SIEMPRE sumen exactamente 100%.
 *
 * Respeta el candado (bloqueado: true):
 * - Los sobres bloqueados no se modifican.
 * - Si el sobre modificado es el único variable, absorbe estrictamente (100 - sumaBloqueados).
 * - La diferencia se redistribuye proporcionalmente SOLO entre los demás sobres variables.
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

          const otrosSobres = sobres.filter((s) => s.id !== idModificado);
          const otrosBloqueados = otrosSobres.filter((s) => s.bloqueado);
          const otrosVariables = otrosSobres.filter((s) => !s.bloqueado);

          const sumaBloqueados = otrosBloqueados.reduce((acc, s) => acc + (s.porcentaje || 0), 0);
          const maxDisponible = Math.max(0, 100 - sumaBloqueados);

          // Si no quedan otros sobres variables, el modificado debe asumir exactamente todo el remanente disponible
          if (otrosVariables.length === 0) {
            return sobres.map((s) => {
              if (s.id === idModificado) {
                return { ...s, porcentaje: maxDisponible };
              }
              return s;
            });
          }

          // Clampear el valor deseado entre 0 y el máximo disponible
          const targetPct = Math.max(0, Math.min(maxDisponible, Math.round(nuevoPorcentaje)));
          const restanteParaVariables = maxDisponible - targetPct;

          const variablesRedistribuidas = distribuirHareNiemeyer(otrosVariables, restanteParaVariables);
          const mapaVariables = new Map<string, number>(variablesRedistribuidas.map((v) => [v.id, v.porcentaje]));

          return sobres.map((s) => {
            if (s.id === idModificado) {
              return { ...s, porcentaje: targetPct };
            }
            if (s.bloqueado) {
              return s;
            }
            return { ...s, porcentaje: mapaVariables.get(s.id) ?? 0 };
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
