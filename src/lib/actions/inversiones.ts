'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Inversion } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createInversion(data: Omit<Inversion, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('inversiones').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${data.cliente_id}`)
  return { id: row.id }
}

export async function updateInversion(id: string, clienteId: string, data: Partial<Omit<Inversion, 'id' | 'created_at'>>): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('inversiones').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}

export async function deleteInversion(id: string, clienteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('inversiones').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${clienteId}`)
  return {}
}
