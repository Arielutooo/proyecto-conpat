'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import type { Inversion } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createInversion(data: Omit<Inversion, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('inversiones').insert(data).select('id').single()
    if (error) {
      console.error('[createInversion] DB error:', error.message)
      return { error: 'No se pudo registrar la inversión.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createInversion')
  }
}

export async function updateInversion(id: string, clienteId: string, data: Partial<Omit<Inversion, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('inversiones').update(data).eq('id', id)
    if (error) {
      console.error('[updateInversion] DB error:', error.message)
      return { error: 'No se pudo actualizar la inversión.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'updateInversion')
  }
}

export async function deleteInversion(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('inversiones').delete().eq('id', id)
    if (error) {
      console.error('[deleteInversion] DB error:', error.message)
      return { error: 'No se pudo eliminar la inversión.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteInversion')
  }
}
