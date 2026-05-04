'use client'

import { useState, useTransition } from 'react'
import { formatCLP, formatUSD, TIPO_CAMBIO_USD_CLP, TIPO_INVERSION_LABELS } from '@/lib/helpers'
import { updateCliente } from '@/lib/actions/clientes'
import type { ClienteConRelaciones, Inversion, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function TabInversiones({ cliente, role }: Props) {
  const [sinInv, setSinInv] = useState(cliente.sin_inversiones)
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin'

  const inversiones = cliente.inversiones
  const financieras = inversiones.filter(i => i.categoria === 'financiera')
  const inmobiliarias = inversiones.filter(i => i.categoria === 'inmobiliaria')

  const totalClp = financieras.reduce((s, i) => s + i.saldo_clp + i.saldo_usd * TIPO_CAMBIO_USD_CLP, 0)
  const totalUsd = financieras.reduce((s, i) => s + i.saldo_usd + i.saldo_clp / TIPO_CAMBIO_USD_CLP, 0)
  const totalUfInmob = inmobiliarias.reduce((s, i) => s + (i.valor_uf ?? 0) * i.cantidad, 0)

  const toggleSinInversiones = () => {
    const next = !sinInv
    setSinInv(next)
    startTransition(async () => {
      await updateCliente(cliente.id, { sin_inversiones: next })
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toggle sin inversiones */}
      <div
        onClick={canEdit ? toggleSinInversiones : undefined}
        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${canEdit ? 'cursor-pointer' : ''} ${sinInv ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
      >
        <div className={`w-10 h-6 rounded-full transition-colors relative ${sinInv ? 'bg-blue-600' : 'bg-slate-300'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${sinInv ? 'left-5' : 'left-1'}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Cliente sin inversiones</p>
          <p className="text-xs text-slate-400">Deshabilita el módulo de inversiones</p>
        </div>
      </div>

      {!sinInv && (
        <>
          {/* KPIs AUM */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <KPICard label="AUM Financiero (CLP)" value={formatCLP(totalClp)} sub={`≈ ${formatUSD(totalUsd)}`} />
            <KPICard label="AUM Inmobiliario (UF)" value={`UF ${totalUfInmob.toLocaleString('es-CL')}`} />
            <KPICard label="Tipo de Cambio" value={`$${TIPO_CAMBIO_USD_CLP.toLocaleString('es-CL')}`} sub="CLP por USD (referencial)" />
          </div>

          {/* Panel Financieras */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Inversiones Financieras</h3>
              <p className="text-xs text-slate-400 mt-0.5">FFMM, Acciones, Depósitos a plazo</p>
            </div>
            {financieras.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Sin inversiones financieras</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Tipo</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Descripción</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Saldo CLP</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Saldo USD</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">Equiv. CLP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financieras.map(inv => {
                    const equivClp = inv.saldo_clp + inv.saldo_usd * TIPO_CAMBIO_USD_CLP
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {TIPO_INVERSION_LABELS[inv.tipo_inversion] ?? inv.tipo_inversion}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{inv.descripcion ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          {inv.saldo_clp > 0 ? formatCLP(inv.saldo_clp) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          {inv.saldo_usd > 0 ? formatUSD(inv.saldo_usd) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 text-xs hidden lg:table-cell">
                          {formatCLP(equivClp)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t border-slate-200">
                  <tr className="bg-slate-50">
                    <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-500">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                      {formatCLP(financieras.reduce((s, i) => s + i.saldo_clp, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                      {formatUSD(financieras.reduce((s, i) => s + i.saldo_usd, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-blue-700 hidden lg:table-cell">
                      {formatCLP(totalClp)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Panel Inmobiliaria — solo lectura */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Inversiones Inmobiliarias</h3>
                <p className="text-xs text-slate-400 mt-0.5">Vista de solo lectura — actualizar desde CRM</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">Solo lectura</span>
            </div>
            {inmobiliarias.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Sin inversiones inmobiliarias</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Tipo</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Descripción</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Cant.</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Propia</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Valor UF</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">DFL2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inmobiliarias.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                          {TIPO_INVERSION_LABELS[inv.tipo_inversion] ?? inv.tipo_inversion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{inv.descripcion ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">{inv.cantidad}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold ${inv.es_propia ? 'text-green-600' : 'text-slate-400'}`}>
                          {inv.es_propia ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {inv.valor_uf != null ? `UF ${inv.valor_uf.toLocaleString('es-CL')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold ${inv.tiene_dfl2 ? 'text-blue-600' : 'text-slate-400'}`}>
                          {inv.tiene_dfl2 ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
