'use client'

import React from 'react'
import { Icon } from './Icon'
import { useApp } from '@/lib/context'
import type { Role } from '@/lib/types'

interface SidebarProps {
  role: Role
  view: string
  onNavigate: (v: string) => void
  userName: string
}

export const Sidebar = ({ role, view, onNavigate, userName }: SidebarProps) => {
  const adminNav = [{ id: 'admin-dashboard', label: 'Clientes', icon: 'users' }]
  const cfoNav = [{ id: 'cfo-dashboard', label: 'Mis Clientes', icon: 'users' }]
  const nav = role === 'admin' ? adminNav : cfoNav
  const { setRole } = useApp()

  return (
    <aside style={{ background: '#0d1117', width: 240, minWidth: 240 }} className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div style={{ background: 'oklch(0.55 0.18 245)', borderRadius: 8 }} className="w-8 h-8 flex items-center justify-center">
            <Icon name="briefcase" size={15} style={{ color: 'white' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", color: 'white', fontSize: 17, lineHeight: 1.1 }}>CONPAT</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Gestión Patrimonial</div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3">
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }} className="flex items-center gap-2">
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: role === 'admin' ? 'oklch(0.7 0.15 145)' : 'oklch(0.7 0.15 250)' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.08em' }}>
            {role === 'admin' ? 'ADMINISTRADOR' : 'CFO EXTERNO'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map(item => {
          const active = view.startsWith(item.id.split('-')[0] + '-') || view === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', textAlign: 'left', borderRadius: 8, padding: '9px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: active ? 'oklch(0.55 0.18 245)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                boxShadow: active ? '0 0 16px oklch(0.55 0.18 245 / 0.35)' : 'none',
                transition: 'all 0.15s', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
              }}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'oklch(0.55 0.18 245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{userName?.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
          </div>
          <button
            onClick={() => setRole(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
            title="Cerrar sesión"
          >
            <Icon name="logout" size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
