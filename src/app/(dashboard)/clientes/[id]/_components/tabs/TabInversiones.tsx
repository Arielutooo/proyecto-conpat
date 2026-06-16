'use client'

import { useState, useTransition, useRef, Fragment } from 'react'
import { formatCLP, formatUSD, TIPO_CAMBIO_USD_CLP, TIPO_INVERSION_LABELS, MESES } from '@/lib/helpers'
import { updateCliente } from '@/lib/actions/clientes'
import { createCartolaInversion, deleteCartolaInversion } from '@/lib/actions/cartolas-inversion'
import { createClient } from '@/lib/supabase/client'
import { Wallet, Landmark, TrendingUp, FileText, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react'
import type { ClienteConRelaciones, Role, CartolaInversion, Inversion } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

function KPICard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: any }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
        {Icon && <Icon size={16} className="text-slate-400" />}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[12px] text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  )
}

// ─── Cartola Upload + List Section ───────────────────────────────────────────

interface CartolaSectionProps {
  inversion: Inversion
  clienteId: string
  anioFiscal: number
  cartolas: CartolaInversion[]
  canEdit: boolean
  onCreated: (c: CartolaInversion) => void
  onDeleted: (id: string) => void
}

function CartolaInversionSection({
  inversion, clienteId, anioFiscal, cartolas, canEdit, onCreated, onDeleted,
}: CartolaSectionProps) {
  const [mes, setMes]               = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [comentario, setComentario] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [, startTransition]         = useTransition()
  const fileRef                     = useRef<HTMLInputElement>(null)
  const dragCountRef                = useRef(0)

  const yearCartolas = cartolas
    .filter(c => c.inversion_id === inversion.id && c.anio === anioFiscal)
    .sort((a, b) => a.mes - b.mes)

  const cancelPending = () => { setPendingFile(null); setComentario('') }

  const handleUpload = async (file: File) => {
    if (!mes) { alert('Selecciona un mes'); return }
    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'bin'
    const path = `cartolas_inversion/${clienteId}/${inversion.id}/${anioFiscal}/${mes.padStart(2,'0')}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('documentos_patrimoniales')
      .upload(path, file, { upsert: false })
    setUploading(false)
    if (error) { alert(error.message); return }
    const { data: { publicUrl } } = supabase.storage
      .from('documentos_patrimoniales')
      .getPublicUrl(data.path)

    startTransition(async () => {
      const result = await createCartolaInversion({
        inversion_id:   inversion.id,
        cliente_id:     clienteId,
        anio:           anioFiscal,
        mes:            Number(mes),
        comentario:     comentario.trim() || null,
        archivo_url:    publicUrl,
        archivo_nombre: file.name,
      })
      if (result.id) {
        onCreated({
          id:             result.id,
          inversion_id:   inversion.id,
          cliente_id:     clienteId,
          anio:           anioFiscal,
          mes:            Number(mes),
          comentario:     comentario.trim() || null,
          archivo_url:    publicUrl,
          archivo_nombre: file.name,
          created_at:     new Date().toISOString(),
        })
        setMes('')
        setComentario('')
        setPendingFile(null)
      }
    })
  }

  const canReceiveDrop = canEdit && !pendingFile && !uploading
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
    if (file) setPendingFile(file)
  }

  return (
    <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Cartolas de Inversión — {anioFiscal}
      </div>

      {/* Upload form */}
      {canEdit && (
        <div style={{ marginBottom: yearCartolas.length > 0 ? 14 : 0 }}>
          {/* Mes selector */}
          <div style={{ marginBottom: 8 }}>
            <select
              value={mes}
              onChange={e => setMes(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0',
                borderRadius: 8, fontSize: 12, background: 'white',
                color: mes ? '#0f172a' : '#94a3b8', outline: 'none',
              }}
            >
              <option value="">Seleccionar mes...</option>
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>

          {/* Pending staging state */}
          {pendingFile ? (
            <div style={{ border: '1.5px solid #93c5fd', borderRadius: 9, padding: '12px 14px', background: '#eff6ff', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#dbeafe', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFile.name}</div>
                </div>
                <button onClick={cancelPending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: '1px solid #bfdbfe', borderRadius: 6, background: 'white', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Comentario (opcional)"
                rows={2}
                style={{ width: '100%', border: '1px solid #bfdbfe', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: '#0f172a', resize: 'none', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = '#bfdbfe')}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={cancelPending} style={{ flex: 1, padding: '7px 0', border: '1px solid #cbd5e1', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpload(pendingFile)}
                  disabled={uploading || !mes}
                  style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, background: uploading || !mes ? '#94a3b8' : '#C84632', cursor: uploading || !mes ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  {uploading && <Loader2 size={12} className="animate-spin" />}
                  {uploading ? 'Subiendo...' : 'Subir Cartola'}
                </button>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              onClick={() => fileRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: `1.5px dashed ${isDragOver ? '#C84632' : '#cbd5e1'}`,
                borderRadius: 9, padding: '14px',
                background: isDragOver ? 'rgba(200,70,50,0.04)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? '#C84632' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span style={{ fontSize: 12, color: isDragOver ? '#C84632' : '#94a3b8', fontWeight: isDragOver ? 600 : 400 }}>
                {isDragOver ? 'Suelta para seleccionar' : 'Arrastra o haz clic para seleccionar archivo'}
              </span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setPendingFile(e.target.files[0])} />
        </div>
      )}

      {/* List */}
      {yearCartolas.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {yearCartolas.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'white', borderRadius: 7, border: '1px solid #f1f5f9' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{MESES[c.mes - 1]}</div>
                {c.comentario && <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.comentario}</div>}
                <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.archivo_nombre}</div>
              </div>
              <a href={c.archivo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, color: '#3b82f6', textDecoration: 'none', flexShrink: 0 }}>
                Ver
              </a>
              {canEdit && (
                <button onClick={() => onDeleted(c.id)} style={{ color: '#cbd5e1', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: 2, flexShrink: 0 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1')}>
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : !canEdit ? (
        <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>
          No hay cartolas para {anioFiscal}
        </div>
      ) : null}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TabInversiones({ cliente, role, anioFiscal }: Props) {
  const [sinInv, setSinInv]         = useState(cliente.sin_inversiones)
  const [openInvs, setOpenInvs]     = useState<Set<string>>(new Set())
  const [localCartolas, setLocalCartolas] = useState<CartolaInversion[]>(cliente.cartolas_inversion ?? [])
  const [, startTransition]         = useTransition()
  const canEdit = role === 'admin' || role === 'master'

  const inversiones    = cliente.inversiones.filter(i => i.anio === anioFiscal)
  const financieras    = inversiones.filter(i => i.categoria === 'financiera')
  const inmobiliarias  = inversiones.filter(i => i.categoria === 'inmobiliaria')

  const totalAperturaClp = financieras.reduce((s, i) => s + (i.valor_apertura || 0), 0)
  const totalCierreClp   = financieras.reduce((s, i) => s + i.saldo_clp, 0)
  const totalCierreUsd   = totalCierreClp / TIPO_CAMBIO_USD_CLP

  const toggleInv = (id: string) => {
    setOpenInvs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCartolaCreated = (c: CartolaInversion) => {
    setLocalCartolas(prev => [...prev, c])
  }

  const handleCartolaDeleted = (id: string) => {
    setLocalCartolas(prev => prev.filter(c => c.id !== id))
    startTransition(async () => {
      await deleteCartolaInversion(id, cliente.id)
    })
  }

  const toggleSinInversiones = () => {
    const next = !sinInv
    setSinInv(next)
    startTransition(async () => {
      await updateCliente(cliente.id, { sin_inversiones: next })
    })
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toggle sin inversiones */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-[14px] text-slate-900">Cliente sin inversiones</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Oculta y deshabilita el módulo de inversiones</p>
        </div>
        <div
          onClick={canEdit ? toggleSinInversiones : undefined}
          className={`w-12 h-7 rounded-full relative transition-colors ${canEdit ? 'cursor-pointer' : ''} ${sinInv ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${sinInv ? 'left-6' : 'left-1'}`} />
        </div>
      </div>

      {!sinInv && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <KPICard label="Apertura de Año"   value={`01/01/${anioFiscal}`} sub="Inicio del ejercicio fiscal"    icon={Wallet}    />
            <KPICard label="Cierre de Año"      value={`31/12/${anioFiscal}`} sub="Cierre del ejercicio fiscal"   icon={Landmark}  />
            <KPICard label={`AUM Total ${anioFiscal}`} value={`$${(totalCierreClp / 1000000).toFixed(1)}M CLP`} sub={`${formatUSD(totalCierreUsd)} USD`} icon={TrendingUp} />
            <KPICard label="Fecha de Valoración" value={`31/12/${anioFiscal}`} sub={`Cierre ejercicio ${anioFiscal}`} icon={FileText} />
          </div>

          {/* Panel Financieras */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Panel 1 — Financieras (FFMM y Acciones)
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Institución</th>
                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Tipo</th>
                    <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Año Apertura</th>
                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Saldo Inicial</th>
                    <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Año Cierre</th>
                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 tracking-widest uppercase">Saldo Final</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financieras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                        No hay inversiones financieras registradas.
                      </td>
                    </tr>
                  ) : financieras.map(inv => {
                    const diff       = inv.saldo_clp - (inv.valor_apertura || 0)
                    const isPositive = diff >= 0
                    const isOpen     = openInvs.has(inv.id)

                    return (
                      <Fragment key={inv.id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-semibold text-slate-900 text-[13px]">
                            {inv.descripcion || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${inv.tipo_inversion === 'Acciones' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {TIPO_INVERSION_LABELS[inv.tipo_inversion] ?? inv.tipo_inversion}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-slate-400 text-[13px]">
                            {inv.fecha_apertura ? inv.fecha_apertura.split('-')[0] : anioFiscal - 1}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="font-semibold text-slate-900 text-[13px]">{formatCLP(inv.valor_apertura || 0)}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{formatUSD((inv.valor_apertura || 0) / TIPO_CAMBIO_USD_CLP)}</div>
                          </td>
                          <td className="px-5 py-4 text-center text-slate-400 text-[13px]">
                            {inv.fecha_cierre ? inv.fecha_cierre.split('-')[0] : anioFiscal}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className={`font-semibold text-[13px] ${isPositive ? 'text-[#059669]' : 'text-slate-900'}`}>{formatCLP(inv.saldo_clp)}</div>
                            <div className={`text-[11px] font-medium mt-0.5 ${isPositive ? 'text-[#059669]' : 'text-red-500'}`}>
                              {isPositive ? '+' : ''}{formatCLP(diff)}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => toggleInv(inv.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 10px', border: '1px solid #e2e8f0',
                                borderRadius: 8, background: isOpen ? '#f8fafc' : 'white',
                                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                color: isOpen ? '#0f172a' : '#64748b', whiteSpace: 'nowrap',
                              }}
                            >
                              Cartolas
                              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={7} style={{ padding: 0, background: '#f8fafc' }}>
                              <CartolaInversionSection
                                inversion={inv}
                                clienteId={cliente.id}
                                anioFiscal={anioFiscal}
                                cartolas={localCartolas}
                                canEdit={canEdit}
                                onCreated={handleCartolaCreated}
                                onDeleted={handleCartolaDeleted}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel Inmobiliaria */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Panel 2 — Inmobiliaria (Solo Lectura)
            </h3>
            {inmobiliarias.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm shadow-sm">
                No hay inversiones inmobiliarias registradas.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {inmobiliarias.map(inv => {
                  const isOpen = openInvs.has(inv.id)
                  return (
                    <div key={inv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6">
                        <h4 className="font-bold text-slate-900 text-[15px] mb-6">
                          {inv.descripcion || TIPO_INVERSION_LABELS[inv.tipo_inversion] || inv.tipo_inversion}
                        </h4>
                        <div className="space-y-4 text-[13px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Cantidad de inmuebles</span>
                            <span className="font-bold text-slate-900">{inv.cantidad}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Valorización</span>
                            <span className="font-bold text-slate-900">{inv.valor_uf ? `${inv.valor_uf.toLocaleString('es-CL')} UF` : '—'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Propiedad propia</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${inv.es_propia ? 'bg-green-50 text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>
                              {inv.es_propia ? '• Sí' : '• No'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Acoge DFL2</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${inv.tiene_dfl2 ? 'bg-green-50 text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>
                              {inv.tiene_dfl2 ? '• Sí' : '• No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cartolas toggle footer */}
                      <div style={{ borderTop: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => toggleInv(inv.id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 24px', border: 'none', background: isOpen ? '#f8fafc' : 'white',
                            cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            color: isOpen ? '#0f172a' : '#64748b',
                          }}
                        >
                          <span>Cartolas de Inversión</span>
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isOpen && (
                          <CartolaInversionSection
                            inversion={inv}
                            clienteId={cliente.id}
                            anioFiscal={anioFiscal}
                            cartolas={localCartolas}
                            canEdit={canEdit}
                            onCreated={handleCartolaCreated}
                            onDeleted={handleCartolaDeleted}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
