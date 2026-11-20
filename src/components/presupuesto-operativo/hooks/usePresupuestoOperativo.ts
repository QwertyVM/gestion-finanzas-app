'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFinanzas } from '@/context/FinanzasContext';
import type {
  PresupuestoOperativoData,
  SobreGastoOperativo,
  EscenarioPresupuesto,
} from '@/lib/finanzas-service';
import { toast } from 'sonner';

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
      setSobresLocales(json.sobres);
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

    const recalcularSobresConPorcentajes = (
      sobresBase: SobreGastoOperativo[],
      obtenerPct: (s: SobreGastoOperativo) => number
    ) => {
      if (!data) return sobresBase;
      const capital = data.capitalOperativoParaVivir;
      const dias = data.runway.diasTotales;
      const semanas = data.runway.semanasTotales;

        return sobresBase.map((s) => {
          const pct = Math.max(0, Math.min(100, Math.round(obtenerPct(s))));
          const monto = Number(((capital * pct) / 100).toFixed(2));
          return {
            ...s,
            porcentaje: pct,
            monto,
            montoSemanal: semanas > 0 ? Number((monto / semanas).toFixed(2)) : 0,
            montoDiario: dias > 0 ? Number((monto / dias).toFixed(2)) : 0,
          };
        });
      };

      const aplicarEscenario = (escenarioId: string) => {
        if (!data) return;
        const esc = data.escenarios.find((e) => e.id === escenarioId);
        if (!esc) return;

        setEscenarioActivo(escenarioId);
        const actualizados = recalcularSobresConPorcentajes(sobresLocales, (s) => {
          const match = esc.distribucion.find((d) => d.sobreId === s.id);
          return match ? match.porcentaje : s.porcentaje;
        });

        setSobresLocales(actualizados);
        persistirEnBackend(actualizados, data.escenarios, escenarioId);
        toast.success(`Escenario ${esc.nombre} aplicado`);
      };

      const actualizarPorcentajeSobre = (sobreId: string, nuevoPct: number) => {
        if (!data) return;
    const actualizados = recalcularSobresConPorcentajes(sobresLocales, (s) =>
            s.id === sobreId ? nuevoPct : s.porcentaje
          );
        setSobresLocales(actualizados);
        setEscenarioActivo('PERSONALIZADO');
        persistirEnBackend(actualizados, data.escenarios, 'PERSONALIZADO');
      };

      const actualizarMontoSobre = (sobreId: string, nuevoMonto: number) => {
        if (!data || data.capitalOperativoParaVivir <= 0) return;
        const calcPct = Math.round((nuevoMonto / data.capitalOperativoParaVivir) * 100);
        actualizarPorcentajeSobre(sobreId, calcPct);
      };

      const autoCuadrar100 = () => {
        if (!data || sobresLocales.length === 0) return;
        const sumaActual = sobresLocales.reduce((acc, s) => acc + s.porcentaje, 0);
        const dif = 100 - sumaActual;
        if (dif === 0) return;

        // Sumar la diferencia al primer sobre o al más grande
        const copia = [...sobresLocales];
        copia[0] = { ...copia[0], porcentaje: Math.max(0, copia[0].porcentaje + dif) };

        const actualizados = recalcularSobresConPorcentajes(copia, (s) => s.porcentaje);
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
                porcentaje: datos.porcentaje,
              }
              : s
          );
        } else {
          const nuevoId = `SOBRE_${Date.now()}`;
          actualizados = [
            ...sobresLocales,
            {
              id: nuevoId,
              nombre: datos.nombre,
              descripcion: datos.descripcion,
              icono: datos.icono,
              color: datos.color,
              porcentaje: datos.porcentaje,
              monto: 0,
              montoSemanal: 0,
              montoDiario: 0,
            },
          ];
        }

        const recalculados = recalcularSobresConPorcentajes(actualizados, (s) => s.porcentaje);
        setSobresLocales(recalculados);
        persistirEnBackend(recalculados, data.escenarios, escenarioActivo);
        toast.success(datos.id ? 'Sobre actualizado' : 'Nuevo sobre creado');
      };

      const eliminarSobre = (id: string) => {
        if (!data || sobresLocales.length <= 1) {
          toast.error('Debes mantener al menos un sobre');
          return;
        }
        const actualizados = sobresLocales.filter((s) => s.id !== id);
        const recalculados = recalcularSobresConPorcentajes(actualizados, (s) => s.porcentaje);
        setSobresLocales(recalculados);
        persistirEnBackend(recalculados, data.escenarios, escenarioActivo);
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
        guardarNuevoEscenario,
        eliminarEscenario,
        cambiarDiaPago,
        resetearDeFabrica,
        recargar: fetchData,
      };
    }
