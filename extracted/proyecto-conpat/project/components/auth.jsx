
const LoginPage = ({ onLogin }) => {
  const [role, setRole] = React.useState(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const CREDS = {
    admin: { email: 'admin@conpat.cl', password: 'admin123', name: 'Sebastián Torres' },
    cfo_externo: { email: 'cfo@externos.cl', password: 'cfo123', name: 'Marcela Ruiz' },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const cred = CREDS[role];
      if (email === cred.email && password === cred.password) {
        onLogin(role, cred.name);
      } else {
        setError('Credenciales incorrectas. Intenta nuevamente.');
        setLoading(false);
      }
    }, 700);
  };

  const fillDemo = () => {
    setEmail(CREDS[role].email);
    setPassword(CREDS[role].password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9' }}>
      {/* Left panel */}
      <div style={{ width: '45%', background: '#0d1117', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'oklch(0.55 0.18 245 / 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'oklch(0.72 0.12 82 / 0.06)', pointerEvents: 'none' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{ background: 'oklch(0.55 0.18 245)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="briefcase" size={18} className="text-white" />
            </div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", color: 'white', fontSize: 22, lineHeight: 1 }}>CONPAT</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>CRM Patrimonial</div>
            </div>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'white', fontSize: 38, lineHeight: 1.15, margin: 0, marginBottom: 20 }}>
            Orquesta el flujo<br />patrimonial.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Plataforma operativa para gestores patrimoniales y CFOs externos. Centraliza clientes, socios, inversiones y documentos contables.
          </p>
        </div>

        <div>
          {[
            { icon: 'users', label: 'Gestión de socios y participaciones' },
            { icon: 'trendingUp', label: 'Control de inversiones por cartera' },
            { icon: 'file', label: 'Entregables contables en tiempo real' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 28 }}>Selecciona tu rol de acceso para continuar.</p>

          {/* Role selector */}
          {!role && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {[
                { id: 'admin', label: 'Administrador', sub: 'Gestor Patrimonial', icon: 'building', color: 'oklch(0.55 0.18 245)' },
                { id: 'cfo_externo', label: 'CFO Externo', sub: 'Acceso de lectura', icon: 'briefcase', color: 'oklch(0.55 0.18 145)' },
              ].map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ padding: '18px 16px', border: '1.5px solid #e5e8ef', borderRadius: 12, background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${r.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e8ef'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon name={r.icon} size={16} style={{ color: r.color }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.sub}</div>
                </button>
              ))}
            </div>
          )}

          {role && (
            <form onSubmit={handleSubmit}>
              <div style={{ background: role === 'admin' ? 'oklch(0.97 0.04 245)' : 'oklch(0.97 0.04 145)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: role === 'admin' ? 'oklch(0.35 0.18 245)' : 'oklch(0.35 0.18 145)', fontWeight: 600 }}>
                  {role === 'admin' ? '🔷 Administrador · Gestor Patrimonial' : '🟢 CFO Externo'}
                </span>
                <button type="button" onClick={() => { setRole(null); setEmail(''); setPassword(''); setError(''); }}
                  style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Cambiar</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Input label="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@empresa.cl" required />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Input label="Contraseña" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
              </div>

              <button type="button" onClick={fillDemo}
                style={{ fontSize: 11, color: 'oklch(0.55 0.18 245)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, textDecoration: 'underline' }}>
                Usar credenciales de demo
              </button>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#dc2626', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="alert" size={13} /> {error}
                </div>
              )}

              <Btn type="submit" disabled={loading || !email || !password} style={{ width: '100%', justifyContent: 'center' }} size="lg">
                {loading ? 'Autenticando…' : 'Ingresar al sistema'}
              </Btn>
            </form>
          )}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>CONPAT v1.0 — Fase 1 MVP Local · Supabase + Next.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage });
