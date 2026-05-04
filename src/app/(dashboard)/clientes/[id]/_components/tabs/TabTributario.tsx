'use client'

import { useState, useTransition } from 'react'
import { FileUploadCard } from '@/components/shared/FileUploadCard'
import { createDocumento, deleteDocumento } from '@/lib/actions/documentos'
import { DOCS_TRIBUTARIOS } from '@/lib/helpers'
import type { ClienteConRelaciones, Documento, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

export function TabTributario({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'tributario')
  )
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin'

  const getDoc = (tipo: string) =>
    docs.find(d => d.tipo_documento === tipo && d.anio === anioFiscal)

  const handleUploaded = (tipo: string, url: string, nombre: string) => {
    startTransition(async () => {
      // Remove existing doc for same tipo + year before inserting new
      const existing = getDoc(tipo)
      if (existing) await deleteDocumento(existing.id, cliente.id)

      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'tributario',
        tipo_documento: tipo, anio: anioFiscal,
        archivo_url: url, archivo_nombre: nombre,
      })
      if (result.id) {
        setDocs(prev => [
          ...prev.filter(d => !(d.tipo_documento === tipo && d.anio === anioFiscal)),
          {
            id: result.id!, cliente_id: cliente.id, categoria: 'tributario',
            tipo_documento: tipo, anio: anioFiscal,
            archivo_url: url, archivo_nombre: nombre,
            created_at: new Date().toISOString(),
          },
        ])
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Documentos Tributarios — {anioFiscal}
        </h3>
        <span className="text-xs text-slate-400">
          {docs.filter(d => d.anio === anioFiscal).length} / {DOCS_TRIBUTARIOS.length} documentos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DOCS_TRIBUTARIOS.map(({ key, label }) => {
          const doc = getDoc(key)
          return (
            <FileUploadCard
              key={key}
              label={label}
              description={`Año fiscal ${anioFiscal}`}
              path={`tributario/${cliente.id}/${anioFiscal}`}
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

      {/* Historial por año */}
      {docs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Historial de Documentos</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Documento</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Año</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Archivo</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs
                .sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0))
                .map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {DOCS_TRIBUTARIOS.find(dt => dt.key === d.tipo_documento)?.label ?? d.tipo_documento}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{d.anio ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 truncate hidden md:table-cell">{d.archivo_nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={d.archivo_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline">
                        Ver
                      </a>
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
