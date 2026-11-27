'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

interface LoanItem {
  id: string;
  banco: string;
  concepto: string;
  cuotaActual: number;
  cuotasTotales: number;
  progreso: number;
  montoCuota: number;
  saldoAprox: number;
  estado: string;
  diaPago: number;
  monedaOriginal?: string;
  montoOriginal?: number | null;
}

interface ExecutiveLoansSectionProps {
  prestamosActivos: LoanItem[];
  moneda: string;
}

export function ExecutiveLoansSection({ prestamosActivos, moneda }: ExecutiveLoansSectionProps) {
  const router = useRouter();

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Créditos & Préstamos Activos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seguimiento de amortización de cuotas y saldo restante.
          </p>
        </div>
        <Link
          href="/fijos-y-prestamos"
          className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
        >
          <span>Gestionar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {prestamosActivos.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No tienes préstamos bancarios registrados.
        </div>
      ) : (
        <>
          {/* Móvil: Tarjetas táctiles de préstamos */}
          <div className="md:hidden divide-y divide-border/40">
            {prestamosActivos.map((p) => (
              <div
                key={`mob-p-${p.id}`}
                onClick={() => router.push('/fijos-y-prestamos')}
                className="p-3.5 space-y-2.5 cursor-pointer hover:bg-muted/30 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">
                        {p.banco}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">Día {p.diaPago}</span>
                      {p.monedaOriginal === 'USD' && p.montoOriginal && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                          ${p.montoOriginal.toFixed(2)} USD
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-xs text-foreground truncate">{p.concepto}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-foreground tabular-nums block">
                      {formatMoney(p.montoCuota, moneda)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">cuota</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Cuota {p.cuotaActual}/{p.cuotasTotales} ({p.progreso}%)
                    </span>
                    <span className="font-mono">Saldo: ~ {formatMoney(p.saldoAprox, moneda)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all"
                      style={{ width: `${p.progreso}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Tabla de préstamos */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border/60">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-medium">Banco / Concepto</th>
                  <th scope="col" className="py-2.5 px-3 font-medium">Cuota</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Día Pago</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Cuota Mensual</th>
                  <th scope="col" className="py-2.5 px-3 text-right font-medium">Saldo Restante</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {prestamosActivos.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push('/fijos-y-prestamos')}
                    className="hover:bg-muted/40 transition cursor-pointer"
                    title="Ver detalle en Fijos y Préstamos"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground text-xs">{p.concepto}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span>{p.banco}</span>
                        {p.monedaOriginal === 'USD' && p.montoOriginal && (
                          <span className="text-[10px] text-muted-foreground">
                            · ${p.montoOriginal.toFixed(2)} USD
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Cuota {p.cuotaActual} de {p.cuotasTotales}
                          </span>
                          <span>{p.progreso}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full transition-all"
                            style={{ width: `${p.progreso}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                      Día {p.diaPago}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                      {formatMoney(p.montoCuota, moneda)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground whitespace-nowrap">
                      ~ {formatMoney(p.saldoAprox, moneda)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          p.estado === 'PAGADO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : p.estado === 'ADELANTADO'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.estado === 'PAGADO'
                              ? 'bg-emerald-500'
                              : p.estado === 'ADELANTADO'
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        {p.estado === 'PAGADO' ? 'Pagado' : p.estado === 'ADELANTADO' ? 'Adelantado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
