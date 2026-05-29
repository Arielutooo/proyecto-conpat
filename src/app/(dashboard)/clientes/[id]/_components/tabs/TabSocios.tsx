'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { FileUploadCard } from '@/components/shared/FileUploadCard'
import { createSocio, deleteSocio } from '@/lib/actions/socios'
import { createCertificadoRetiro } from '@/lib/actions/documentos'
import { formatCLP } from '@/lib/helpers'
import type { ClienteConRelaciones, SocioConRelaciones, Role } from '@/lib/types'

interface Props {
  cliente: ClienteConRelaciones
  role: Role
  anioFiscal: number
}

export function TabSocios({ cliente, role, anioFiscal }: Props) {
  const [socios, setSocios] = useState<SocioConRelaciones[]>(cliente.socios)
  const [adding, setAdding] = useState(false)
  const [newSocio, setNewSocio] = useState({ nombre: '', rut: '', porcentaje_participacion: '' })
  const [, startTransition] = useTransition()
  const canEdit = role === 'admin' || role === 'master'

  const total = socios.reduce((s, x) => s + (x.porcentaje_participacion ?? 0), 0)

  const handleAddSocio = () => {
    startTransition(async () => {
      const result = await createSocio({
        cliente_id: cliente.id,
        nombre: newSocio.nombre,
        rut: newSocio.rut || null,
        porcentaje_participacion: newSocio.porcentaje_participacion ? Number(newSocio.porcentaje_participacion) : null,
      })
      if (result.id) {
        setSocios(prev => [...prev, {
          id: result.id!, cliente_id: cliente.id,
          nombre: newSocio.nombre, rut: newSocio.rut || null,
          porcentaje_participacion: newSocio.porcentaje_participacion ? Number(newSocio.porcentaje_participacion) : null,
          created_at: new Date().toISOString(), retiros: [], certificados: [],
        }])
        setNewSocio({ nombre: '', rut: '', porcentaje_participacion: '' })
        setAdding(false)
      }
    })
  }

  const handleDeleteSocio = (id: string) => {
    startTransition(async () => {
      await deleteSocio(id, cliente.id)
      setSocios(prev => prev.filter(s => s.id !== id))
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Tabla de socios */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Composición Accionaria</h3>
          {canEdit && (
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus size={13} /> Agregar Socio
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Nombre</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">RUT</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Participación</th>
              {canEdit && <th className="px-4 py-2.5 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {socios.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{s.nombre}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.rut ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  {s.porcentaje_participacion != null ? (
                    <span className="font-semibold text-slate-800">{s.porcentaje_participacion}%</span>
                  ) : '—'}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteSocio(s.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {socios.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">Sin socios registrados</td></tr>
            )}
            {socios.length > 0 && (
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-slate-500">Total</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`text-xs font-bold ${Math.abs(total - 100) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
                    {total.toFixed(2)}%
                  </span>
                </td>
                {canEdit && <td />}
              </tr>
            )}
          </tbody>
        </table>

        {/* Formulario agregar socio */}
        {adding && (
          <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nuevo Socio</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Nombre completo"
                value={newSocio.nombre}
                onChange={e => setNewSocio(p => ({ ...p, nombre: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="% Part."
                type="number"
                min={0} max={100}
                value={newSocio.porcentaje_participacion}
                onChange={e => setNewSocio(p => ({ ...p, porcentaje_participacion: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="RUT (opcional)"
                value={newSocio.rut}
                onChange={e => setNewSocio(p => ({ ...p, rut: e.target.value }))}
                className="col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleAddSocio}
                disabled={!newSocio.nombre}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:opacity-85 disabled:opacity-50 text-white rounded-lg transition-opacity"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Certificados de retiro anual */}
      {socios.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Certificados de Retiro Anual — {anioFiscal}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socios.map(socio => {
              const cert = socio.certificados.find(c => c.anio === anioFiscal)
              return (
                <FileUploadCard
                  key={socio.id}
                  label={socio.nombre}
                  description={`Certificado anual ${anioFiscal}`}
                  path={`certificados/${cliente.id}/${socio.id}`}
                  existingUrl={cert?.archivo_url}
                  existingName={cert?.archivo_nombre}
                  canUpload={canEdit}
                  canDelete={canEdit}
                  onUploaded={(url, nombre) => {
                    startTransition(async () => {
                      const result = await createCertificadoRetiro({
                        socio_id: socio.id, anio: anioFiscal,
                        archivo_url: url, archivo_nombre: nombre,
                      })
                      if (result.id) {
                        setSocios(prev => prev.map(s => s.id === socio.id
                          ? { ...s, certificados: [...s.certificados.filter(c => c.anio !== anioFiscal), { id: result.id!, socio_id: socio.id, anio: anioFiscal, archivo_url: url, archivo_nombre: nombre, created_at: new Date().toISOString() }] }
                          : s
                        ))
                      }
                    })
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Retiros societarios */}
      {socios.some(s => s.retiros.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Retiros Societarios</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Socio</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Fecha</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {socios.flatMap(s => s.retiros.map(r => ({
                ...r, socioNombre: s.nombre,
              }))).sort((a, b) => b.fecha.localeCompare(a.fecha)).map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{r.socioNombre}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.fecha}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCLP(r.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
