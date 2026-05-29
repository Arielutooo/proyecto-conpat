'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { createInversion, updateInversion, deleteInversion } from '@/lib/actions/inversiones'
import { updateCliente } from '@/lib/actions/clientes'
import type { ClienteConRelaciones } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  open: boolean
  anioFiscal: number
  onClose: () => void
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#CB3817]'
const selectCls = inputCls

export function EditarInversionesDrawer({ cliente, open, anioFiscal, onClose }: Props) {
  const [sinInversiones, setSinInversiones] = useState(cliente.sin_inversiones)
  const [inversiones, setInversiones] = useState(cliente.inversiones.filter(i => i.anio === anioFiscal).map(i => ({
    id: i.id,
    tipo: i.tipo_inversion,
    descripcion: i.descripcion || '',
    valor_uf: i.valor_uf ? String(i.valor_uf) : '',
    cantidad: String(i.cantidad),
    es_propia: i.es_propia,
    tiene_dfl2: i.tiene_dfl2,
    saldo_clp: String(i.saldo_clp),
    valor_apertura: String(i.valor_apertura || 0),
    fecha_apertura: i.fecha_apertura || '',
    fecha_cierre: i.fecha_cierre || ''
  })))
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    setInversiones(prev => [...prev, {
      id: `new_${Date.now()}`, tipo: 'Fondo Mutuo', descripcion: '', valor_uf: '', cantidad: '1', es_propia: true, tiene_dfl2: false, saldo_clp: '', valor_apertura: '', fecha_apertura: '', fecha_cierre: ''
    }])
  }

  const handleUpdate = (idx: number, field: string, val: string | boolean) => {
    const newInv = [...inversiones]
    newInv[idx] = { ...newInv[idx], [field]: val }
    setInversiones(newInv)
  }

  const handleRemove = (idx: number) => {
    const i = inversiones[idx]
    if (!i.id.startsWith('new_')) {
      setDeletedIds(prev => [...prev, i.id])
    }
    setInversiones(prev => prev.filter((_, index) => index !== idx))
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      if (cliente.sin_inversiones !== sinInversiones) {
        await updateCliente(cliente.id, { sin_inversiones: sinInversiones })
      }

      // Deletes
      for (const id of deletedIds) {
        await deleteInversion(id, cliente.id)
      }
      
      // Upserts
      const INMOBILIARIAS_TIPOS = ['Inmueble Propio', 'Inmueble Arrendado', 'Departamento', 'Casa', 'Oficina', 'Local Comercial']
      for (const inv of inversiones) {
        const isMueble = INMOBILIARIAS_TIPOS.includes(inv.tipo)
        const data = {
          categoria: (isMueble ? 'inmobiliaria' : 'financiera') as 'inmobiliaria' | 'financiera',
          anio: anioFiscal,
          tipo_inversion: inv.tipo,
          descripcion: inv.descripcion || null,
          saldo_clp: Number(inv.saldo_clp) || 0,
          saldo_usd: 0,
          cantidad: isMueble ? (Number(inv.cantidad) || 1) : 1,
          es_propia: inv.es_propia,
          valor_uf: isMueble ? (Number(inv.valor_uf) || null) : null,
          tiene_dfl2: inv.tiene_dfl2,
          valor_apertura: Number(inv.valor_apertura) || 0,
          fecha_apertura: inv.fecha_apertura || null,
          fecha_cierre: inv.fecha_cierre || null
        }

        if (inv.id.startsWith('new_')) {
          await createInversion({ cliente_id: cliente.id, ...data })
        } else {
          await updateInversion(inv.id, cliente.id, data)
        }
      }
      
      onClose()
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-[580px] bg-white shadow-2xl z-50 flex flex-col focus:outline-none animate-slide-in-right">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">Editar Inversiones</Dialog.Title>
              <p className="text-xs text-slate-400 mt-0.5">{cliente.razon_social}</p>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 mb-6">
              <input type="checkbox" checked={sinInversiones} onChange={e => setSinInversiones(e.target.checked)} className="rounded" />
              <div>
                <span className="block text-sm font-bold text-slate-700">Cliente sin inversiones</span>
                <span className="block text-xs text-slate-500">Deshabilita el módulo de inversiones</span>
              </div>
            </label>

            {!sinInversiones && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={handleAdd} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Plus size={14} /> Agregar Inversión
                  </button>
                </div>

                <div className="space-y-4">
                  {inversiones.map((inv, idx) => (
                    <div key={inv.id} className="p-5 rounded-xl border border-slate-200 bg-white relative shadow-sm">
                      <button onClick={() => handleRemove(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <h4 className="font-semibold text-slate-600 text-[13px] mb-4">Inversión #{idx + 1}</h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Inversión</label>
                            <select className={selectCls} value={inv.tipo} onChange={e => handleUpdate(idx, 'tipo', e.target.value)}>
                              <option value="Fondo Mutuo">Fondo Mutuo</option>
                              <option value="Acciones">Acciones</option>
                              <option value="Depósito a Plazo">Depósito a Plazo</option>
                              <option value="Bonos">Bonos</option>
                              <option value="Departamento">Departamento</option>
                              <option value="Casa">Casa</option>
                              <option value="Oficina">Oficina</option>
                              <option value="Local Comercial">Local Comercial</option>
                              <option value="Inmueble Propio">Inmueble Propio</option>
                              <option value="Inmueble Arrendado">Inmueble Arrendado</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Descripción</label>
                            <input className={inputCls} value={inv.descripcion} onChange={e => handleUpdate(idx, 'descripcion', e.target.value)} />
                          </div>
                        </div>

                        {['Inmueble Propio', 'Inmueble Arrendado', 'Departamento', 'Casa', 'Oficina', 'Local Comercial'].includes(inv.tipo) ? (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Valorización (UF)</label>
                              <input type="number" className={inputCls} value={inv.valor_uf} onChange={e => handleUpdate(idx, 'valor_uf', e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cantidad</label>
                              <input type="number" className={inputCls} value={inv.cantidad} onChange={e => handleUpdate(idx, 'cantidad', e.target.value)} />
                            </div>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input type="checkbox" checked={inv.es_propia} onChange={e => handleUpdate(idx, 'es_propia', e.target.checked)} className="rounded" />
                              <span className="text-sm font-medium text-slate-700">Inmueble propio</span>
                            </label>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input type="checkbox" checked={inv.tiene_dfl2} onChange={e => handleUpdate(idx, 'tiene_dfl2', e.target.checked)} className="rounded" />
                              <span className="text-sm font-medium text-slate-700">Acoge DFL2</span>
                            </label>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-slate-100">
                            <h5 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">AUM de la Inversión</h5>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-[12px] font-semibold text-slate-700 mb-3">Apertura</div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Valor Apertura (CLP)</label>
                                    <input type="number" className={inputCls} value={inv.valor_apertura} onChange={e => handleUpdate(idx, 'valor_apertura', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fecha Apertura</label>
                                    <input type="date" className={inputCls} value={inv.fecha_apertura} onChange={e => handleUpdate(idx, 'fecha_apertura', e.target.value)} />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-[12px] font-semibold text-slate-700 mb-3">Cierre / Actual</div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Valor Actual (CLP)</label>
                                    <input type="number" className={inputCls} value={inv.saldo_clp} onChange={e => handleUpdate(idx, 'saldo_clp', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fecha Cierre</label>
                                    <input type="date" className={inputCls} value={inv.fecha_cierre} onChange={e => handleUpdate(idx, 'fecha_cierre', e.target.value)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:opacity-85 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-opacity">
              {isPending && <Loader2 size={13} className="animate-spin" />} Guardar Cambios
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
