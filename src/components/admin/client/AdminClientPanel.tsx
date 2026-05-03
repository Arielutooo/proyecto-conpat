'use client'

import React, { useState, useRef } from 'react'
import { Icon } from '@/components/shared/Icon'
import { Badge } from '@/components/shared/Badge'
import { Btn } from '@/components/shared/Btn'
import { Toast } from '@/components/shared/Feedback'
import { MESES, TIPO_INV_LABELS, getSociedadColor } from '@/lib/helpers'
import { useApp } from '@/lib/context'
import type { Cliente, Socio, Inversion } from '@/lib/types'

// ─── Micro-primitives ─────────────────────────────────────────────────────────
const thS: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }
const tdS: React.CSSProperties = { padding: '13px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#374151' }

const Row = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
  </div>
)

const Pill = ({ ok, yes = 'Sí', no = 'No' }: { ok: boolean; yes?: string; no?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: ok ? '#f0fdf4' : '#f8fafc', color: ok ? '#15803d' : '#94a3b8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${ok ? '#bbf7d0' : '#e2e8f0'}` }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: ok ? '#15803d' : '#d1d5db', display: 'inline-block' }} />
    {ok ? yes : no}
  </span>
)

const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{children}</span>
    {action}
  </div>
)

const MiniToggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? 'oklch(0.55 0.18 245)' : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
  </button>
)

