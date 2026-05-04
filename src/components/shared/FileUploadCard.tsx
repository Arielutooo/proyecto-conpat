'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFile = Boolean(existingUrl)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
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

  const handleDelete = async () => {
    setDeleting(true)
    onDeleted?.()
    setDeleting(false)
  }

  return (
    <div className={cn(
      'border rounded-xl p-4 space-y-2 transition-colors',
      hasFile ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-800 truncate">{label}</span>
            {obligatorio && <span className="text-xs text-red-400">*</span>}
            {hasFile && <Check size={13} className="text-green-600 flex-shrink-0" />}
          </div>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasFile && existingUrl && (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
              title="Ver documento"
            >
              <FileText size={13} />
            </a>
          )}
          {canDelete && hasFile && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          )}
          {canUpload && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
              title={hasFile ? 'Reemplazar' : 'Subir'}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            </button>
          )}
        </div>
      </div>

      {hasFile && existingName && (
        <p className="text-xs text-slate-400 truncate font-mono">{existingName}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />
    </div>
  )
}
