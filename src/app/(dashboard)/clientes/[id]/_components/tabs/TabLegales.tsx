'use client'

import { useState, useTransition, useRef } from 'react'
import { FileUploadCard } from '@/components/shared/FileUploadCard'
import { createDocumento, deleteDocumento } from '@/lib/actions/documentos'
import { DOCS_LEGALES, formatCLP } from '@/lib/helpers'
import { createClient } from '@/lib/supabase/client'
import type { ClienteConRelaciones, Documento, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

function Pill({ ok }: { ok: boolean | null | undefined }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: ok ? '#f0fdf4' : '#f8fafc', color: ok ? '#15803d' : '#94a3b8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${ok ? '#bbf7d0' : '#e2e8f0'}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: ok ? '#15803d' : '#d1d5db', display: 'inline-block' }} />
      {ok ? 'Sí' : 'No'}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value ?? <span style={{ color: '#94a3b8' }}>—</span>}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
      {children}
    </div>
  )
}

function formatFecha(d: string | null | undefined) {
  if (!d) return null
  const [year, month, day] = d.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Modal: nueva versión ──────────────────────────────────────────────────────

interface NuevaVersionModalProps {
  tipo: string
  label: string
  clienteId: string
  storagePath: string
  onClose: () => void
  onCreated: (doc: Documento) => void
}

function NuevaVersionModal({ tipo, label, clienteId, storagePath, onClose, onCreated }: NuevaVersionModalProps) {
  const [file,      setFile]      = useState<File | null>(null)
  const [nota,      setNota]      = useState('')
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCountRef = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCountRef.current++; if (dragCountRef.current === 1) setIsDragOver(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragCountRef.current--; if (dragCountRef.current === 0) setIsDragOver(false) }
  const handleDragOver  = (e: React.DragEvent) => { if (!file) e.preventDefault() }
  const handleDrop      = (e: React.DragEvent) => { e.preventDefault(); dragCountRef.current = 0; setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }

  const handleConfirm = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext      = file.name.split('.').pop()
    const fullPath = `${storagePath}/${Date.now()}.${ext}`
    const { data, error: uploadError } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(fullPath, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage
      .from('documentos_patrimoniales')
      .getPublicUrl(data.path)
    const result = await createDocumento({
      cliente_id: clienteId, categoria: 'legal', tipo_documento: tipo,
      anio: null, archivo_url: publicUrl, archivo_nombre: file.name,
      nota: nota || null,
    })
    setUploading(false)
    if (result.error) { setError(result.error); return }
    onCreated({
      id: result.id!, cliente_id: clienteId, categoria: 'legal',
      tipo_documento: tipo, anio: null, archivo_url: publicUrl,
      archivo_nombre: file.name, nota: nota || null,
      created_at: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, background: 'white', borderRadius: 14, padding: '24px 28px', width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Subir nueva versión</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
        </div>

        <input ref={inputRef} type="file" accept="*" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
            onDragOver={handleDragOver} onDrop={handleDrop}
            style={{ border: `1.5px dashed ${isDragOver ? '#C84632' : '#cbd5e1'}`, borderRadius: 9, padding: '20px 16px', background: isDragOver ? 'rgba(200,70,50,0.04)' : '#f8fafc', cursor: 'pointer', textAlign: 'center', marginBottom: 16, transition: 'all .15s' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? '#C84632' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDragOver ? '#C84632' : '#475569' }}>
              {isDragOver ? 'Suelta el archivo' : 'Arrastra un archivo o haz clic'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '10px 12px', marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            <span style={{ flex: 1, fontSize: 12, color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
            <button onClick={() => setFile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Nota (opcional)</label>
          <textarea
            value={nota} onChange={e => setNota(e.target.value)}
            placeholder="ej: Versión actualizada 2026"
            rows={2}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, resize: 'none', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' }}
            onFocus={e => (e.target.style.borderColor = '#C84632')}
            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        {error && <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>Cancelar</button>
          <button onClick={handleConfirm} disabled={!file || uploading}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: !file || uploading ? '#94a3b8' : '#C84632', cursor: !file || uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: 'white' }}>
            {uploading ? 'Subiendo…' : 'Subir'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Modal: historial de versiones ─────────────────────────────────────────────

interface HistorialModalProps {
  label: string
  versions: Documento[]
  onClose: () => void
}

function HistorialModal({ label, versions, onClose }: HistorialModalProps) {
  const sorted = [...versions].sort((a, b) => b.created_at.localeCompare(a.created_at))
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, background: 'white', borderRadius: 14, width: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Historial</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
          </div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', cursor: 'pointer', color: '#64748b' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          {sorted.map((doc, i) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < sorted.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#C84632' : '#cbd5e1', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.archivo_nombre ?? 'Archivo'}
                  </span>
                  {i === 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#fff0ec', color: '#C84632', border: '1px solid #f4c5b5', borderRadius: 20, padding: '1px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Actual
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: doc.nota ? 3 : 0 }}>{formatTs(doc.created_at)}</div>
                {doc.nota && <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>{doc.nota}</div>}
              </div>
              {doc.archivo_url && (
                <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', fontSize: 11, fontWeight: 500, color: '#475569', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  Ver
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function TabLegales({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'legal')
  )
  const [, startTransition] = useTransition()
  const [nuevaVersionTipo, setNuevaVersionTipo] = useState<string | null>(null)
  const [historialTipo,    setHistorialTipo]    = useState<string | null>(null)
  const canEdit = role === 'admin' || role === 'master'

  // Devuelve el documento más reciente del tipo (independiente del año fiscal)
  const getDoc = (tipo: string) => {
    const all = docs.filter(d => d.tipo_documento === tipo)
    if (all.length === 0) return undefined
    return all.reduce((latest, d) => d.created_at > latest.created_at ? d : latest)
  }

  const getLabelForTipo = (tipo: string) => DOCS_LEGALES.find(d => d.key === tipo)?.label ?? tipo

  const handleUploaded = (tipo: string, url: string, nombre: string, nota: string) => {
    startTransition(async () => {
      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'legal', tipo_documento: tipo,
        anio: null, archivo_url: url, archivo_nombre: nombre, nota: nota || null,
      })
      if (result.id) {
        setDocs(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, categoria: 'legal',
          tipo_documento: tipo, anio: null, archivo_url: url,
          archivo_nombre: nombre, nota: nota || null,
          created_at: new Date().toISOString(),
        }])
      }
    })
  }

  const handleDeleted = (docId: string) => {
    startTransition(async () => {
      await deleteDocumento(docId, cliente.id)
      setDocs(prev => prev.filter(d => d.id !== docId))
    })
  }

  const handleNuevaVersionCreated = (doc: Documento) => {
    setDocs(prev => [...prev, doc])
  }

  const std = DOCS_LEGALES.filter(d => d.obligatorio)
  const opt = DOCS_LEGALES.filter(d => !d.obligatorio)

  const renderCard = (key: string, label: string, obligatorio: boolean) => {
    const doc       = getDoc(key)
    const allVersions = docs.filter(d => d.tipo_documento === key)
    return (
      <FileUploadCard
        key={key}
        label={label}
        obligatorio={obligatorio}
        path={`legales/${cliente.id}`}
        existingUrl={doc?.archivo_url}
        existingName={doc?.archivo_nombre}
        existingNota={doc?.nota}
        canUpload={canEdit}
        canDelete={canEdit}
        onUploaded={(url, nombre, nota) => handleUploaded(key, url, nombre, nota)}
        onDeleted={() => doc && handleDeleted(doc.id)}
        onNuevaVersion={canEdit && doc ? () => setNuevaVersionTipo(key) : undefined}
        onVerHistorial={allVersions.length > 1 ? () => setHistorialTipo(key) : undefined}
      />
    )
  }

  return (
    <>
      {nuevaVersionTipo && (
        <NuevaVersionModal
          tipo={nuevaVersionTipo}
          label={getLabelForTipo(nuevaVersionTipo)}
          clienteId={cliente.id}
          storagePath={`legales/${cliente.id}`}
          onClose={() => setNuevaVersionTipo(null)}
          onCreated={handleNuevaVersionCreated}
        />
      )}
      {historialTipo && (
        <HistorialModal
          label={getLabelForTipo(historialTipo)}
          versions={docs.filter(d => d.tipo_documento === historialTipo)}
          onClose={() => setHistorialTipo(null)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Columna izquierda — datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Información Básica</SectionTitle>
            <Row label="Fecha de Constitución"    value={formatFecha(cliente.fecha_constitucion)} />
            <Row label="Tipo de Sociedad"          value={cliente.tipo_sociedad} />
            <Row label="Método de Creación"        value={cliente.metodo_creacion} />
            <Row label="Representante Legal"       value={cliente.representante_legal} />
            <Row label="Régimen Tributario"        value={cliente.regimen_tributario} />
            <Row label="RUT"                       value={<span style={{ fontFamily: 'monospace' }}>{cliente.rut}</span>} />
            <Row label="Nómina"                    value={<Pill ok={cliente.tiene_nomina} />} />
            <Row label="Emisión de Facturas"       value={<Pill ok={cliente.emite_facturas} />} />
            <Row label="Boletas de Honorarios"     value={<Pill ok={cliente.boletas_honorarios} />} />
            <Row label="Iniciación de Actividades" value={<Pill ok={cliente.iniciacion_actividades} />} />
            <Row label="Actividad Económica"       value={cliente.actividad_economica} />
            <Row label="Código SII"                value={cliente.codigo_sii} />
            <Row label="Rentas Presuntas"          value={<Pill ok={cliente.rentas_presuntas} />} />
          </div>

          {canEdit && (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
              <SectionTitle>Facturación Interna Conpat</SectionTitle>
              <Row label="Conpat le factura" value={<Pill ok={cliente.conpat_factura} />} />
              {cliente.conpat_factura && (
                <>
                  <Row label="Moneda" value={cliente.moneda_facturacion} />
                  <Row
                    label={`Honorario ${anioFiscal}`}
                    value={
                      cliente.cantidad_facturacion != null
                        ? cliente.moneda_facturacion === 'CLP'
                          ? formatCLP(cliente.cantidad_facturacion)
                          : `${cliente.cantidad_facturacion} ${cliente.moneda_facturacion} / mes`
                        : null
                    }
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha — documentos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Documentación Estándar</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {std.map(({ key, label, obligatorio }) => renderCard(key, label, obligatorio))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Documentación Adicional</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {opt.map(({ key, label, obligatorio }) => renderCard(key, label, obligatorio))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
