'use client'

import { useState, useMemo } from 'react'
import type { AuditLog } from '@/lib/types'

const ENTITY_LABELS: Record<string, string> = {
  cliente:            'Cliente',
  socio:              'Socio',
  inversion:          'Inversión',
  documento:          'Documento',
  cartola:            'Cartola',
  entregable:         'Entregable CFO',
  certificado_retiro: 'Certificado Retiro',
}

const ENTITY_COLORS: Record<string, { bg: string; text: string }> = {
  cliente:            { bg: '#eff6ff', text: '#1d4ed8' },
  socio:              { bg: '#f0fdf4', text: '#15803d' },
  inversion:          { bg: '#faf5ff', text: '#7c3aed' },
  documento:          { bg: '#fffbeb', text: '#d97706' },
  cartola:            { bg: '#fff7ed', text: '#c2410c' },
  entregable:         { bg: '#fdf4ff', text: '#9333ea' },
  certificado_retiro: { bg: '#f0fdf4', text: '#166534' },
}

const ACTION_ICONS: Record<string, string> = {
  creado:      '✦',
  actualizado: '↻',
  eliminado:   '✕',
  subido:      '↑',
}

function getActionIcon(action: string) {
  for (const key of Object.keys(ACTION_ICONS)) {
    if (action.includes(key)) return ACTION_ICONS[key]
  }
  return '●'
}

function formatDateCL(iso: string) {
  return new Date(iso).toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
  })
}

function getEmpresa(log: AuditLog): string {
  return (log.metadata as Record<string, unknown> | null)?.empresa as string ?? '—'
}

interface Props {
  logs:        AuditLog[]
  entityTypes: string[]
}

export function AuditLogTable({ logs, entityTypes }: Props) {
  const [search,       setSearch]       = useState('')
  const [empresaFilter, setEmpresaFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('todos')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')

  const hasFilter = search || empresaFilter || entityFilter !== 'todos' || dateFrom || dateTo

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (entityFilter !== 'todos' && log.entity_type !== entityFilter) return false
      if (search && !log.description.toLowerCase().includes(search.toLowerCase()) &&
          !log.user_email.toLowerCase().includes(search.toLowerCase())) return false
      if (empresaFilter) {
        const emp = getEmpresa(log).toLowerCase()
        if (!emp.includes(empresaFilter.toLowerCase())) return false
      }
      if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) return false
      if (dateTo   && new Date(log.created_at) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [logs, entityFilter, search, empresaFilter, dateFrom, dateTo])

  const inputStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#363E46',
    outline: 'none',
    background: 'white',
    width: '100%',
    boxSizing: 'border-box',
  }

  const focusRed = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = '#C84632')
  const blurGray = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = '#e2e8f0')

  return (
    <div>
      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Buscar
          </label>
          <input
            type="text"
            placeholder="Descripción o usuario…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
            onFocus={focusRed}
            onBlur={blurGray}
          />
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Empresa
          </label>
          <input
            type="text"
            placeholder="Nombre empresa…"
            value={empresaFilter}
            onChange={e => setEmpresaFilter(e.target.value)}
            style={inputStyle}
            onFocus={focusRed}
            onBlur={blurGray}
          />
        </div>

        <div style={{ flex: '0 0 180px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Tipo de entidad
          </label>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusRed}
            onBlur={blurGray}
          >
            <option value="todos">Todas</option>
            {entityTypes.map(t => (
              <option key={t} value={t}>{ENTITY_LABELS[t] ?? t}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '0 0 150px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Desde
          </label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={inputStyle} onFocus={focusRed} onBlur={blurGray} />
        </div>

        <div style={{ flex: '0 0 150px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Hasta
          </label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={inputStyle} onFocus={focusRed} onBlur={blurGray} />
        </div>

        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setEmpresaFilter(''); setEntityFilter('todos'); setDateFrom(''); setDateTo('') }}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, color: '#64748b', cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        {filtered.length < logs.length && ` (de ${logs.length} totales)`}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            No hay registros que coincidan con los filtros.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Fecha y hora', 'Usuario', 'Empresa', 'Descripción', 'Entidad'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const ec      = ENTITY_COLORS[log.entity_type] ?? { bg: '#f8fafc', text: '#475569' }
                  const empresa = getEmpresa(log)
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {formatDateCL(log.created_at)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.user_email}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: empresa !== '—' ? 500 : 400, color: empresa !== '—' ? '#0f172a' : '#94a3b8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {empresa}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a' }}>
                        <span style={{ marginRight: 8, fontSize: 11, color: '#94a3b8' }}>{getActionIcon(log.action)}</span>
                        {log.description}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: ec.bg, color: ec.text, whiteSpace: 'nowrap' }}>
                          {ENTITY_LABELS[log.entity_type] ?? log.entity_type}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
