'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/types'

interface SidebarProps {
  role: Role
  userName: string
}

const BriefcaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
)

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
    <circle cx="9" cy="7" r="4" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/clientes', label: role === 'admin' ? 'Clientes' : 'Mis Clientes', icon: <UsersIcon /> },
  ]

  const initial = userName?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{ background: '#0d1117', width: 240, minWidth: 240 }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: 'oklch(0.55 0.18 245)', borderRadius: 8 }}
          >
            <BriefcaseIcon />
          </div>
          <div>
            <div className="font-serif text-white" style={{ fontSize: 17, lineHeight: 1.1 }}>CONPAT</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Gestión Patrimonial
            </div>
          </div>
        </div>
      </div>

      {/* Role pill */}
      <div className="px-5 py-3">
        <div
          className="flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: role === 'admin' ? 'oklch(0.7 0.15 145)' : 'oklch(0.7 0.15 250)', flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.08em' }}>
            {role === 'admin' ? 'ADMINISTRADOR' : 'CFO EXTERNO'}
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
                background: active ? 'oklch(0.55 0.18 245)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                boxShadow: active ? '0 0 16px oklch(0.55 0.18 245 / 0.35)' : 'none',
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
            style={{ borderRadius: '50%', background: 'oklch(0.55 0.18 245)' }}
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
