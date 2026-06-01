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
  canUpload?: boolean
  canDelete?: boolean
  onUploaded?: (url: string, nombre: string) => void
  onDeleted?: () => void
}

export function FileUploadCard({
  label, description, obligatorio, path,
  existingUrl, existingName, canUpload = true, canDelete = false,
  onUploaded, onDeleted,
}: Props) {
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropFlash,  setDropFlash]  = useState(false)

  const inputRef     = useRef<HTMLInputElement>(null)
  const dragCountRef = useRef(0) // contador para manejar enter/leave con hijos

  const hasFile        = Boolean(existingUrl)
  const canReceiveDrop = canUpload && !hasFile

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
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
    onUploaded?.(publicUrl, file.name)
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
    e.preventDefault() // necesario para habilitar el drop
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!canReceiveDrop) return
    e.preventDefault()
    dragCountRef.current = 0
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Flash verde 200ms → confirmación visual antes de subir
    setDropFlash(true)
    setTimeout(() => {
      setDropFlash(false)
      handleUpload(file)
    }, 200)
  }

  // ── Estilos dinámicos ─────────────────────────────────────────────────────
  let borderColor: string
  let borderStyle: string
  let borderWidth: string
  let bgColor:     string

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

  const paddingV = isDragOver ? '20px' : '14px'

  return (
    <div
      onClick={() => !hasFile && canUpload && inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        border:       `${borderWidth} ${borderStyle} ${borderColor}`,
        borderRadius: 10,
        padding:      `${paddingV} 16px`,
        background:   bgColor,
        cursor:       (!hasFile && canUpload) ? 'pointer' : 'default',
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        transition:   'all .2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,.xlsx"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      {/* ── Overlay de drop ─────────────────────────────────────────────── */}
      {isDragOver && (
        <div
          style={{
            position:      'absolute',
            inset:         0,
            borderRadius:  10,
            zIndex:        10,
            background:    'rgba(200,70,50,0.08)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            gap:           8,
            pointerEvents: 'none', // no interfiere con los eventos del padre
          }}
        >
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

      {/* ── Icono ───────────────────────────────────────────────────────── */}
      <div style={{
        width:      34,
        height:     34,
        borderRadius: 8,
        flexShrink: 0,
        background: (hasFile || dropFlash) ? '#dcfce7' : 'white',
        border:     `1px solid ${(hasFile || dropFlash) ? '#86efac' : '#e2e8f0'}`,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {uploading ? (
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2" />
            <path d="M12 3a9 9 0 019 9" />
          </svg>
        ) : (hasFile || dropFlash) ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M17 8l-5-5-5 5M12 3v12" />
          </svg>
        )}
      </div>

      {/* ── Texto ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
          {label}
        </div>

        {hasFile ? (
          <div style={{ fontSize: 11, color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {existingName ?? 'Archivo cargado'}
          </div>
        ) : isDragOver ? (
          <div style={{ fontSize: 11, color: '#C84632', fontWeight: 500 }}>
            Suelta para subir
          </div>
        ) : canUpload ? (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Arrastra un archivo aquí o haz clic para explorar
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {description ?? (obligatorio ? 'Requerido · PDF/DOCX' : 'Opcional · PDF/DOCX')}
          </div>
        )}

        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{error}</div>}
      </div>

      {/* ── Acciones ────────────────────────────────────────────────────── */}
      {hasFile ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {existingUrl && (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #bbf7d0', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#16a34a', textDecoration: 'none' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Ver
            </a>
          )}
          {canDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDeleted?.() }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: '1px solid #fecaca', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#dc2626' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Quitar
            </button>
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
