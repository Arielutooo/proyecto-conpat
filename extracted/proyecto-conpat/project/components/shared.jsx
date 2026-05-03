
const { useState, useEffect, useRef, createContext, useContext } = React;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CLIENTES = [
  {
    id: '1', razon_social: 'Inversiones del Sur SpA', rut: '76.123.456-7',
    tipo_sociedad: 'SpA', regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: true, emite_facturas: true, boletas_honorarios: false,
    created_at: '2024-01-15',
    socios: [
      { id: 's1', nombre: 'Rodrigo Vargas M.', rut: '12.345.678-9', porcentaje_participacion: 60 },
      { id: 's2', nombre: 'Catalina Soto P.', rut: '13.456.789-0', porcentaje_participacion: 40 },
    ],
    inversiones: [
      { id: 'i1', tipo_inversion: 'Fondo_Mutuo', descripcion: 'BCI Asset Management · Renta Fija', ingreso_mensual_asociado: 850000 },
      { id: 'i2', tipo_inversion: 'Inmueble_Arrendado', descripcion: 'Oficina Providencia 480m²', ingreso_mensual_asociado: 1200000 },
    ],
    retiros: [
      { id: 'r1', socio_id: 's1', socio_nombre: 'Rodrigo Vargas M.', monto: 3500000, fecha: '2025-01-15', comprobante_url: 'comprobante_r1.pdf' },
      { id: 'r2', socio_id: 's2', socio_nombre: 'Catalina Soto P.', monto: 2200000, fecha: '2025-01-20', comprobante_url: 'comprobante_r2.pdf' },
    ],
    cartolas: [{ id: 'c1', mes: 1, anio: 2025, archivo_url: 'cartola_enero_2025.pdf' }],
    entregables: [
      { id: 'e1', mes: 12, anio: 2024, tipo_documento: 'Balance', archivo_url: 'balance_dic2024.pdf', created_at: '2025-01-10' },
      { id: 'e2', mes: 1, anio: 2025, tipo_documento: 'F29', archivo_url: 'f29_ene2025.pdf', created_at: '2025-02-05' },
    ],
  },
  {
    id: '2', razon_social: 'Constructora Andina Ltda', rut: '77.654.321-K',
    tipo_sociedad: 'Ltda', regimen_tributario: '14D Transparente',
    tiene_nomina: true, emite_facturas: true, boletas_honorarios: true,
    created_at: '2024-03-22',
    socios: [
      { id: 's3', nombre: 'Felipe Morales R.', rut: '14.567.890-1', porcentaje_participacion: 50 },
      { id: 's4', nombre: 'Andrea Muñoz L.', rut: '15.678.901-2', porcentaje_participacion: 30 },
      { id: 's5', nombre: 'Inversiones FM SpA', rut: '76.987.654-3', porcentaje_participacion: 20 },
    ],
    inversiones: [
      { id: 'i3', tipo_inversion: 'Inmueble_Propio', descripcion: 'Bodega industrial Quilicura 2.400m²', ingreso_mensual_asociado: 0 },
      { id: 'i4', tipo_inversion: 'Acciones', descripcion: 'CMPC, Falabella, Banco de Chile', ingreso_mensual_asociado: 320000 },
    ],
    retiros: [], cartolas: [], entregables: [],
  },
  {
    id: '3', razon_social: 'Agrícola Los Robles EIRL', rut: '78.111.222-3',
    tipo_sociedad: 'EIRL', regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: false, emite_facturas: true, boletas_honorarios: false,
    created_at: '2024-06-10',
    socios: [{ id: 's6', nombre: 'Ignacio Pereira B.', rut: '16.789.012-3', porcentaje_participacion: 100 }],
    inversiones: [
      { id: 'i5', tipo_inversion: 'Fondo_Mutuo', descripcion: 'Santander AM · Renta Variable', ingreso_mensual_asociado: 410000 },
    ],
    retiros: [{ id: 'r3', socio_id: 's6', socio_nombre: 'Ignacio Pereira B.', monto: 4800000, fecha: '2025-01-08', comprobante_url: 'comprobante_r3.pdf' }],
    cartolas: [{ id: 'c2', mes: 1, anio: 2025, archivo_url: 'cartola_enero_2025.pdf' }],
    entregables: [{ id: 'e3', mes: 1, anio: 2025, tipo_documento: 'Informe_Contable', archivo_url: 'informe_ene2025.pdf', created_at: '2025-02-08' }],
  },
  {
    id: '4', razon_social: 'Tech Ventures SpA', rut: '76.500.100-5',
    tipo_sociedad: 'SpA', regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: true, emite_facturas: true, boletas_honorarios: true,
    created_at: '2024-09-01',
    socios: [
      { id: 's7', nombre: 'Valentina Cruz H.', rut: '17.890.123-4', porcentaje_participacion: 70 },
      { id: 's8', nombre: 'Matías Ibáñez O.', rut: '18.901.234-5', porcentaje_participacion: 30 },
    ],
    inversiones: [
      { id: 'i6', tipo_inversion: 'Acciones', descripcion: 'Portfolio NYSE: AAPL, MSFT, NVDA', ingreso_mensual_asociado: 620000 },
    ],
    retiros: [], cartolas: [], entregables: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCLP = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TIPO_DOC_LABELS = { Balance: 'Balance', F29: 'Form. 29', Informe_Contable: 'Inf. Contable', Pago_IVA: 'Pago IVA' };
const TIPO_INV_LABELS = { Fondo_Mutuo: 'Fondo Mutuo', Inmueble_Propio: 'Inmueble Propio', Inmueble_Arrendado: 'Inmueble Arrendado', Acciones: 'Acciones' };

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, className = '' }) => {
  const paths = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    plus: "M12 5v14 M5 12h14",
    chevronRight: "M9 18l6-6-6-6",
    chevronDown: "M6 9l6 6 6-6",
    building: "M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9v.01 M9 12v.01 M9 15v.01 M9 18v.01",
    briefcase: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18 M6 6l12 12",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    inbox: "M22 12h-6l-2 3H10l-2-3H2 M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
    trendingUp: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    menu: "M3 12h18 M3 6h18 M3 18h18",
    search: "M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35",
    calendar: "M8 2v4 M16 2v4 M3 10h18 M21 8v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z",
    dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] && paths[name].split(' M').map((d, i) => (
        <path key={i} d={i === 0 ? d : 'M' + d} />
      ))}
    </svg>
  );
};

