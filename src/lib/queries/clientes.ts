import { createClient } from '@/lib/supabase/server'
import type { Cliente, ClienteConRelaciones, ClienteConStats } from '@/lib/types'

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('razon_social')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getClientesConStats(): Promise<ClienteConStats[]> {
  const supabase = await createClient()
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const monthStart = `${y}-${m}-01`
  const monthEnd   = `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`

  const { data, error } = await supabase
    .from('clientes')
    .select(`*, socios(id, retiros:retiros_societarios(monto, fecha)), inversiones(id), entregables:entregables_cfo(id, anio)`)
    .order('razon_social')

  if (error) throw new Error(error.message)

  return (data ?? []).map((c: any): ClienteConStats => {
    const socios     = c.socios     ?? []
    const inversiones = c.inversiones ?? []
    const entregables = c.entregables ?? []

    const retirosMes = socios
      .flatMap((s: any) => s.retiros ?? [])
      .filter((r: any) => r.fecha >= monthStart && r.fecha <= monthEnd)
      .reduce((sum: number, r: any) => sum + (r.monto ?? 0), 0)

    return {
      id: c.id, razon_social: c.razon_social, rut: c.rut,
      tipo_sociedad: c.tipo_sociedad, regimen_tributario: c.regimen_tributario,
      representante_legal: c.representante_legal, metodo_creacion: c.metodo_creacion,
      conpat_factura: c.conpat_factura, moneda_facturacion: c.moneda_facturacion,
      cantidad_facturacion: c.cantidad_facturacion, tiene_nomina: c.tiene_nomina,
      emite_facturas: c.emite_facturas, boletas_honorarios: c.boletas_honorarios,
      sin_inversiones: c.sin_inversiones, cantidad_trabajadores: c.cantidad_trabajadores,
      iniciacion_actividades: c.iniciacion_actividades, actividad_economica: c.actividad_economica,
      codigo_sii: c.codigo_sii, rentas_presuntas: c.rentas_presuntas,
      created_at: c.created_at,
      socios_count: socios.length,
      inversiones_count: inversiones.length,
      retiros_mes: retirosMes,
      entregables_count: entregables.filter((e: any) => e.anio === y).length,
    }
  })
}

export async function getClienteConRelaciones(id: string): Promise<ClienteConRelaciones | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      socios (
        *,
        retiros:retiros_societarios (*),
        certificados:certificados_retiro_anual (*)
      ),
      inversiones (*),
      cartolas:cartolas_mensuales (*),
      documentos (*),
      entregables:entregables_cfo (*)
    `)
    .eq('id', id)
    .single()
  if (error) return null
  return data as ClienteConRelaciones
}
