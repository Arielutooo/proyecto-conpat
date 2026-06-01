'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload, Loader2, FileText, Trash2, Eye, CheckCircle2, X } from 'lucide-react'
import { createDocumento, deleteDocumento, createEntregableCFO, deleteEntregableCFO } from '@/lib/actions/documentos'
import { createClient } from '@/lib/supabase/client'
import { createCertificado, deleteCertificado } from '@/lib/actions/certificados'
import { DOCS_TRIBUTARIOS, MESES, getInitials, TIPO_ENTREGABLE_OPTIONS } from '@/lib/helpers'
import type { ClienteConRelaciones, Documento, Role, CertificadoRetiroAnual, EntregableCFO } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

const F29_KEYS = MESES.map((_, i) => `f29_${String(i + 1).padStart(2, '0')}`)

export function TabTributario({ cliente, role, anioFiscal }: Props) {
  const [docs, setDocs] = useState<Documento[]>(
    cliente.documentos.filter(d => d.categoria === 'tributario')
  )
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [uploadingF29, setUploadingF29] = useState<string | null>(null)
  const [uploadingCert, setUploadingCert] = useState<string | null>(null)
  const [uploadingEntregable, setUploadingEntregable] = useState(false)
  const [selectedMesIdx, setSelectedMesIdx] = useState(0)
  const [tipoEntregable, setTipoEntregable] = useState('')

  // archivos en espera (staged) — no se suben hasta confirmar
  const [pendingF29, setPendingF29] = useState<File | null>(null)
  const [pendingEntregable, setPendingEntregable] = useState<File | null>(null)
  const [f29Error, setF29Error] = useState<string | null>(null)
  const [entregableError, setEntregableError] = useState<string | null>(null)

  const [entregables, setEntregables] = useState<EntregableCFO[]>(
    cliente.entregables || []
  )

  const [certificados, setCertificados] = useState<CertificadoRetiroAnual[]>(
    cliente.socios.flatMap(s => s.certificados || [])
  )

  // drag & drop state — por zona independiente
  const [isDragOverDoc, setIsDragOverDoc] = useState<string | null>(null)
  const [dropFlashDoc, setDropFlashDoc] = useState<string | null>(null)
  const [isDragOverF29, setIsDragOverF29] = useState(false)
  const [dropFlashF29, setDropFlashF29] = useState(false)
  const [isDragOverEntregable, setIsDragOverEntregable] = useState(false)
  const [dropFlashEntregable, setDropFlashEntregable] = useState(false)

  const [, startTransition] = useTransition()
  const docInputRef = useRef<HTMLInputElement>(null)
  const f29InputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)
  const entregableRef = useRef<HTMLInputElement>(null)
  const pendingDocKey = useRef<string | null>(null)
  const pendingSocioId = useRef<string | null>(null)
  const canEdit = role === 'admin' || role === 'cfo_externo' || role === 'master'

  const getDoc = (tipo: string) => docs.find(d => d.tipo_documento === tipo && d.anio === anioFiscal)

  const uploadedCount = DOCS_TRIBUTARIOS.filter(({ key }) => getDoc(key)).length
  const progress = (uploadedCount / DOCS_TRIBUTARIOS.length) * 100
  const complete = uploadedCount === DOCS_TRIBUTARIOS.length

  const handleUploadGeneric = async (file: File, key: string, isF29: boolean) => {
    const setLoader = isF29 ? setUploadingF29 : setUploadingDoc
    setLoader(key)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `tributario/${cliente.id}/${anioFiscal}/${key}_${Date.now()}.${ext}`

    const { data, error } = await supabase.storage.from('documentos_patrimoniales').upload(path, file, { upsert: false })

    if (error) {
      setLoader(null)
      alert(error.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)

    startTransition(async () => {
      const existing = getDoc(key)
      if (existing) await deleteDocumento(existing.id, cliente.id)

      const result = await createDocumento({
        cliente_id: cliente.id, categoria: 'tributario',
        tipo_documento: key, anio: anioFiscal,
        archivo_url: publicUrl, archivo_nombre: file.name,
      })

      if (result.id) {
        setDocs(prev => [
          ...prev.filter(d => !(d.tipo_documento === key && d.anio === anioFiscal)),
          { id: result.id!, cliente_id: cliente.id, categoria: 'tributario', tipo_documento: key, anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name, created_at: new Date().toISOString() },
        ])
      }
      setLoader(null)
    })
  }

  const handleDeleted = (docId: string) => {
    startTransition(async () => {
      await deleteDocumento(docId, cliente.id)
      setDocs(prev => prev.filter(d => d.id !== docId))
    })
  }

  const handleUploadCertificado = async (file: File, socioId: string) => {
    setUploadingCert(socioId)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `tributario/${cliente.id}/certificados/${anioFiscal}/${socioId}_${Date.now()}.${ext}`

    const { data, error } = await supabase.storage.from('documentos_patrimoniales').upload(path, file, { upsert: false })
    if (error) {
      setUploadingCert(null)
      alert(error.message)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)

    startTransition(async () => {
      const existing = certificados.find(c => c.socio_id === socioId && c.anio === anioFiscal)
      if (existing) await deleteCertificado(existing.id)

      const result = await createCertificado({ socio_id: socioId, anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name })
      if (result.id) {
        setCertificados(prev => [
          ...prev.filter(c => !(c.socio_id === socioId && c.anio === anioFiscal)),
          { id: result.id!, socio_id: socioId, anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name, created_at: new Date().toISOString() }
        ])
      }
      setUploadingCert(null)
    })
  }

  const handleDeleteCertificado = (certId: string) => {
    startTransition(async () => {
      await deleteCertificado(certId)
      setCertificados(prev => prev.filter(c => c.id !== certId))
    })
  }

  const handleUploadEntregable = async (file: File) => {
    setUploadingEntregable(true)
    const supabase = createClient()
    const path = `entregables/${cliente.id}/${anioFiscal}/${tipoEntregable.replace(/\s/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`

    const { data, error } = await supabase.storage.from('documentos_patrimoniales').upload(path, file, { upsert: false })
    if (error) {
      setUploadingEntregable(false)
      alert(error.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documentos_patrimoniales').getPublicUrl(data.path)

    startTransition(async () => {
      const result = await createEntregableCFO({
        cliente_id: cliente.id,
        tipo_documento: tipoEntregable,
        anio: anioFiscal,
        mes: null,
        archivo_url: publicUrl,
        archivo_nombre: file.name,
      })

      if (result.id) {
        setEntregables(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, tipo_documento: tipoEntregable,
          anio: anioFiscal, mes: null, archivo_url: publicUrl,
          archivo_nombre: file.name, created_at: new Date().toISOString()
        }])
        setTipoEntregable('')
      }
      setUploadingEntregable(false)
    })
  }

  const handleDeleteEntregable = (id: string) => {
    startTransition(async () => {
      await deleteEntregableCFO(id, cliente.id)
      setEntregables(prev => prev.filter(e => e.id !== id))
    })
  }

  // Confirmar subida F29 desde archivo en espera
  const submitF29 = () => {
    if (!pendingF29) return
    handleUploadGeneric(pendingF29, F29_KEYS[selectedMesIdx], true)
    setPendingF29(null)
    setF29Error(null)
  }

  // Confirmar subida Entregable desde archivo en espera
  const submitEntregable = () => {
    if (!tipoEntregable) {
      setEntregableError('Selecciona el tipo de documento antes de subir')
      return
    }
    if (!pendingEntregable) return
    handleUploadEntregable(pendingEntregable)
    setPendingEntregable(null)
    setEntregableError(null)
  }

  // helpers visuales para zonas de drop
  const dropZoneStyle = (active: boolean, flash: boolean) => ({
    position: 'relative' as const,
    ...(flash
      ? { border: '2px solid #16a34a', background: '#f0fdf4' }
      : active
      ? { border: '2px solid #C84632', background: 'rgba(200,70,50,0.05)' }
      : {})
  })

  const DropOverlay = () => (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 12, zIndex: 10,
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
  )

  return (
    <div className="max-w-4xl space-y-10">
      {/* Repositorio Tributario Anual */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">Repositorio Tributario {anioFiscal}</h2>
            <p className="text-[13px] text-slate-500 mt-1">Documentos obligatorios para la contabilidad anual.</p>
          </div>
          <div className="text-right">
            <div className={`text-[15px] font-bold ${complete ? 'text-green-600' : 'text-slate-900'}`}>{uploadedCount}/{DOCS_TRIBUTARIOS.length} documentos</div>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={`h-full transition-all duration-500 rounded-full ${complete ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          {DOCS_TRIBUTARIOS.map(({ key, label }) => {
            const doc = getDoc(key)
            const isLoading = uploadingDoc === key
            const isRowDragOver = isDragOverDoc === key && !doc && canEdit
            const isRowFlash = dropFlashDoc === key

            return (
              <div
                key={key}
                className="p-5 flex items-center gap-4 transition-colors"
                style={{
                  position: 'relative',
                  ...(isRowFlash
                    ? { background: '#f0fdf4', boxShadow: 'inset 0 0 0 2px #16a34a' }
                    : isRowDragOver
                    ? { background: 'rgba(200,70,50,0.05)', boxShadow: 'inset 0 0 0 2px #C84632' }
                    : {})
                }}
                onDragEnter={!doc && canEdit ? (e) => {
                  e.preventDefault()
                  setIsDragOverDoc(key)
                } : undefined}
                onDragLeave={!doc && canEdit ? (e) => {
                  e.preventDefault()
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return
                  setIsDragOverDoc(prev => prev === key ? null : prev)
                } : undefined}
                onDragOver={!doc && canEdit ? (e) => { e.preventDefault() } : undefined}
                onDrop={!doc && canEdit ? (e) => {
                  e.preventDefault()
                  setIsDragOverDoc(null)
                  const file = e.dataTransfer.files[0]
                  if (!file) return
                  setDropFlashDoc(key)
                  setTimeout(() => { setDropFlashDoc(null); handleUploadGeneric(file, key, false) }, 200)
                } : undefined}
              >
                {isRowDragOver && (
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
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${doc ? 'bg-slate-50 border border-slate-200 text-slate-600' : 'bg-amber-50 border border-amber-100 text-amber-500'}`}>
                  <FileText size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-slate-900">{label}</h3>
                    {doc ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#059669] bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Subido
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 truncate">
                    {doc ? doc.archivo_nombre : `Requerido para cierre de año fiscal ${anioFiscal}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {doc ? (
                    <>
                      <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Ver documento">
                        <Eye size={18} />
                      </a>
                      {canEdit && (
                        <button onClick={() => handleDeleted(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </>
                  ) : (
                    canEdit && (
                      <button
                        onClick={() => { pendingDocKey.current = key; if (docInputRef.current) docInputRef.current.click() }}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-white border border-slate-200 text-blue-600 text-[13px] font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Cargar
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <input
          ref={docInputRef} type="file" accept=".pdf,.xls,.xlsx,.png,.jpg" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file && pendingDocKey.current) handleUploadGeneric(file, pendingDocKey.current, false)
            e.target.value = ''
          }}
        />
      </div>

      {/* F29 Mensual */}
      <div>
        <div className="mb-4">
          <h2 className="text-[16px] font-bold text-slate-900">F29 — Declaración Mensual</h2>
          <p className="text-[13px] text-slate-500 mt-1">Sube los comprobantes de declaración de impuestos mensuales.</p>
        </div>

        {canEdit && (
          <>
            <div
              className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-2 flex gap-4 items-center"
              style={dropZoneStyle(isDragOverF29, dropFlashF29)}
              onDragEnter={(e) => { e.preventDefault(); setIsDragOverF29(true) }}
              onDragLeave={(e) => {
                e.preventDefault()
                if (e.currentTarget.contains(e.relatedTarget as Node)) return
                setIsDragOverF29(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOverF29(false)
                const file = e.dataTransfer.files[0]
                if (!file) return
                setDropFlashF29(true)
                setTimeout(() => {
                  setDropFlashF29(false)
                  setPendingF29(file)
                  setF29Error(null)
                }, 200)
              }}
            >
              {isDragOverF29 && <DropOverlay />}
              <div className="w-48 flex-shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mes a declarar</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 outline-none font-medium"
                  value={selectedMesIdx} onChange={e => setSelectedMesIdx(Number(e.target.value))}
                >
                  {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>

              {/* Box del archivo — muestra nombre si está en espera, dashed si no */}
              {pendingF29 ? (
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg h-14 flex items-center justify-between px-4 gap-3">
                  <span className="text-[13px] font-medium text-green-700 flex items-center gap-2 min-w-0">
                    <FileText size={15} className="flex-shrink-0 text-green-600" />
                    <span className="truncate">{pendingF29.name}</span>
                  </span>
                  <button
                    onClick={() => { setPendingF29(null); setF29Error(null) }}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Quitar archivo"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => f29InputRef.current?.click()}
                  className="flex-1 bg-white border border-dashed border-slate-300 rounded-lg h-14 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                >
                  <span className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                    <FileText size={16} /> Seleccionar F29 (PDF)…
                  </span>
                </div>
              )}

              <button
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-14 px-6 rounded-lg font-semibold text-[13px] flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={submitF29}
                disabled={uploadingF29 !== null || !pendingF29}
              >
                {uploadingF29 ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Subir F29
              </button>

              <input
                ref={f29InputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) { setPendingF29(file); setF29Error(null) }
                  e.target.value = ''
                }}
              />
            </div>
            {f29Error && (
              <p className="text-[12px] text-red-600 mb-4 px-1">{f29Error}</p>
            )}
          </>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {F29_KEYS.map((key, i) => {
            const doc = getDoc(key)
            if (!doc) return null
            return (
              <div key={key} className="px-5 py-4 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-slate-900">F29 {MESES[i]}</div>
                    <div className="text-[12px] text-slate-500">{doc.archivo_nombre}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    Ver PDF
                  </a>
                  {canEdit && (
                    <button onClick={() => handleDeleted(doc.id)} className="text-[12px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {F29_KEYS.every(k => !getDoc(k)) && (
            <div className="p-8 text-center text-[13px] text-slate-400">
              No hay declaraciones F29 subidas para el año {anioFiscal}.
            </div>
          )}
        </div>
      </div>

      {/* Certificados de Retiro */}
      <div>
        <div className="mb-4">
          <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">CERTIFICADOS DE RETIRO — AÑO {anioFiscal}</h2>
        </div>

        <div className="space-y-4">
          {cliente.socios.map(socio => {
            const cert = certificados.find(c => c.socio_id === socio.id && c.anio === anioFiscal)
            const isLoading = uploadingCert === socio.id

            return (
              <div key={socio.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[14px]">
                    {getInitials(socio.nombre)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">{socio.nombre}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {socio.porcentaje_participacion}% · {socio.rut || 'Sin RUT'}
                    </p>
                  </div>
                </div>

                <div>
                  {cert ? (
                    <div className="flex items-center gap-2">
                      <a href={cert.archivo_url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        Ver PDF
                      </a>
                      {canEdit && (
                        <button onClick={() => handleDeleteCertificado(cert.id)} className="text-[12px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                          Eliminar
                        </button>
                      )}
                    </div>
                  ) : (
                    canEdit && (
                      <button
                        onClick={() => { pendingSocioId.current = socio.id; if (certInputRef.current) certInputRef.current.click() }}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 border-dashed hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 text-[13px] font-medium rounded-lg transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Adjuntar Certificado {anioFiscal}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
          {cliente.socios.length === 0 && (
            <div className="p-8 text-center text-[13px] text-slate-400 border border-slate-200 border-dashed rounded-xl">
              No hay socios registrados para este cliente.
            </div>
          )}
        </div>

        <input
          ref={certInputRef} type="file" accept=".pdf" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file && pendingSocioId.current) handleUploadCertificado(file, pendingSocioId.current)
            e.target.value = ''
          }}
        />
      </div>

      {/* Entregables CFO */}
      <div>
        <div className="mb-4">
          <h2 className="text-[16px] font-bold text-slate-900">Entregables CFO — Año {anioFiscal}</h2>
          <p className="text-[13px] text-slate-500 mt-1">Sube informes patrimoniales y análisis de inversiones generados por el CFO.</p>
        </div>

        {canEdit && (
          <>
            <div
              className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-2 flex gap-4 items-center"
              style={dropZoneStyle(isDragOverEntregable, dropFlashEntregable)}
              onDragEnter={(e) => { e.preventDefault(); setIsDragOverEntregable(true) }}
              onDragLeave={(e) => {
                e.preventDefault()
                if (e.currentTarget.contains(e.relatedTarget as Node)) return
                setIsDragOverEntregable(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOverEntregable(false)
                const file = e.dataTransfer.files[0]
                if (!file) return
                setDropFlashEntregable(true)
                setTimeout(() => {
                  setDropFlashEntregable(false)
                  setPendingEntregable(file)
                  setEntregableError(null)
                }, 200)
              }}
            >
              {isDragOverEntregable && <DropOverlay />}
              <div className="w-64 flex-shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo de Documento</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 outline-none font-medium"
                  value={tipoEntregable}
                  onChange={e => { setTipoEntregable(e.target.value); setEntregableError(null) }}
                >
                  <option value="">Seleccionar tipo</option>
                  {TIPO_ENTREGABLE_OPTIONS.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Box del archivo — muestra nombre si está en espera, dashed si no */}
              {pendingEntregable ? (
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg h-14 flex items-center justify-between px-4 gap-3">
                  <span className="text-[13px] font-medium text-green-700 flex items-center gap-2 min-w-0">
                    <FileText size={15} className="flex-shrink-0 text-green-600" />
                    <span className="truncate">{pendingEntregable.name}</span>
                  </span>
                  <button
                    onClick={() => { setPendingEntregable(null); setEntregableError(null) }}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Quitar archivo"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => entregableRef.current?.click()}
                  className="flex-1 bg-white border border-dashed border-slate-300 rounded-lg h-14 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                >
                  <span className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                    <FileText size={16} /> Seleccionar Archivo (PDF, Excel)…
                  </span>
                </div>
              )}

              <button
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-14 px-6 rounded-lg font-semibold text-[13px] flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={submitEntregable}
                disabled={uploadingEntregable || !pendingEntregable}
              >
                {uploadingEntregable ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Subir Entregable
              </button>

              <input
                ref={entregableRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.jpg,.jpeg,.png" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) { setPendingEntregable(file); setEntregableError(null) }
                  e.target.value = ''
                }}
              />
            </div>
            {entregableError && (
              <p className="text-[12px] text-red-600 mb-4 px-1">{entregableError}</p>
            )}
          </>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          {entregables.filter(e => e.anio === anioFiscal).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(e => (
            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">{e.tipo_documento}</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {e.archivo_nombre} · {new Date(e.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={e.archivo_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Ver documento">
                  <Eye size={18} />
                </a>
                {canEdit && (
                  <button onClick={() => handleDeleteEntregable(e.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {entregables.filter(e => e.anio === anioFiscal).length === 0 && (
            <div className="p-8 text-center text-[13px] text-slate-400">
              No hay entregables subidos para el año fiscal {anioFiscal}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
