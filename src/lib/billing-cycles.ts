/**
 * Lógica de Facturación y Ciclos de Tarjetas de Crédito
 */

export interface CalculoFacturacion {
  periodoPago: string;      // YYYY-MM
  fechaLimitePago: Date;    // Fecha aproximada de fin de mes
  esMesSiguiente: boolean;  // True si la compra fue después del día de corte
  descripcionExplicativa: string;
}

/**
 * Calcula el periodo (YYYY-MM) en el que se liquida la compra de tarjeta de crédito
 * en base a su fecha de compra y el día de corte (por defecto día 10).
 * 
 * Regla:
 * - Compras hasta el día de corte (ej. <= 10): Se pagan con el sueldo a fines de ese mismo mes.
 * - Compras después del día de corte (ej. >= 11): Se pagan con el sueldo a fines del mes siguiente.
 */
export function calcularPeriodoFacturacion(
  fechaCompra: Date | string,
  diaCorte: number = 10,
  diaPago: number = 30
): CalculoFacturacion {
  const date = typeof fechaCompra === 'string' ? new Date(fechaCompra) : fechaCompra;
  const dia = date.getDate();
  const anio = date.getFullYear();
  const mes = date.getMonth(); // 0-indexed (0 = Enero, 10 = Noviembre)

  let anioPago = anio;
  let mesPago = mes;
  let esMesSiguiente = false;

  if (dia <= diaCorte) {
    // Entra en la facturación del mes actual y se paga a fines del mes actual
    anioPago = anio;
    mesPago = mes;
    esMesSiguiente = false;
  } else {
    // Ya cerró el corte de este mes; pasa a la facturación del siguiente mes
    const siguiente = new Date(anio, mes + 1, 1);
    anioPago = siguiente.getFullYear();
    mesPago = siguiente.getMonth();
    esMesSiguiente = true;
  }

  // Generar periodo YYYY-MM
  const periodoPago = `${anioPago}-${String(mesPago + 1).padStart(2, '0')}`;

  // Calcular último día del mes de pago
  const ultimoDiaMes = new Date(anioPago, mesPago + 1, 0).getDate();
  const diaEfectivo = Math.min(diaPago, ultimoDiaMes);
  const fechaLimitePago = new Date(anioPago, mesPago, diaEfectivo);

  const descripcionExplicativa = esMesSiguiente
    ? `Compra realizada el día ${dia} (posterior al corte del día ${diaCorte}). Se facturará para pagarse a fines del próximo mes (${periodoPago}).`
    : `Compra realizada el día ${dia} (antes o en el corte del día ${diaCorte}). Se pagará a fines de este mismo mes (${periodoPago}).`;

  return {
    periodoPago,
    fechaLimitePago,
    esMesSiguiente,
    descripcionExplicativa,
  };
}

/**
 * Genera periodos subsiguientes para compras en N cuotas
 */
export function calcularCuotasPeriodos(periodoInicial: string, totalCuotas: number): string[] {
  const [anioStr, mesStr] = periodoInicial.split('-');
  const anio = parseInt(anioStr, 10);
  const mes = parseInt(mesStr, 10) - 1;

  const periodos: string[] = [];
  for (let i = 0; i < totalCuotas; i++) {
    const d = new Date(anio, mes + i, 1);
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    periodos.push(p);
  }
  return periodos;
}
