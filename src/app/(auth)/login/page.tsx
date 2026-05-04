import { LoginForm } from './_components/LoginForm'

export default function LoginPage() {
  return (
    <>
      {/* Left dark panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden"
        style={{ width: '45%', background: '#0d1117', padding: '48px 52px' }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'oklch(0.55 0.18 245 / 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'oklch(0.72 0.12 82 / 0.06)', pointerEvents: 'none' }} />

        {/* Logo + headline */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'oklch(0.55 0.18 245)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div>
              <div className="font-serif text-white" style={{ fontSize: 22, lineHeight: 1 }}>CONPAT</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>CRM Patrimonial</div>
            </div>
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
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1.5">Iniciar sesión</h2>
          <p className="text-slate-500 text-sm mb-7">Selecciona tu rol de acceso para continuar.</p>
          <LoginForm />
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">CONPAT v1.0 — Fase 1 MVP Local · Supabase + Next.js</p>
          </div>
        </div>
      </div>
    </>
  )
}
