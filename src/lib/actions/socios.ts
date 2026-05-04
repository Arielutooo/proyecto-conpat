'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Socio } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createSocio(data: Omit<Socio, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('socios').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${data.cliente_id}`)
  return { id: row.id }
}

export async function updateSocio(id: string, clienteId: string, data: Partial<Omit<Socio, 'id' | 'created_at'>>): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('socios').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}

export async function deleteSocio(id: string, clienteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('socios').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}
