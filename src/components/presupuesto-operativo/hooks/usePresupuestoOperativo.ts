'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import type {
  PresupuestoOperativoData,
  SobreGastoOperativo,
  EscenarioPresupuesto,
} from '@/lib/finanzas-service';
import { toast } from 'sonner';
import {
  redistribuirPorcentajes,
  redistribuirAlEliminar,
  normalizarSuma100,
  calcularMontosSobres,
  toggleBloqueoSobre as toggleBloqueoHelper,
} from '@/lib/presupuesto-operativo-helpers';

export function usePresupuestoOperativo() {
  const { periodo, irMesAnterior, irMesSiguiente, puedeIrMesAnterior } = useFinanzas();
  const [data, setData] = useState<PresupuestoOperativoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [escenarioActivo, setEscenarioActivo] = useState<string>('EQUILIBRADO');
  const [sobresLocales, setSobresLocales] = useState<SobreGastoOperativo[]>([]);
  const [diaPagoSueldo, setDiaPagoSueldo] = useState<number>(30);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/finanzas/presupuesto-operativo?periodo=${periodo}`);
      if (!res.ok) throw new Error('Error al cargar presupuesto operativo');
      const json: PresupuestoOperativoData = await res.json();
      setData(json);
      const normalizados = normalizarSuma100(json.sobres);
      const conMontos = calcularMontosSobres(
        normalizados,
        json.capitalOperativoParaVivir,
        json.runway.diasTotales
      );
      setSobresLocales(conMontos);
      setEscenarioActivo(json.escenarioActivo || 'EQUILIBRADO');
      setDiaPagoSueldo(json.diaPagoSueldo || 30);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo cargar el presupuesto operativo');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persistir cambios al backend (con debounce para no saturar)
  const persistirEnBackend = useCallback(
    (
      sobresNuevos: SobreGastoOperativo[],
      escenariosNuevos?: EscenarioPresupuesto[],
      escenarioNuevoActivo?: string,
      nuevoDiaPago?: number
    ) => {
      if (!data) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          const payload = {
            periodoDestino: data.periodoDestino,
            diaPagoSueldo: nuevoDiaPago !== undefined ? nuevoDiaPago : diaPagoSueldo,
            sobres: sobresNuevos.map((s) => ({
              id: s.id,
              nombre: s.nombre,
              descripcion: s.descripcion,
              icono: s.icono,
              color: s.color,
              porcentaje: s.porcentaje,
              bloqueado: Boolean(s.bloqueado),
            })),
            escenarios: escenariosNuevos || data.escenarios,
            escenarioActivo: escenarioNuevoActivo || escenarioActivo,
          };

          const res = await fetch('/api/finanzas/presupuesto-operativo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error('Error al guardar presupuesto');
        } catch (e) {
          console.error(e);
          toast.error('Error al sincronizar con el servidor');
        } finally {
          setSaving(false);
        }
      }, 700);
    },
    [data, diaPagoSueldo, escenarioActivo]
  );

  const aplicarEscenario = (escenarioId: string) => {
    if (!data) return;
    const esc = data.escenarios.find((e) => e.id === escenarioId);
    if (!esc) return;

    setEscenarioActivo(escenarioId);
    const combinados = sobresLocales.map((s) => {
      const match = esc.distribucion.find((d) => d.sobreId === s.id);
      return {
        ...s,
        porcentaje: match !== undefined ? match.porcentaje : s.porcentaje,
      };
    });
    const normalizados = normalizarSuma100(combinados);
    const actualizados = calcularMontosSobres(
      normalizados,
      data.capitalOperativoParaVivir,
      data.runway.diasTotales
    );

    setSobresLocales(actualizados);
    persistirEnBackend(actualizados, data.escenarios, escenarioId);
    toast.success(`Escenario ${esc.nombre} aplicado`);
  };

  const actualizarPorcentajeSobre = (sobreId: string, nuevoPct: number) => {
    if (!data) return;
    // Redistribuir proporcionalmente para mantener siempre la suma al 100%
    const redistribuidos = redistribuirPorcentajes(sobresLocales, sobreId, nuevoPct);
    const actualizados = calcularMontosSobres(
      redistribuidos,
      data.capitalOperativoParaVivir,
      data.runway.diasTotales
    );
    setSobresLocales(actualizados);
    setEscenarioActivo('PERSONALIZADO');
    persistirEnBackend(actualizados, data.escenarios, 'PERSONALIZADO');
  };

  const actualizarMontoSobre = (sobreId: string, nuevoMonto: number) => {
    if (!data || data.capitalOperativoParaVivir <= 0) return;
    const calcPct = Math.max(
      0,
      Math.min(100, Math.round((nuevoMonto / data.capitalOperativoParaVivir) * 100))
    );
    actualizarPorcentajeSobre(sobreId, calcPct);
  };

  const autoCuadrar100 = () => {
    if (!data || sobresLocales.length === 0) return;
    const normalizados = normalizarSuma100(sobresLocales);
    const actualizados = calcularMontosSobres(
      normalizados,
      data.capitalOperativoParaVivir,
      data.runway.diasTotales
    );
    setSobresLocales(actualizados);
    setEscenarioActivo('PERSONALIZADO');
    persistirEnBackend(actualizados, data.escenarios, 'PERSONALIZADO');
    toast.success('Distribución auto-cuadrada al 100%');
  };

  const guardarSobre = (datos: {
    id?: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    porcentaje: number;
  }) => {
    if (!data) return;
    let actualizados: SobreGastoOperativo[];

    if (datos.id) {
      actualizados = sobresLocales.map((s) =>
        s.id === datos.id
          ? {
            ...s,
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            icono: datos.icono,
            color: datos.color,
          }
          : s
      );
      setSobresLocales(actualizados);
      persistirEnBackend(actualizados, data.escenarios, escenarioActivo);
      toast.success('Sobre actualizado');
    } else {
      const nuevoId = `SOBRE_${Date.now()}`;
      const nuevoSobre: SobreGastoOperativo = {
        id: nuevoId,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        icono: datos.icono,
        color: datos.color,
        porcentaje: 0,
        monto: 0,
        montoSemanal: 0,
        montoDiario: 0,
        bloqueado: false,
      };
      actualizados = [...sobresLocales, nuevoSobre];
      setSobresLocales(actualizados);
      persistirEnBackend(actualizados, data.escenarios, escenarioActivo);
      toast.success('Nuevo sobre creado con 0%');
    }
  };

  const toggleBloqueo = (sobreId: string) => {
    if (!data) return;
    const sobre = sobresLocales.find((s) => s.id === sobreId);
    const nuevoEstado = !sobre?.bloqueado;
    const actualizados = toggleBloqueoHelper(sobresLocales, sobreId);
    setSobresLocales(actualizados);
    persistirEnBackend(actualizados, data.escenarios, escenarioActivo);
    if (nuevoEstado) {
      toast.info(`Sobre "${sobre?.nombre}" fijado con candado`);
    } else {
      toast.info(`Sobre "${sobre?.nombre}" desbloqueado`);
    }
  };

  const eliminarSobre = (id: string) => {
    if (!data || sobresLocales.length <= 1) {
      toast.error('Debes mantener al menos un sobre');
      return;
    }
    const redistribuidos = redistribuirAlEliminar(sobresLocales, id);
    const actualizados = calcularMontosSobres(
      redistribuidos,
      data.capitalOperativoParaVivir,
      data.runway.diasTotales
    );
    setSobresLocales(actualizados);
    persistirEnBackend(actualizados, data.escenarios, escenarioActivo);
    toast.success('Sobre eliminado');
  };

  const guardarNuevoEscenario = (nombre: string, descripcion: string, icono: string) => {
    if (!data) return;
    const nuevoEscenario: EscenarioPresupuesto = {
      id: `ESC_${Date.now()}`,
      nombre,
      descripcion,
      icono,
      esPersonalizado: true,
      distribucion: sobresLocales.map((s) => ({ sobreId: s.id, porcentaje: s.porcentaje })),
    };

    const nuevosEscenarios = [...data.escenarios, nuevoEscenario];
    setData({ ...data, escenarios: nuevosEscenarios });
    setEscenarioActivo(nuevoEscenario.id);
    persistirEnBackend(sobresLocales, nuevosEscenarios, nuevoEscenario.id);
    toast.success(`Preset "${nombre}" guardado con éxito`);
  };

  const eliminarEscenario = (id: string) => {
    if (!data) return;
    const nuevosEscenarios = data.escenarios.filter((e) => e.id !== id);
    const nuevoActivo = escenarioActivo === id ? 'EQUILIBRADO' : escenarioActivo;
    setData({ ...data, escenarios: nuevosEscenarios });
    setEscenarioActivo(nuevoActivo);
    persistirEnBackend(sobresLocales, nuevosEscenarios, nuevoActivo);
    toast.success('Preset eliminado');
  };

  const cambiarDiaPago = (dia: number) => {
    setDiaPagoSueldo(dia);
    if (data) {
      persistirEnBackend(sobresLocales, data.escenarios, escenarioActivo, dia);
      toast.success(`Día de cobro configurado al día ${dia}`);
    }
  };

  const resetearDeFabrica = async () => {
    if (!data) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/finanzas/presupuesto-operativo?periodoDestino=${data.periodoDestino}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al restablecer');
      toast.success('Configuración restablecida a valores de fábrica');
      await fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Error al restablecer valores de fábrica');
    } finally {
      setLoading(false);
    }
  };

  const sumaPorcentajes = sobresLocales.reduce((acc, s) => acc + s.porcentaje, 0);
  const sumaMontos = Number(sobresLocales.reduce((acc, s) => acc + s.monto, 0).toFixed(2));
  const descuadrePorcentaje = 100 - sumaPorcentajes;

  return {
    periodo,
    moneda: data?.moneda || 'S/',
    data,
    loading,
    saving,
    escenarioActivo,
    sobresLocales,
    diaPagoSueldo,
    sumaPorcentajes,
    sumaMontos,
    descuadrePorcentaje,
    irMesAnterior,
    irMesSiguiente,
    puedeIrMesAnterior,
    aplicarEscenario,
    actualizarPorcentajeSobre,
    actualizarMontoSobre,
    autoCuadrar100,
    guardarSobre,
    eliminarSobre,
    toggleBloqueo,
    guardarNuevoEscenario,
    eliminarEscenario,
    cambiarDiaPago,
    resetearDeFabrica,
    recargar: fetchData,
  };
}
