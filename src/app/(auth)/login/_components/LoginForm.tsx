'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type RoleChoice = 'admin' | 'cfo_externo' | null

const ROLE_CARDS = [
  {
    role: 'admin' as const,
    label: 'Administrador',
    sub: 'Gestión completa',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    role: 'cfo_externo' as const,
    label: 'CFO Externo',
    sub: 'Portal contable',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
]

export function LoginForm() {
  const [role, setRole]     = useState<RoleChoice>(null)
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Correo o contraseña incorrectos.'); return }
      const mustChange = data.user?.user_metadata?.must_change_password === true
      router.push(mustChange ? '/cambiar-contrasena' : '/clientes')
      router.refresh()
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #EDEEF1',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#363E46',
    outline: 'none',
    background: 'white',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  /* ── Step 1: role selector ── */
  if (!role) {
    return (
      <div className="space-y-5">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#363E46', margin: '0 0 4px' }}>
            ¿Cómo ingresarás?
          </h2>
          <p style={{ fontSize: 13, color: '#464C5E', margin: 0 }}>Selecciona tu perfil de acceso</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_CARDS.map(card => (
            <button
              key={card.role}
              onClick={() => setRole(card.role)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '22px 16px',
                borderRadius: 12,
                border: '2px solid #EDEEF1',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#CB3817'
                e.currentTarget.style.background = '#FFF0EC'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#EDEEF1'
                e.currentTarget.style.background = 'white'
              }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#F3F3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#363E46' }}>
                {card.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#363E46' }}>{card.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{card.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── Step 2: credentials ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ background: '#FFF0EC', border: '1px solid #F4C5B5', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#CB3817', fontSize: 14 }}>◆</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#363E46' }}>
            {role === 'admin' ? 'Administrador · Gestor Patrimonial' : 'CFO Externo · Contable'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setRole(null); setError(null) }}
          style={{ fontSize: 12, fontWeight: 500, color: '#CB3817', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Cambiar
        </button>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
          Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="tu@empresa.cl"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#CB3817')}
          onBlur={e => (e.target.style.borderColor = '#EDEEF1')}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
          Contraseña <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#CB3817')}
          onBlur={e => (e.target.style.borderColor = '#EDEEF1')}
        />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !email || !password}
        style={{
          width: '100%',
          padding: '11px 24px',
          borderRadius: 8,
          border: 'none',
          background: isPending || !email || !password ? '#94a3b8' : '#CB3817',
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          cursor: isPending || !email || !password ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'opacity 0.15s',
          boxShadow: isPending || !email || !password ? 'none' : '0 1px 3px rgba(203,56,23,0.4)',
        }}
      >
        {isPending ? 'Autenticando…' : 'Ingresar al sistema'}
      </button>
    </form>
  )
}
