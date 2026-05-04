'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import { ChevronLeft, Pencil, Building2 } from 'lucide-react'
import { EditarFichaDrawer } from './EditarFichaDrawer'
import { TabLegales } from './tabs/TabLegales'
import { TabSocios } from './tabs/TabSocios'
import { TabCartolas } from './tabs/TabCartolas'
import { TabInversiones } from './tabs/TabInversiones'
import { TabTributario } from './tabs/TabTributario'
import { TabRRHH } from './tabs/TabRRHH'
import { useAnoFiscal } from '@/lib/contexts/ano-fiscal'
import { getSociedadColor } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import type { ClienteConRelaciones, Role } from '@/lib/types'

const BADGE_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  amber:  'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green:  'bg-green-100 text-green-700',
  slate:  'bg-slate-100 text-slate-700',
}

const TAB_LIST = [
  { id: 'legales',     label: 'Legales' },
  { id: 'socios',      label: 'Socios' },
  { id: 'cartolas',    label: 'Cartolas Bancarias' },
  { id: 'inversiones', label: 'Inversiones' },
  { id: 'tributario',  label: 'Tributario' },
  { id: 'rrhh',        label: 'RRHH' },
]

interface Props {
  cliente: ClienteConRelaciones
  role: Role
}

export function ClienteDetail({ cliente, role }: Props) {
  const [tab, setTab] = useState('legales')
  const [editOpen, setEditOpen] = useState(false)
  const { anioFiscal } = useAnoFiscal()
  const color = getSociedadColor(cliente.tipo_sociedad)

  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="h-full flex flex-col">
      {/* Sticky header + tab list */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/clientes"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 size={16} className="text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{cliente.razon_social}</h2>
                {cliente.tipo_sociedad && (
                  <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold', BADGE_COLORS[color])}>
                    {cliente.tipo_sociedad}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{cliente.rut}</p>
            </div>
          </div>

          {role === 'admin' && (
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Pencil size={13} />
              Editar Ficha
            </button>
          )}
        </div>

        <Tabs.List className="flex gap-1 px-6 pb-0 overflow-x-auto">
          {TAB_LIST.map(t => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              className={cn(
                'px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap focus:outline-none',
                tab === t.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <Tabs.Content value="legales"     className="p-6 focus:outline-none animate-slide-up">
          <TabLegales    cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="socios"      className="p-6 focus:outline-none animate-slide-up">
          <TabSocios     cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="cartolas"    className="p-6 focus:outline-none animate-slide-up">
          <TabCartolas   cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="inversiones" className="p-6 focus:outline-none animate-slide-up">
          <TabInversiones cliente={cliente} role={role} />
        </Tabs.Content>
        <Tabs.Content value="tributario"  className="p-6 focus:outline-none animate-slide-up">
          <TabTributario cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="rrhh"        className="p-6 focus:outline-none animate-slide-up">
          <TabRRHH       cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
      </div>

      {role === 'admin' && (
        <EditarFichaDrawer
          cliente={cliente}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </Tabs.Root>
  )
}
