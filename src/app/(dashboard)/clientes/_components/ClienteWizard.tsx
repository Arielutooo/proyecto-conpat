'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { createCliente } from '@/lib/actions/clientes'
import { TIPO_SOCIEDAD_OPTIONS, REGIMEN_OPTIONS } from '@/lib/helpers'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 1 | 2 | 3

const INITIAL = {
  razon_social: '', rut: '', tipo_sociedad: '', regimen_tributario: '',
  representante_legal: '', metodo_creacion: '',
  conpat_factura: false, moneda_facturacion: 'CLP' as 'CLP' | 'UF', cantidad_facturacion: '',
  tiene_nomina: false, emite_facturas: false, boletas_honorarios: false,
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[oklch(0.55_0.18_245)]'
const selectCls = inputCls + ' bg-white'

function WizardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export function ClienteWizard({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleClose = () => { setStep(1); setForm(INITIAL); setError(null); onClose() }

  const handleFinish = () => {
    setError(null)
    startTransition(async () => {
      const result = await createCliente({
        ...form,
        cantidad_facturacion: form.cantidad_facturacion ? Number(form.cantidad_facturacion) : null,
        sin_inversiones: false,
        cantidad_trabajadores: 0,
        iniciacion_actividades: false,
        actividad_economica: '',
        codigo_sii: '',
        rentas_presuntas: false,
      })
      if (result.error) { setError(result.error); return }
      handleClose()
      router.push(`/clientes/${result.id}`)
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">Nuevo Cliente</Dialog.Title>
              <p className="text-xs text-slate-400 mt-0.5">Paso {step} de 3</p>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 px-6 pt-4">
            {([1, 2, 3] as Step[]).map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
            {step === 1 && (
              <>
                <WizardField label="Razón Social">
                  <input className={inputCls} value={form.razon_social} onChange={e => set('razon_social', e.target.value)} placeholder="Ej. Inversiones ABC SpA" />
                </WizardField>
                <WizardField label="RUT">
                  <input className={inputCls} value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="76.123.456-7" />
                </WizardField>
                <div className="grid grid-cols-2 gap-4">
                  <WizardField label="Tipo de Sociedad">
                    <select className={selectCls} value={form.tipo_sociedad} onChange={e => set('tipo_sociedad', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {TIPO_SOCIEDAD_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </WizardField>
                  <WizardField label="Régimen Tributario">
                    <select className={selectCls} value={form.regimen_tributario} onChange={e => set('regimen_tributario', e.target.value)}>
                      <option value="">Seleccionar</option>
                      {REGIMEN_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </WizardField>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <WizardField label="Representante Legal">
                  <input className={inputCls} value={form.representante_legal} onChange={e => set('representante_legal', e.target.value)} placeholder="Nombre completo" />
                </WizardField>
                <WizardField label="Método de Constitución">
                  <input className={inputCls} value={form.metodo_creacion} onChange={e => set('metodo_creacion', e.target.value)} placeholder="Ej. Notaría Pública" />
                </WizardField>
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Facturación Conpat</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.conpat_factura} onChange={e => set('conpat_factura', e.target.checked)} className="rounded" />
                    <span className="text-sm text-slate-700">Conpat factura a este cliente</span>
                  </label>
                  {form.conpat_factura && (
                    <div className="grid grid-cols-2 gap-3">
                      <WizardField label="Moneda">
                        <select className={selectCls} value={form.moneda_facturacion} onChange={e => set('moneda_facturacion', e.target.value)}>
                          <option value="CLP">CLP</option>
                          <option value="UF">UF</option>
                        </select>
                      </WizardField>
                      <WizardField label="Monto">
                        <input type="number" className={inputCls} value={form.cantidad_facturacion} onChange={e => set('cantidad_facturacion', e.target.value)} placeholder="0" />
                      </WizardField>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Características del Cliente</p>
                {[
                  { key: 'tiene_nomina',       label: 'Tiene nómina de trabajadores' },
                  { key: 'emite_facturas',      label: 'Emite facturas' },
                  { key: 'boletas_honorarios',  label: 'Emite boletas de honorarios' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={e => set(key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <button
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 1 ? 'invisible' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep((step + 1) as Step)}
                disabled={step === 1 && (!form.razon_social || !form.rut)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:opacity-85 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-opacity"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:opacity-85 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-opacity"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                Crear Cliente
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
