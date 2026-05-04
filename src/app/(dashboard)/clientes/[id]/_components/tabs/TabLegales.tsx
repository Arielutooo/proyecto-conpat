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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-slate-800 font-medium mt-0.5">{value ?? <span className="text-slate-300">—</span>}</dd>
    </div>
  )
}

export function TabLegales({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'legal')
  )
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin'

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

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Datos societarios */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Datos Societarios</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <InfoRow label="Tipo de Sociedad"   value={cliente.tipo_sociedad} />
          <InfoRow label="Régimen Tributario"  value={cliente.regimen_tributario} />
          <InfoRow label="Representante Legal" value={cliente.representante_legal} />
          <InfoRow label="Método Constitución" value={cliente.metodo_creacion} />
          <InfoRow label="Emite Facturas"      value={cliente.emite_facturas ? 'Sí' : 'No'} />
          <InfoRow label="Boletas Honorarios"  value={cliente.boletas_honorarios ? 'Sí' : 'No'} />
        </dl>
      </div>

      {/* Facturación Conpat */}
      {(cliente.conpat_factura || canEdit) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Facturación Interna Conpat</h3>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-4">
            <InfoRow label="Factura" value={cliente.conpat_factura ? 'Sí' : 'No'} />
            {cliente.conpat_factura && (
              <>
                <InfoRow label="Moneda" value={cliente.moneda_facturacion} />
                <InfoRow
                  label="Monto"
                  value={
                    cliente.cantidad_facturacion != null
                      ? cliente.moneda_facturacion === 'CLP'
                        ? formatCLP(cliente.cantidad_facturacion)
                        : `UF ${cliente.cantidad_facturacion}`
                      : null
                  }
                />
              </>
            )}
          </dl>
        </div>
      )}

      {/* Documentos legales */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Documentos Societarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DOCS_LEGALES.map(({ key, label, obligatorio }) => {
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
  )
}
