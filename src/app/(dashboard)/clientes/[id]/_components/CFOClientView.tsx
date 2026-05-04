'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'
import { Upload, Loader2, FileText } from 'lucide-react'
import { createCartola, createEntregableCFO } from '@/lib/actions/documentos'
import { createClient } from '@/lib/supabase/client'
import { MESES, BANCOS, TIPO_ENTREGABLE_OPTIONS, formatCLP, TIPO_INVERSION_LABELS } from '@/lib/helpers'
import { useAnoFiscal, ANOS_FISCALES } from '@/lib/contexts/ano-fiscal'
import type { ClienteConRelaciones, CartolaMensual, EntregableCFO } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
}

const TAB_LIST = [
  { id: 'radiografia',  label: 'Radiografía',       icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'buzon',        label: 'Buzón de Insumos',   icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
  { id: 'entregables',  label: 'Mis Entregables',    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

export function CFOClientView({ cliente }: Props) {
  const [tab, setTab] = useState('radiografia')
  const { anioFiscal, setAnioFiscal } = useAnoFiscal()

  return (
    <Tabs.Root value={tab} onValueChange={setTab} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <div style={{ flexShrink: 0, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {/* Breadcrumb row */}
        <div style={{ height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
            <Link href="/clientes" style={{ color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
              Mis Carteras
            </Link>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{cliente.razon_social}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Año Fiscal</label>
            <select
              value={anioFiscal}
              onChange={e => setAnioFiscal(Number(e.target.value))}
              style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 24px 5px 10px', fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', background: 'white', cursor: 'pointer' }}
            >
              {ANOS_FISCALES.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Client strip */}
        <div style={{ padding: '14px 28px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
              {cliente.razon_social.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="font-serif" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              {cliente.razon_social}
            </h1>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>RUT {cliente.rut}</div>
          </div>
        </div>

        {/* Tab list */}
        <Tabs.List style={{ display: 'flex', padding: '0 28px' }}>
          {TAB_LIST.map(t => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? '#0f172a' : '#6b7280',
                borderBottom: `2px solid ${tab === t.id ? '#0f172a' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all .15s', marginBottom: -1, outline: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {t.icon.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
              </svg>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9' }}>
        <Tabs.Content value="radiografia" style={{ padding: 28, outline: 'none' }}>
          <RadiografiaTab cliente={cliente} />
        </Tabs.Content>
        <Tabs.Content value="buzon" style={{ padding: 28, outline: 'none' }}>
          <BuzonTab cliente={cliente} anioFiscal={anioFiscal} />
        </Tabs.Content>
        <Tabs.Content value="entregables" style={{ padding: 28, outline: 'none' }}>
          <EntregablesTab cliente={cliente} anioFiscal={anioFiscal} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}

/* ───────────── Radiografía ───────────── */
function RadiografiaTab({ cliente }: { cliente: ClienteConRelaciones }) {
  const financieras   = cliente.inversiones.filter(i => i.categoria === 'financiera')
  const inmobiliarias = cliente.inversiones.filter(i => i.categoria === 'inmobiliaria')
  const aumCLP = financieras.reduce((s, i) => s + i.saldo_clp, 0)
  const totalSocios = cliente.socios.reduce((s, x) => s + (x.porcentaje_participacion ?? 0), 0)

  const Row = ({ label, value }: { label: string; value: string | null }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{value ?? '—'}</span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
      {/* Datos societarios */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Datos Societarios</div>
        <Row label="Razón Social"       value={cliente.razon_social} />
        <Row label="RUT"                value={cliente.rut} />
        <Row label="Tipo de Sociedad"   value={cliente.tipo_sociedad} />
        <Row label="Régimen Tributario" value={cliente.regimen_tributario} />
        <Row label="Representante Legal" value={cliente.representante_legal} />
        <Row label="Constitución"       value={cliente.metodo_creacion} />
      </div>

      {/* Composición accionaria */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Composición Accionaria</div>
        </div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Socio</th>
              <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {cliente.socios.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>Sin socios</td></tr>
            ) : (
              <>
                {cliente.socios.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid #f8fafc' }}>
                    <td style={{ padding: '9px 16px', color: '#0f172a', fontWeight: 500 }}>{s.nombre}</td>
                    <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {s.porcentaje_participacion != null ? `${s.porcentaje_participacion}%` : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Total</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: Math.abs(totalSocios - 100) < 0.01 ? '#15803d' : '#d97706' }}>
                    {totalSocios.toFixed(2)}%
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Portafolio inversiones */}
      {!cliente.sin_inversiones && (
        <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Portafolio de Inversiones
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Inversiones Financieras</div>
              <div className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{financieras.length}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{formatCLP(aumCLP)} AUM</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Activos Inmobiliarios</div>
              <div className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{inmobiliarias.length}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>propiedades</div>
            </div>
          </div>
          {financieras.length > 0 && (
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Instrumento</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Saldo CLP</th>
                </tr>
              </thead>
              <tbody>
                {financieras.map(inv => (
                  <tr key={inv.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{TIPO_INVERSION_LABELS[inv.tipo_inversion] ?? inv.tipo_inversion}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500, color: '#0f172a' }}>{formatCLP(inv.saldo_clp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

/* ───────────── Buzón de Insumos ───────────── */
function BuzonTab({ cliente, anioFiscal }: { cliente: ClienteConRelaciones; anioFiscal: number }) {
  const [cartolas, setCartolas] = useState<CartolaMensual[]>(cliente.cartolas)
  const [banco, setBanco]       = useState('')
  const [mes, setMes]           = useState('')
  const [uploading, setUploading] = useState(false)
  const [, startTransition]     = useTransition()
  const fileRef                 = useRef<HTMLInputElement>(null)

  const filtered = cartolas.filter(c => c.anio === anioFiscal)

  const handleUpload = async (file: File) => {
    if (!banco || !mes) { alert('Selecciona banco y mes'); return }
    setUploading(true)
    const supabase = createClient()
    const path = `cartolas/${cliente.id}/${anioFiscal}/${banco.replace(/\s/g, '_')}_${mes}_${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(path, file, { upsert: false })
    setUploading(false)
    if (error) { alert(error.message); return }
    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)
    startTransition(async () => {
      const result = await createCartola({
        cliente_id: cliente.id, banco, mes: Number(mes),
        anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name,
      })
      if (result.id) {
        setCartolas(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, banco, mes: Number(mes),
          anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name,
          created_at: new Date().toISOString(),
        }])
        setBanco(''); setMes('')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* Upload form */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Subir Cartola — {anioFiscal}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Banco</label>
            <select
              value={banco}
              onChange={e => setBanco(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: 'white', outline: 'none', color: '#0f172a' }}
            >
              <option value="">Seleccionar banco</option>
              {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Mes</label>
            <select
              value={mes}
              onChange={e => setMes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: 'white', outline: 'none', color: '#0f172a' }}
            >
              <option value="">Seleccionar mes</option>
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !banco || !mes}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 600, cursor: uploading || !banco || !mes ? 'not-allowed' : 'pointer', opacity: uploading || !banco || !mes ? 0.5 : 1, transition: 'opacity 0.15s' }}
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Subiendo…' : 'Seleccionar Archivo'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      </div>

      {/* Cartola list */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Cartolas {anioFiscal} — {filtered.length} archivo{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            No hay cartolas subidas para {anioFiscal}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[...filtered].sort((a, b) => a.mes - b.mes).map(c => (
              <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid #f8fafc' }}>
                <FileText size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{MESES[c.mes - 1]} — {c.banco}</div>
                  {c.archivo_nombre && <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.archivo_nombre}</div>}
                </div>
                <a href={c.archivo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.55 0.18 245)', textDecoration: 'none' }}>Ver</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Retiros de socios (read-only) */}
      {cliente.socios.some(s => s.retiros.length > 0) && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Retiros Societarios
            </div>
          </div>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Socio</th>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Fecha</th>
                <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>Monto</th>
                <th style={{ padding: '8px 16px', width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {cliente.socios.flatMap(s => s.retiros.map(r => ({ ...r, socioNombre: s.nombre })))
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid #f8fafc' }}>
                    <td style={{ padding: '9px 16px', color: '#374151' }}>{r.socioNombre}</td>
                    <td style={{ padding: '9px 16px', color: '#64748b', fontSize: 12 }}>{r.fecha}</td>
                    <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{formatCLP(r.monto)}</td>
                    <td style={{ padding: '9px 16px', textAlign: 'center' }}>
                      {r.comprobante_url && (
                        <a href={r.comprobante_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'oklch(0.55 0.18 245)', fontWeight: 500, textDecoration: 'none' }}>
                          Ver
                        </a>
                      )}
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

/* ───────────── Mis Entregables ───────────── */
function EntregablesTab({ cliente, anioFiscal }: { cliente: ClienteConRelaciones; anioFiscal: number }) {
  const [entregables, setEntregables] = useState<EntregableCFO[]>(cliente.entregables)
  const [tipo, setTipo]               = useState('')
  const [uploading, setUploading]     = useState(false)
  const [, startTransition]           = useTransition()
  const fileRef                       = useRef<HTMLInputElement>(null)

  const filtered = entregables.filter(e => e.anio === anioFiscal).sort((a, b) => b.created_at.localeCompare(a.created_at))

  const handleUpload = async (file: File) => {
    if (!tipo) { alert('Selecciona el tipo de documento'); return }
    setUploading(true)
    const supabase = createClient()
    const path = `entregables/${cliente.id}/${anioFiscal}/${tipo.replace(/\s/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(path, file, { upsert: false })
    setUploading(false)
    if (error) { alert(error.message); return }
    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)
    startTransition(async () => {
      const result = await createEntregableCFO({
        cliente_id: cliente.id, tipo_documento: tipo, anio: anioFiscal,
        mes: null, archivo_url: publicUrl, archivo_nombre: file.name,
      })
      if (result.id) {
        setEntregables(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, tipo_documento: tipo, anio: anioFiscal,
          mes: null, archivo_url: publicUrl, archivo_nombre: file.name,
          created_at: new Date().toISOString(),
        }])
        setTipo('')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* Upload form */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Subir Entregable — {anioFiscal}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Tipo de Documento
          </label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: 'white', outline: 'none', color: '#0f172a' }}
          >
            <option value="">Seleccionar tipo</option>
            {TIPO_ENTREGABLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !tipo}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', background: 'oklch(0.55 0.18 245)', color: 'white', fontSize: 13, fontWeight: 600, cursor: uploading || !tipo ? 'not-allowed' : 'pointer', opacity: uploading || !tipo ? 0.5 : 1, transition: 'opacity 0.15s' }}
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Subiendo…' : 'Subir Entregable'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      </div>

      {/* Historial */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Entregables {anioFiscal} — {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            No hay entregables subidos para {anioFiscal}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map(e => (
              <li key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid #f8fafc' }}>
                <FileText size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{e.tipo_documento}</div>
                  {e.archivo_nombre && <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.archivo_nombre}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(e.created_at).toLocaleDateString('es-CL')}
                  </span>
                  <a href={e.archivo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.55 0.18 245)', textDecoration: 'none' }}>
                    Descargar
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
