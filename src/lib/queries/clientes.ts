import { createClient } from '@/lib/supabase/server'
import type { Cliente, ClienteConRelaciones } from '@/lib/types'

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('razon_social')
  if (error) throw new Error(error.message)
  return data ?? []
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
