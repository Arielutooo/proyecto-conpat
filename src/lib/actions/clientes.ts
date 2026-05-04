'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Cliente } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createCliente(data: Omit<Cliente, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('clientes').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { id: row.id }
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'created_at'>>): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
  return {}
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return {}
}
