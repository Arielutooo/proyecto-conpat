'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { updateCliente } from '@/lib/actions/clientes'
import { TIPO_SOCIEDAD_OPTIONS, REGIMEN_OPTIONS, METODO_CREACION_OPTIONS } from '@/lib/helpers'
import type { Cliente } from '@/lib/types'

interface Props {
  cliente: Cliente
  open: boolean
  onClose: () => void
}

const inputCls  = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:border-blue-500 transition-colors'
const selectCls = inputCls

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
    {children}
  </div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-6 first:mt-0">{children}</h3>
)

export function EditarFichaDrawer({ cliente, open, onClose }: Props) {
  const [form, setForm] = useState({
    razon_social: cliente.razon_social,
    rut: cliente.rut,
    tipo_sociedad: cliente.tipo_sociedad ?? '',
    regimen_tributario: cliente.regimen_tributario ?? '',
    metodo_creacion: cliente.metodo_creacion ?? 'Tradicional',
    conpat_factura: cliente.conpat_factura,
    moneda_facturacion: cliente.moneda_facturacion,
    cantidad_facturacion: String(cliente.cantidad_facturacion ?? ''),
    actividad_economica: cliente.actividad_economica ?? '',
    codigo_sii: cliente.codigo_sii ?? '',
    iniciacion_actividades: cliente.iniciacion_actividades,
    rentas_presuntas: cliente.rentas_presuntas,
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateCliente(cliente.id, {
        razon_social: form.razon_social,
        rut: form.rut,
        tipo_sociedad: form.tipo_sociedad || null,
        regimen_tributario: form.regimen_tributario || null,
        metodo_creacion: form.metodo_creacion || null,
        conpat_factura: form.conpat_factura,
        moneda_facturacion: form.moneda_facturacion as 'CLP' | 'UF',
        cantidad_facturacion: form.cantidad_facturacion ? Number(form.cantidad_facturacion) : null,
        actividad_economica: form.actividad_economica || null,
        codigo_sii: form.codigo_sii || null,
        iniciacion_actividades: form.iniciacion_actividades,
        rentas_presuntas: form.rentas_presuntas,
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
              <Dialog.Title className="text-[16px] font-bold text-slate-900">Editar Datos del Cliente</Dialog.Title>
              <p className="text-[13px] text-slate-400 mt-0.5">Identificación, facturación y operaciones</p>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto px-6 py-6">
            <SectionTitle>Identificación</SectionTitle>
            <div className="space-y-4">
              <Field label="Razón Social">
                <input className={inputCls} value={form.razon_social} onChange={e => set('razon_social', e.target.value)} />
              </Field>
              <Field label="RUT">
                <input className={inputCls} value={form.rut} onChange={e => set('rut', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de Sociedad">
                  <select className={selectCls} value={form.tipo_sociedad} onChange={e => set('tipo_sociedad', e.target.value)}>
                    <option value="">Seleccionar</option>
                    {TIPO_SOCIEDAD_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Régimen">
                  <select className={selectCls} value={form.regimen_tributario} onChange={e => set('regimen_tributario', e.target.value)}>
                    <option value="">Seleccionar</option>
                    {REGIMEN_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Método de Creación">
                <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-lg">
                  {METODO_CREACION_OPTIONS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('metodo_creacion', m)}
                      className={`flex-1 text-[13px] font-semibold py-2 rounded-md transition-all ${form.metodo_creacion === m ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="h-px bg-slate-100 w-full my-8" />

            <SectionTitle>Facturación Conpat</SectionTitle>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mb-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-700">Conpat le factura a este cliente</span>
              <div 
                onClick={() => set('conpat_factura', !form.conpat_factura)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.conpat_factura ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${form.conpat_factura ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>

            {form.conpat_factura && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Moneda">
                  <select className={selectCls} value={form.moneda_facturacion} onChange={e => set('moneda_facturacion', e.target.value)}>
                    <option value="CLP">CLP</option>
                    <option value="UF">UF</option>
                  </select>
                </Field>
                <Field label="Monto Mensual">
                  <input type="number" className={inputCls} value={form.cantidad_facturacion} onChange={e => set('cantidad_facturacion', e.target.value)} />
                </Field>
              </div>
            )}

            <div className="h-px bg-slate-100 w-full my-8" />

            <SectionTitle>Características Tributarias</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Field label="Actividad Económica">
                <input className={inputCls} value={form.actividad_economica} onChange={e => set('actividad_economica', e.target.value)} />
              </Field>
              <Field label="Código SII">
                <input className={inputCls} value={form.codigo_sii} onChange={e => set('codigo_sii', e.target.value)} />
              </Field>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] font-semibold text-slate-700">Iniciación de Actividades</span>
              <div 
                onClick={() => set('iniciacion_actividades', !form.iniciacion_actividades)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.iniciacion_actividades ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${form.iniciacion_actividades ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-2 pt-4">
              <span className="text-[13px] font-semibold text-slate-700">Rentas Presuntas</span>
              <div 
                onClick={() => set('rentas_presuntas', !form.rentas_presuntas)}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.rentas_presuntas ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${form.rentas_presuntas ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-6">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-white">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0f172a] hover:bg-slate-800 disabled:opacity-60 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
