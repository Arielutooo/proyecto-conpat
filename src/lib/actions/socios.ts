'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, handleActionError } from '@/lib/auth'
import type { Socio } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createSocio(data: Omit<Socio, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('socios').insert(data).select('id').single()
    if (error) {
      console.error('[createSocio] DB error:', error.message)
      return { error: 'No se pudo crear el socio.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createSocio')
  }
}

export async function updateSocio(id: string, clienteId: string, data: Partial<Omit<Socio, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('socios').update(data).eq('id', id)
    if (error) {
      console.error('[updateSocio] DB error:', error.message)
      return { error: 'No se pudo actualizar el socio.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'updateSocio')
  }
}

export async function deleteSocio(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('socios').delete().eq('id', id)
    if (error) {
      console.error('[deleteSocio] DB error:', error.message)
      return { error: 'No se pudo eliminar el socio.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteSocio')
  }
}
