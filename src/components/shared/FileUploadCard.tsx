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
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const hasFile                   = Boolean(existingUrl)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext      = file.name.split('.').pop()
    const fullPath = `${path}/${Date.now()}.${ext}`
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

  const borderColor = hasFile ? '#86efac' : obligatorio ? '#cbd5e1' : '#e2e8f0'

  return (
    <div
      onClick={() => !hasFile && canUpload && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${borderColor}`,
        borderRadius: 10,
        padding: '14px 16px',
        background: hasFile ? '#f0fdf4' : obligatorio ? '#f8fafc' : '#fafafa',
        cursor: (!hasFile && canUpload) ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'all .2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,.xlsx"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      {/* Icon box */}
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: hasFile ? '#dcfce7' : 'white',
        border: `1px solid ${hasFile ? '#86efac' : '#e2e8f0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {uploading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2" />
            <path d="M12 3a9 9 0 019 9" />
          </svg>
        ) : hasFile ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M17 8l-5-5-5 5M12 3v12" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{label}</div>
        {hasFile ? (
          <div style={{ fontSize: 11, color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {existingName ?? 'Archivo cargado'}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {description ?? (obligatorio ? 'Requerido · PDF/DOCX' : 'Opcional · PDF/DOCX')}
          </div>
        )}
        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{error}</div>}
      </div>

      {/* Action */}
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
        canUpload && (
          <span style={{ fontSize: 11, color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 9px', flexShrink: 0 }}>
            {obligatorio ? 'Subir *' : 'Subir'}
          </span>
        )
      )}
    </div>
  )
}
