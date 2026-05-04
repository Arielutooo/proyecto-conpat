'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { updateCliente } from '@/lib/actions/clientes'
import { TIPO_SOCIEDAD_OPTIONS, REGIMEN_OPTIONS } from '@/lib/helpers'
import type { Cliente } from '@/lib/types'

interface Props {
  cliente: Cliente
  open: boolean
  onClose: () => void
}

const inputCls  = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[oklch(0.55_0.18_245)]'
const selectCls = inputCls

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
)

const Divider = ({ label }: { label: string }) => (
  <div className="pt-4">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
  </div>
)

export function EditarFichaDrawer({ cliente, open, onClose }: Props) {
  const [form, setForm] = useState({
    razon_social: cliente.razon_social,
    rut: cliente.rut,
    tipo_sociedad: cliente.tipo_sociedad ?? '',
    regimen_tributario: cliente.regimen_tributario ?? '',
    representante_legal: cliente.representante_legal ?? '',
    metodo_creacion: cliente.metodo_creacion ?? '',
    conpat_factura: cliente.conpat_factura,
    moneda_facturacion: cliente.moneda_facturacion,
    cantidad_facturacion: String(cliente.cantidad_facturacion ?? ''),
    tiene_nomina: cliente.tiene_nomina,
    emite_facturas: cliente.emite_facturas,
    boletas_honorarios: cliente.boletas_honorarios,
    cantidad_trabajadores: String(cliente.cantidad_trabajadores),
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateCliente(cliente.id, {
        ...form,
        tipo_sociedad: form.tipo_sociedad || null,
        regimen_tributario: form.regimen_tributario || null,
        representante_legal: form.representante_legal || null,
        metodo_creacion: form.metodo_creacion || null,
        cantidad_facturacion: form.cantidad_facturacion ? Number(form.cantidad_facturacion) : null,
        cantidad_trabajadores: Number(form.cantidad_trabajadores) || 0,
      })
      if (result.error) { setError(result.error); return }
      onClose()
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed right-0 top-0 h-full w-full max-w-[540px] bg-white shadow-2xl z-50 flex flex-col focus:outline-none animate-slide-in-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">Editar Ficha</Dialog.Title>
              <p className="text-xs text-slate-400 mt-0.5">{cliente.razon_social}</p>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
            <Divider label="Identificación" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Razón Social">
                <input className={inputCls} value={form.razon_social} onChange={e => set('razon_social', e.target.value)} />
              </Field>
              <Field label="RUT">
                <input className={inputCls} value={form.rut} onChange={e => set('rut', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de Sociedad">
                <select className={selectCls} value={form.tipo_sociedad} onChange={e => set('tipo_sociedad', e.target.value)}>
                  <option value="">Sin definir</option>
                  {TIPO_SOCIEDAD_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Régimen Tributario">
                <select className={selectCls} value={form.regimen_tributario} onChange={e => set('regimen_tributario', e.target.value)}>
                  <option value="">Sin definir</option>
                  {REGIMEN_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Representante Legal">
              <input className={inputCls} value={form.representante_legal} onChange={e => set('representante_legal', e.target.value)} />
            </Field>
            <Field label="Método de Constitución">
              <input className={inputCls} value={form.metodo_creacion} onChange={e => set('metodo_creacion', e.target.value)} />
            </Field>

            <Divider label="Facturación Conpat" />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.conpat_factura} onChange={e => set('conpat_factura', e.target.checked)} className="rounded" />
              <span className="text-sm text-slate-700">Conpat factura a este cliente</span>
            </label>
            {form.conpat_factura && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Moneda">
                  <select className={selectCls} value={form.moneda_facturacion} onChange={e => set('moneda_facturacion', e.target.value)}>
                    <option value="CLP">CLP</option>
                    <option value="UF">UF</option>
                  </select>
                </Field>
                <Field label="Monto">
                  <input type="number" className={inputCls} value={form.cantidad_facturacion} onChange={e => set('cantidad_facturacion', e.target.value)} />
                </Field>
              </div>
            )}

            <Divider label="Operaciones" />
            {[
              { key: 'tiene_nomina', label: 'Tiene nómina de trabajadores' },
              { key: 'emite_facturas', label: 'Emite facturas' },
              { key: 'boletas_honorarios', label: 'Emite boletas de honorarios' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => set(key, e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
            <Field label="Cantidad de Trabajadores">
              <input type="number" min={0} className={inputCls} value={form.cantidad_trabajadores} onChange={e => set('cantidad_trabajadores', e.target.value)} />
            </Field>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:opacity-85 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-opacity"
            >
              {isPending && <Loader2 size={13} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
