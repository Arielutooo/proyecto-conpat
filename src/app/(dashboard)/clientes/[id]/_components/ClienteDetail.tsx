'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import { EditarFichaDrawer } from './EditarFichaDrawer'
import { TabLegales } from './tabs/TabLegales'
import { TabSocios } from './tabs/TabSocios'
import { TabCartolas } from './tabs/TabCartolas'
import { TabInversiones } from './tabs/TabInversiones'
import { TabTributario } from './tabs/TabTributario'
import { TabRRHH } from './tabs/TabRRHH'
import { useAnoFiscal, ANOS_FISCALES } from '@/lib/contexts/ano-fiscal'
import { getSociedadColor } from '@/lib/helpers'
import type { ClienteConRelaciones, Role } from '@/lib/types'

const BADGE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  blue:   { bg: '#eff6ff', text: '#1d4ed8', ring: '#bfdbfe' },
  purple: { bg: '#faf5ff', text: '#7c3aed', ring: '#ddd6fe' },
  amber:  { bg: '#fffbeb', text: '#d97706', ring: '#fde68a' },
  indigo: { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe' },
  green:  { bg: '#f0fdf4', text: '#15803d', ring: '#bbf7d0' },
  slate:  { bg: '#f8fafc', text: '#475569', ring: '#e2e8f0' },
}

const TAB_LIST = [
  { id: 'legales',     label: 'Datos Cliente',    iconPath: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' },
  { id: 'socios',      label: 'Socios',            iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { id: 'cartolas',    label: 'Cartolas Bancarias',iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { id: 'inversiones', label: 'Inversiones',       iconPath: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6' },
  { id: 'tributario',  label: 'Tributario',        iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { id: 'rrhh',        label: 'RRHH',              iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
]

const EDITABLE_TABS = ['legales', 'socios', 'inversiones']
const EDIT_LABELS: Record<string, string> = {
  legales:     'Editar Datos Cliente',
  socios:      'Editar Socios',
  inversiones: 'Editar Inversiones',
}

interface Props {
  cliente: ClienteConRelaciones
  role: Role
}

export function ClienteDetail({ cliente, role }: Props) {
  const [tab, setTab]         = useState('legales')
  const [editOpen, setEditOpen] = useState(false)
  const { anioFiscal, setAnioFiscal } = useAnoFiscal()
  const color = getSociedadColor(cliente.tipo_sociedad)
  const bc    = BADGE_COLORS[color] ?? BADGE_COLORS.slate

  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="h-full flex flex-col">

      {/* Sticky header */}
      <div className="flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #e2e8f0' }}>

        {/* Breadcrumb */}
        <div style={{ height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: '#6b7280' }}>
            <Link href="/clientes" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
              Clientes
            </Link>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{cliente.razon_social}</span>
          </div>
        </div>

        {/* Client strip */}
        <div style={{ padding: '16px 28px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 48, height: 48, borderRadius: 12, background: '#0f172a' }}
          >
            <span className="font-serif text-white" style={{ fontSize: 19, fontWeight: 700 }}>
              {cliente.razon_social.charAt(0)}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="font-serif" style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#0f172a' }}>
                {cliente.razon_social}
              </h1>
              {cliente.tipo_sociedad && (
                <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '2px 8px', fontSize: 12, fontWeight: 500, background: bc.bg, color: bc.text, outline: `1px solid ${bc.ring}` }}>
                  {cliente.tipo_sociedad}
                </span>
              )}
              <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#15803d', display: 'inline-block' }} />
                ACTIVO
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>RUT {cliente.rut}</div>
          </div>

          {/* Año Fiscal + Edit button */}
          <div className="flex items-center gap-3 flex-shrink-0" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                Año Fiscal
              </label>
              <select
                value={anioFiscal}
                onChange={e => setAnioFiscal(Number(e.target.value))}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 28px 7px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', background: 'white', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {ANOS_FISCALES.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {role === 'admin' && EDITABLE_TABS.includes(tab) && (
              <button
                onClick={() => setEditOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'opacity .15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                </svg>
                {EDIT_LABELS[tab] ?? 'Editar Ficha'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs.List style={{ display: 'flex', gap: 0, padding: '0 28px' }}>
          {TAB_LIST.map(t => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? '#0f172a' : '#6b7280',
                borderBottom: `2px solid ${tab === t.id ? '#0f172a' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                transition: 'all .15s',
                marginBottom: -1,
                outline: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {t.iconPath.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
              </svg>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto" style={{ background: '#f1f5f9' }}>
        <Tabs.Content value="legales"     className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
          <TabLegales    cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="socios"      className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
          <TabSocios     cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="cartolas"    className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
          <TabCartolas   cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="inversiones" className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
          <TabInversiones cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="tributario"  className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
          <TabTributario cliente={cliente} role={role} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="rrhh"        className="focus:outline-none animate-slide-up" style={{ padding: 28 }}>
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