// ─── AppContext ───────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'blue', size = 'sm' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ role, view, onNavigate, userName }) => {
  const adminNav = [
    { id: 'admin-dashboard', label: 'Clientes', icon: 'users' },
  ];
  const cfoNav = [
    { id: 'cfo-dashboard', label: 'Mis Clientes', icon: 'users' },
  ];
  const nav = role === 'admin' ? adminNav : cfoNav;
  const { setView, setRole } = useApp();

  return (
    <aside style={{ background: '#0d1117', width: 240, minWidth: 240 }} className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div style={{ background: 'oklch(0.55 0.18 245)', borderRadius: 8 }} className="w-8 h-8 flex items-center justify-center">
            <Icon name="briefcase" size={15} className="text-white" />
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", color: 'white', fontSize: 17, lineHeight: 1.1 }}>CONPAT</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Gestión Patrimonial</div>
          </div>
        </div>
      </div>

      {/* Role pill */}
      <div className="px-5 py-3">
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }} className="flex items-center gap-2">
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: role === 'admin' ? 'oklch(0.7 0.15 145)' : 'oklch(0.7 0.15 250)' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.08em' }}>
            {role === 'admin' ? 'ADMINISTRADOR' : 'CFO EXTERNO'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map(item => {
          const active = view.startsWith(item.id.split('-')[0] + '-') || view === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', textAlign: 'left', borderRadius: 8, padding: '9px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: active ? 'oklch(0.55 0.18 245)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                boxShadow: active ? '0 0 16px oklch(0.55 0.18 245 / 0.35)' : 'none',
                transition: 'all 0.15s', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
              }}>
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'oklch(0.55 0.18 245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>
              {userName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          </div>
          <button onClick={() => setRole(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
            title="Cerrar sesión">
            <Icon name="logout" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
const TopBar = ({ breadcrumbs = [], action }) => (
  <div style={{ borderBottom: '1px solid #e5e8ef', background: 'white', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div className="flex items-center gap-2" style={{ color: '#6b7280', fontSize: 13 }}>
      {breadcrumbs.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevronRight" size={12} />}
          <span style={{ color: i === breadcrumbs.length - 1 ? '#0f172a' : '#6b7280', fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}>{b}</span>
        </React.Fragment>
      ))}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, className = '', style = {} }) => (
  <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', ...style }} className={className}>
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = false }) => (
  <Card style={{ padding: '20px 24px' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: accent ? 'oklch(0.55 0.18 245)' : '#0f172a', marginTop: 6, fontFamily: "'DM Serif Display', serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
  </Card>
);

// ─── Button ───────────────────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, icon, type = 'button', style = {} }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 8, fontWeight: 500, transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, ...style };
  const sizes = { sm: { padding: '6px 12px', fontSize: 12 }, md: { padding: '9px 18px', fontSize: 13 }, lg: { padding: '11px 24px', fontSize: 14 } };
  const variants = {
    primary: { background: 'oklch(0.55 0.18 245)', color: 'white', boxShadow: '0 1px 3px oklch(0.55 0.18 245 / 0.4)' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    ghost: { background: 'transparent', color: '#6b7280' },
    danger: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    success: { background: 'oklch(0.55 0.18 145)', color: 'white' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant] }}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
};

// ─── Input ───────────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = 'text', placeholder, required, hint, error, className = '' }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', border: `1px solid ${error ? '#fca5a5' : '#d1d5db'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', background: error ? '#fef2f2' : 'white', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
      onFocus={e => e.target.style.borderColor = 'oklch(0.55 0.18 245)'}
      onBlur={e => e.target.style.borderColor = error ? '#fca5a5' : '#d1d5db'}
    />
    {hint && !error && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</div>}
    {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</div>}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, required, className = '' }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}</label>}
    <select value={value} onChange={onChange}
      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
      onFocus={e => e.target.style.borderColor = 'oklch(0.55 0.18 245)'}
      onBlur={e => e.target.style.borderColor = '#d1d5db'}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── FileDropzone ─────────────────────────────────────────────────────────────
const FileDropzone = ({ label, onFile, accept = '.pdf', fileName }) => {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>{label}</label>}
      <div onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${drag ? 'oklch(0.55 0.18 245)' : '#d1d5db'}`,
          borderRadius: 10, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
          background: drag ? 'oklch(0.97 0.04 245)' : '#f9fafb', transition: 'all 0.15s',
        }}>
        <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
        {fileName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'oklch(0.55 0.18 245)' }}>
            <Icon name="file" size={16} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{fileName}</span>
          </div>
        ) : (
          <>
            <Icon name="upload" size={20} className="mx-auto" style={{ color: '#9ca3af', marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Arrastra aquí o <span style={{ color: 'oklch(0.55 0.18 245)', fontWeight: 500 }}>selecciona archivo</span></div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{accept.toUpperCase().replace(/\./g, '').split(',').join(', ')}</div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const cfg = { success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46', icon: 'check' }, error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: 'x' } };
  const c = cfg[type];
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', color: c.color, fontSize: 13, fontWeight: 500, animation: 'slideUp 0.2s ease' }}>
      <Icon name={c.icon} size={15} />
      {message}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose, width = 480 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e8ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, sub }) => (
  <div style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8' }}>
    <Icon name={icon} size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
    <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{title}</div>
    {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
  </div>
);

// ─── SociedadBadge ────────────────────────────────────────────────────────────
const getSociedadColor = (tipo) => ({ SpA: 'blue', Ltda: 'purple', EIRL: 'amber', SA: 'indigo' }[tipo] || 'slate');

Object.assign(window, {
  MOCK_CLIENTES, MESES, TIPO_DOC_LABELS, TIPO_INV_LABELS,
  formatCLP, Icon, AppContext, useApp,
  Badge, Sidebar, TopBar, Card, StatCard, Btn, Input, Select,
  FileDropzone, Toast, Modal, EmptyState, getSociedadColor,
});
