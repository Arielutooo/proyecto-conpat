'use client'

import React, { useState } from 'react'
import { TopBar, Card, StatCard, Badge, Btn, EmptyState } from '@/components/shared'
import { Icon } from '@/components/shared/Icon'
import { formatCLP, getSociedadColor } from '@/lib/helpers'
import type { Cliente } from '@/lib/types'

interface AdminDashboardProps {
  clientes: Cliente[]
  onSelectCliente: (c: Cliente) => void
  onNewCliente: () => void
}

export const AdminDashboard = ({ clientes, onSelectCliente, onNewCliente }: AdminDashboardProps) => {
  const [search, setSearch] = useState('')

  const filtered = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) || c.rut.includes(search)
  )

  const totalRetiros = clientes.reduce((sum, c) => sum + c.retiros.reduce((s, r) => s + r.monto, 0), 0)
  const totalIngresos = clientes.reduce((sum, c) => sum + c.inversiones.reduce((s, i) => s + i.ingreso_mensual_asociado, 0), 0)
  const pendientes = clientes.filter(c => c.entregables.length === 0).length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar
        breadcrumbs={['Administración', 'Clientes']}
        action={<Btn icon="plus" onClick={onNewCliente}>Nuevo Cliente</Btn>}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Carteras Activas" value={clientes.length} sub="clientes gestionados" accent />
          <StatCard label="Ingresos Mensuales" value={formatCLP(totalIngresos)} sub="de inversiones activas" />
          <StatCard label="Retiros del Mes" value={formatCLP(totalRetiros)} sub="registrados" />
          <StatCard label="Sin Entregables" value={pendientes} sub="pendientes de CFO" />
        </div>

        <Card>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Directorio de Clientes</h2>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por razón social o RUT…"
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #e5e8ef', borderRadius: 8, fontSize: 12, color: '#374151', outline: 'none', width: 260 }}
              />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Razón Social', 'RUT', 'Sociedad', 'Socios', 'Inversiones', 'Retiros (mes)', 'Entregables', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const totalRetiro = c.retiros.reduce((s, r) => s + r.monto, 0)
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{c.razon_social}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.regimen_tributario}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{c.rut}</td>
                    <td style={{ padding: '14px 16px' }}><Badge color={getSociedadColor(c.tipo_sociedad)}>{c.tipo_sociedad}</Badge></td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{c.socios.length}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{c.inversiones.length}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: totalRetiro > 0 ? '#0f172a' : '#94a3b8', fontWeight: totalRetiro > 0 ? 600 : 400 }}>
                      {totalRetiro > 0 ? formatCLP(totalRetiro) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.entregables.length > 0
                        ? <Badge color="green">{c.entregables.length} doc{c.entregables.length > 1 ? 's' : ''}</Badge>
                        : <Badge color="amber">Pendiente</Badge>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Btn size="sm" variant="secondary" icon="chevronRight" onClick={() => onSelectCliente(c)}>Ver Panel</Btn>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon="search" title="Sin resultados" sub="Intenta con otro término de búsqueda" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
