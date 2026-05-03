
const { useState } = React;

const STEPS = [
  { n: 1, label: 'Datos Cliente', sub: 'Empresa y socios' },
  { n: 2, label: 'Inversiones',   sub: 'Portafolio de activos' },
  { n: 3, label: 'Operaciones',   sub: 'Configuración fiscal' },
];

const emptyInversion = () => ({ tipo_inversion: 'Fondo_Mutuo', descripcion: '', aum_apertura: '', fecha_apertura: '01/01/2025', aum_cierre: '', fecha_cierre: '31/12/2025' });
const emptySocio    = () => ({ nombre: '', rut: '', porcentaje_participacion: '' });

const OnboardingWizard = ({ onFinish, onCancel }) => {
  const { userName } = useApp();
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  /* ── Step 1 ── */
  const [razon_social, setRazonSocial]   = useState('');
  const [rut, setRut]                     = useState('');
  const [tipo_sociedad, setTipoSociedad]  = useState('SpA');
  const [regimen_tributario, setRegimen]  = useState('14A Semi-Integrado');
  const [actividad_economica, setActividad] = useState('');
  const [codigo_sii, setCodigoSII]        = useState('');
  const [iniciacion_actividades, setIniciacion] = useState(false);
  const [rentas_presuntas, setRentasPresuntas]   = useState(false);
  const [factura_conpat, setFacturaConpat]       = useState(true);
  const [factura_moneda, setFacturaMoneda]       = useState('UF');
  const [factura_monto, setFacturaMonto]         = useState('');
  const [socios, setSocios] = useState([emptySocio()]);

  /* ── Step 2 ── */
  const [sinInversiones, setSinInversiones] = useState(false);
  const [inversiones, setInversiones]       = useState([emptyInversion()]);

  /* ── Step 3 ── */
  const [tiene_nomina, setNomina]         = useState(false);
  const [emite_facturas, setFacturas]     = useState(true);
  const [boletas_honorarios, setBoletas]  = useState(false);

  /* ── Socios helpers ── */
  const updateSocio = (i, k, v) => { const a = [...socios]; a[i] = { ...a[i], [k]: v }; setSocios(a); };
  const addSocio    = () => setSocios([...socios, emptySocio()]);
  const removeSocio = (i) => socios.length > 1 && setSocios(socios.filter((_, idx) => idx !== i));
  const totalPct = socios.reduce((s, x) => s + (parseFloat(x.porcentaje_participacion) || 0), 0);
  const pctOk    = Math.abs(totalPct - 100) < 0.01;

  /* ── Inversiones helpers ── */
  const updateInv = (i, k, v) => { const a = [...inversiones]; a[i] = { ...a[i], [k]: v }; setInversiones(a); };
  const addInv    = () => setInversiones([...inversiones, emptyInversion()]);
  const removeInv = (i) => inversiones.length > 1 && setInversiones(inversiones.filter((_, idx) => idx !== i));

  /* ── Nav guards ── */
  const canNext1 = razon_social.trim() && rut.trim() && pctOk && socios.every(s => s.nombre && s.rut);
  const canNext2 = sinInversiones || inversiones.every(i => i.descripcion.trim());

  /* ── Finish ── */
  const handleFinish = () => {
    setSaving(true);
    const now   = new Date();
    const ts    = now.toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    setTimeout(() => {
      const newCliente = {
        id: Date.now().toString(),
        razon_social: razon_social.trim(),
        rut: rut.trim(),
        tipo_sociedad, regimen_tributario,
        actividad_economica: actividad_economica.trim(),
        codigo_sii: codigo_sii.trim(),
        iniciacion_actividades, rentas_presuntas,
        factura_conpat, factura_moneda, factura_monto,
        tiene_nomina, emite_facturas, boletas_honorarios,
        sin_inversiones: sinInversiones,
        created_at:      now.toISOString().split('T')[0],
        created_by:      userName || 'Administrador',
        created_at_full: ts,
        socios: socios.map((s, i) => ({ ...s, id: `ns${i}`, porcentaje_participacion: parseFloat(s.porcentaje_participacion) })),
        inversiones: sinInversiones ? [] : inversiones.map((inv, i) => ({ ...inv, id: `ni${i}`, aum_apertura: parseFloat(inv.aum_apertura) || 0, aum_cierre: parseFloat(inv.aum_cierre) || 0 })),
        retiros: [], cartolas: [], entregables: [],
      };
      setSaving(false);
      onFinish(newCliente);
    }, 900);
  };

  const pctColor = totalPct > 100 ? '#dc2626' : pctOk ? '#059669' : '#d97706';

  /* ── Toggle row ── */
  const TRow = ({ label, sub, value, setter, icon }) => (
    <div onClick={() => setter(!value)}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10,
        border:`1.5px solid ${value ? 'oklch(0.55 0.18 245)' : '#e5e8ef'}`,
        background: value ? 'oklch(0.97 0.04 245)' : 'white',
        cursor:'pointer', transition:'all 0.15s', marginBottom:8 }}>
      <div style={{ width:34, height:34, borderRadius:8, background: value ? 'oklch(0.55 0.18 245)' : '#f8fafc',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
        <Icon name={icon} size={15} style={{ color: value ? 'white' : '#94a3b8' }} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>{sub}</div>}
      </div>
      <div style={{ width:20, height:20, borderRadius:4,
        border:`2px solid ${value ? 'oklch(0.55 0.18 245)' : '#d1d5db'}`,
        background: value ? 'oklch(0.55 0.18 245)' : 'white',
        display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
        {value && <Icon name="check" size={11} style={{ color:'white' }} />}
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <TopBar breadcrumbs={['Administración', 'Clientes', 'Nuevo Cliente']} />

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* ── Step rail ── */}
        <div style={{ width:220, background:'white', borderRight:'1px solid #e5e8ef', padding:'32px 24px', flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:24 }}>Progreso</div>
          {STEPS.map((s, idx) => {
            const done = step > s.n, active = step === s.n;
            return (
              <div key={s.n} style={{ display:'flex', gap:14, marginBottom:32, position:'relative' }}>
                {idx < STEPS.length - 1 && (
                  <div style={{ position:'absolute', left:14, top:28, width:2, height:28, background: done ? 'oklch(0.55 0.18 245)' : '#e5e8ef', transition:'background 0.3s' }} />
                )}
                <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
                  background: done ? 'oklch(0.55 0.18 245)' : active ? 'white' : '#f8fafc',
                  border:`2px solid ${done ? 'oklch(0.55 0.18 245)' : active ? 'oklch(0.55 0.18 245)' : '#e5e8ef'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                  {done ? <Icon name="check" size={12} style={{ color:'white' }} /> :
                    <span style={{ fontSize:11, fontWeight:700, color: active ? 'oklch(0.55 0.18 245)' : '#94a3b8' }}>{s.n}</span>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight: active ? 700 : 500, color: active ? '#0f172a' : done ? '#374151' : '#94a3b8' }}>{s.label}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
            <Btn variant="ghost" size="sm" onClick={onCancel}>Cancelar</Btn>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflow:'auto', padding:36 }}>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div style={{ maxWidth:640 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Datos del Cliente</h2>
              <p style={{ color:'#6b7280', fontSize:13, marginBottom:26 }}>Ingresa la información de la sociedad, datos tributarios y socios.</p>

              {/* Datos de la empresa */}
              <Card style={{ padding:24, marginBottom:18 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:16 }}>Datos de la Empresa</h3>
                <div style={{ marginBottom:14 }}>
                  <Input label="Razón Social" value={razon_social} onChange={e => setRazonSocial(e.target.value)} placeholder="Ejemplo SpA" required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <Input label="RUT" value={rut} onChange={e => setRut(e.target.value)} placeholder="76.XXX.XXX-X" required />
                  <Select label="Tipo de Sociedad" value={tipo_sociedad} onChange={e => setTipoSociedad(e.target.value)} required
                    options={['SpA','Ltda','EIRL','SA','EU'].map(v => ({ value:v, label: v === 'EU' ? 'EU — Empresa Unipersonal' : v }))} />
                  <Select label="Régimen Tributario" value={regimen_tributario} onChange={e => setRegimen(e.target.value)} required
                    options={['14A Semi-Integrado','14D Transparente','14 TER Pyme','14D Pyme'].map(v => ({ value:v, label:v }))} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <Input label="Actividad Económica" value={actividad_economica} onChange={e => setActividad(e.target.value)} placeholder="Ej: Servicios contables" />
                  <Input label="Código SII" value={codigo_sii} onChange={e => setCodigoSII(e.target.value)} placeholder="Ej: 742000" hint="Bajar código desde SII" />
                </div>
              </Card>

              {/* Características tributarias */}
              <Card style={{ padding:24, marginBottom:18 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Características Tributarias</h3>
                <TRow label="Iniciación de Actividades" sub="La empresa tiene inicio formal de actividades ante el SII" value={iniciacion_actividades} setter={setIniciacion} icon="check" />
                <TRow label="Tiene Rentas Presuntas" sub="Opera bajo el régimen de renta presunta" value={rentas_presuntas} setter={setRentasPresuntas} icon="dollar" />
              </Card>

              {/* Facturación Conpat */}
              <Card style={{ padding:24, marginBottom:18 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Facturación Conpat</h3>
                <TRow label="Conpat le factura a este cliente" sub="Conpat emite facturas por sus servicios de gestión patrimonial" value={factura_conpat} setter={setFacturaConpat} icon="file" />
                {factura_conpat && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:4 }}>
                    <Select label="Moneda" value={factura_moneda} onChange={e => setFacturaMoneda(e.target.value)}
                      options={['CLP','UF','USD'].map(v => ({ value:v, label:v }))} />
                    <Input label={`Monto mensual (${factura_moneda})`} value={factura_monto} onChange={e => setFacturaMonto(e.target.value)} type="number" placeholder="Ej: 4.2" />
                  </div>
                )}
              </Card>

              {/* Socios */}
              <Card style={{ padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ fontSize:13, fontWeight:600, color:'#374151', margin:0 }}>Socios y Participaciones</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:pctColor }}>{totalPct.toFixed(1)}% / 100%</div>
                    <Btn size="sm" variant="secondary" icon="plus" onClick={addSocio}>Agregar</Btn>
                  </div>
                </div>
                {socios.map((s, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px 32px', gap:12, marginBottom:12, alignItems:'end' }}>
                    <Input label={i === 0 ? 'Nombre completo' : ''} value={s.nombre} onChange={e => updateSocio(i,'nombre',e.target.value)} placeholder="Nombre del socio" required />
                    <Input label={i === 0 ? 'RUT Socio' : ''} value={s.rut} onChange={e => updateSocio(i,'rut',e.target.value)} placeholder="12.XXX.XXX-X" required />
                    <Input label={i === 0 ? '% Part.' : ''} value={s.porcentaje_participacion} onChange={e => updateSocio(i,'porcentaje_participacion',e.target.value)} type="number" placeholder="0" />
                    <button onClick={() => removeSocio(i)} disabled={socios.length === 1}
                      style={{ height:36, width:32, border:'1px solid #fecaca', borderRadius:8, background:'#fef2f2', color:'#dc2626', cursor: socios.length === 1 ? 'not-allowed' : 'pointer', opacity: socios.length === 1 ? 0.4 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}
                {!pctOk && totalPct > 0 && (
                  <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#92400e', marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
                    <Icon name="alert" size={12} /> Las participaciones deben sumar exactamente 100%. Actual: {totalPct.toFixed(1)}%
                  </div>
                )}
              </Card>

              <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
                <Btn disabled={!canNext1} onClick={() => setStep(2)} icon="chevronRight">Siguiente: Inversiones</Btn>
              </div>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div style={{ maxWidth:640 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Inversiones</h2>
              <p style={{ color:'#6b7280', fontSize:13, marginBottom:22 }}>Registra el portafolio de activos de la sociedad.</p>

              {/* Toggle sin inversiones */}
              <div onClick={() => setSinInversiones(!sinInversiones)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px',
                  border:`1.5px solid ${sinInversiones ? 'oklch(0.55 0.18 245)' : '#e2e8f0'}`,
                  borderRadius:12, background: sinInversiones ? 'oklch(0.97 0.04 245)' : 'white',
                  cursor:'pointer', transition:'all .2s', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>Cliente sin inversiones</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Deshabilita el módulo de inversiones para este cliente</div>
                </div>
                <div style={{ width:40, height:22, borderRadius:11, background: sinInversiones ? 'oklch(0.55 0.18 245)' : '#d1d5db', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:3, left: sinInversiones ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'white', boxShadow:'0 1px 3px rgba(0,0,0,.2)', transition:'left .2s' }} />
                </div>
              </div>

              {!sinInversiones && (
                <>
                  {inversiones.map((inv, i) => (
                    <Card key={i} style={{ padding:20, marginBottom:16 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:'oklch(0.55 0.18 245)' }} />
                          <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>Inversión #{i + 1}</span>
                        </div>
                        {inversiones.length > 1 && (
                          <button onClick={() => removeInv(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:11 }}>Eliminar</button>
                        )}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:12 }}>
                        <Select label="Tipo de Inversión" value={inv.tipo_inversion} onChange={e => updateInv(i,'tipo_inversion',e.target.value)}
                          options={Object.entries(TIPO_INV_LABELS).map(([v,l]) => ({ value:v, label:l }))} />
                        <div />
                        <div style={{ gridColumn:'span 2' }}>
                          <Input label="Descripción" value={inv.descripcion} onChange={e => updateInv(i,'descripcion',e.target.value)} placeholder="Ej: BCI Asset Management · Renta Fija" required />
                        </div>
                      </div>
                      {/* AUM Apertura / Cierre */}
                      <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>AUM de la Inversión</div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:10 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:2 }}>Apertura</div>
                          <div style={{ fontSize:11, fontWeight:600, color:'#374151', marginBottom:2 }}>Cierre</div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                          <Input label="Valor Apertura (CLP)" value={inv.aum_apertura} onChange={e => updateInv(i,'aum_apertura',e.target.value)} type="number" placeholder="0" />
                          <Input label="Valor Cierre (CLP)" value={inv.aum_cierre} onChange={e => updateInv(i,'aum_cierre',e.target.value)} type="number" placeholder="0" />
                          <Input label="Fecha Apertura" value={inv.fecha_apertura} onChange={e => updateInv(i,'fecha_apertura',e.target.value)} placeholder="DD/MM/AAAA" />
                          <Input label="Fecha Cierre" value={inv.fecha_cierre} onChange={e => updateInv(i,'fecha_cierre',e.target.value)} placeholder="DD/MM/AAAA" />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Btn variant="secondary" icon="plus" onClick={addInv} style={{ marginBottom:24 }}>Agregar Inversión</Btn>
                </>
              )}

              <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>Volver</Btn>
                <Btn disabled={!canNext2} onClick={() => setStep(3)} icon="chevronRight">Siguiente: Operaciones</Btn>
              </div>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            <div style={{ maxWidth:640 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Configuración Operacional</h2>
              <p style={{ color:'#6b7280', fontSize:13, marginBottom:28 }}>Indica las características fiscales y operativas de la empresa.</p>

              <Card style={{ padding:24, marginBottom:24 }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:20 }}>Operaciones Activas</h3>
                {[
                  { key:'nomina',   label:'Nómina de trabajadores',       sub:'La empresa tiene empleados con liquidaciones de sueldo', value:tiene_nomina,       setter:setNomina,   icon:'users' },
                  { key:'facturas', label:'Emisión de facturas a cliente', sub:'Opera con documentos tributarios electrónicos (DTE)',    value:emite_facturas,     setter:setFacturas, icon:'file' },
                  { key:'boletas',  label:'Boletas de honorarios',         sub:'Trabaja con prestadores de servicios independientes',    value:boletas_honorarios, setter:setBoletas,  icon:'paperclip' },
                ].map(opt => (
                  <div key={opt.key} onClick={() => opt.setter(!opt.value)}
                    style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
                      border:`1.5px solid ${opt.value ? 'oklch(0.55 0.18 245)' : '#e5e8ef'}`,
                      background: opt.value ? 'oklch(0.97 0.04 245)' : 'white',
                      cursor:'pointer', marginBottom:10, transition:'all 0.15s' }}>
                    <div style={{ width:38, height:38, borderRadius:9, background: opt.value ? 'oklch(0.55 0.18 245)' : '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                      <Icon name={opt.icon} size={16} style={{ color: opt.value ? 'white' : '#94a3b8' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{opt.label}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{opt.sub}</div>
                    </div>
                    <div style={{ width:20, height:20, borderRadius:4,
                      border:`2px solid ${opt.value ? 'oklch(0.55 0.18 245)' : '#d1d5db'}`,
                      background: opt.value ? 'oklch(0.55 0.18 245)' : 'white',
                      display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                      {opt.value && <Icon name="check" size={11} style={{ color:'white' }} />}
                    </div>
                  </div>
                ))}
              </Card>

              {/* Resumen */}
              <Card style={{ padding:20, marginBottom:28, background:'#f8fafc', border:'1px solid #e5e8ef' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:12 }}>Resumen del cliente</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                  {[
                    ['Razón Social', razon_social],
                    ['RUT', rut],
                    ['Tipo', tipo_sociedad],
                    ['Régimen', regimen_tributario],
                    ['Socios', socios.length],
                    ['Inversiones', sinInversiones ? 'Sin inversiones' : inversiones.length],
                    ['Inicia Actividades', iniciacion_actividades ? 'Sí' : 'No'],
                    ['Rentas Presuntas', rentas_presuntas ? 'Sí' : 'No'],
                    ['Conpat Factura', factura_conpat ? `Sí · ${factura_monto || '—'} ${factura_moneda}` : 'No'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span style={{ color:'#94a3b8' }}>{k}: </span>
                      <span style={{ fontWeight:600, color:'#374151' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <Btn variant="secondary" onClick={() => setStep(2)}>Volver</Btn>
                <Btn variant="success" icon="check" onClick={handleFinish} disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear Cliente'}
                </Btn>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OnboardingWizard });
