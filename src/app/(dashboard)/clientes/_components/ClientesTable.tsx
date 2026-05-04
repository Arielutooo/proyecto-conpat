'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSociedadColor, formatCLP } from '@/lib/helpers'
import type { ClienteConStats } from '@/lib/types'

const BADGE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  blue:   { bg: '#eff6ff', text: '#1d4ed8', ring: '#bfdbfe' },
  purple: { bg: '#faf5ff', text: '#7c3aed', ring: '#ddd6fe' },
  amber:  { bg: '#fffbeb', text: '#d97706', ring: '#fde68a' },
  indigo: { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe' },
  green:  { bg: '#f0fdf4', text: '#15803d', ring: '#bbf7d0' },
  slate:  { bg: '#f8fafc', text: '#475569', ring: '#e2e8f0' },
}

const TH: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em',
  background: '#f8fafc', whiteSpace: 'nowrap',
  borderBottom: '1px solid #e5e8ef',
}

interface Props { clientes: ClienteConStats[] }

export function ClientesTable({ clientes }: Props) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
    c.rut.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Directorio de Clientes</h2>
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por razón social o RUT…"
            style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #e5e8ef', borderRadius: 8, fontSize: 12, color: '#374151', outline: 'none', width: 270, background: '#fafafa' }}
          />
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={TH}>Razón Social</th>
            <th style={TH}>RUT</th>
            <th style={TH}>Sociedad</th>
            <th style={{ ...TH, textAlign: 'center' }}>Socios</th>
            <th style={{ ...TH, textAlign: 'center' }}>Inversiones</th>
            <th style={{ ...TH, textAlign: 'right' }}>Retiros (Mes)</th>
            <th style={{ ...TH, textAlign: 'center' }}>Entregables</th>
            <th style={{ ...TH }} />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No se encontraron clientes
              </td>
            </tr>
          )}
          {filtered.map((c, idx) => {
            const color = getSociedadColor(c.tipo_sociedad)
            const bc    = BADGE_COLORS[color] ?? BADGE_COLORS.slate
            const hasEntregables = c.entregables_count > 0

            return (
              <tr
                key={c.id}
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={() => router.push(`/clientes/${c.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Razón Social */}
                <td style={{ padding: '14px 16px', minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.razon_social}</div>
                  {c.regimen_tributario && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.regimen_tributario}</div>
                  )}
                </td>

                {/* RUT */}
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {c.rut}
                </td>

                {/* Sociedad badge */}
                <td style={{ padding: '14px 16px' }}>
                  {c.tipo_sociedad && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9999, padding: '2px 9px', fontSize: 12, fontWeight: 600, background: bc.bg, color: bc.text, outline: `1px solid ${bc.ring}` }}>
                      {c.tipo_sociedad}
                    </span>
                  )}
                </td>

                {/* Socios count */}
                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  {c.socios_count}
                </td>

                {/* Inversiones count */}
                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  {c.inversiones_count || '—'}
                </td>

                {/* Retiros del mes */}
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 500, color: c.retiros_mes > 0 ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {c.retiros_mes > 0 ? formatCLP(c.retiros_mes) : '—'}
                </td>

                {/* Entregables badge */}
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: hasEntregables ? '#f0fdf4' : '#fffbeb',
                    color: hasEntregables ? '#15803d' : '#d97706',
                    border: `1px solid ${hasEntregables ? '#bbf7d0' : '#fde68a'}`,
                  }}>
                    {hasEntregables ? `${c.entregables_count} doc${c.entregables_count !== 1 ? 's' : ''}` : 'Pendiente'}
                  </span>
                </td>

                {/* Ver Panel button */}
                <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => router.push(`/clientes/${c.id}`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    Ver Panel
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
