import { CambiarContrasenaForm } from './_components/CambiarContrasenaForm'

export default function CambiarContrasenaPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
        padding: '36px 32px',
        margin: '0 16px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'oklch(0.97 0.04 245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.18 245)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.55 0.18 245)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              CONPAT
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Cambio de contraseña
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Es tu primer acceso. Define una contraseña segura para continuar.
          </p>
        </div>

        <CambiarContrasenaForm />
      </div>
    </div>
  )
}
