'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  label: string
  description?: string
  obligatorio?: boolean
  path: string
  existingUrl?: string | null
  existingName?: string | null
  existingNota?: string | null
  canUpload?: boolean
  canDelete?: boolean
  onUploaded?: (url: string, nombre: string, nota: string) => void
  onDeleted?: () => void
  onNuevaVersion?: () => void
  onVerHistorial?: () => void
}

export function FileUploadCard({
  label, description, obligatorio, path,
  existingUrl, existingName, existingNota,
  canUpload = true, canDelete = false,
  onUploaded, onDeleted, onNuevaVersion, onVerHistorial,
}: Props) {
  const [uploading,    setUploading]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [isDragOver,   setIsDragOver]   = useState(false)
  const [dropFlash,    setDropFlash]    = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [pendingFile,  setPendingFile]  = useState<File | null>(null)
  const [pendingNota,  setPendingNota]  = useState('')

  const inputRef     = useRef<HTMLInputElement>(null)
  const dragCountRef = useRef(0)

  const hasFile        = Boolean(existingUrl)
  const canReceiveDrop = canUpload && !hasFile && !pendingFile
  const showMenu       = hasFile && (onNuevaVersion || onVerHistorial)

  const cancelPending = () => { setPendingFile(null); setPendingNota('') }

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (file: File, nota: string) => {
    setUploading(true)
    setError(null)
    const supabase  = createClient()
    const ext       = file.name.split('.').pop()
    const fullPath  = `${path}/${Date.now()}.${ext}`
    const { data, error: uploadError } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(fullPath, file, { upsert: true })
    setUploading(false)
    if (uploadError) { setError(uploadError.message); return }
    const { data: { publicUrl } } = supabase.storage
      .from('documentos_patrimoniales')
      .getPublicUrl(data.path)
    setPendingFile(null)
    setPendingNota('')
    onUploaded?.(publicUrl, file.name, nota)
  }

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    if (!canReceiveDrop) return
    e.preventDefault()
    dragCountRef.current++
    if (dragCountRef.current === 1) setIsDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    if (!canReceiveDrop) return
    e.preventDefault()
    dragCountRef.current--
    if (dragCountRef.current === 0) setIsDragOver(false)
  }
  const handleDragOver = (e: React.DragEvent) => {
    if (!canReceiveDrop) return
    e.preventDefault()
  }
  const handleDrop = (e: React.DragEvent) => {
    if (!canReceiveDrop) return
    e.preventDefault()
    dragCountRef.current = 0
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    setDropFlash(true)
    setTimeout(() => { setDropFlash(false); setPendingFile(file) }, 200)
  }

  // ── Estado: staging (archivo seleccionado, pendiente de confirmación) ─────
  if (pendingFile && !uploading) {
    return (
      <div style={{
        border: '1.5px solid #93c5fd', borderRadius: 10,
        padding: '14px 16px', background: '#eff6ff',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <input ref={inputRef} type="file" accept="*" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && setPendingFile(e.target.files[0])} />

        {/* Fila superior: ícono + nombre + X */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#dbeafe', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</div>
          </div>
          <button onClick={cancelPending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, border: '1px solid #bfdbfe', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nota opcional */}
        <textarea
          value={pendingNota}
          onChange={e => setPendingNota(e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="Nota (opcional)  ej: Constitución original"
          rows={2}
          style={{ width: '100%', border: '1px solid #bfdbfe', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: '#0f172a', resize: 'none', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }}
          onFocus={e => (e.target.style.borderColor = '#3b82f6')}
          onBlur={e => (e.target.style.borderColor = '#bfdbfe')}
        />

        {error && <div style={{ fontSize: 11, color: '#dc2626' }}>{error}</div>}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={cancelPending} style={{ flex: 1, padding: '8px 0', border: '1px solid #cbd5e1', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}>
            Cancelar
          </button>
          <button onClick={() => handleUpload(pendingFile, pendingNota)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, background: '#C84632', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'white' }}>
            Subir
          </button>
        </div>
      </div>
    )
  }

  // ── Estilos dinámicos (estado normal, con archivo, o vacío) ───────────────
  let borderColor: string, borderStyle: string, borderWidth: string, bgColor: string
  if (dropFlash) {
    borderColor = '#16a34a'; borderStyle = 'solid'; borderWidth = '2px'; bgColor = '#f0fdf4'
  } else if (isDragOver) {
    borderColor = '#C84632'; borderStyle = 'solid'; borderWidth = '2px'; bgColor = 'rgba(200,70,50,0.04)'
  } else if (hasFile) {
    borderColor = '#86efac'; borderStyle = 'dashed'; borderWidth = '1.5px'; bgColor = '#f0fdf4'
  } else if (obligatorio) {
    borderColor = '#cbd5e1'; borderStyle = 'dashed'; borderWidth = '1.5px'; bgColor = '#f8fafc'
  } else {
    borderColor = '#e2e8f0'; borderStyle = 'dashed'; borderWidth = '1.5px'; bgColor = '#fafafa'
  }

  return (
    <div
      onClick={() => !hasFile && !pendingFile && canUpload && inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'relative', border: `${borderWidth} ${borderStyle} ${borderColor}`,
        borderRadius: 10, padding: `${isDragOver ? '20px' : '14px'} 16px`,
        background: bgColor, cursor: (!hasFile && canUpload) ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s',
      }}
    >
      <input ref={inputRef} type="file" accept="*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]) }} />

      {/* Overlay drag */}
      {isDragOver && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 10, zIndex: 10, background: 'rgba(200,70,50,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C84632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#C84632' }}>Suelta para subir</span>
        </div>
      )}

      {/* Ícono */}
      <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: (hasFile || dropFlash) ? '#dcfce7' : 'white', border: `1px solid ${(hasFile || dropFlash) ? '#86efac' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
        {uploading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2" /><path d="M12 3a9 9 0 019 9" />
          </svg>
        ) : (hasFile || dropFlash) ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" />
          </svg>
        )}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{label}</div>
        {hasFile ? (
          <>
            <div style={{ fontSize: 11, color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {existingName ?? 'Archivo cargado'}
            </div>
            {existingNota && (
              <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                {existingNota}
              </div>
            )}
          </>
        ) : isDragOver ? (
          <div style={{ fontSize: 11, color: '#C84632', fontWeight: 500 }}>Suelta para subir</div>
        ) : canUpload ? (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Arrastra un archivo aquí o haz clic para explorar</div>
        ) : (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{description ?? (obligatorio ? 'Requerido' : 'Opcional')}</div>
        )}
        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{error}</div>}
      </div>

      {/* Acciones */}
      {hasFile ? (
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {existingUrl && (
            <a href={existingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #bbf7d0', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#16a34a', textDecoration: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Ver
            </a>
          )}
          {canDelete && (
            <button onClick={e => { e.stopPropagation(); onDeleted?.() }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #fecaca', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#dc2626' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Quitar
            </button>
          )}
          {/* Menú ⋯ */}
          {showMenu && (
            <div style={{ position: 'relative' }}>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 36, zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 170, overflow: 'hidden' }}>
                    {onNuevaVersion && (
                      <button onClick={() => { setMenuOpen(false); onNuevaVersion() }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#0f172a', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Subir nueva versión
                      </button>
                    )}
                    {onVerHistorial && (
                      <button onClick={() => { setMenuOpen(false); onVerHistorial() }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#0f172a', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        Ver historial
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        canUpload && !isDragOver && (
          <span style={{ fontSize: 11, color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 9px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {obligatorio ? 'Subir *' : 'Subir'}
          </span>
        )
      )}
    </div>
  )
}
