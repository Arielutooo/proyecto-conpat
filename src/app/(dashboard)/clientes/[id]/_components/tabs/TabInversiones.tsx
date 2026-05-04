'use client'

import { useState, useTransition } from 'react'
import { formatCLP, formatUSD, TIPO_CAMBIO_USD_CLP, TIPO_INVERSION_LABELS } from '@/lib/helpers'
import { updateCliente } from '@/lib/actions/clientes'
import { Wallet, Landmark, TrendingUp, FileText } from 'lucide-react'
import type { ClienteConRelaciones, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

function KPICard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: any }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
        {Icon && <Icon size={16} className="text-slate-400" />}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[12px] text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  )
}

export function TabInversiones({ cliente, role, anioFiscal }: Props) {
  const [sinInv, setSinInv] = useState(cliente.sin_inversiones)
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin'

  const inversiones = cliente.inversiones.filter(i => i.anio === anioFiscal)
  const financieras = inversiones.filter(i => i.categoria === 'financiera')
  const inmobiliarias = inversiones.filter(i => i.categoria === 'inmobiliaria')

  const totalAperturaClp = financieras.reduce((s, i) => s + (i.valor_apertura || 0), 0)
  const totalCierreClp = financieras.reduce((s, i) => s + i.saldo_clp, 0)
  const totalCierreUsd = totalCierreClp / TIPO_CAMBIO_USD_CLP

  const toggleSinInversiones = () => {
    const next = !sinInv
    setSinInv(next)
    startTransition(async () => {
      await updateCliente(cliente.id, { sin_inversiones: next })
    })
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toggle sin inversiones */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-[14px] text-slate-900">Cliente sin inversiones</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Oculta y deshabilita el módulo de inversiones</p>
        </div>
        <div
          onClick={canEdit ? toggleSinInversiones : undefined}
          className={`w-12 h-7 rounded-full relative transition-colors ${canEdit ? 'cursor-pointer' : ''} ${sinInv ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${sinInv ? 'left-6' : 'left-1'}`} />
        </div>
      </div>

      {!sinInv && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <KPICard
              label="Apertura de Año"
              value={`01/01/${anioFiscal}`}
              sub="Inicio del ejercicio fiscal"
              icon={Wallet}
            />
            <KPICard
              label="Cierre de Año"
              value={`31/12/${anioFiscal}`}
              sub="Cierre del ejercicio fiscal"
              icon={Landmark}
            />
            <KPICard
              label={`AUM Total ${anioFiscal}`}
              value={`$${(totalCierreClp / 1000000).toFixed(1)}M CLP`}
              sub={`${formatUSD(totalCierreUsd)} USD`}
              icon={TrendingUp}
            />
            <KPICard
              label="Fecha de Valoración"
              value={`31/12/${anioFiscal}`}
              sub={`Cierre ejercicio ${anioFiscal}`}
              icon={FileText}
            />
          </div>

          {/* Panel Financieras */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Panel 1 — Financieras (FFMM y Acciones)
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Institución</th>
                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Tipo</th>
                    <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Año Apertura</th>
                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Saldo Inicial</th>
                    <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Año Cierre</th>
                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Saldo Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financieras.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No hay inversiones financieras registradas.</td></tr>
                  ) : financieras.map(inv => {
                    const diff = inv.saldo_clp - (inv.valor_apertura || 0)
                    const isPositive = diff >= 0

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-semibold text-slate-900 text-[13px]">
                          {inv.descripcion || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${inv.tipo_inversion === 'Acciones' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {TIPO_INVERSION_LABELS[inv.tipo_inversion] ?? inv.tipo_inversion}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-400 text-[13px]">
                          {inv.fecha_apertura ? inv.fecha_apertura.split('-')[0] : anioFiscal - 1}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="font-semibold text-slate-900 text-[13px]">{formatCLP(inv.valor_apertura || 0)}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{formatUSD((inv.valor_apertura || 0) / TIPO_CAMBIO_USD_CLP)}</div>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-400 text-[13px]">
                          {inv.fecha_cierre ? inv.fecha_cierre.split('-')[0] : anioFiscal}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className={`font-semibold text-[13px] ${isPositive ? 'text-[#059669]' : 'text-slate-900'}`}>{formatCLP(inv.saldo_clp)}</div>
                          <div className={`text-[11px] font-medium mt-0.5 ${isPositive ? 'text-[#059669]' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{formatCLP(diff)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel Inmobiliaria */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Panel 2 — Inmobiliaria (Solo Lectura)
            </h3>
            {inmobiliarias.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm shadow-sm">
                No hay inversiones inmobiliarias registradas.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {inmobiliarias.map(inv => (
                  <div key={inv.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-[15px] mb-6">{inv.descripcion || TIPO_INVERSION_LABELS[inv.tipo_inversion] || inv.tipo_inversion}</h4>
                    <div className="space-y-4 text-[13px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Cantidad de inmuebles</span>
                        <span className="font-bold text-slate-900">{inv.cantidad}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Valorización</span>
                        <span className="font-bold text-slate-900">{inv.valor_uf ? `${inv.valor_uf.toLocaleString('es-CL')} UF` : '—'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Propiedad propia</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${inv.es_propia ? 'bg-green-50 text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>
                          {inv.es_propia ? '• Sí' : '• No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Acoge DFL2</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${inv.tiene_dfl2 ? 'bg-green-50 text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>
                          {inv.tiene_dfl2 ? '• Sí' : '• No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
