'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConpatLogo } from '@/components/ConpatLogo'
import type { Role } from '@/lib/types'

interface SidebarProps {
  role: Role
  userName: string
}

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
    <circle cx="9" cy="7" r="4" />
  </svg>
)

const AuditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

const ROLE_LABEL: Record<Role, string> = {
  admin:       'ADMINISTRADOR',
  cfo_externo: 'CFO EXTERNO',
  master:      'MASTER',
}

const ROLE_DOT: Record<Role, string> = {
  admin:       '#4ade80',
  cfo_externo: '#60a5fa',
  master:      '#C84632',
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/clientes', label: role === 'cfo_externo' ? 'Mis Clientes' : 'Clientes', icon: <UsersIcon /> },
    ...(role === 'master' ? [{ href: '/control-cambios', label: 'Control de Cambios', icon: <AuditIcon /> }] : []),
  ]

  const initial = userName?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{ background: '#363E46', width: 240, minWidth: 240 }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <ConpatLogo variant="white" width={148} />
      </div>

      {/* Role pill */}
      <div className="px-5 py-3">
        <div
          className="flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: ROLE_DOT[role], flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.08em' }}>
            {ROLE_LABEL[role]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 w-full transition-all"
              style={{
                borderRadius: 8,
                padding: '9px 12px',
                background: active ? '#C84632' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                boxShadow: active ? '0 0 16px rgba(200,70,50,0.35)' : 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
              }}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ borderRadius: '50%', background: '#C84632' }}
          >
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}
