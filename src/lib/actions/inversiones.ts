'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import { logAudit } from '@/lib/actions/audit'
import type { Inversion } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

async function getEmpresa(clienteId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('clientes').select('razon_social').eq('id', clienteId).single()
    return data?.razon_social ?? null
  } catch {
    return null
  }
}

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
    const empresa = await getEmpresa(data.cliente_id)
    await logAudit({
      action:      'inversion_creada',
      description: `Inversión '${data.tipo_inversion}' registrada`,
      entity_type: 'inversion',
      entity_id:   row.id,
      empresa,
      metadata:    { cliente_id: data.cliente_id, categoria: data.categoria, tipo: data.tipo_inversion, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createInversion')
  }
}

export async function updateInversion(id: string, clienteId: string, data: Partial<Omit<Inversion, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('inversiones').select('tipo_inversion').eq('id', id).single()
    const { error } = await supabase.from('inversiones').update(data).eq('id', id)
    if (error) {
      console.error('[updateInversion] DB error:', error.message)
      return { error: 'No se pudo actualizar la inversión.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    const empresa = await getEmpresa(clienteId)
    await logAudit({
      action:      'inversion_actualizada',
      description: `Inversión '${prev?.tipo_inversion ?? id}' actualizada`,
      entity_type: 'inversion',
      entity_id:   id,
      empresa,
      metadata:    { cliente_id: clienteId, ...data as Record<string, unknown> },
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'updateInversion')
  }
}

export async function deleteInversion(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('inversiones').select('tipo_inversion').eq('id', id).single()
    const { error } = await supabase.from('inversiones').delete().eq('id', id)
    if (error) {
      console.error('[deleteInversion] DB error:', error.message)
      return { error: 'No se pudo eliminar la inversión.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    const empresa = await getEmpresa(clienteId)
    await logAudit({
      action:      'inversion_eliminada',
      description: `Inversión '${prev?.tipo_inversion ?? id}' eliminada`,
      entity_type: 'inversion',
      entity_id:   id,
      empresa,
      metadata:    { cliente_id: clienteId },
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteInversion')
  }
}
