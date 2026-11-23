import { EstadoPago } from '@prisma/client';
import { EgresoConsolidado, ResumenDivisasEgresos } from './types';

export function calcularResumenDivisas(
  egresosConsolidados: EgresoConsolidado[],
  totalEgresos: number,
  tipoCambioConfigurado: number = 4.0
): ResumenDivisasEgresos {
  let sTotal = 0;
  let sPendiente = 0;
  let sPagado = 0;
  let sAdelantado = 0;
  let sConteo = 0;
  let sConteoPendiente = 0;

  let dTotalUSD = 0;
  let dPendienteUSD = 0;
  let dPagadoUSD = 0;
  let dAdelantadoUSD = 0;
  let dConteo = 0;
  let dConteoPendiente = 0;

  for (const item of egresosConsolidados) {
    if (item.monedaOriginal === 'USD') {
      const montoUSD = item.montoOriginal != null
        ? item.montoOriginal
        : Number((item.monto / tipoCambioConfigurado).toFixed(2));

      dTotalUSD += montoUSD;
      dConteo += 1;

      if (item.estado === EstadoPago.PENDIENTE) {
        dPendienteUSD += montoUSD;
        dConteoPendiente += 1;
      } else if (item.estado === EstadoPago.PAGADO) {
        dPagadoUSD += montoUSD;
      } else if (item.estado === EstadoPago.ADELANTADO) {
        dAdelantadoUSD += montoUSD;
      }
    } else {
      const montoPEN = item.monto;
      sTotal += montoPEN;
      sConteo += 1;

      if (item.estado === EstadoPago.PENDIENTE) {
        sPendiente += montoPEN;
        sConteoPendiente += 1;
      } else if (item.estado === EstadoPago.PAGADO) {
        sPagado += montoPEN;
      } else if (item.estado === EstadoPago.ADELANTADO) {
        sAdelantado += montoPEN;
      }
    }
  }

  const sTotalNum = Number(sTotal.toFixed(2));
  const sPendienteNum = Number(sPendiente.toFixed(2));
  const dTotalUSDNum = Number(dTotalUSD.toFixed(2));
  const dPendienteUSDNum = Number(dPendienteUSD.toFixed(2));

  const dTotalPENNum = Number((dTotalUSDNum * tipoCambioConfigurado).toFixed(2));
  const dPendientePENNum = Number((dPendienteUSDNum * tipoCambioConfigurado).toFixed(2));
  const dPagadoPENNum = Number((Number(dPagadoUSD.toFixed(2)) * tipoCambioConfigurado).toFixed(2));
  const dAdelantadoPENNum = Number((Number(dAdelantadoUSD.toFixed(2)) * tipoCambioConfigurado).toFixed(2));

  const totalConsolidado = Number((sTotalNum + dTotalPENNum).toFixed(2));
  const totalPendienteConsolidado = Number((sPendienteNum + dPendientePENNum).toFixed(2));

  // Solo se considera que tiene múltiples monedas si existen compromisos en USD pendientes de pago.
  // Si los egresos en dólares ya fueron adelantados o pagados (dPendienteUSDNum === 0), no hay divisa extranjera por liquidar
  // y por ende ya no debe mostrarse el resumen de divisas en el dashboard.
  const tieneMultiplesMonedas = sConteo > 0 && dConteo > 0 && dPendienteUSDNum > 0;

  const porcentajeSoles = totalPendienteConsolidado > 0
    ? Number(((sPendienteNum / totalPendienteConsolidado) * 100).toFixed(1))
    : 0;
  const porcentajeDolares = totalPendienteConsolidado > 0
    ? Number(((dPendientePENNum / totalPendienteConsolidado) * 100).toFixed(1))
    : 0;

  return {
    soles: {
      total: sTotalNum,
      pendiente: sPendienteNum,
      pagado: Number(sPagado.toFixed(2)),
      adelantado: Number(sAdelantado.toFixed(2)),
      porcentaje: porcentajeSoles,
      conteo: sConteo,
      conteoPendiente: sConteoPendiente,
    },
    dolares: {
      totalUSD: dTotalUSDNum,
      total: dTotalPENNum,
      pendienteUSD: dPendienteUSDNum,
      pendiente: dPendientePENNum,
      pagadoUSD: Number(dPagadoUSD.toFixed(2)),
      pagado: dPagadoPENNum,
      adelantadoUSD: Number(dAdelantadoUSD.toFixed(2)),
      adelantado: dAdelantadoPENNum,
      tipoCambio: tipoCambioConfigurado,
      tipoCambioPromedio: tipoCambioConfigurado,
      porcentaje: porcentajeDolares,
      conteo: dConteo,
      conteoPendiente: dConteoPendiente,
    },
    tieneMultiplesMonedas,
    consolidado: {
      totalEgresosPEN: totalConsolidado,
      totalPendientePEN: totalPendienteConsolidado,
      totalPagadoPEN: Number((Number(sPagado.toFixed(2)) + dPagadoPENNum).toFixed(2)),
      totalAdelantadoPEN: Number((Number(sAdelantado.toFixed(2)) + dAdelantadoPENNum).toFixed(2)),
      totalCompromisos: sConteo + dConteo,
      totalPendientes: sConteoPendiente + dConteoPendiente,
      cuadraSumatoria: Math.abs(totalConsolidado - totalEgresos) < 0.05,
    },
  };
}
