'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, X, DollarSign, Check, Building2, Briefcase, FileText, Paperclip, Users } from 'lucide-react'
import { createCliente } from '@/lib/actions/clientes'
import { createSocio } from '@/lib/actions/socios'
import { createInversion } from '@/lib/actions/inversiones'
import { TIPO_SOCIEDAD_OPTIONS, REGIMEN_OPTIONS } from '@/lib/helpers'
import { useAnoFiscal } from '@/lib/contexts/ano-fiscal'

const INITIAL = {
  // Paso 1
  razon_social: '', rut: '', tipo_sociedad: '', regimen_tributario: '', representante_legal: '', metodo_creacion: '',
  actividad_economica: '', codigo_sii: '',
  iniciacion_actividades: false, rentas_presuntas: false,
  conpat_factura: false, moneda_facturacion: 'UF' as 'CLP' | 'UF', cantidad_facturacion: '',
  socios: [] as { nombre: string; rut: string; porcentaje: string }[],
  
  // Paso 2
  sin_inversiones: false,
  inversiones: [] as { tipo: string; descripcion: string; valor_apertura: string; fecha_apertura: string; valor_cierre: string; fecha_cierre: string; cantidad: string; valor_uf: string; es_propia: boolean; tiene_dfl2: boolean }[],

  // Paso 3
  tiene_nomina: false, emite_facturas: false, boletas_honorarios: false,
}

