'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import { logAudit } from '@/lib/actions/audit'
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
    await logAudit({
      action:      'cliente_creado',
      description: `Cliente '${data.razon_social}' creado`,
      entity_type: 'cliente',
      entity_id:   row.id,
      empresa:     data.razon_social,
      metadata:    { rut: data.rut, tipo_sociedad: data.tipo_sociedad },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCliente')
  }
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('clientes').select('razon_social').eq('id', id).single()
    const { error } = await supabase.from('clientes').update(data).eq('id', id)
    if (error) {
      console.error('[updateCliente] DB error:', error.message)
      return { error: 'No se pudo actualizar el cliente.' }
    }
    revalidatePath(`/clientes/${id}`)
    revalidatePath('/clientes')
    await logAudit({
      action:      'cliente_actualizado',
      description: `Cliente '${prev?.razon_social ?? id}' actualizado`,
      entity_type: 'cliente',
      entity_id:   id,
      empresa:     prev?.razon_social ?? null,
      metadata:    data as Record<string, unknown>,
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'updateCliente')
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('clientes').select('razon_social').eq('id', id).single()
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) {
      console.error('[deleteCliente] DB error:', error.message)
      return { error: 'No se pudo eliminar el cliente.' }
    }
    revalidatePath('/clientes')
    await logAudit({
      action:      'cliente_eliminado',
      description: `Cliente '${prev?.razon_social ?? id}' eliminado`,
      entity_type: 'cliente',
      entity_id:   id,
      empresa:     prev?.razon_social ?? null,
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteCliente')
  }
}
