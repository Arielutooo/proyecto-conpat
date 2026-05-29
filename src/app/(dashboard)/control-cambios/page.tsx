import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuditLogTable } from './_components/AuditLogTable'
import type { AuditLog, Role } from '@/lib/types'

export default async function ControlCambiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = (roleRow?.role ?? 'cfo_externo') as Role
  if (role !== 'master') redirect('/clientes')

  const { data: logs } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  const safeLog = (logs ?? []) as AuditLog[]

  const entityTypes = [...new Set(safeLog.map(l => l.entity_type))].sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TopBar */}
      <div style={{ borderBottom: '1px solid #e5e8ef', background: 'white', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontSize: 13 }}>
        <span style={{ color: '#6b7280' }}>Master</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>Control de Cambios</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
            Auditoría del Sistema
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Registro completo de cambios realizados por administradores y CFOs.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total de eventos', value: safeLog.length },
            { label: 'Últimas 24 h', value: safeLog.filter(l => Date.now() - new Date(l.created_at).getTime() < 86_400_000).length },
            { label: 'Usuarios activos', value: new Set(safeLog.map(l => l.user_id)).size },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '18px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              <div className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#C84632', marginTop: 6, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <AuditLogTable logs={safeLog} entityTypes={entityTypes} />
      </div>
    </div>
  )
}
