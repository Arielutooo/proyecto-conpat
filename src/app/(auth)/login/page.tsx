import { ConpatLogo } from '@/components/ConpatLogo'
import { LoginForm } from './_components/LoginForm'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const params         = await searchParams
  const sessionExpired = params.session === 'expired'
  return (
    <>
      {/* Left dark panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden"
        style={{ width: '45%', background: '#363E46', padding: '48px 52px' }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,70,50,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        {/* Logo + headline */}
        <div>
          <div className="mb-16">
            <ConpatLogo variant="white" width={140} />
          </div>

          <h1 className="font-serif text-white mb-5" style={{ fontSize: 38, lineHeight: 1.15 }}>
            Orquesta el flujo<br />patrimonial.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Plataforma operativa para gestores patrimoniales y CFOs externos. Centraliza clientes, socios, inversiones y documentos contables.
          </p>
        </div>

        {/* Feature list */}
        <div>
          {[
            { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', label: 'Gestión de socios y participaciones' },
            { d: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6', label: 'Control de inversiones por cartera' },
            { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', label: 'Entregables contables en tiempo real' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.d.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right light panel */}
      <div className="flex-1 flex items-center justify-center p-12" style={{ background: '#F3F3EB' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold mb-1.5" style={{ color: '#363E46' }}>Iniciar sesión</h2>
          <p className="text-sm mb-7" style={{ color: '#464C5E' }}>Ingresa tus credenciales para acceder al sistema.</p>
          <LoginForm sessionExpired={sessionExpired} />
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid #EDEEF1' }}>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>CONPAT · Sistema de Gestión Patrimonial</p>
          </div>
        </div>
      </div>
    </>
  )
}
