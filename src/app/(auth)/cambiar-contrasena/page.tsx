import { ConpatLogo } from '@/components/ConpatLogo'
import { CambiarContrasenaForm } from './_components/CambiarContrasenaForm'

export default function CambiarContrasenaPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#F3F3EB' }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(54,62,70,0.08)',
        padding: '36px 32px',
        margin: '0 16px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <ConpatLogo variant="dark" width={110} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#363E46', margin: '0 0 6px' }}>
            Cambio de contraseña
          </h1>
          <p style={{ fontSize: 13, color: '#464C5E', margin: 0 }}>
            Es tu primer acceso. Define una contraseña segura para continuar.
          </p>
        </div>

        <CambiarContrasenaForm />
      </div>
    </div>
  )
}
