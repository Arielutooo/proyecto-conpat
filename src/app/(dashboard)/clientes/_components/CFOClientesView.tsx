import Link from 'next/link'
import { getSociedadColor } from '@/lib/helpers'
import type { Cliente } from '@/lib/types'

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  blue:   { bg: '#eff6ff', text: '#1d4ed8' },
  purple: { bg: '#faf5ff', text: '#7c3aed' },
  amber:  { bg: '#fffbeb', text: '#d97706' },
  indigo: { bg: '#eef2ff', text: '#4338ca' },
  green:  { bg: '#f0fdf4', text: '#15803d' },
  slate:  { bg: '#f8fafc', text: '#475569' },
}

interface Props {
  clientes: Cliente[]
}

export function CFOClientesView({ clientes }: Props) {
  const conNomina     = clientes.filter(c => c.tiene_nomina).length
  const emiteFacturas = clientes.filter(c => c.emite_facturas).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TopBar */}
      <div style={{ borderBottom: '1px solid #e5e8ef', background: 'white', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontSize: 13 }}>
        <span style={{ color: '#6b7280' }}>Portal CFO</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>Mis Carteras</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {/* Hero banner */}
        <div style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #363E46 0%, #464C5E 55%, #8B3020 100%)',
          padding: '32px 36px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,70,50,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
              Panel de Trabajo Contable
            </div>
            <h1 className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>
              Bienvenido, CFO
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
              Gestiona los insumos y entregables de tus carteras asignadas.
            </p>
            <div style={{ display: 'flex', gap: 36 }}>
              {[
                { label: 'Carteras asignadas', value: clientes.length },
                { label: 'Con nómina',          value: conNomina },
                { label: 'Emiten facturas',      value: emiteFacturas },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {clientes.map(c => {
            const color = getSociedadColor(c.tipo_sociedad)
            const bc    = BADGE_COLORS[color] ?? BADGE_COLORS.slate
            return (
              <div key={c.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="font-serif" style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                      {c.razon_social.charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.razon_social}
                      </h3>
                      {c.tipo_sociedad && (
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 99, background: bc.bg, color: bc.text, flexShrink: 0 }}>
                          {c.tipo_sociedad}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{c.rut}</div>
                  </div>
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.tiene_nomina && (
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: '#f0fdf4', color: '#15803d', fontWeight: 500 }}>Nómina</span>
                  )}
                  {c.emite_facturas && (
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8', fontWeight: 500 }}>DTE</span>
                  )}
                  {c.boletas_honorarios && (
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: '#faf5ff', color: '#7c3aed', fontWeight: 500 }}>Honorarios</span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/clientes/${c.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#0f172a', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginTop: 'auto' }}
                >
                  Abrir Panel
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
