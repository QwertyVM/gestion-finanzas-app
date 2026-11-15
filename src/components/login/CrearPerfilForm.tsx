'use client';

import React, { useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CrearPerfilFormProps {
  onPerfilCreado: () => void;
}

const PRESET_COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export function CrearPerfilForm({ onPerfilCreado }: CrearPerfilFormProps) {
  const [nombre, setNombre] = useState('');
  const [sueldoBase, setSueldoBase] = useState('5000');
  const [moneda, setMoneda] = useState('S/');
  const [pin, setPin] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('Por favor ingresa un nombre para el perfil');
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          sueldoBaseMensual: parseFloat(sueldoBase) || 5000,
          monedaSimbolo: moneda,
          pin: pin.trim() || null,
          color,
          avatar: 'User',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el perfil');
      }

      toast.success(`¡Perfil "${nombre.trim()}" creado exitosamente!`);

      // Iniciar sesión con el nuevo usuario
      const loginRes = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: data.data.id, pin: pin.trim() || undefined }),
      });

      if (loginRes.ok) {
        window.location.href = '/';
      } else {
        onPerfilCreado();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al crear perfil');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-1">
      <div className="text-center space-y-1">
        <div className="inline-flex p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-1">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Crear Nuevo Perfil
        </h2>
        <p className="text-xs text-muted-foreground">
          Configura un nuevo espacio financiero personal o compartido.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            Nombre del Perfil *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Finanzas Personales, Negocio..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Sueldo Base Mensual
            </label>
            <input
              type="number"
              step="0.01"
              value={sueldoBase}
              onChange={(e) => setSueldoBase(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Moneda</label>
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="S/">S/ (Soles)</option>
              <option value="$">$ (Dólares)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1">
            PIN de Acceso (Opcional)
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="PIN numérico de 4 a 6 dígitos"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground block mb-1.5">
            Color del Perfil
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-xl transition-all ${
                  color === c ? 'scale-115 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={guardando || !nombre.trim()}
        className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
      >
        {guardando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creando perfil...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Crear e Ingresar</span>
          </>
        )}
      </button>
    </form>
  );
}
