'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import { logAudit } from '@/lib/actions/audit'
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
    await logAudit({
      action:      'socio_creado',
      description: `Socio '${data.nombre}' agregado al cliente ${data.cliente_id}`,
      entity_type: 'socio',
      entity_id:   row.id,
      metadata:    { cliente_id: data.cliente_id, rut: data.rut, porcentaje: data.porcentaje_participacion },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createSocio')
  }
}

export async function updateSocio(id: string, clienteId: string, data: Partial<Omit<Socio, 'id' | 'created_at'>>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('socios').select('nombre').eq('id', id).single()
    const { error } = await supabase.from('socios').update(data).eq('id', id)
    if (error) {
      console.error('[updateSocio] DB error:', error.message)
      return { error: 'No se pudo actualizar el socio.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    await logAudit({
      action:      'socio_actualizado',
      description: `Socio '${prev?.nombre ?? id}' actualizado`,
      entity_type: 'socio',
      entity_id:   id,
      metadata:    { cliente_id: clienteId, ...data as Record<string, unknown> },
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'updateSocio')
  }
}

export async function deleteSocio(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('socios').select('nombre').eq('id', id).single()
    const { error } = await supabase.from('socios').delete().eq('id', id)
    if (error) {
      console.error('[deleteSocio] DB error:', error.message)
      return { error: 'No se pudo eliminar el socio.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    await logAudit({
      action:      'socio_eliminado',
      description: `Socio '${prev?.nombre ?? id}' eliminado`,
      entity_type: 'socio',
      entity_id:   id,
      metadata:    { cliente_id: clienteId },
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteSocio')
  }
}
