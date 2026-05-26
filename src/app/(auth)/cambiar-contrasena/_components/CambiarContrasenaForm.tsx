'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function CambiarContrasenaForm() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      })
      if (error) {
        setError('No se pudo actualizar la contraseña. Intenta nuevamente.')
        return
      }
      router.push('/clientes')
      router.refresh()
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#0f172a',
    outline: 'none',
    background: 'white',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ background: 'oklch(0.97 0.06 50)', border: '1px solid oklch(0.88 0.08 50)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'oklch(0.45 0.15 50)' }}>
        Por seguridad, debes establecer una contraseña personal antes de continuar.
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
          Nueva contraseña <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="Mínimo 8 caracteres"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'oklch(0.55 0.18 245)')}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
          Confirmar contraseña <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="Repite tu nueva contraseña"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'oklch(0.55 0.18 245)')}
          onBlur={e => (e.target.style.borderColor = '#d1d5db')}
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
        disabled={isPending || !password || !confirm}
        style={{
          width: '100%',
          padding: '11px 24px',
          borderRadius: 8,
          border: 'none',
          background: isPending || !password || !confirm ? '#94a3b8' : 'oklch(0.55 0.18 245)',
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          cursor: isPending || !password || !confirm ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'opacity 0.15s',
          boxShadow: isPending || !password || !confirm ? 'none' : '0 1px 3px oklch(0.55 0.18 245 / 0.4)',
        }}
      >
        {isPending ? 'Guardando…' : 'Establecer contraseña'}
      </button>
    </form>
  )
}
