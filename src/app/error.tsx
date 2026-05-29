'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F3EB', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ fontSize: 22 }}>⚠</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Algo salió mal</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          {error.message || 'Ocurrió un error inesperado en la aplicación.'}
        </div>
        <button
          onClick={reset}
          style={{ padding: '10px 24px', background: '#CB3817', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
