import { createClient } from '@/lib/supabase/server'
import { getClientesConStats } from '@/lib/queries/clientes'
import { ClientesTable } from './_components/ClientesTable'
import { NuevoClienteBtn } from './_components/NuevoClienteBtn'
import { CFOClientesView } from './_components/CFOClientesView'
import { formatCLP } from '@/lib/helpers'
import type { Role } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const role     = (roleRow?.role ?? 'cfo_externo') as Role
  const clientes = await getClientesConStats()

  if (role === 'cfo_externo') {
    return <CFOClientesView clientes={clientes} />
  }

  const totalRetirosMes   = clientes.reduce((s, c) => s + c.retiros_mes, 0)
  const ingresosMensuales = clientes
    .filter(c => c.conpat_factura && c.moneda_facturacion === 'CLP')
    .reduce((s, c) => s + (c.cantidad_facturacion ?? 0), 0)
  const sinEntregables    = clientes.filter(c => c.entregables_count === 0).length

  const stats = [
    { label: 'CARTERAS ACTIVAS',   value: String(clientes.length),          sub: 'clientes gestionados',   accent: true },
    { label: 'INGRESOS MENSUALES', value: formatCLP(ingresosMensuales),     sub: 'facturación mensual' },
    { label: 'RETIROS DEL MES',    value: formatCLP(totalRetirosMes),       sub: 'registrados' },
    { label: 'SIN ENTREGABLES',    value: String(sinEntregables),           sub: 'pendientes de CFO' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TopBar */}
      <div style={{ borderBottom: '1px solid #e5e8ef', background: 'white', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
          <span>Administración</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Clientes</span>
        </div>
        <NuevoClienteBtn />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '20px 24px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              <div className="font-serif" style={{ fontSize: s.value.startsWith('$') ? 22 : 28, fontWeight: 700, color: s.accent ? 'oklch(0.55 0.18 245)' : '#0f172a', marginTop: 8, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <ClientesTable clientes={clientes} />
      </div>
    </div>
  )
}
