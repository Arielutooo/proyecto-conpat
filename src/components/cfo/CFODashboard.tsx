'use client'

import React, { useState } from 'react'
import { TopBar, Card, Badge, EmptyState } from '@/components/shared'
import { Icon } from '@/components/shared/Icon'
import { formatCLP, getSociedadColor } from '@/lib/helpers'
import type { Cliente } from '@/lib/types'

interface CFODashboardProps {
  clientes: Cliente[]
  onSelectCliente: (c: Cliente) => void
}

export const CFODashboard = ({ clientes, onSelectCliente }: CFODashboardProps) => {
  const [search, setSearch] = useState('')

  const filtered = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) || c.rut.includes(search)
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar breadcrumbs={['Portal CFO', 'Mis Clientes']} />
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

        <div style={{ background: 'linear-gradient(135deg, #0d1117 0%, oklch(0.2 0.06 245) 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Portal CFO Externo</div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'DM Serif Display', serif" }}>Panel de Trabajo Contable</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0' }}>Accede a la información de cada cliente y sube los entregables contables del período.</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            {[
              { label: 'Clientes', val: clientes.length },
              { label: 'Con entregables', val: clientes.filter(c => c.entregables.length > 0).length },
              { label: 'Pendientes', val: clientes.filter(c => c.entregables.length === 0).length },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', serif" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e5e8ef', borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="search" title="Sin resultados" sub="Intenta con otro término de búsqueda" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(c => {
              const totalIngreso = c.inversiones.reduce((s, i) => s + i.ingreso_mensual_asociado, 0)
              const pendiente = c.entregables.length === 0
              return (
                <Card
                  key={c.id}
                  style={{ padding: 20, cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${pendiente ? '#fde68a' : '#e5e8ef'}` }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  onClick={() => onSelectCliente(c)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'oklch(0.55 0.18 245)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{c.razon_social.charAt(0)}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{c.razon_social}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{c.rut}</div>
                      </div>
                    </div>
                    {pendiente
                      ? <Badge color="amber">Pendiente</Badge>
                      : <Badge color="green">{c.entregables.length} entregable{c.entregables.length > 1 ? 's' : ''}</Badge>
                    }
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'Socios', val: c.socios.length },
                      { label: 'Cartolas', val: c.cartolas.length },
                      { label: 'Retiros', val: c.retiros.length },
                      { label: 'Ingreso/mes', val: totalIngreso > 0 ? formatCLP(totalIngreso) : '—' },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{m.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge color={getSociedadColor(c.tipo_sociedad)}>{c.tipo_sociedad}</Badge>
                    <Badge color="slate">{c.regimen_tributario}</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
