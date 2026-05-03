
const { useState } = React;

// ─── CFO Dashboard ────────────────────────────────────────────────────────────
const CFODashboard = ({ clientes, onSelectCliente }) => {
  const [search, setSearch] = useState('');
  const filtered = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) || c.rut.includes(search)
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar breadcrumbs={['Portal CFO', 'Mis Clientes']} />
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0d1117 0%, oklch(0.2 0.06 245) 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Portal CFO Externo</div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'DM Serif Display', serif" }}>Panel de Trabajo Contable</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0' }}>Accede a la información de cada cliente y sube los entregables contables del período.</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            {[
              { label: 'Clientes', val: clientes.length },
              { label: 'Con entregables', val: clientes.filter(c => c.entregables.length > 0).length },
              { label: 'Pendientes', val: clientes.filter(c => c.entregables.length === 0).length },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', serif" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e5e8ef', borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none', background: 'white', boxSizing: 'border-box' }} />
        </div>

        {/* Client grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(c => {
            const totalIngreso = c.inversiones.reduce((s, i) => s + i.ingreso_mensual_asociado, 0);
            const pendiente = c.entregables.length === 0;
            return (
              <Card key={c.id} style={{ padding: 20, cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${pendiente ? '#fde68a' : '#e5e8ef'}` }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onClick={() => onSelectCliente(c)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'oklch(0.55 0.18 245)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{c.razon_social.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{c.razon_social}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{c.rut}</div>
                    </div>
                  </div>
                  {pendiente ? <Badge color="amber">Pendiente</Badge> : <Badge color="green">{c.entregables.length} entregable{c.entregables.length > 1 ? 's' : ''}</Badge>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'Socios', val: c.socios.length },
                    { label: 'Cartolas', val: c.cartolas.length },
                    { label: 'Retiros', val: c.retiros.length },
                    { label: 'Ingreso/mes', val: totalIngreso > 0 ? formatCLP(totalIngreso) : '—' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{m.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge color={getSociedadColor(c.tipo_sociedad)}>{c.tipo_sociedad}</Badge>
                  <Badge color="slate">{c.regimen_tributario}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── CFO Client View ──────────────────────────────────────────────────────────
const CFOClientView = ({ cliente: initialCliente, onBack, onUpdate }) => {
  const [cliente, setCliente] = useState(initialCliente);
  const [tab, setTab] = useState('radiografia');
  const [toast, setToast] = useState(null);

  // Upload entregable
  const [tipoDoc, setTipoDoc] = useState('F29');
  const [mes, setMes] = useState('1');
  const [anio, setAnio] = useState('2025');
  const [entregableFile, setEntregableFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); };

  const handleUpload = () => {
    if (!entregableFile) return;
    setUploading(true);
    setTimeout(() => {
      const updated = {
        ...cliente,
        entregables: [...cliente.entregables, {
          id: Date.now().toString(),
          mes: parseInt(mes),
          anio: parseInt(anio),
          tipo_documento: tipoDoc,
          archivo_url: entregableFile.name,
          created_at: new Date().toISOString().split('T')[0],
        }],
      };
      setCliente(updated);
      onUpdate(updated);
      setEntregableFile(null);
      setUploading(false);
      showToast('Entregable subido correctamente');
    }, 1100);
  };

  const TABS = [
    { id: 'radiografia', label: 'Radiografía' },
    { id: 'insumos', label: 'Buzón de Insumos' },
    { id: 'entregables', label: 'Mis Entregables' },
  ];

  const docColors = { Balance: 'blue', F29: 'green', Informe_Contable: 'purple', Pago_IVA: 'amber' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar
        breadcrumbs={['Mis Clientes', cliente.razon_social]}
        action={<Btn variant="secondary" onClick={onBack} style={{ transform: 'rotate(180deg)' }} icon="chevronRight">Volver</Btn>}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {/* Header */}
        <Card style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'oklch(0.55 0.18 145)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{cliente.razon_social.charAt(0)}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{cliente.razon_social}</h1>
              <Badge color={getSociedadColor(cliente.tipo_sociedad)}>{cliente.tipo_sociedad}</Badge>
              <Badge color="slate">Solo lectura</Badge>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>RUT {cliente.rut} · {cliente.regimen_tributario}</div>
          </div>
        </Card>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'white', border: '1px solid #e5e8ef', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? 'oklch(0.55 0.18 145)' : 'transparent', color: tab === t.id ? 'white' : '#6b7280', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Radiografía ── */}
        {tab === 'radiografia' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Datos Societarios</h3>
              {[
                ['Razón Social', cliente.razon_social],
                ['RUT', cliente.rut],
                ['Tipo Sociedad', cliente.tipo_sociedad],
                ['Régimen', cliente.regimen_tributario],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {cliente.tiene_nomina && <Badge color="blue">Nómina</Badge>}
                {cliente.emite_facturas && <Badge color="green">Facturación</Badge>}
                {cliente.boletas_honorarios && <Badge color="purple">Honorarios</Badge>}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Socios</h3>
              {cliente.socios.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{s.nombre.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{s.nombre}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{s.rut}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Serif Display', serif" }}>{s.porcentaje_participacion}%</div>
                </div>
              ))}
            </Card>

            <Card style={{ padding: 24, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Portafolio de Inversiones</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Tipo', 'Descripción', 'Ingreso Mensual'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cliente.inversiones.map((inv, i) => (
                    <tr key={inv.id} style={{ borderBottom: i < cliente.inversiones.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}><Badge color="indigo">{TIPO_INV_LABELS[inv.tipo_inversion]}</Badge></td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{inv.descripcion}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: inv.ingreso_mensual_asociado > 0 ? '#059669' : '#94a3b8' }}>
                        {inv.ingreso_mensual_asociado > 0 ? formatCLP(inv.ingreso_mensual_asociado) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ── Buzón Insumos ── */}
        {tab === 'insumos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Cartolas del Período</h3>
              </div>
              {cliente.cartolas.length === 0 ? (
                <EmptyState icon="file" title="Sin cartolas disponibles" sub="El administrador aún no ha subido cartolas" />
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {cliente.cartolas.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f8fafc' }}>
                      <Icon name="file" size={16} style={{ color: 'oklch(0.55 0.18 245)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{MESES[c.mes - 1]} {c.anio}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.archivo_url}</div>
                      </div>
                      <Btn size="sm" variant="secondary" icon="download">PDF</Btn>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Comprobantes de Retiro</h3>
              </div>
              {cliente.retiros.filter(r => r.comprobante_url).length === 0 ? (
                <EmptyState icon="paperclip" title="Sin comprobantes" sub="No hay retiros con comprobante adjunto" />
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {cliente.retiros.filter(r => r.comprobante_url).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f8fafc' }}>
                      <Icon name="paperclip" size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{r.socio_nombre}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatCLP(r.monto)} · {r.fecha}</div>
                      </div>
                      <Btn size="sm" variant="secondary" icon="download">PDF</Btn>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── Entregables CFO ── */}
        {tab === 'entregables' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 18px' }}>Subir Entregable Contable</h3>
              <div style={{ marginBottom: 14 }}>
                <Select label="Tipo de Documento" value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}
                  options={Object.entries(TIPO_DOC_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Select label="Mes" value={mes} onChange={e => setMes(e.target.value)}
                  options={MESES.map((m, i) => ({ value: String(i + 1), label: m }))} />
                <Input label="Año" value={anio} onChange={e => setAnio(e.target.value)} type="number" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <FileDropzone label="Archivo PDF" onFile={setEntregableFile} fileName={entregableFile?.name} />
              </div>
              <Btn onClick={handleUpload} disabled={!entregableFile || uploading} icon="upload" style={{ width: '100%', justifyContent: 'center' }} variant="success">
                {uploading ? 'Subiendo…' : 'Enviar al Administrador'}
              </Btn>
            </Card>

            <Card>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Historial de Entregables</h3>
              </div>
              {cliente.entregables.length === 0 ? (
                <EmptyState icon="inbox" title="Sin entregables" sub="Sube el primer documento contable" />
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {cliente.entregables.map((e, i) => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < cliente.entregables.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="file" size={16} style={{ color: '#16a34a' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{TIPO_DOC_LABELS[e.tipo_documento]}</span>
                          <Badge color={docColors[e.tipo_documento] || 'blue'}>{e.tipo_documento}</Badge>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{MESES[e.mes - 1]} {e.anio} · {e.created_at}</div>
                      </div>
                      <Btn size="sm" variant="ghost" icon="download" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

Object.assign(window, { CFODashboard, CFOClientView });
