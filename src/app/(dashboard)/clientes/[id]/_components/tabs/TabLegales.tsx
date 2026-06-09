'use client'

import { useState, useTransition } from 'react'
import { FileUploadCard } from '@/components/shared/FileUploadCard'
import { createDocumento, deleteDocumento, updateDocumentoVigencia } from '@/lib/actions/documentos'
import { DOCS_LEGALES, formatCLP } from '@/lib/helpers'
import type { ClienteConRelaciones, Documento, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

function Pill({ ok }: { ok: boolean | null | undefined }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: ok ? '#f0fdf4' : '#f8fafc',
      color: ok ? '#15803d' : '#94a3b8',
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      border: `1px solid ${ok ? '#bbf7d0' : '#e2e8f0'}`,
    }}>
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

interface VigenciaModalProps {
  doc: Documento
  clienteId: string
  onClose: () => void
  onSaved: (id: string, validFrom: number | null, validUntil: number | null) => void
}

function VigenciaModal({ doc, clienteId, onClose, onSaved }: VigenciaModalProps) {
  const currentYear = new Date().getFullYear()
  const [validFrom,  setValidFrom]  = useState<string>(doc.valid_from  ? String(doc.valid_from)  : '')
  const [validUntil, setValidUntil] = useState<string>(doc.valid_until ? String(doc.valid_until) : '')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '9px 12px', fontSize: 14, color: '#0f172a', outline: 'none',
    background: 'white', boxSizing: 'border-box',
  }

  const handleSave = () => {
    setError(null)
    const from  = validFrom  ? Number(validFrom)  : null
    const until = validUntil ? Number(validUntil) : null
    if (from && (from < 2000 || from > currentYear + 10)) {
      setError('Año desde inválido.')
      return
    }
    if (until && (until < 2000 || until > currentYear + 50)) {
      setError('Año hasta inválido.')
      return
    }
    if (from && until && from > until) {
      setError('El año de inicio no puede ser mayor que el año final.')
      return
    }
    startTransition(async () => {
      const result = await updateDocumentoVigencia(doc.id, clienteId, from, until)
      if (result.error) { setError(result.error); return }
      onSaved(doc.id, from, until)
      onClose()
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
        onClick={onClose}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 101, background: 'white', borderRadius: 14, padding: '24px 28px',
        width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Definir vigencia
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{doc.tipo_documento}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Válido desde (año)
            </label>
            <input
              type="number"
              placeholder="2020"
              value={validFrom}
              onChange={e => setValidFrom(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#C84632')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Válido hasta (año)
            </label>
            <input
              type="number"
              placeholder="2026"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#C84632')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: '#0f172a', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: 'white', opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  )
}

export function TabLegales({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'legal')
  )
  const [, startTransition] = useTransition()
  const [vigenciaDoc, setVigenciaDoc] = useState<Documento | null>(null)
  const canEdit = role === 'admin' || role === 'master'

  const getDoc = (tipo: string) => {
    const all = docs.filter(d => d.tipo_documento === tipo)
    if (all.length === 0) return undefined
    const candidates = all.filter(d => {
      if (!d.valid_from && !d.valid_until) return true
      const from  = d.valid_from  ?? -Infinity
      const until = d.valid_until ?? Infinity
      return anioFiscal >= from && anioFiscal <= until
    })
    if (candidates.length === 0) return undefined
    // Si hay overlap, preferir la versión con valid_from más reciente
    return candidates.reduce((best, d) =>
      (d.valid_from ?? -Infinity) > (best.valid_from ?? -Infinity) ? d : best
    )
  }

  const handleUploaded = (tipo: string, url: string, nombre: string) => {
    startTransition(async () => {
      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'legal', tipo_documento: tipo,
        anio: null, archivo_url: url, archivo_nombre: nombre,
        valid_from: null, valid_until: null,
      })
      if (result.id) {
        setDocs(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, categoria: 'legal',
          tipo_documento: tipo, anio: null, archivo_url: url,
          archivo_nombre: nombre,
          created_at: new Date().toISOString(),
        }])
      }
    })
  }

  const handleDeleted = (tipo: string, docId: string) => {
    startTransition(async () => {
      await deleteDocumento(docId, cliente.id)
      setDocs(prev => prev.filter(d => d.id !== docId))
    })
  }

  const handleVigenciaSaved = (id: string, validFrom: number | null, validUntil: number | null) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, valid_from: validFrom, valid_until: validUntil } : d))
  }

  const std = DOCS_LEGALES.filter(d => d.obligatorio)
  const opt = DOCS_LEGALES.filter(d => !d.obligatorio)

  return (
    <>
      {vigenciaDoc && (
        <VigenciaModal
          doc={vigenciaDoc}
          clienteId={cliente.id}
          onClose={() => setVigenciaDoc(null)}
          onSaved={handleVigenciaSaved}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Información Básica</SectionTitle>
            <Row label="Tipo de Sociedad"        value={cliente.tipo_sociedad} />
            <Row label="Método de Creación"       value={cliente.metodo_creacion} />
            <Row label="Representante Legal"      value={cliente.representante_legal} />
            <Row label="Régimen Tributario"       value={cliente.regimen_tributario} />
            <Row label="RUT"                      value={<span style={{ fontFamily: 'monospace' }}>{cliente.rut}</span>} />
            <Row label="Nómina"                   value={<Pill ok={cliente.tiene_nomina} />} />
            <Row label="Emisión de Facturas"      value={<Pill ok={cliente.emite_facturas} />} />
            <Row label="Boletas de Honorarios"    value={<Pill ok={cliente.boletas_honorarios} />} />
            <Row label="Iniciación de Actividades"value={<Pill ok={cliente.iniciacion_actividades} />} />
            <Row label="Actividad Económica"      value={cliente.actividad_economica} />
            <Row label="Código SII"               value={cliente.codigo_sii} />
            <Row label="Rentas Presuntas"         value={<Pill ok={cliente.rentas_presuntas} />} />
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

        {/* Right column — documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Documentación Estándar</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {std.map(({ key, label, obligatorio }) => {
                const doc = getDoc(key)
                return (
                  <FileUploadCard
                    key={key}
                    label={label}
                    obligatorio={obligatorio}
                    path={`legales/${cliente.id}`}
                    existingUrl={doc?.archivo_url}
                    existingName={doc?.archivo_nombre}
                    canUpload={canEdit}
                    canDelete={canEdit}
                    validFrom={doc?.valid_from}
                    validUntil={doc?.valid_until}
                    canDefineVigencia={canEdit && !!doc}
                    onDefineVigencia={() => doc && setVigenciaDoc(doc)}
                    onUploaded={(url, nombre) => handleUploaded(key, url, nombre)}
                    onDeleted={() => doc && handleDeleted(key, doc.id)}
                  />
                )
              })}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e8ef', padding: '20px 24px' }}>
            <SectionTitle>Documentación Adicional</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {opt.map(({ key, label, obligatorio }) => {
                const doc = getDoc(key)
                return (
                  <FileUploadCard
                    key={key}
                    label={label}
                    obligatorio={obligatorio}
                    path={`legales/${cliente.id}`}
                    existingUrl={doc?.archivo_url}
                    existingName={doc?.archivo_nombre}
                    canUpload={canEdit}
                    canDelete={canEdit}
                    validFrom={doc?.valid_from}
                    validUntil={doc?.valid_until}
                    canDefineVigencia={canEdit && !!doc}
                    onDefineVigencia={() => doc && setVigenciaDoc(doc)}
                    onUploaded={(url, nombre) => handleUploaded(key, url, nombre)}
                    onDeleted={() => doc && handleDeleted(key, doc.id)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