// UI Helpers
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
  fontSize: 13, color: '#0f172a', outline: 'none', background: 'white',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
}
const selectStyle: React.CSSProperties = { ...inputStyle, background: 'white', cursor: 'pointer' }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function NuevoClienteForm() {
  const { anioFiscal } = useAnoFiscal()
  const [form, setForm] = useState(INITIAL)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const set = <K extends keyof typeof INITIAL>(k: K, v: typeof INITIAL[K]) => setForm(p => ({ ...p, [k]: v }))

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const addSocio = () => set('socios', [...form.socios, { nombre: '', rut: '', porcentaje: '' }])
  const updateSocio = (index: number, field: string, val: string) => {
    const newSocios = [...form.socios]
    newSocios[index] = { ...newSocios[index], [field]: val }
    set('socios', newSocios)
  }
  const removeSocio = (index: number) => set('socios', form.socios.filter((_, i) => i !== index))
  const totalPart = form.socios.reduce((acc, s) => acc + (Number(s.porcentaje) || 0), 0)

  const addInversion = () => set('inversiones', [...form.inversiones, { tipo: 'Fondo Mutuo', descripcion: '', valor_apertura: '', fecha_apertura: '', valor_cierre: '', fecha_cierre: '', cantidad: '1', valor_uf: '', es_propia: true, tiene_dfl2: false }])
  const updateInversion = (index: number, field: string, val: string) => {
    const newInv = [...form.inversiones]
    newInv[index] = { ...newInv[index], [field]: val }
    set('inversiones', newInv)
  }
  const removeInversion = (index: number) => set('inversiones', form.inversiones.filter((_, i) => i !== index))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.razon_social || !form.rut) { setError('Razón social y RUT son obligatorios.'); return }
    setError(null)

    startTransition(async () => {
      // 1. Crear Cliente
      const resCliente = await createCliente({
        razon_social: form.razon_social,
        rut: form.rut,
        tipo_sociedad: form.tipo_sociedad || null,
        regimen_tributario: form.regimen_tributario || null,
        representante_legal: form.representante_legal || null,
        metodo_creacion: form.metodo_creacion || null,
        iniciacion_actividades: form.iniciacion_actividades,
        rentas_presuntas: form.rentas_presuntas,
        actividad_economica: form.actividad_economica || null,
        codigo_sii: form.codigo_sii || null,
        conpat_factura: form.conpat_factura,
        moneda_facturacion: form.moneda_facturacion,
        cantidad_facturacion: form.cantidad_facturacion ? Number(form.cantidad_facturacion) : null,
        tiene_nomina: form.tiene_nomina,
        cantidad_trabajadores: 0,
        emite_facturas: form.emite_facturas,
        boletas_honorarios: form.boletas_honorarios,
        sin_inversiones: form.sin_inversiones,
      })
      if (resCliente.error || !resCliente.id) { setError(resCliente.error || 'Error al crear cliente'); return }

      // 2. Crear Socios
      for (const s of form.socios) {
        if (s.nombre) {
          await createSocio({
            cliente_id: resCliente.id,
            nombre: s.nombre,
            rut: s.rut || null,
            porcentaje_participacion: s.porcentaje ? Number(s.porcentaje) : null
          })
        }
      }

      // 3. Crear Inversiones
      if (!form.sin_inversiones) {
        const INMOBILIARIAS_TIPOS = ['Inmueble Propio', 'Inmueble Arrendado', 'Departamento', 'Casa', 'Oficina', 'Local Comercial']
        for (const i of form.inversiones) {
          const isMueble = INMOBILIARIAS_TIPOS.includes(i.tipo)
          await createInversion({
            cliente_id: resCliente.id,
            anio: anioFiscal,
            categoria: isMueble ? 'inmobiliaria' : 'financiera',
            tipo_inversion: i.tipo,
            descripcion: i.descripcion || null,
            saldo_clp: i.valor_cierre ? Number(i.valor_cierre) : 0,
            saldo_usd: 0,
            cantidad: isMueble ? Number(i.cantidad) || 1 : 1,
            es_propia: i.es_propia,
            valor_uf: i.valor_uf ? Number(i.valor_uf) : null,
            tiene_dfl2: i.tiene_dfl2,
            valor_apertura: i.valor_apertura ? Number(i.valor_apertura) : 0,
            fecha_apertura: i.fecha_apertura || null,
            fecha_cierre: i.fecha_cierre || null
          })
        }
      }

      router.push(`/clientes/${resCliente.id}`)
    })
  }

  return (
    <div className="flex h-full bg-slate-50 flex-col overflow-hidden">
      {/* TopBar */}
      <div className="flex-shrink-0 h-14 bg-white border-b border-slate-200 px-7 flex items-center shadow-sm z-10">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
          <Link href="/clientes" className="hover:text-slate-800 transition-colors">Administración</Link>
          <span>›</span>
          <Link href="/clientes" className="hover:text-slate-800 transition-colors">Clientes</Link>
          <span>›</span>
          <span className="text-slate-900 font-semibold">Nuevo Cliente</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Stepper */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-6 z-0">
          <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-8">Progreso</div>
          
          <div className="relative">
            {/* Línea conectora */}
            <div className="absolute left-4 top-2 bottom-6 w-[2px] bg-slate-100 z-0"></div>

            {[
              { num: 1, title: 'Datos Cliente', desc: 'Empresa y socios' },
              { num: 2, title: 'Inversiones', desc: 'Portafolio de activos' },
              { num: 3, title: 'Operaciones', desc: 'Configuración fiscal' }
            ].map((s) => {
              const isActive = step === s.num
              const isPast = step > s.num
              return (
                <div key={s.num} className="flex gap-4 mb-8 relative z-10 cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-50' : isPast ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 ring-4 ring-white'}`}>
                    {isPast ? <Check size={14} strokeWidth={3} /> : s.num}
                  </div>
                  <div>
                    <div className={`text-[14px] font-bold ${isActive || isPast ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</div>
                    <div className="text-[12px] text-slate-400 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100">
            <Link href="/clientes" className="text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Cancelar
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[700px]">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Datos del Cliente</h1>
                  <p className="text-slate-500 text-sm">Ingresa la información de la sociedad, datos tributarios y socios.</p>
                </div>

                <SectionCard title="Datos de la Empresa">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field label="Razón Social" required>
                        <input style={inputStyle} value={form.razon_social} onChange={e => set('razon_social', e.target.value)} placeholder="Ejemplo SpA" />
                      </Field>
                    </div>
                    <Field label="RUT" required>
                      <input style={inputStyle} value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="76.XXX.XXX-X" />
                    </Field>
                    <Field label="Tipo de Sociedad" required>
                      <select style={selectStyle} value={form.tipo_sociedad} onChange={e => set('tipo_sociedad', e.target.value)}>
                        <option value="">Seleccionar</option>
                        {TIPO_SOCIEDAD_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Régimen Tributario" required>
                      <select style={selectStyle} value={form.regimen_tributario} onChange={e => set('regimen_tributario', e.target.value)}>
                        <option value="">Seleccionar</option>
                        {REGIMEN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Método de Creación">
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['Tradicional', 'Empresa en un Día'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => set('metodo_creacion', m)}
                            className={`flex-1 text-[13px] font-semibold py-2 rounded-md transition-all ${form.metodo_creacion === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Representante Legal">
                      <input style={inputStyle} value={form.representante_legal} onChange={e => set('representante_legal', e.target.value)} placeholder="Nombre completo" />
                    </Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Actividad Económica">
                         <input style={inputStyle} value={form.actividad_economica} onChange={e => set('actividad_economica', e.target.value)} placeholder="Ej: Servicios contables" />
                      </Field>
                      <Field label="Código SII">
                         <input style={inputStyle} value={form.codigo_sii} onChange={e => set('codigo_sii', e.target.value)} placeholder="Ej: 742000" />
                         <span className="text-[11px] text-slate-400 block mt-1">Bajar código desde SII</span>
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Características Tributarias">
                  <div className="space-y-3">
                    <div 
                      onClick={() => set('iniciacion_actividades', !form.iniciacion_actividades)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.iniciacion_actividades ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Check size={16} /></div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Iniciación de Actividades</div>
                          <div className="text-[12px] text-slate-500">La empresa tiene inicio formal de actividades ante el SII</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.iniciacion_actividades ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.iniciacion_actividades && <Check size={14} className="text-white" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => set('rentas_presuntas', !form.rentas_presuntas)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.rentas_presuntas ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><DollarSign size={16} /></div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Tiene Rentas Presuntas</div>
                          <div className="text-[12px] text-slate-500">Opera bajo el régimen de renta presunta</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.rentas_presuntas ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.rentas_presuntas && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Facturación Conpat">
                   <div 
                      onClick={() => set('conpat_factura', !form.conpat_factura)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all mb-4 ${form.conpat_factura ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.conpat_factura ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Conpat le factura a este cliente</div>
                          <div className="text-[12px] text-slate-500">Conpat emite facturas por sus servicios de gestión patrimonial</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.conpat_factura ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.conpat_factura && <Check size={14} className="text-white" />}
                      </div>
                    </div>

                    {form.conpat_factura && (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                        <Field label="Moneda">
                          <select style={selectStyle} value={form.moneda_facturacion} onChange={e => set('moneda_facturacion', e.target.value as 'CLP'|'UF')}>
                            <option value="UF">UF</option>
                            <option value="CLP">CLP</option>
                          </select>
                        </Field>
                        <Field label={`Monto mensual (${form.moneda_facturacion})`}>
                           <input type="number" style={inputStyle} placeholder="Ej: 4.2" value={form.cantidad_facturacion} onChange={e => set('cantidad_facturacion', e.target.value)} />
                        </Field>
                      </div>
                    )}
                </SectionCard>

                <SectionCard title="Socios y Participaciones">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[13px] font-bold">
                      <span className={`${totalPart > 100 ? 'text-red-500' : totalPart === 100 ? 'text-green-600' : 'text-amber-500'}`}>
                        {totalPart.toFixed(1)}%
                      </span>
                      <span className="text-slate-400"> / 100%</span>
                    </div>
                    <button onClick={addSocio} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Plus size={14} /> Agregar
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {form.socios.map((socio, idx) => (
                      <div key={idx} className="flex gap-3 items-end">
                        <div className="flex-1">
                          {idx === 0 && <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Nombre completo *</label>}
                          <input style={inputStyle} placeholder="Nombre del socio" value={socio.nombre} onChange={e => updateSocio(idx, 'nombre', e.target.value)} />
                        </div>
                        <div className="w-[180px]">
                           {idx === 0 && <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">RUT Socio *</label>}
                           <input style={inputStyle} placeholder="12.XXX.XXX-X" value={socio.rut} onChange={e => updateSocio(idx, 'rut', e.target.value)} />
                        </div>
                        <div className="w-[100px]">
                           {idx === 0 && <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">% Part.</label>}
                           <input type="number" style={inputStyle} placeholder="0" value={socio.porcentaje} onChange={e => updateSocio(idx, 'porcentaje', e.target.value)} />
                        </div>
                        <button onClick={() => removeSocio(idx)} type="button" className="w-[42px] h-[36px] flex-shrink-0 flex items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {form.socios.length === 0 && (
                       <div className="text-center py-6 text-[13px] text-slate-400 border border-dashed rounded-xl bg-slate-50">No hay socios registrados</div>
                    )}
                  </div>
                </SectionCard>

                <div className="flex justify-end pt-4 pb-12">
                   <button onClick={handleNext} type="button" className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors">
                      Siguiente: Inversiones ›
                   </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="mb-8">
                  <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Inversiones</h1>
                  <p className="text-slate-500 text-sm">Registra el portafolio de activos de la sociedad.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between mb-6 shadow-sm">
                   <div>
                     <h3 className="font-bold text-[14px] text-slate-900">Cliente sin inversiones</h3>
                     <p className="text-[12px] text-slate-500 mt-0.5">Deshabilita el módulo de inversiones para este cliente</p>
                   </div>
                   <div 
                      onClick={() => set('sin_inversiones', !form.sin_inversiones)}
                      className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${form.sin_inversiones ? 'bg-blue-600' : 'bg-slate-200'}`}
                   >
                     <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${form.sin_inversiones ? 'left-6' : 'left-1'}`} />
                   </div>
                </div>

                {!form.sin_inversiones && (
                  <>
                    <div className="space-y-6">
                      {form.inversiones.map((inv, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
                           <button onClick={() => removeInversion(idx)} type="button" className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={18} /></button>
                           <div className="flex items-center gap-2 mb-6">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             <h4 className="font-semibold text-slate-600 text-[13px]">Inversión #{idx + 1}</h4>
                           </div>
                           
                           <div className="space-y-4">
                             <Field label="Tipo de Inversión">
                               <select style={selectStyle} value={inv.tipo} onChange={e => handleUpdateInv(idx, 'tipo', e.target.value)}>
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
                             </Field>
                             <Field label="Descripción *">
                               <input style={inputStyle} placeholder="Ej: BCI Asset Management - Renta Fija" value={inv.descripcion} onChange={e => updateInversion(idx, 'descripcion', e.target.value)} />
                             </Field>

                             {['Inmueble Propio', 'Inmueble Arrendado', 'Departamento', 'Casa', 'Oficina', 'Local Comercial'].includes(inv.tipo) ? (
                               <div className="pt-4 mt-2 border-t border-slate-100">
                                 <h5 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Detalles Inmobiliarios</h5>
                                 <div className="grid grid-cols-2 gap-4">
                                   <Field label="Valorización (UF)">
                                     <input type="number" style={inputStyle} value={inv.valor_uf} onChange={e => updateInversion(idx, 'valor_uf', e.target.value)} />
                                   </Field>
                                   <Field label="Cantidad">
                                     <input type="number" style={inputStyle} value={inv.cantidad} onChange={e => updateInversion(idx, 'cantidad', e.target.value)} />
                                   </Field>
                                   <label className="flex items-center gap-2 cursor-pointer mt-2">
                                     <input type="checkbox" checked={inv.es_propia} onChange={e => updateInversion(idx, 'es_propia', e.target.checked as any)} className="rounded" />
                                     <span className="text-sm font-medium text-slate-700">Inmueble propio</span>
                                   </label>
                                   <label className="flex items-center gap-2 cursor-pointer mt-2">
                                     <input type="checkbox" checked={inv.tiene_dfl2} onChange={e => updateInversion(idx, 'tiene_dfl2', e.target.checked as any)} className="rounded" />
                                     <span className="text-sm font-medium text-slate-700">Acoge DFL2</span>
                                   </label>
                                 </div>
                               </div>
                             ) : (
                               <div className="pt-4 mt-2 border-t border-slate-100">
                                 <h5 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">AUM de la Inversión</h5>
                                 <div className="grid grid-cols-2 gap-6">
                                   <div>
                                     <div className="text-[12px] font-semibold text-slate-700 mb-3">Apertura</div>
                                     <div className="space-y-3">
                                       <Field label="Valor Apertura (CLP)">
                                         <input type="number" style={inputStyle} placeholder="0" value={inv.valor_apertura} onChange={e => updateInversion(idx, 'valor_apertura', e.target.value)} />
                                       </Field>
                                       <Field label="Fecha Apertura">
                                         <input type="date" style={inputStyle} value={inv.fecha_apertura} onChange={e => updateInversion(idx, 'fecha_apertura', e.target.value)} />
                                       </Field>
                                     </div>
                                   </div>
                                   <div>
                                     <div className="text-[12px] font-semibold text-slate-700 mb-3">Cierre</div>
                                     <div className="space-y-3">
                                       <Field label="Valor Cierre (CLP)">
                                         <input type="number" style={inputStyle} placeholder="0" value={inv.valor_cierre} onChange={e => updateInversion(idx, 'valor_cierre', e.target.value)} />
                                       </Field>
                                       <Field label="Fecha Cierre">
                                         <input type="date" style={inputStyle} value={inv.fecha_cierre} onChange={e => updateInversion(idx, 'fecha_cierre', e.target.value)} />
                                       </Field>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={addInversion} type="button" className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-white bg-slate-50 transition-colors shadow-sm">
                      <Plus size={16} /> Agregar Inversión
                    </button>
                  </>
                )}

                <div className="flex justify-between pt-8 pb-12">
                   <button onClick={handlePrev} type="button" className="px-6 py-2.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-white bg-slate-50 transition-colors">
                      Volver
                   </button>
                   <button onClick={handleNext} type="button" className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors">
                      Siguiente: Operaciones ›
                   </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="mb-8">
                  <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Configuración Operacional</h1>
                  <p className="text-slate-500 text-sm">Indica las características fiscales y operativas de la empresa.</p>
                </div>

                <SectionCard title="Operaciones Activas">
                  <div className="space-y-3">
                    <div 
                      onClick={() => set('tiene_nomina', !form.tiene_nomina)}
                      className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${form.tiene_nomina ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600"><Users size={20} /></div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Nómina de trabajadores</div>
                          <div className="text-[12px] text-slate-500 mt-0.5">La empresa tiene empleados con liquidaciones de sueldo</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.tiene_nomina ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.tiene_nomina && <Check size={14} className="text-white" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => set('emite_facturas', !form.emite_facturas)}
                      className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${form.emite_facturas ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.emite_facturas ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-100 text-slate-600'}`}><FileText size={20} /></div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Emisión de facturas a cliente</div>
                          <div className="text-[12px] text-slate-500 mt-0.5">Opera con documentos tributarios electrónicos (DTE)</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.emite_facturas ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.emite_facturas && <Check size={14} className="text-white" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => set('boletas_honorarios', !form.boletas_honorarios)}
                      className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${form.boletas_honorarios ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600"><Paperclip size={20} /></div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">Boletas de honorarios</div>
                          <div className="text-[12px] text-slate-500 mt-0.5">Trabaja con prestadores de servicios independientes</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.boletas_honorarios ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {form.boletas_honorarios && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="bg-slate-100 border border-slate-200/60 rounded-xl p-6 mb-6">
                  <h3 className="text-[13px] font-bold text-slate-600 mb-4 tracking-wide">Resumen del cliente</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[13px]">
                     <div className="flex items-center justify-between"><span className="text-slate-500">Razón Social:</span> <span className="font-semibold text-slate-900">{form.razon_social || '—'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">RUT:</span> <span className="font-semibold text-slate-900">{form.rut || '—'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Tipo:</span> <span className="font-semibold text-slate-900">{form.tipo_sociedad || '—'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Régimen:</span> <span className="font-semibold text-slate-900">{form.regimen_tributario || '—'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Socios:</span> <span className="font-semibold text-slate-900">{form.socios.length}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Inversiones:</span> <span className="font-semibold text-slate-900">{form.sin_inversiones ? '0' : form.inversiones.length}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Inicia Actividades:</span> <span className="font-semibold text-slate-900">{form.iniciacion_actividades ? 'Sí' : 'No'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Rentas Presuntas:</span> <span className="font-semibold text-slate-900">{form.rentas_presuntas ? 'Sí' : 'No'}</span></div>
                     <div className="flex items-center justify-between"><span className="text-slate-500">Conpat Factura:</span> <span className="font-semibold text-slate-900">{form.conpat_factura ? `Sí · ${form.cantidad_facturacion} ${form.moneda_facturacion}` : 'No'}</span></div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 pb-12">
                   <button onClick={handlePrev} type="button" className="px-6 py-2.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-white bg-slate-50 transition-colors">
                      Volver
                   </button>
                   <button onClick={handleSubmit} disabled={isPending || !form.razon_social || !form.rut} type="button" className="bg-[#45a049] hover:bg-[#3d8b40] text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                      Crear Cliente
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
