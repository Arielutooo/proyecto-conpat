'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSociedadColor } from '@/lib/helpers'
import type { Cliente, Role } from '@/lib/types'

interface Props {
  clientes: Cliente[]
  role: Role
}

const BADGE_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  amber:  'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green:  'bg-green-100 text-green-700',
  slate:  'bg-slate-100 text-slate-700',
}

export function ClientesTable({ clientes, role }: Props) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
    c.rut.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por razón social o RUT..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Razón Social</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">RUT</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Sociedad</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Régimen</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Nómina</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                  No se encontraron clientes
                </td>
              </tr>
            )}
            {filtered.map(cliente => {
              const color = getSociedadColor(cliente.tipo_sociedad)
              return (
                <tr
                  key={cliente.id}
                  onClick={() => router.push(`/clientes/${cliente.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={13} className="text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900 truncate max-w-[220px]">
                        {cliente.razon_social}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cliente.rut}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {cliente.tipo_sociedad && (
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold', BADGE_COLORS[color])}>
                        {cliente.tipo_sociedad}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                    {cliente.regimen_tributario ?? '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('text-xs font-medium', cliente.tiene_nomina ? 'text-green-600' : 'text-slate-400')}>
                      {cliente.tiene_nomina ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={14} className="text-slate-300 ml-auto" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
