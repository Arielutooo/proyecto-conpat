'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { checkLoginAttempts, recordFailedAttempt, resetAttempts } from '@/lib/actions/login-attempts'

interface Props {
  sessionExpired?: boolean
}

export function LoginForm({ sessionExpired = false }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      // 1. Verificar si el email está bloqueado
      const check = await checkLoginAttempts(email)
      if (check.blocked) {
        const mins = check.minutesLeft ?? 1
        setError(`Demasiados intentos fallidos. Intenta nuevamente en ${mins} ${mins === 1 ? 'minuto' : 'minutos'}.`)
        return
      }

      // 2. Intentar login
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        await recordFailedAttempt(email)
        setError('Correo o contraseña incorrectos.')
        return
      }

      // 3. Login exitoso: limpiar intentos
      await resetAttempts(email)

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sessionExpired && !error && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Tu sesión ha expirado. Inicia sesión nuevamente.
        </div>
      )}

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
          onFocus={e => (e.target.style.borderColor = '#C84632')}
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
          onFocus={e => (e.target.style.borderColor = '#C84632')}
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
          background: isPending || !email || !password ? '#94a3b8' : '#C84632',
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          cursor: isPending || !email || !password ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'opacity 0.15s',
          boxShadow: isPending || !email || !password ? 'none' : '0 1px 3px rgba(200,70,50,0.4)',
        }}
      >
        {isPending ? 'Autenticando…' : 'Ingresar al sistema'}
      </button>
    </form>
  )
}
