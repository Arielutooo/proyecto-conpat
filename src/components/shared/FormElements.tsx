'use client'

import React, { useRef, useState } from 'react'
import { Icon } from './Icon'

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  readOnly?: boolean
}

export const Input = ({ label, value, onChange, type = 'text', placeholder, required, hint, error, className = '', readOnly }: InputProps) => (
  <div className={className}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%',
        border: `1px solid ${error ? '#fca5a5' : '#d1d5db'}`,
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 13,
        color: '#0f172a',
        outline: 'none',
        background: readOnly ? '#F3F3EB' : error ? '#fef2f2' : 'white',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = '#CB3817' }}
      onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : '#d1d5db' }}
    />
    {hint && !error && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</div>}
    {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</div>}
  </div>
)

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  required?: boolean
  className?: string
}

export const Select = ({ label, value, onChange, options, required, className = '' }: SelectProps) => (
  <div className={className}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 13,
        color: '#0f172a',
        outline: 'none',
        background: 'white',
        appearance: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: 30,
      }}
      onFocus={e => { e.target.style.borderColor = '#CB3817' }}
      onBlur={e => { e.target.style.borderColor = '#d1d5db' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

// ─── FileDropzone ─────────────────────────────────────────────────────────────
interface FileDropzoneProps {
  label?: string
  onFile: (file: File) => void
  accept?: string
  fileName?: string
}

export const FileDropzone = ({ label, onFile, accept = '.pdf', fileName }: FileDropzoneProps) => {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${drag ? '#CB3817' : '#d1d5db'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? '#FFF0EC' : '#f9fafb',
          transition: 'all 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]) }}
        />
        {fileName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: '#CB3817' }}>
            <Icon name="file" size={16} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{fileName}</span>
          </div>
        ) : (
          <>
            <Icon name="upload" size={20} style={{ color: '#9ca3af', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Arrastra aquí o <span style={{ color: '#CB3817', fontWeight: 500 }}>selecciona archivo</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              {accept.toUpperCase().replace(/\./g, '').split(',').join(', ')}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
