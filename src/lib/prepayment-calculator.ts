/**
 * Calculadora y Simulador de Prepagos de Préstamos Bancarios
 * Permite calcular el impacto de prepagar parte del capital (por ejemplo con la gratificación).
 */

export interface SimulacionPrepago {
  montoPrepagar: number;
  saldoActualAproximado: number;
  cuotasRestantes: number;
  cuotaActual: number;
  // Opción 1: Reducción de Plazo (mantener monto de cuota, reducir número de meses)
  opcionPlazo: {
    mesesAhorrados: number;
    nuevasCuotasRestantes: number;
    interesAhorradoAproximado: number;
    fechaFinalizacionAntes: string;
  };
  // Opción 2: Reducción de Cuota (mantener plazo original, reducir monto de cada cuota)
  opcionCuota: {
    nuevaCuotaMensual: number;
    ahorroMensual: number;
    interesAhorradoAproximado: number;
  };
}

export function simularPrepago(params: {
  montoTotal: number;
  montoCuota: number;
  cuotaActualNumero: number;
  cuotasTotales: number;
  montoPrepagar: number;
  tasaAnualTEA?: number; // TEA % (ej: 14.5%)
}): SimulacionPrepago {
  const {
    montoTotal,
    montoCuota,
    cuotaActualNumero,
    cuotasTotales,
    montoPrepagar,
    tasaAnualTEA = 14.5,
  } = params;

  const cuotasRestantes = Math.max(0, cuotasTotales - cuotaActualNumero);
  const tem = Math.pow(1 + tasaAnualTEA / 100, 1 / 12) - 1; // Tasa Efectiva Mensual

  // Estimación del saldo de capital pendiente mediante valor presente de las cuotas restantes
  let saldoPendiente = 0;
  if (tem > 0 && cuotasRestantes > 0) {
    saldoPendiente = montoCuota * ((1 - Math.pow(1 + tem, -cuotasRestantes)) / tem);
  } else {
    saldoPendiente = montoCuota * cuotasRestantes;
  }

  const prepagoEfectivo = Math.min(montoPrepagar, saldoPendiente);
  const nuevoSaldo = Math.max(0, saldoPendiente - prepagoEfectivo);

  // 1. OPCIÓN REDUCCIÓN DE PLAZO
  let nuevasCuotasRestantes = 0;
  let mesesAhorrados = 0;
  let interesAhorradoPlazo = 0;

  if (nuevoSaldo <= 0) {
    mesesAhorrados = cuotasRestantes;
    nuevasCuotasRestantes = 0;
    interesAhorradoPlazo = (cuotasRestantes * montoCuota) - prepagoEfectivo;
  } else if (tem > 0 && montoCuota > nuevoSaldo * tem) {
    // n = -ln(1 - (P * i / R)) / ln(1 + i)
    const n = -Math.log(1 - (nuevoSaldo * tem / montoCuota)) / Math.log(1 + tem);
    nuevasCuotasRestantes = Math.ceil(n);
    mesesAhorrados = Math.max(0, cuotasRestantes - nuevasCuotasRestantes);

    const totalSinPrepago = cuotasRestantes * montoCuota;
    const totalConPrepago = prepagoEfectivo + (nuevasCuotasRestantes * montoCuota);
    interesAhorradoPlazo = Math.max(0, totalSinPrepago - totalConPrepago);
  } else {
    nuevasCuotasRestantes = Math.max(1, Math.round(nuevoSaldo / montoCuota));
    mesesAhorrados = Math.max(0, cuotasRestantes - nuevasCuotasRestantes);
    interesAhorradoPlazo = mesesAhorrados * (montoCuota * 0.25);
  }

  // 2. OPCIÓN REDUCCIÓN DE CUOTA
  let nuevaCuotaMensual = 0;
  let ahorroMensual = 0;
  let interesAhorradoCuota = 0;

  if (nuevoSaldo <= 0 || cuotasRestantes === 0) {
    nuevaCuotaMensual = 0;
    ahorroMensual = montoCuota;
    interesAhorradoCuota = (cuotasRestantes * montoCuota) - prepagoEfectivo;
  } else if (tem > 0) {
    // R = P * (i * (1+i)^n) / ((1+i)^n - 1)
    nuevaCuotaMensual = Number((nuevoSaldo * (tem * Math.pow(1 + tem, cuotasRestantes)) / (Math.pow(1 + tem, cuotasRestantes) - 1)).toFixed(2));
    ahorroMensual = Math.max(0, Number((montoCuota - nuevaCuotaMensual).toFixed(2)));

    const totalSinPrepago = cuotasRestantes * montoCuota;
    const totalConPrepago = prepagoEfectivo + (cuotasRestantes * nuevaCuotaMensual);
    interesAhorradoCuota = Math.max(0, Number((totalSinPrepago - totalConPrepago).toFixed(2)));
  } else {
    nuevaCuotaMensual = Number((nuevoSaldo / cuotasRestantes).toFixed(2));
    ahorroMensual = Math.max(0, Number((montoCuota - nuevaCuotaMensual).toFixed(2)));
    interesAhorradoCuota = ahorroMensual * cuotasRestantes * 0.2;
  }

  return {
    montoPrepagar: prepagoEfectivo,
    saldoActualAproximado: Number(saldoPendiente.toFixed(2)),
    cuotasRestantes,
    cuotaActual: montoCuota,
    opcionPlazo: {
      mesesAhorrados,
      nuevasCuotasRestantes,
      interesAhorradoAproximado: Number(interesAhorradoPlazo.toFixed(2)),
      fechaFinalizacionAntes: `${mesesAhorrados} meses antes`,
    },
    opcionCuota: {
      nuevaCuotaMensual,
      ahorroMensual,
      interesAhorradoAproximado: Number(interesAhorradoCuota.toFixed(2)),
    },
  };
}