const DocCard = ({ label, file, onFile, onRemove, optional }: { label: string; file: File | null; onFile: (f: File) => void; onRemove: () => void; optional?: boolean }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div style={{ border: `1.5px dashed ${file ? '#86efac' : optional ? '#e2e8f0' : '#cbd5e1'}`, borderRadius: 10, padding: '14px 16px', background: file ? '#f0fdf4' : optional ? '#fafafa' : '#f8fafc', cursor: file ? 'default' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => !file && ref.current?.click()}>
      <input ref={ref} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div style={{ width: 34, height: 34, borderRadius: 8, background: file ? '#dcfce7' : 'white', border: `1px solid ${file ? '#86efac' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={file ? 'check' : 'upload'} size={15} style={{ color: file ? '#16a34a' : '#94a3b8' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{label}</div>
        {file ? <div style={{ fontSize: 11, color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
          : <div style={{ fontSize: 11, color: '#94a3b8' }}>{optional ? 'Opcional · PDF/DOCX' : 'Requerido · PDF/DOCX'}</div>}
      </div>
      {file
        ? <button onClick={e => { e.stopPropagation(); onRemove() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><Icon name="x" size={13} /></button>
        : <span style={{ fontSize: 11, color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 9px', flexShrink: 0 }}>{optional ? 'Subir' : 'Subir *'}</span>}
    </div>
  )
}

// ─── Tab Legales ──────────────────────────────────────────────────────────────
const TabLegales = ({ cliente, anioFiscal }: { cliente: Cliente; anioFiscal: string }) => {
  const [stdDocs, setStd] = useState<Record<string, File | null>>({ escritura: null, constitucion: null, extracto: null, protocolo: null })
  const [optDocs, setOpt] = useState<Record<string, File | null>>({ patente: null, modificaciones: null, cedulas: null, poderes: null })
  const setDoc = (s: string, k: string, f: File) => s === 'std' ? setStd(d => ({ ...d, [k]: f })) : setOpt(d => ({ ...d, [k]: f }))
  const removeDoc = (s: string, k: string) => s === 'std' ? setStd(d => ({ ...d, [k]: null })) : setOpt(d => ({ ...d, [k]: null }))

  const std: [string, string][] = [['escritura', 'Escritura Pública'], ['constitucion', 'Constitución de Sociedad'], ['extracto', 'Extracto'], ['protocolo', 'Protocolización']]
  const opt: [string, string][] = [['patente', 'Patente Comercial'], ['modificaciones', 'Modificaciones de Sociedad'], ['cedulas', 'Cédulas de Socios'], ['poderes', 'Poderes']]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <SectionTitle>Información Básica</SectionTitle>
          <Row label="Tipo de Sociedad" value={cliente.tipo_sociedad} />
          <Row label="Método de Creación" value="Tradicional" />
          <Row label="Representante Legal" value={cliente.socios[0]?.nombre} />
          <Row label="Régimen Tributario" value={cliente.regimen_tributario} />
          <Row label="RUT" value={cliente.rut} mono />
          <Row label="Nómina" value={<Pill ok={cliente.tiene_nomina} />} />
          <Row label="Emisión de Facturas a Cliente" value={<Pill ok={cliente.emite_facturas} />} />
          <Row label="Boletas de Honorarios" value={<Pill ok={cliente.boletas_honorarios} />} />
          <Row label="Iniciación de Actividades" value={<Pill ok={cliente.iniciacion_actividades ?? false} />} />
          <Row label="Actividad Económica" value={cliente.actividad_economica || '—'} />
          <Row label="Código SII" value={cliente.codigo_sii || '—'} mono />
          <Row label="Rentas Presuntas" value={<Pill ok={cliente.rentas_presuntas ?? false} />} />
        </div>
        <div>
          <SectionTitle>Facturación Interna Conpat</SectionTitle>
          <Row label="Conpat le factura" value={<Pill ok={true} />} />
          <Row label="Moneda" value={cliente.factura_moneda || 'UF'} />
          <Row label={`Honorario ${anioFiscal}`} value={`${cliente.factura_monto || '4.2'} ${cliente.factura_moneda || 'UF'} / mes`} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <SectionTitle>Documentación Estándar</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {std.map(([k, l]) => <DocCard key={k} label={l} file={stdDocs[k]} onFile={f => setDoc('std', k, f)} onRemove={() => removeDoc('std', k)} optional={false} />)}
          </div>
        </div>
        <div>
          <SectionTitle>Documentación Adicional</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {opt.map(([k, l]) => <DocCard key={k} label={l} file={optDocs[k]} onFile={f => setDoc('opt', k, f)} onRemove={() => removeDoc('opt', k)} optional={true} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab Socios ───────────────────────────────────────────────────────────────
const TabSocios = ({ cliente, anioFiscal }: { cliente: Cliente; anioFiscal: string }) => {
  const [certs, setCerts] = useState<Record<string, File | null>>({})
  const refs = useRef<Record<string, HTMLInputElement | null>>({})
  const total = cliente.socios.reduce((s, x) => s + (parseFloat(String(x.porcentaje_participacion)) || 0), 0)
  const ok = Math.abs(total - 100) < 0.01

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Participación total:</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: ok ? '#16a34a' : '#dc2626' }}>{total}%</span>
            <Pill ok={ok} yes="Válido" no="Error" />
          </div>
        }>Socios Registrados</SectionTitle>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={thS}>Nombre</th><th style={thS}>RUT</th><th style={{ ...thS, textAlign: 'right' }}>Participación</th></tr>
            </thead>
            <tbody>
              {cliente.socios.map((s, i) => (
                <tr key={s.id}>
                  <td style={tdS}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `hsl(${i * 73 + 210}deg 55% 90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: `hsl(${i * 73 + 210}deg 55% 35%)` }}>{s.nombre.charAt(0)}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.nombre}</span>
                    </div>
                  </td>
                  <td style={{ ...tdS, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{s.rut}</td>
                  <td style={{ ...tdS, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                      <div style={{ width: 72, height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.porcentaje_participacion}%`, background: 'oklch(0.55 0.18 245)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', minWidth: 34, textAlign: 'right' }}>{s.porcentaje_participacion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionTitle>Certificados de Retiro — Año {anioFiscal}</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cliente.socios.map(s => {
            const f = certs[s.id]
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: `1px solid ${f ? '#86efac' : '#e2e8f0'}`, borderRadius: 11, background: f ? '#f0fdf4' : 'white', transition: 'all .2s' }}>
                <input ref={el => { refs.current[s.id] = el }} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setCerts(c => ({ ...c, [s.id]: e.target.files![0] }))} />
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'oklch(0.55 0.18 245)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{s.nombre.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.nombre}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.porcentaje_participacion}% · {s.rut}</div>
                </div>
                {f
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                      <Icon name="paperclip" size={12} />{f.name}
                    </div>
                    <button onClick={() => setCerts(c => ({ ...c, [s.id]: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Icon name="x" size={13} /></button>
                  </div>
                  : <button onClick={() => refs.current[s.id]?.click()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', border: '1.5px dashed #d1d5db', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#64748b', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(0.55 0.18 245)'; e.currentTarget.style.color = 'oklch(0.45 0.18 245)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#64748b' }}>
                    <Icon name="upload" size={13} />Adjuntar Certificado {anioFiscal}
                  </button>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Tab Cartolas ─────────────────────────────────────────────────────────────
const BANCOS = ['Banco de Chile', 'BCI', 'Santander', 'Itaú', 'Scotiabank', 'BICE', 'Bancoestado', 'HSBC']

const TabCartolas = ({ cliente, anioFiscal }: { cliente: Cliente; anioFiscal: string }) => {
  const [archivos, setArchivos] = useState(
    cliente.cartolas.map(c => ({ id: c.id, banco: 'Banco de Chile', mes: MESES[c.mes - 1], anio: c.anio, archivo: c.archivo_url }))
  )
  const [banco, setBanco] = useState('Banco de Chile')
  const [mes, setMes] = useState('Enero')
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = () => {
    if (!file) return
    setArchivos(prev => [...prev, { id: String(Date.now()), banco, mes, anio: parseInt(anioFiscal), archivo: file.name }])
    setFile(null)
  }

  const selectStyle: React.CSSProperties = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 26 }

  return (
    <div style={{ maxWidth: 740 }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <SectionTitle>Configuración de Subida</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Banco</label>
            <select value={banco} onChange={e => setBanco(e.target.value)} style={selectStyle}>{BANCOS.map(b => <option key={b}>{b}</option>)}</select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mes</label>
            <select value={mes} onChange={e => setMes(e.target.value)} style={selectStyle}>{MESES.map(m => <option key={m}>{m}</option>)}</select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Año</label>
            <input type="number" value={anioFiscal} readOnly style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#64748b', background: '#f1f5f9', boxSizing: 'border-box' }} />
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => inputRef.current?.click()} style={{ flex: 1, padding: '10px 14px', border: `2px dashed ${file ? '#86efac' : '#d1d5db'}`, borderRadius: 9, background: file ? '#f0fdf4' : 'white', cursor: 'pointer', fontSize: 12, color: file ? '#16a34a' : '#64748b', fontWeight: file ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}>
            <Icon name={file ? 'check' : 'paperclip'} size={13} style={{ color: file ? '#16a34a' : '#94a3b8' }} />
            {file ? file.name : 'Seleccionar archivo PDF…'}
          </button>
          <button onClick={handleUpload} disabled={!file} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, background: file ? 'oklch(0.55 0.18 245)' : '#e2e8f0', color: file ? 'white' : '#94a3b8', border: 'none', cursor: file ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, flexShrink: 0, transition: 'all .15s' }}>
            <Icon name="upload" size={13} />Subir Cartola
          </button>
        </div>
      </div>

      <SectionTitle>{archivos.length > 0 ? `${archivos.length} cartola${archivos.length !== 1 ? 's' : ''} registrada${archivos.length !== 1 ? 's' : ''}` : 'Sin cartolas subidas'}</SectionTitle>
      {archivos.length > 0 && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thS}>Archivo</th><th style={thS}>Banco</th><th style={thS}>Mes / Año</th><th style={{ ...thS, textAlign: 'center', width: 80 }}>Acción</th></tr></thead>
            <tbody>
              {archivos.map(a => (
                <tr key={a.id} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={tdS}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={14} style={{ color: 'oklch(0.55 0.18 245)' }} /></div><span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{a.archivo}</span></div></td>
                  <td style={{ ...tdS, fontSize: 12, color: '#64748b' }}>{a.banco}</td>
                  <td style={{ ...tdS, fontSize: 12, color: '#64748b' }}>{a.mes} {a.anio}</td>
                  <td style={{ ...tdS, textAlign: 'center' }}>
                    <button onClick={() => setArchivos(prev => prev.filter(x => x.id !== a.id))} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #fecaca', borderRadius: 7, background: 'white', cursor: 'pointer', color: '#dc2626', fontSize: 11, fontWeight: 600 }} onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <Icon name="x" size={11} />Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Tab Inversiones ──────────────────────────────────────────────────────────
const MOCK_FINANCIERAS = [
  { id: 'f1', institucion: 'BCI Asset Management', tipo: 'FFMM', apertura: '18.500.000', cierre: '21.200.000', aperturaUSD: '19.072', cierreUSD: '21.855' },
  { id: 'f2', institucion: 'LarrainVial', tipo: 'Acciones', apertura: '9.200.000', cierre: '11.800.000', aperturaUSD: '9.485', cierreUSD: '12.165' },
  { id: 'f3', institucion: 'Santander AM', tipo: 'FFMM', apertura: '5.400.000', cierre: '5.800.000', aperturaUSD: '5.567', cierreUSD: '5.979' },
]
const MOCK_INMUEBLES = [
  { id: 'im1', nombre: 'Oficina Providencia', cantidad: 1, propia: true, valorUF: 4200, dfl2: false },
  { id: 'im2', nombre: 'Bodega Quilicura', cantidad: 2, propia: false, valorUF: 8500, dfl2: true },
]

const TabInversiones = ({ cliente, anioFiscal }: { cliente: Cliente; anioFiscal: string }) => {
  const [sinInversiones, setSinInversiones] = useState(false)
  const AUM_CLP = 38800000
  const AUM_USD = 40000

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: `1.5px solid ${sinInversiones ? 'oklch(0.55 0.18 245)' : '#e2e8f0'}`, borderRadius: 12, background: sinInversiones ? 'oklch(0.97 0.04 245)' : 'white', transition: 'all .2s' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Cliente sin inversiones</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Oculta y deshabilita el módulo de inversiones</div>
        </div>
        <MiniToggle value={sinInversiones} onChange={setSinInversiones} />
      </div>

      {sinInversiones ? (
        <div style={{ textAlign: 'center', padding: '52px 0', color: '#94a3b8' }}>
          <Icon name="briefcase" size={36} style={{ opacity: 0.25, marginBottom: 14, display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Módulo deshabilitado</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Este cliente no registra inversiones para el período {anioFiscal}.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Apertura de Año', val: `01/01/${anioFiscal}`, sub: 'Inicio del ejercicio fiscal', icon: 'calendar' },
              { label: 'Cierre de Año', val: `31/12/${anioFiscal}`, sub: 'Cierre del ejercicio fiscal', icon: 'check' },
            ].map(k => (
              <div key={k.label} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</span>
                  <Icon name={k.icon} size={14} style={{ color: '#94a3b8' }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{k.val}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: `AUM Total ${anioFiscal}`, val: `$${(AUM_CLP / 1000000).toFixed(1)}M CLP`, sub: `USD ${AUM_USD.toLocaleString('es-CL')}`, icon: 'trendingUp', color: 'oklch(0.55 0.18 245)' },
              { label: 'Fecha de Valoración', val: `31/12/${anioFiscal}`, sub: `Cierre ejercicio ${anioFiscal}`, icon: 'calendar', color: '#64748b' },
            ].map(k => (
              <div key={k.label} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</span>
                  <Icon name={k.icon} size={14} style={{ color: k.color }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Serif Display',serif" }}>{k.val}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div>
            <SectionTitle>Panel 1 — Financieras (FFMM y Acciones)</SectionTitle>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thS}>Institución</th><th style={thS}>Tipo</th><th style={{ ...thS, textAlign: 'right' }}>Año Apertura</th><th style={{ ...thS, textAlign: 'right' }}>Saldo Inicial</th><th style={{ ...thS, textAlign: 'right' }}>Año Cierre</th><th style={{ ...thS, textAlign: 'right' }}>Saldo Final</th></tr></thead>
                <tbody>
                  {MOCK_FINANCIERAS.map(f => (
                    <tr key={f.id} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ ...tdS, fontWeight: 600, color: '#0f172a' }}>{f.institucion}</td>
                      <td style={tdS}><span style={{ background: f.tipo === 'FFMM' ? '#eff6ff' : '#f5f3ff', color: f.tipo === 'FFMM' ? '#1d4ed8' : '#7c3aed', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20 }}>{f.tipo}</span></td>
                      <td style={{ ...tdS, textAlign: 'right', fontSize: 11, color: '#94a3b8' }}>{parseInt(anioFiscal) - 1}</td>
                      <td style={{ ...tdS, textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>${f.apertura} CLP</div><div style={{ fontSize: 11, color: '#94a3b8' }}>USD {f.aperturaUSD}</div></td>
                      <td style={{ ...tdS, textAlign: 'right', fontSize: 11, color: '#94a3b8' }}>{anioFiscal}</td>
                      <td style={{ ...tdS, textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>${f.cierre} CLP</div><div style={{ fontSize: 11, color: '#94a3b8' }}>USD {f.cierreUSD}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <SectionTitle>Panel 2 — Inmobiliaria (Solo Lectura)</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {MOCK_INMUEBLES.map(im => (
                <div key={im.id} style={{ border: '1px solid #e2e8f0', borderRadius: 13, padding: 20, background: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{im.nombre}</div>
                  <Row label="Cantidad de inmuebles" value={im.cantidad} />
                  <Row label="Valorización" value={`${im.valorUF.toLocaleString('es-CL')} UF`} />
                  <Row label="Propiedad propia" value={<Pill ok={im.propia} />} />
                  <Row label="Acoge DFL2" value={<Pill ok={im.dfl2} />} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Tab Tributario ───────────────────────────────────────────────────────────
const TabTributario = ({ anioFiscal }: { anioFiscal: string }) => {
  const { userName } = useApp()
  type DocEntry = { label: string; sub: string; file: File | null; subido_por: string | null; subido_en: string | null }
  const [docs, setDocs] = useState<Record<string, DocEntry>>({
    balances: { label: 'Balances', sub: 'Balance General y Estado de Resultados', file: null, subido_por: null, subido_en: null },
    rli: { label: 'RLI', sub: 'Renta Líquida Imponible del ejercicio', file: null, subido_por: null, subido_en: null },
    capital: { label: 'Capital Propio Tributario', sub: 'Determinación CPT según SII', file: null, subido_por: null, subido_en: null },
    libro: { label: 'Libro Mayor', sub: 'Registro auxiliar de cuentas contables', file: null, subido_por: null, subido_en: null },
    registros_empresariales: { label: 'Registros Empresariales', sub: 'Registros legales de la empresa ante el SII', file: null, subido_por: null, subido_en: null },
    f22: { label: 'F22 — Declaración Anual de Renta', sub: 'Formulario 22, presentación anual ante el SII', file: null, subido_por: null, subido_en: null },
    declaraciones_juradas: { label: 'Declaraciones Juradas', sub: 'DJ presentadas al SII en el período', file: null, subido_por: null, subido_en: null },
  })
  const docRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const setFile = (k: string, f: File) => {
    const d = new Date()
    const ts = `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
    setDocs(prev => ({ ...prev, [k]: { ...prev[k], file: f, subido_por: userName || 'Admin', subido_en: ts } }))
  }
  const removeDoc = (k: string) => setDocs(prev => ({ ...prev, [k]: { ...prev[k], file: null, subido_por: null, subido_en: null } }))

  const [f29List, setF29List] = useState<{ id: number; mes: string; anio: number; archivo: string; subido_por: string; subido_en: string }[]>([])
  const [f29Mes, setF29Mes] = useState('Enero')
  const [f29File, setF29File] = useState<File | null>(null)
  const f29Ref = useRef<HTMLInputElement>(null)
  const addF29 = () => {
    if (!f29File) return
    const d = new Date()
    const ts = `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
    setF29List(prev => [...prev, { id: Date.now(), mes: f29Mes, anio: parseInt(anioFiscal), archivo: f29File.name, subido_por: userName || 'Admin', subido_en: ts }])
    setF29File(null)
  }

  const loaded = Object.values(docs).filter(d => d.file).length
  const total = Object.keys(docs).length

  const f29SelectStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#0f172a', outline: 'none', background: 'white', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 28 }

  return (
    <div style={{ maxWidth: 740 }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Repositorio Tributario {anioFiscal}</span>
            <span style={{ fontWeight: 700, color: loaded === total ? '#16a34a' : '#64748b' }}>{loaded}/{total} documentos</span>
          </div>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(loaded / total) * 100}%`, background: loaded === total ? '#16a34a' : 'oklch(0.55 0.18 245)', borderRadius: 3, transition: 'width .3s' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(docs).map(([key, doc]) => {
          const up = !!doc.file
          return (
            <div key={key} style={{ border: `1px solid ${up ? '#86efac' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 20px', background: up ? '#f0fdf4' : 'white', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 16 }}>
              <input ref={el => { docRefs.current[key] = el }} type="file" accept=".pdf,.xlsx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setFile(key, e.target.files[0])} />
              <div style={{ width: 40, height: 40, borderRadius: 10, background: up ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}>
                <Icon name={up ? 'check' : 'file'} size={17} style={{ color: up ? '#16a34a' : '#94a3b8' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{doc.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, background: up ? '#dcfce7' : '#fef9c3', color: up ? '#15803d' : '#854d0e', borderRadius: 20, padding: '2px 8px' }}>{up ? 'SUBIDO' : 'PENDIENTE'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{up ? <><span style={{ fontWeight: 500, color: '#0f172a' }}>{doc.file!.name}</span> · Subido por <strong style={{ color: '#374151' }}>{doc.subido_por}</strong> · {doc.subido_en}</> : doc.sub}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {up ? (
                  <>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #bbf7d0', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#16a34a' }}><Icon name="eye" size={13} />Ver</button>
                    <button onClick={() => removeDoc(key)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #fecaca', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#dc2626' }}><Icon name="x" size={13} />Quitar</button>
                  </>
                ) : (
                  <button onClick={() => docRefs.current[key]?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: 'oklch(0.55 0.18 245)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    <Icon name="upload" size={13} />Cargar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* F29 */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 13, overflow: 'hidden', marginTop: 4 }}>
        <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>F29 — Declaración Mensual</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Formulario 29 por mes · {f29List.length} subido{f29List.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mes</label>
              <select value={f29Mes} onChange={e => setF29Mes(e.target.value)} style={f29SelectStyle}>{MESES.map(m => <option key={m}>{m}</option>)}</select>
            </div>
            <div style={{ flex: 1 }}>
              <input ref={f29Ref} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setF29File(e.target.files?.[0] ?? null)} />
              <button onClick={() => f29Ref.current?.click()} style={{ width: '100%', padding: '10px 14px', border: `2px dashed ${f29File ? '#86efac' : '#d1d5db'}`, borderRadius: 9, background: f29File ? '#f0fdf4' : 'white', cursor: 'pointer', fontSize: 12, color: f29File ? '#16a34a' : '#64748b', fontWeight: f29File ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={f29File ? 'check' : 'paperclip'} size={13} style={{ color: f29File ? '#16a34a' : '#94a3b8' }} />
                {f29File ? f29File.name : 'Seleccionar F29 (PDF)…'}
              </button>
            </div>
            <button onClick={addF29} disabled={!f29File} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, background: f29File ? 'oklch(0.55 0.18 245)' : '#e2e8f0', color: f29File ? 'white' : '#94a3b8', border: 'none', cursor: f29File ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              <Icon name="upload" size={13} />Subir F29
            </button>
          </div>
        </div>
        {f29List.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Sin F29 subidos para {anioFiscal}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thS}>Archivo</th><th style={thS}>Mes / Año</th><th style={thS}>Subido por</th><th style={{ ...thS, textAlign: 'center', width: 80 }}>Acción</th></tr></thead>
            <tbody>
              {f29List.map(a => (
                <tr key={a.id} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={tdS}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={13} style={{ color: 'oklch(0.55 0.18 245)' }} /></div><span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{a.archivo}</span></div></td>
                  <td style={{ ...tdS, fontSize: 12, color: '#64748b' }}>{a.mes} {a.anio}</td>
                  <td style={{ ...tdS, fontSize: 11, color: '#64748b' }}><strong style={{ color: '#374151' }}>{a.subido_por}</strong> · {a.subido_en}</td>
                  <td style={{ ...tdS, textAlign: 'center' }}>
                    <button onClick={() => setF29List(prev => prev.filter(x => x.id !== a.id))} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #fecaca', borderRadius: 7, background: 'white', cursor: 'pointer', color: '#dc2626', fontSize: 11, fontWeight: 600 }}>
                      <Icon name="x" size={11} />Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── DocZone ──────────────────────────────────────────────────────────────────
type RRHHFileEntry = { id: number; name: string; fecha: string; hora: string; por: string }

const DocZone = ({ title, icon, files, inputRef, onAdd, onRemove, anioFiscal }: {
  title: string; icon: string; anioFiscal: string
  files: RRHHFileEntry[]
  inputRef: React.RefObject<HTMLInputElement>
  onAdd: (f: File) => void
  onRemove: (id: number) => void
}) => (
  <div style={{ border: '1px solid #e2e8f0', borderRadius: 13, overflow: 'hidden' }}>
    <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Icon name={icon} size={14} style={{ color: '#64748b' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{files.length} archivo{files.length !== 1 ? 's' : ''}</span>
      </div>
      <button onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: 'none', borderRadius: 7, background: 'oklch(0.55 0.18 245)', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
        <Icon name="plus" size={12} />Agregar
      </button>
      <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onAdd(e.target.files[0])} />
    </div>
    {files.length === 0 ? (
      <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Sin archivos para {anioFiscal}</div>
    ) : files.map((f, i) => (
      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: i < files.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
        <Icon name="file" size={14} style={{ color: 'oklch(0.55 0.18 245)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{f.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Subido por <strong style={{ color: '#64748b' }}>{f.por}</strong> · {f.fecha} {f.hora}</div>
        </div>
        <button onClick={() => onRemove(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#dc2626', fontSize: 11, fontWeight: 600 }}>
          <Icon name="x" size={11} />Eliminar
        </button>
      </div>
    ))}
  </div>
)

// ─── Tab RRHH ─────────────────────────────────────────────────────────────────
const TabRRHH = ({ cliente, anioFiscal }: { cliente: Cliente; anioFiscal: string }) => {
  const { userName } = useApp()
  const [trabajadores, setTrabajadores] = useState(4)
  const [contratos, setContratos] = useState<{ id: number; name: string; fecha: string; hora: string; por: string }[]>([])
  const [sueldos, setSueldos] = useState<typeof contratos>([])
  const [vacaciones, setVacaciones] = useState<typeof contratos>([])
  const [licencias, setLicencias] = useState<typeof contratos>([])
  const contRef = useRef<HTMLInputElement>(null)
  const sueldRef = useRef<HTMLInputElement>(null)
  const vacRef = useRef<HTMLInputElement>(null)
  const licRef = useRef<HTMLInputElement>(null)

  type SetList = React.Dispatch<React.SetStateAction<RRHHFileEntry[]>>

  const addFile = (setList: SetList, file: File) => {
    const d = new Date()
    setList(prev => [...prev, { id: Date.now(), name: file.name, fecha: d.toLocaleDateString('es-CL'), hora: d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), por: userName || 'Admin' }])
  }
  const removeFile = (setList: SetList, id: number) => setList(prev => prev.filter(f => f.id !== id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px', background: 'white' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Trabajadores Activos</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{trabajadores}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => setTrabajadores(t => t + 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 16, fontWeight: 700 }}>+</button>
              <button onClick={() => setTrabajadores(t => Math.max(0, t - 1))} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>−</button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Período fiscal {anioFiscal}</div>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Row label="Nómina activa" value={<Pill ok={cliente.tiene_nomina} />} />
        </div>
      </div>
      <DocZone title="Contratos de Trabajo" icon="briefcase" files={contratos} inputRef={contRef} onAdd={f => addFile(setContratos, f)} onRemove={id => removeFile(setContratos, id)} anioFiscal={anioFiscal} />
      <DocZone title="Sueldos / Remuneraciones" icon="dollar" files={sueldos} inputRef={sueldRef} onAdd={f => addFile(setSueldos, f)} onRemove={id => removeFile(setSueldos, id)} anioFiscal={anioFiscal} />
      <DocZone title="Certificados de Vacaciones" icon="calendar" files={vacaciones} inputRef={vacRef} onAdd={f => addFile(setVacaciones, f)} onRemove={id => removeFile(setVacaciones, id)} anioFiscal={anioFiscal} />
      <DocZone title="Licencias" icon="file" files={licencias} inputRef={licRef} onAdd={f => addFile(setLicencias, f)} onRemove={id => removeFile(setLicencias, id)} anioFiscal={anioFiscal} />
    </div>
  )
}

// ─── Edit Drawer helpers ──────────────────────────────────────────────────────
const DrawerField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</label>
    {children}
  </div>
)

const drawerInputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }
const drawerSelectStyle: React.CSSProperties = { ...drawerInputStyle, background: 'white', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 }

const DI = ({ value, onChange, type = 'text', placeholder = '' }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <input value={value} type={type} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={drawerInputStyle}
    onFocus={e => (e.target.style.borderColor = 'oklch(0.55 0.18 245)')}
    onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
)

const DS = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={drawerSelectStyle}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
)

const DrawerDivider = ({ label }: { label?: string }) => (
  <div style={{ margin: '20px 0 16px' }}>
    <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />
    {label && <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>{label}</div>}
  </div>
)

interface SectionProps {
  cliente: Cliente
  onClose: () => void
  onSave: (f: Partial<Cliente>) => void
}

// Section: Datos Cliente
const SectionDatosCliente = ({ cliente, onClose, onSave: save }: SectionProps) => {
    const [form, setForm] = useState({
      razon_social: cliente.razon_social,
      rut: cliente.rut,
      tipo_sociedad: cliente.tipo_sociedad,
      regimen: cliente.regimen_tributario,
      metodo: 'Tradicional',
      factura_conpat: cliente.factura_conpat !== undefined ? cliente.factura_conpat : true,
      factura_moneda: cliente.factura_moneda || 'UF',
      factura_monto: cliente.factura_monto || '4.2',
      actividad_economica: cliente.actividad_economica || '',
      codigo_sii: cliente.codigo_sii || '',
      iniciacion_actividades: cliente.iniciacion_actividades || false,
      rentas_presuntas: cliente.rentas_presuntas || false,
      tiene_nomina: cliente.tiene_nomina || false,
      emite_facturas: cliente.emite_facturas || false,
      boletas_honorarios: cliente.boletas_honorarios || false,
    })
    const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))
    return (
      <>
        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Identificación</div>
          <DrawerField label="Razón Social"><DI value={form.razon_social} onChange={v => set('razon_social', v)} /></DrawerField>
          <DrawerField label="RUT"><DI value={form.rut} onChange={v => set('rut', v)} /></DrawerField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <DrawerField label="Tipo de Sociedad"><DS value={form.tipo_sociedad} onChange={v => set('tipo_sociedad', v)} options={['SpA', 'Ltda', 'SA', 'EIRL', 'EU', 'Fundación']} /></DrawerField>
            <DrawerField label="Régimen"><DS value={form.regimen} onChange={v => set('regimen', v)} options={['14A Semi-Integrado', '14D Transparente', '14 TER Pyme', '14D Pyme']} /></DrawerField>
          </div>
          <DrawerField label="Método de Creación">
            <div style={{ display: 'flex', gap: 8 }}>
              {['Tradicional', 'Empresa en un Día'].map(o => (
                <button key={o} onClick={() => set('metodo', o)} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${form.metodo === o ? 'oklch(0.55 0.18 245)' : '#e2e8f0'}`, background: form.metodo === o ? 'oklch(0.97 0.04 245)' : 'white', fontSize: 12, fontWeight: form.metodo === o ? 600 : 400, color: form.metodo === o ? 'oklch(0.35 0.18 245)' : '#6b7280', cursor: 'pointer' }}>{o}</button>
              ))}
            </div>
          </DrawerField>
          <DrawerDivider label="Facturación Conpat" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '12px 14px', background: '#f8fafc', borderRadius: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Conpat le factura a este cliente</span>
            <MiniToggle value={form.factura_conpat} onChange={v => set('factura_conpat', v)} />
          </div>
          {form.factura_conpat && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DrawerField label="Moneda"><DS value={form.factura_moneda} onChange={v => set('factura_moneda', v)} options={['CLP', 'UF', 'USD']} /></DrawerField>
              <DrawerField label="Monto mensual"><DI value={form.factura_monto} onChange={v => set('factura_monto', v)} /></DrawerField>
            </div>
          )}
          <DrawerDivider label="Características Tributarias" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <DrawerField label="Actividad Económica"><DI value={form.actividad_economica} onChange={v => set('actividad_economica', v)} /></DrawerField>
            <DrawerField label="Código SII"><DI value={form.codigo_sii} onChange={v => set('codigo_sii', v)} /></DrawerField>
          </div>
          {[
            { k: 'iniciacion_actividades', label: 'Iniciación de Actividades', sub: 'Registro ante el SII' },
            { k: 'rentas_presuntas', label: 'Rentas Presuntas', sub: 'Opera bajo régimen de renta presunta' },
          ].map(op => (
            <div key={op.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
              <div><div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{op.label}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{op.sub}</div></div>
              <MiniToggle value={form[op.k as keyof typeof form] as boolean} onChange={v => set(op.k, v)} />
            </div>
          ))}
          <DrawerDivider label="Operaciones" />
          {[
            { k: 'tiene_nomina', label: 'Nómina de trabajadores', sub: 'Liquidaciones de sueldo' },
            { k: 'emite_facturas', label: 'Emisión de facturas DTE', sub: 'Documentos tributarios electrónicos' },
            { k: 'boletas_honorarios', label: 'Boletas de honorarios', sub: 'Prestadores independientes' },
          ].map(op => (
            <div key={op.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
              <div><div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{op.label}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{op.sub}</div></div>
              <MiniToggle value={form[op.k as keyof typeof form] as boolean} onChange={v => set(op.k, v)} />
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => save({ razon_social: form.razon_social, rut: form.rut, tipo_sociedad: form.tipo_sociedad as Cliente['tipo_sociedad'], regimen_tributario: form.regimen, factura_conpat: form.factura_conpat, factura_moneda: form.factura_moneda, factura_monto: form.factura_monto, actividad_economica: form.actividad_economica, codigo_sii: form.codigo_sii, iniciacion_actividades: form.iniciacion_actividades, rentas_presuntas: form.rentas_presuntas, tiene_nomina: form.tiene_nomina, emite_facturas: form.emite_facturas, boletas_honorarios: form.boletas_honorarios })} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Guardar Cambios</button>
        </div>
      </>
    )
  }

// Section: Socios
const SectionSocios = ({ cliente, onClose, onSave: save }: SectionProps) => {
  const [socios, setSocios] = useState<Socio[]>(cliente.socios.map(s => ({ ...s })))
    const update = (i: number, k: keyof Socio, v: string | number) => { const a = [...socios]; a[i] = { ...a[i], [k]: v }; setSocios(a) }
    const add = () => setSocios([...socios, { id: `s${Date.now()}`, nombre: '', rut: '', porcentaje_participacion: 0 }])
    const remove = (i: number) => socios.length > 1 && setSocios(socios.filter((_, idx) => idx !== i))
    const total = socios.reduce((s, x) => s + (parseFloat(String(x.porcentaje_participacion)) || 0), 0)
    const pctOk = Math.abs(total - 100) < 0.01
    return (
      <>
        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Socios y Participaciones</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: total > 100 ? '#dc2626' : pctOk ? '#059669' : '#d97706' }}>{total.toFixed(1)}% / 100%</span>
              <button onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}><Icon name="plus" size={11} />Agregar</button>
            </div>
          </div>
          {socios.map((s, i) => (
            <div key={s.id || i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12, background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 73 + 210}deg 55% 90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: `hsl(${i * 73 + 210}deg 55% 35%)` }}>{s.nombre.charAt(0) || '?'}</span>
                </div>
                <button onClick={() => remove(i)} disabled={socios.length === 1} style={{ border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: socios.length === 1 ? 'not-allowed' : 'pointer', opacity: socios.length === 1 ? 0.4 : 1, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>Eliminar</button>
              </div>
              <DrawerField label="Nombre completo"><DI value={s.nombre} onChange={v => update(i, 'nombre', v)} placeholder="Nombre del socio" /></DrawerField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <DrawerField label="RUT"><DI value={s.rut} onChange={v => update(i, 'rut', v)} placeholder="12.XXX.XXX-X" /></DrawerField>
                <DrawerField label="% Participación"><DI value={String(s.porcentaje_participacion)} onChange={v => update(i, 'porcentaje_participacion', v)} type="number" placeholder="0" /></DrawerField>
              </div>
            </div>
          ))}
          {!pctOk && total > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alert" size={12} />Las participaciones deben sumar 100%. Actual: {total.toFixed(1)}%
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => save({ socios: socios.map(s => ({ ...s, porcentaje_participacion: parseFloat(String(s.porcentaje_participacion)) || 0 })) })} disabled={!pctOk} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: pctOk ? '#0f172a' : '#94a3b8', color: 'white', fontSize: 13, fontWeight: 600, cursor: pctOk ? 'pointer' : 'not-allowed' }}>Guardar Cambios</button>
        </div>
      </>
    )
  }

// Section: Inversiones
const SectionInversiones = ({ cliente, onClose, onSave: save }: SectionProps) => {
    type InvForm = Inversion & { aum_apertura_str: string; aum_cierre_str: string }
    const initInv: InvForm[] = (cliente.inversiones || []).map(inv => ({ ...inv, aum_apertura_str: String(inv.aum_apertura || ''), aum_cierre_str: String(inv.aum_cierre || '') }))
    const emptyI = (): InvForm => ({ id: `ni${Date.now()}`, tipo_inversion: 'Fondo_Mutuo', descripcion: '', ingreso_mensual_asociado: 0, aum_apertura: 0, aum_cierre: 0, fecha_apertura: '', fecha_cierre: '', aum_apertura_str: '', aum_cierre_str: '' })
    const [sinInv, setSinInv] = useState(cliente.sin_inversiones || false)
    const [inversiones, setInversiones] = useState<InvForm[]>(initInv.length ? initInv : [emptyI()])
    const update = (i: number, k: string, v: string) => { const a = [...inversiones]; a[i] = { ...a[i], [k]: v }; setInversiones(a) }
    const add = () => setInversiones([...inversiones, emptyI()])
    const remove = (i: number) => inversiones.length > 1 && setInversiones(inversiones.filter((_, idx) => idx !== i))
    return (
      <>
        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1.5px solid ${sinInv ? 'oklch(0.55 0.18 245)' : '#e2e8f0'}`, borderRadius: 10, background: sinInv ? 'oklch(0.97 0.04 245)' : 'white', marginBottom: 20, cursor: 'pointer' }} onClick={() => setSinInv(!sinInv)}>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Cliente sin inversiones</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Deshabilita el módulo de inversiones</div></div>
            <MiniToggle value={sinInv} onChange={setSinInv} />
          </div>
          {!sinInv && (
            <>
              {inversiones.map((inv, i) => (
                <div key={inv.id || i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 14, background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Inversión #{i + 1}</span>
                    {inversiones.length > 1 && <button onClick={() => remove(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Eliminar</button>}
                  </div>
                  <DrawerField label="Tipo de Inversión">
                    <DS value={inv.tipo_inversion} onChange={v => update(i, 'tipo_inversion', v)} options={['Fondo_Mutuo', 'Acciones', 'Bonos', 'Inmobiliario', 'Deposito_Plazo', 'Otro']} />
                  </DrawerField>
                  <DrawerField label="Descripción"><DI value={inv.descripcion} onChange={v => update(i, 'descripcion', v)} placeholder="Ej: BCI Asset Management · Renta Fija" /></DrawerField>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>AUM</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <DrawerField label="Apertura (CLP)"><DI value={inv.aum_apertura_str} onChange={v => update(i, 'aum_apertura_str', v)} type="number" placeholder="0" /></DrawerField>
                      <DrawerField label="Cierre (CLP)"><DI value={inv.aum_cierre_str} onChange={v => update(i, 'aum_cierre_str', v)} type="number" placeholder="0" /></DrawerField>
                      <DrawerField label="Fecha Apertura"><DI value={inv.fecha_apertura || ''} onChange={v => update(i, 'fecha_apertura', v)} placeholder="DD/MM/AAAA" /></DrawerField>
                      <DrawerField label="Fecha Cierre"><DI value={inv.fecha_cierre || ''} onChange={v => update(i, 'fecha_cierre', v)} placeholder="DD/MM/AAAA" /></DrawerField>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', border: '1.5px dashed #d1d5db', borderRadius: 9, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b', width: '100%', justifyContent: 'center' }}>
                <Icon name="plus" size={13} />Agregar Inversión
              </button>
            </>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => save({ sin_inversiones: sinInv, inversiones: inversiones.map(inv => ({ ...inv, aum_apertura: parseFloat(inv.aum_apertura_str) || 0, aum_cierre: parseFloat(inv.aum_cierre_str) || 0 })) })} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Guardar Cambios</button>
        </div>
      </>
    )
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
interface EditDrawerProps {
  cliente: Cliente
  section: string
  onClose: () => void
  onSave: (form: Partial<Cliente>) => void
}

const EditDrawer = ({ cliente, section, onClose, onSave }: EditDrawerProps) => {
  const titles: Record<string, { title: string; sub: string }> = {
    legales: { title: 'Editar Datos del Cliente', sub: 'Identificación, facturación y operaciones' },
    socios: { title: 'Editar Socios', sub: 'Participaciones y datos de socios' },
    inversiones: { title: 'Editar Inversiones', sub: 'Portafolio y AUM de cada inversión' },
  }
  const { title, sub } = titles[section] ?? titles.legales

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} onClick={onClose} />
      <div style={{ width: 480, background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', height: '100vh' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>
        {section === 'legales' && <SectionDatosCliente cliente={cliente} onClose={onClose} onSave={onSave} />}
        {section === 'socios' && <SectionSocios cliente={cliente} onClose={onClose} onSave={onSave} />}
        {section === 'inversiones' && <SectionInversiones cliente={cliente} onClose={onClose} onSave={onSave} />}
      </div>
    </div>
  )
}

// ─── Main: AdminClientPanel ───────────────────────────────────────────────────
interface AdminClientPanelProps {
  cliente: Cliente
  onBack: () => void
  onUpdate: (c: Cliente) => void
}

export const AdminClientPanel = ({ cliente: initialCliente, onBack, onUpdate }: AdminClientPanelProps) => {
  const [cliente, setCliente] = useState(initialCliente)
  const [tab, setTab] = useState('legales')
  const [anioFiscal, setAnioFiscal] = useState('2025')
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const handleSave = (form: Partial<Cliente>) => {
    let updated: Cliente
    if (tab === 'legales') {
      updated = { ...cliente, ...form }
    } else if (tab === 'socios') {
      updated = { ...cliente, socios: form.socios ?? cliente.socios }
    } else if (tab === 'inversiones') {
      updated = { ...cliente, sin_inversiones: form.sin_inversiones, inversiones: form.inversiones ?? cliente.inversiones }
    } else {
      updated = { ...cliente }
    }
    setCliente(updated)
    onUpdate(updated)
    setEditOpen(false)
    const labels: Record<string, string> = { legales: 'Datos del cliente', socios: 'Socios', inversiones: 'Inversiones' }
    setToast({ msg: `${labels[tab] ?? 'Ficha'} actualizado correctamente`, type: 'success' })
    setTimeout(() => setToast(null), 3500)
  }

  const EDITABLE_TABS = ['legales', 'socios', 'inversiones']
  const editBtnLabels: Record<string, string> = { legales: 'Editar Datos Cliente', socios: 'Editar Socios', inversiones: 'Editar Inversiones' }

  const TABS = [
    { id: 'legales', label: 'Datos Cliente', icon: 'briefcase' },
    { id: 'socios', label: 'Socios', icon: 'users' },
    { id: 'cartolas', label: 'Cartolas Bancarias', icon: 'file' },
    { id: 'inversiones', label: 'Inversiones', icon: 'trendingUp' },
    { id: 'tributario', label: 'Tributario', icon: 'dollar' },
    { id: 'rrhh', label: 'RRHH', icon: 'users' },
  ]

  const anioSelectStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 28px 7px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', background: 'white', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6b7280' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="chevronRight" size={11} style={{ transform: 'rotate(180deg)' }} />Clientes
            </button>
            <Icon name="chevronRight" size={11} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{cliente.razon_social}</span>
          </div>
        </div>

        <div style={{ padding: '16px 28px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 19, fontWeight: 700, fontFamily: "'DM Serif Display',serif" }}>{cliente.razon_social.charAt(0)}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#0f172a', fontFamily: "'DM Serif Display',serif" }}>{cliente.razon_social}</h1>
              <Badge color={getSociedadColor(cliente.tipo_sociedad)}>{cliente.tipo_sociedad}</Badge>
              <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#15803d', display: 'inline-block' }} />ACTIVO
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>RUT {cliente.rut}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>Año Fiscal</label>
              <select value={anioFiscal} onChange={e => setAnioFiscal(e.target.value)} style={anioSelectStyle}>
                {['2023', '2024', '2025', '2026'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            {EDITABLE_TABS.includes(tab) && (
              <button
                onClick={() => setEditOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Icon name="file" size={13} />{editBtnLabels[tab] ?? 'Editar Ficha'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, padding: '0 28px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? '#0f172a' : '#6b7280', borderBottom: `2px solid ${tab === t.id ? '#0f172a' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s', marginBottom: -1 }}>
              <Icon name={t.icon} size={12} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {tab === 'legales' && <TabLegales cliente={cliente} anioFiscal={anioFiscal} />}
        {tab === 'socios' && <TabSocios cliente={cliente} anioFiscal={anioFiscal} />}
        {tab === 'cartolas' && <TabCartolas cliente={cliente} anioFiscal={anioFiscal} />}
        {tab === 'inversiones' && <TabInversiones cliente={cliente} anioFiscal={anioFiscal} />}
        {tab === 'tributario' && <TabTributario anioFiscal={anioFiscal} />}
        {tab === 'rrhh' && <TabRRHH cliente={cliente} anioFiscal={anioFiscal} />}
      </div>

      {editOpen && <EditDrawer cliente={cliente} section={tab} onClose={() => setEditOpen(false)} onSave={handleSave} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
