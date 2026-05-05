'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { createSocio, updateSocio, deleteSocio } from '@/lib/actions/socios'
import type { ClienteConRelaciones } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  open: boolean
  onClose: () => void
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[oklch(0.55_0.18_245)]'

export function EditarSociosDrawer({ cliente, open, onClose }: Props) {
  const [socios, setSocios] = useState(cliente.socios.map(s => ({
    id: s.id, nombre: s.nombre, rut: s.rut || '', porcentaje: s.porcentaje_participacion ? String(s.porcentaje_participacion) : ''
  })))
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    setSocios(prev => [...prev, { id: `new_${Date.now()}`, nombre: '', rut: '', porcentaje: '' }])
  }

  const handleUpdate = (idx: number, field: string, val: string) => {
    const newSocios = [...socios]
    newSocios[idx] = { ...newSocios[idx], [field]: val }
    setSocios(newSocios)
  }

  const handleRemove = (idx: number) => {
    const s = socios[idx]
    if (!s.id.startsWith('new_')) {
      setDeletedIds(prev => [...prev, s.id])
    }
    setSocios(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      // Deletes
      for (const id of deletedIds) {
        await deleteSocio(id, cliente.id)
      }
      
      // Upserts
      for (const s of socios) {
        if (!s.nombre) continue
        
        if (s.id.startsWith('new_')) {
          await createSocio({
            cliente_id: cliente.id,
            nombre: s.nombre,
            rut: s.rut || null,
            porcentaje_participacion: s.porcentaje ? Number(s.porcentaje) : null
          })
        } else {
          await updateSocio(s.id, cliente.id, {
            nombre: s.nombre,
            rut: s.rut || null,
            porcentaje_participacion: s.porcentaje ? Number(s.porcentaje) : null
          })
        }
      }
      
      onClose()
    })
  }

  const totalPart = socios.reduce((acc, s) => acc + (Number(s.porcentaje) || 0), 0)

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-[540px] bg-white shadow-2xl z-50 flex flex-col focus:outline-none animate-slide-in-right">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">Editar Socios</Dialog.Title>
              <p className="text-xs text-slate-400 mt-0.5">{cliente.razon_social}</p>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold">
                <span className={`${totalPart > 100 ? 'text-red-500' : totalPart === 100 ? 'text-green-600' : 'text-amber-500'}`}>
                  {totalPart.toFixed(1)}%
                </span>
                <span className="text-slate-400"> / 100%</span>
              </div>
              <button onClick={handleAdd} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <Plus size={14} /> Agregar Socio
              </button>
            </div>

            <div className="space-y-4">
              {socios.map((socio, idx) => (
                <div key={socio.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                  <button onClick={() => handleRemove(idx)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nombre completo</label>
                      <input className={inputCls} value={socio.nombre} onChange={e => handleUpdate(idx, 'nombre', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">RUT</label>
                      <input className={inputCls} value={socio.rut} onChange={e => handleUpdate(idx, 'rut', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">% Part.</label>
                      <input type="number" className={inputCls} value={socio.porcentaje} onChange={e => handleUpdate(idx, 'porcentaje', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
