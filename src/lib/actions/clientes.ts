'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import type { Cliente } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createCliente(data: Omit<Cliente, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('clientes').insert(data).select('id').single()
    if (error) {
      console.error('[createCliente] DB error:', error.message)
      return { error: 'No se pudo crear el cliente.' }
    }
    revalidatePath('/clientes')
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCliente')
  }
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('clientes').update(data).eq('id', id)
    if (error) {
      console.error('[updateCliente] DB error:', error.message)
      return { error: 'No se pudo actualizar el cliente.' }
    }
    revalidatePath(`/clientes/${id}`)
    revalidatePath('/clientes')
    return {}
  } catch (err) {
    return handleActionError(err, 'updateCliente')
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) {
      console.error('[deleteCliente] DB error:', error.message)
      return { error: 'No se pudo eliminar el cliente.' }
    }
    revalidatePath('/clientes')
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteCliente')
  }
}
