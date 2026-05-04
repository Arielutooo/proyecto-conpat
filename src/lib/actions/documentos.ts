'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Documento, CartolaMensual, EntregableCFO, CertificadoRetiroAnual } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createDocumento(data: Omit<Documento, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('documentos').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${data.cliente_id}`)
  return { id: row.id }
}

export async function deleteDocumento(id: string, clienteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('documentos').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}

export async function createCartola(data: Omit<CartolaMensual, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('cartolas_mensuales').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${data.cliente_id}`)
  return { id: row.id }
}

export async function deleteCartola(id: string, clienteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('cartolas_mensuales').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}

export async function createEntregableCFO(data: Omit<EntregableCFO, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('entregables_cfo').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${data.cliente_id}`)
  return { id: row.id }
}

export async function createCertificadoRetiro(data: Omit<CertificadoRetiroAnual, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('certificados_retiro_anual').insert(data).select('id').single()
  if (error) return { error: error.message }
  return { id: row.id }
}
