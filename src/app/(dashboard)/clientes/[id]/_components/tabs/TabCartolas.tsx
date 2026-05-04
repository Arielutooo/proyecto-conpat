'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload, Trash2, Loader2, FileText } from 'lucide-react'
import { createCartola, deleteCartola } from '@/lib/actions/documentos'
import { createClient } from '@/lib/supabase/client'
import { MESES, BANCOS } from '@/lib/helpers'
import type { ClienteConRelaciones, CartolaMensual, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

export function TabCartolas({ cliente, role, anioFiscal }: Props) {
  const [cartolas, setCartolas] = useState<CartolaMensual[]>(cliente.cartolas)
  const [banco, setBanco] = useState('')
  const [mes, setMes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const canEdit = role === 'admin' || role === 'cfo_externo'

  const filtered = cartolas.filter(c => c.anio === anioFiscal)

  const handleUpload = async (file: File) => {
    if (!banco || !mes) { alert('Selecciona banco y mes'); return }
    setUploading(true)
    const supabase = createClient()
    const path = `cartolas/${cliente.id}/${anioFiscal}/${banco.replace(/\s/g,'_')}_${mes}_${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(path, file, { upsert: false })
    setUploading(false)
    if (error) { alert(error.message); return }
    const { data: { publicUrl } } = supabase.storage
      .from('documentos_patrimoniales')
      .getPublicUrl(data.path)

    startTransition(async () => {
      const result = await createCartola({
        cliente_id: cliente.id, banco, mes: Number(mes),
        anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name,
      })
      if (result.id) {
        setCartolas(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id, banco, mes: Number(mes),
          anio: anioFiscal, archivo_url: publicUrl, archivo_nombre: file.name,
          created_at: new Date().toISOString(),
        }])
        setBanco('')
        setMes('')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCartola(id, cliente.id)
      setCartolas(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Formulario de subida */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Subir Cartola — {anioFiscal}
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Banco</label>
              <select
                value={banco}
                onChange={e => setBanco(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar banco</option>
                {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mes</label>
              <select
                value={mes}
                onChange={e => setMes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar mes</option>
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !banco || !mes}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:opacity-85 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-opacity"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
      )}

      {/* Lista de cartolas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Cartolas {anioFiscal} — {filtered.length} archivo{filtered.length !== 1 ? 's' : ''}
          </h3>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No hay cartolas subidas para {anioFiscal}
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered
              .sort((a, b) => a.mes - b.mes)
              .map(c => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <FileText size={14} className="text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800">{MESES[c.mes - 1]} — {c.banco}</span>
                    {c.archivo_nombre && (
                      <p className="text-xs text-slate-400 truncate">{c.archivo_nombre}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={c.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Ver
                    </a>
                    {role === 'admin' && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}
