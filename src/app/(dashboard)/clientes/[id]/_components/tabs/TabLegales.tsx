'use client'

import { useState, useTransition } from 'react'
import { FileUploadCard } from '@/components/shared/FileUploadCard'
import { createDocumento, deleteDocumento } from '@/lib/actions/documentos'
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

export function TabLegales({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'legal')
  )
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin' || role === 'master'

  const getDoc = (tipo: string) => docs.find(d => d.tipo_documento === tipo)

  const handleUploaded = (tipo: string, url: string, nombre: string) => {
    startTransition(async () => {
      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'legal', tipo_documento: tipo,
        anio: null, archivo_url: url, archivo_nombre: nombre,
      })
      if (result.id) {
        setDocs(prev => {
          const without = prev.filter(d => d.tipo_documento !== tipo)
          return [...without, {
            id: result.id!, cliente_id: cliente.id, categoria: 'legal',
            tipo_documento: tipo, anio: null, archivo_url: url,
            archivo_nombre: nombre, created_at: new Date().toISOString(),
          }]
        })
      }
    })
  }

  const handleDeleted = (tipo: string, docId: string) => {
    startTransition(async () => {
      await deleteDocumento(docId, cliente.id)
      setDocs(prev => prev.filter(d => d.id !== docId))
    })
  }

  const std = DOCS_LEGALES.filter(d => d.obligatorio)
  const opt = DOCS_LEGALES.filter(d => !d.obligatorio)

  return (
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
                  onUploaded={(url, nombre) => handleUploaded(key, url, nombre)}
                  onDeleted={() => doc && handleDeleted(key, doc.id)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
