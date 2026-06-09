'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Trash2, Eye, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { createDocumento, deleteDocumento } from '@/lib/actions/documentos'
import { createClient } from '@/lib/supabase/client'
import { DOCS_RRHH } from '@/lib/helpers'
import type { ClienteConRelaciones, Documento, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

export function TabRRHH({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'rrhh')
  )
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    contratos: true, liquidaciones: true
  })
  const [isDragOverCat, setIsDragOverCat] = useState<Record<string, boolean>>({})
  const [dropFlashCat, setDropFlashCat] = useState<Record<string, boolean>>({})

  const [, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingCategory = useRef<string | null>(null)

  const canEdit = role === 'admin' || role === 'master'

  const toggleCategory = (key: string) => {
    setOpenCategories(p => ({ ...p, [key]: !p[key] }))
  }

  const handleUpload = async (file: File, categoriaKey: string) => {
    setUploadingDoc(categoriaKey)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `rrhh/${cliente.id}/${anioFiscal}/${categoriaKey}_${Date.now()}.${ext}`

    const { data, error } = await supabase.storage.from('documentos_patrimoniales').upload(path, file, { upsert: false })

    if (error) {
      setUploadingDoc(null)
      alert(error.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)

    startTransition(async () => {
      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'rrhh',
        tipo_documento: categoriaKey, anio: anioFiscal,
        archivo_url: publicUrl, archivo_nombre: file.name,
      })

      if (result.id) {
        setDocs(prev => [
          ...prev,
          { id: result.id!, cliente_id: cliente.id, categoria: 'rrhh', tipo_documento: categoriaKey, anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name, created_at: new Date().toISOString() },
        ])
      }
      setUploadingDoc(null)
    })
  }

  const handleDeleted = (docId: string) => {
    startTransition(async () => {
      await deleteDocumento(docId, cliente.id)
      setDocs(prev => prev.filter(d => d.id !== docId))
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-slate-900">Documentos RRHH — Período Fiscal {anioFiscal}</h2>
        <p className="text-[13px] text-slate-500 mt-1">Nómina, contratos y comprobantes laborales.</p>

        {!cliente.tiene_nomina && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-[13px]">
            El cliente no tiene habilitada la nómina de trabajadores en su perfil.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {DOCS_RRHH.map(({ key, label }) => {
          const categoryDocs = docs.filter(d => d.tipo_documento === key && d.anio === anioFiscal)
          const isOpen = openCategories[key]
          const isUploading = uploadingDoc === key
          const isCatDragOver = isDragOverCat[key] && canEdit
          const isCatFlash = dropFlashCat[key]

          return (
            <div key={key} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all">
              {/* Accordion Header */}
              <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 cursor-pointer" onClick={() => toggleCategory(key)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">{label}</h3>
                    <div className="text-[12px] text-slate-500 mt-0.5">{categoryDocs.length} archivo{categoryDocs.length !== 1 && 's'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        pendingCategory.current = key
                        if (fileInputRef.current) fileInputRef.current.click()
                      }}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Agregar
                    </button>
                  )}
                  <div className="text-slate-400">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Accordion Body — zona de drop */}
              {isOpen && (
                <div
                  className="border-t border-slate-100 bg-white"
                  style={{
                    position: 'relative',
                    ...(isCatFlash
                      ? { background: '#f0fdf4', boxShadow: 'inset 0 0 0 2px #16a34a' }
                      : isCatDragOver
                      ? { background: 'rgba(200,70,50,0.05)', boxShadow: 'inset 0 0 0 2px #C84632' }
                      : {})
                  }}
                  onDragEnter={canEdit ? (e) => {
                    e.preventDefault()
                    setIsDragOverCat(p => ({ ...p, [key]: true }))
                  } : undefined}
                  onDragLeave={canEdit ? (e) => {
                    e.preventDefault()
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return
                    setIsDragOverCat(p => ({ ...p, [key]: false }))
                  } : undefined}
                  onDragOver={canEdit ? (e) => { e.preventDefault() } : undefined}
                  onDrop={canEdit ? (e) => {
                    e.preventDefault()
                    setIsDragOverCat(p => ({ ...p, [key]: false }))
                    const file = e.dataTransfer.files[0]
                    if (!file) return
                    setDropFlashCat(p => ({ ...p, [key]: true }))
                    setTimeout(() => {
                      setDropFlashCat(p => ({ ...p, [key]: false }))
                      handleUpload(file, key)
                    }, 200)
                  } : undefined}
                >
                  {isCatDragOver && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 10,
                      background: 'rgba(200,70,50,0.08)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#C84632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <path d="M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#C84632', letterSpacing: '0.01em' }}>
                        Suelta para subir
                      </span>
                    </div>
                  )}
                  {categoryDocs.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-[13px] text-slate-400 font-medium">Sin archivos para {anioFiscal}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {categoryDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-400" />
                            <span className="text-[13px] font-medium text-slate-700">{doc.archivo_nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                              <Eye size={16} />
                            </a>
                            {canEdit && (
                              <button onClick={() => handleDeleted(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <input
        ref={fileInputRef} type="file" accept="*" className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file && pendingCategory.current) handleUpload(file, pendingCategory.current)
          e.target.value = ''
        }}
      />
    </div>
  )
}
